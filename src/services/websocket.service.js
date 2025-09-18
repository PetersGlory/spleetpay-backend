const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, AdminUser } = require('../models');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.connectedAdmins = new Map();
  }

  /**
   * Initialize WebSocket server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log('WebSocket server initialized');
  }

  /**
   * Setup authentication middleware
   */
  setupMiddleware() {
    // User authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if it's an admin user
        if (decoded.role && ['super_admin', 'admin', 'moderator', 'analyst'].includes(decoded.role)) {
          const adminUser = await AdminUser.findByPk(decoded.id);
          if (!adminUser || adminUser.status !== 'active') {
            return next(new Error('Invalid admin user'));
          }
          socket.adminUser = adminUser;
          socket.userType = 'admin';
        } else {
          const user = await User.findByPk(decoded.id);
          if (!user || user.accountStatus === 'suspended') {
            return next(new Error('Invalid user'));
          }
          socket.user = user;
          socket.userType = 'user';
        }

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id} (${socket.userType})`);

      // Store connected user
      if (socket.userType === 'admin') {
        this.connectedAdmins.set(socket.adminUser.id, socket);
        socket.join('admin-room');
      } else {
        this.connectedUsers.set(socket.user.id, socket);
        socket.join(`user-${socket.user.id}`);
      }

      // Handle joining merchant room for users
      if (socket.userType === 'user' && socket.user.merchantId) {
        socket.join(`merchant-${socket.user.merchantId}`);
      }

      // Handle joining admin department room
      if (socket.userType === 'admin') {
        if (socket.adminUser.department) {
          socket.join(`admin-${socket.adminUser.department}`);
        }
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        if (socket.userType === 'admin') {
          this.connectedAdmins.delete(socket.adminUser.id);
        } else {
          this.connectedUsers.delete(socket.user.id);
        }
      });

      // Handle custom events
      socket.on('join-room', (roomName) => {
        socket.join(roomName);
        console.log(`User ${socket.id} joined room: ${roomName}`);
      });

      socket.on('leave-room', (roomName) => {
        socket.leave(roomName);
        console.log(`User ${socket.id} left room: ${roomName}`);
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  /**
   * Emit transaction update to relevant users
   * @param {Object} transactionData - Transaction data
   */
  emitTransactionUpdate(transactionData) {
    const { transaction, merchantId, customerId } = transactionData;

    // Emit to admin room
    this.io.to('admin-room').emit('transaction:updated', {
      type: 'transaction:updated',
      data: transaction,
      timestamp: new Date().toISOString()
    });

    // Emit to merchant room
    if (merchantId) {
      this.io.to(`merchant-${merchantId}`).emit('transaction:updated', {
        type: 'transaction:updated',
        data: transaction,
        timestamp: new Date().toISOString()
      });
    }

    // Emit to customer if connected
    if (customerId) {
      this.io.to(`user-${customerId}`).emit('payment:update', {
        type: 'payment:update',
        data: transaction,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit new transaction to relevant users
   * @param {Object} transactionData - Transaction data
   */
  emitNewTransaction(transactionData) {
    const { transaction, merchantId } = transactionData;

    // Emit to admin room
    this.io.to('admin-room').emit('transaction:created', {
      type: 'transaction:created',
      data: transaction,
      timestamp: new Date().toISOString()
    });

    // Emit to merchant room
    if (merchantId) {
      this.io.to(`merchant-${merchantId}`).emit('transaction:created', {
        type: 'transaction:created',
        data: transaction,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit payment received notification
   * @param {Object} paymentData - Payment data
   */
  emitPaymentReceived(paymentData) {
    const { transaction, contributorId, merchantId } = paymentData;

    // Emit to admin room
    this.io.to('admin-room').emit('payment:received', {
      type: 'payment:received',
      data: {
        transactionId: transaction.id,
        contributorId,
        amount: paymentData.amount,
        merchantId
      },
      timestamp: new Date().toISOString()
    });

    // Emit to merchant room
    if (merchantId) {
      this.io.to(`merchant-${merchantId}`).emit('payment:received', {
        type: 'payment:received',
        data: {
          transactionId: transaction.id,
          contributorId,
          amount: paymentData.amount
        },
        timestamp: new Date().toISOString()
      });
    }

    // Emit to contributor if connected
    if (contributorId) {
      this.io.to(`user-${contributorId}`).emit('payment:received', {
        type: 'payment:received',
        data: {
          transactionId: transaction.id,
          amount: paymentData.amount,
          status: 'success'
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit settlement update
   * @param {Object} settlementData - Settlement data
   */
  emitSettlementUpdate(settlementData) {
    const { settlement, merchantId } = settlementData;

    // Emit to admin room
    this.io.to('admin-room').emit('settlement:updated', {
      type: 'settlement:updated',
      data: settlement,
      timestamp: new Date().toISOString()
    });

    // Emit to merchant room
    if (merchantId) {
      this.io.to(`merchant-${merchantId}`).emit('settlement:updated', {
        type: 'settlement:updated',
        data: settlement,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit new dispute notification
   * @param {Object} disputeData - Dispute data
   */
  emitNewDispute(disputeData) {
    const { dispute, merchantId } = disputeData;

    // Emit to admin room
    this.io.to('admin-room').emit('dispute:created', {
      type: 'dispute:created',
      data: dispute,
      timestamp: new Date().toISOString()
    });

    // Emit to merchant room
    if (merchantId) {
      this.io.to(`merchant-${merchantId}`).emit('dispute:created', {
        type: 'dispute:created',
        data: dispute,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Emit system alert
   * @param {Object} alertData - Alert data
   */
  emitSystemAlert(alertData) {
    const { alert, targetRoles = ['super_admin', 'admin'] } = alertData;

    // Emit to admin room
    this.io.to('admin-room').emit('system:alert', {
      type: 'system:alert',
      data: alert,
      timestamp: new Date().toISOString()
    });

    // Emit to specific admin roles if specified
    targetRoles.forEach(role => {
      this.io.to(`admin-${role}`).emit('system:alert', {
        type: 'system:alert',
        data: alert,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Emit notification to specific user
   * @param {string} userId - User ID
   * @param {Object} notification - Notification data
   */
  emitUserNotification(userId, notification) {
    this.io.to(`user-${userId}`).emit('notification:new', {
      type: 'notification:new',
      data: notification,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Emit notification to specific admin
   * @param {string} adminId - Admin ID
   * @param {Object} notification - Notification data
   */
  emitAdminNotification(adminId, notification) {
    this.io.to(`admin-${adminId}`).emit('notification:new', {
      type: 'notification:new',
      data: notification,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast message to all connected users
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  broadcast(event, data) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get connected users count
   * @returns {Object} Connection statistics
   */
  getConnectionStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      connectedAdmins: this.connectedAdmins.size,
      totalConnections: this.io.engine.clientsCount
    };
  }

  /**
   * Get connected users list
   * @returns {Array} List of connected users
   */
  getConnectedUsers() {
    const users = [];
    this.connectedUsers.forEach((socket, userId) => {
      users.push({
        userId,
        socketId: socket.id,
        connectedAt: socket.handshake.time
      });
    });
    return users;
  }

  /**
   * Get connected admins list
   * @returns {Array} List of connected admins
   */
  getConnectedAdmins() {
    const admins = [];
    this.connectedAdmins.forEach((socket, adminId) => {
      admins.push({
        adminId,
        socketId: socket.id,
        role: socket.adminUser?.role,
        department: socket.adminUser?.department,
        connectedAt: socket.handshake.time
      });
    });
    return admins;
  }
}

module.exports = new WebSocketService();
