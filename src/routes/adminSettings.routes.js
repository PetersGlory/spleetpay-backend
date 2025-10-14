const express = require('express');
const router = express.Router();
const adminSettingsController = require('../controllers/adminSettings.controller');
const { adminAuth } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin Settings
 *   description: Admin Settings API endpoints for managing administrators and system configuration
 */

/**
 * @swagger
 * /admin/settings/admins:
 *   get:
 *     tags: [Admin Settings]
 *     summary: Get all administrators
 *     description: Retrieve a paginated list of administrators with optional filtering and search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [super_admin, admin, moderator, analyst]
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Administrators retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     admins:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdminUser'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationData'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin management permission required
 */
router.get('/admins', adminAuth, adminSettingsController.getAdmins);

/**
 * @swagger
 * /admin/settings/admins/{id}:
 *   get:
 *     tags: [Admin Settings]
 *     summary: Get administrator by ID
 *     description: Retrieve detailed information about a specific administrator
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Administrator ID
 *     responses:
 *       200:
 *         description: Administrator retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AdminUser'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin management permission required
 *       404:
 *         description: Administrator not found
 *   post:
 *     tags: [Admin Settings]
 *     summary: Create administrator
 *     description: Create a new administrator account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: Administrator full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Administrator email address
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin, moderator, analyst]
 *                 description: Administrator role
 *               department:
 *                 type: string
 *                 description: Administrator department
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Custom permissions (optional, will use role defaults if not provided)
 *     responses:
 *       201:
 *         description: Administrator created successfully
 *       400:
 *         description: Bad request - Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin access required
 *       409:
 *         description: Conflict - Email already exists
 *   put:
 *     tags: [Admin Settings]
 *     summary: Update administrator
 *     description: Update administrator information and permissions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Administrator ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin, moderator, analyst]
 *               department:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Administrator updated successfully
 *       400:
 *         description: Bad request - Cannot modify own account
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin access required
 *       404:
 *         description: Administrator not found
 *       409:
 *         description: Conflict - Email already exists
 *   delete:
 *     tags: [Admin Settings]
 *     summary: Delete administrator
 *     description: Permanently delete an administrator account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Administrator ID
 *     responses:
 *       200:
 *         description: Administrator deleted successfully
 *       400:
 *         description: Bad request - Cannot delete self or last super admin
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin access required
 *       404:
 *         description: Administrator not found
 */
router.get('/admins/:id', adminAuth, adminSettingsController.getAdmin);
router.post('/admins', adminAuth, adminSettingsController.createAdmin);
router.put('/admins/:id', adminAuth, adminSettingsController.updateAdmin);
router.delete('/admins/:id', adminAuth, adminSettingsController.deleteAdmin);

/**
 * @swagger
 * /admin/settings/admins/{id}/status:
 *   put:
 *     tags: [Admin Settings]
 *     summary: Toggle administrator status
 *     description: Activate or deactivate an administrator account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Administrator ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: New status for the administrator
 *     responses:
 *       200:
 *         description: Administrator status updated successfully
 *       400:
 *         description: Bad request - Cannot modify own account
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin management permission required
 *       404:
 *         description: Administrator not found
 */
router.put('/admins/:id/status', adminAuth, adminSettingsController.toggleAdminStatus);

/**
 * @swagger
 * /admin/settings/admins/{id}/reset-password:
 *   post:
 *     tags: [Admin Settings]
 *     summary: Reset administrator password
 *     description: Generate a new temporary password for an administrator
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Administrator ID
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     temporaryPassword:
 *                       type: string
 *                     resetAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin management permission required
 *       404:
 *         description: Administrator not found
 */
router.post('/admins/:id/reset-password', adminAuth, adminSettingsController.resetAdminPassword);

/**
 * @swagger
 * /admin/settings/system:
 *   get:
 *     tags: [Admin Settings]
 *     summary: Get system settings
 *     description: Retrieve current system configuration settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AdminSettings'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - System configuration permission required
 *   put:
 *     tags: [Admin Settings]
 *     summary: Update system settings
 *     description: Update system configuration settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminSettings'
 *     responses:
 *       200:
 *         description: System settings updated successfully
 *       400:
 *         description: Bad request - Invalid setting values
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super admin access required
 */
router.get('/system', adminAuth, adminSettingsController.getSystemSettings);
router.put('/system', adminAuth, adminSettingsController.updateSystemSettings);

/**
 * @swagger
 * /admin/settings/audit-logs:
 *   get:
 *     tags: [Admin Settings]
 *     summary: Get audit logs
 *     description: Retrieve audit logs with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by administrator ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *         description: Filter by resource type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs until this date
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     auditLogs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuditLog'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationData'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Audit logs permission required
 */
router.get('/audit-logs', adminAuth, adminSettingsController.getAuditLogs);

module.exports = router;
