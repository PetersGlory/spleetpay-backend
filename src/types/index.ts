// Enums
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  ANALYST = 'analyst'
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked'
}

export enum KycStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum TransactionType {
  PAY_FOR_ME = 'pay_for_me',
  GROUP_SPLIT = 'group_split'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial',
  COMPLETED = 'completed'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed'
}

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SETTLED = 'settled'
}

export enum DocumentType {
  CAC_CERTIFICATE = 'cac_certificate',
  PROOF_OF_ADDRESS = 'proof_of_address',
  IDENTITY_DOCUMENT = 'identity_document',
  DIRECTOR_ID = 'director_id'
}

export enum OnboardingStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  ACTIVE = 'active'
}

export enum SettlementType {
  T_0 = 'T+0',
  T_1 = 'T+1',
  MANUAL = 'manual'
}

// Admin User Interface (from AdminBackendInstruction.md)
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  department: string;
  lastLogin: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// Regular User Interface (from MerchantBackendInstruction.md)
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: Address;
  kycStatus: KycStatus;
  kycDocuments: KycDocument[];
  accountStatus: UserStatus;
  walletBalance: number;
  currency: string;
  createdAt: string;
  lastLogin: string;
}

// Address Interface
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

// KYC Document Interface
export interface KycDocument {
  id: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: KycStatus;
  uploadedAt: string;
}

// Merchant Interface (from both instruction documents)
export interface Merchant {
  id: string;
  businessName: string;
  businessType: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: Address;
  taxId: string;
  bankAccount: BankAccount;
  kycStatus: KycStatus;
  onboardingStatus: OnboardingStatus;
  documents: KycDocument[];
  apiKeys: APIKey[];
  settlementSchedule: string;
  fees: MerchantFees;
  createdAt: string;
  approvedAt?: string;
}

// Bank Account Interface
export interface BankAccount {
  accountNumber: string;
  bankCode: string;
  accountName: string;
  bankName: string;
}

// API Key Interface
export interface APIKey {
  id: string;
  key: string;
  name: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

// Merchant Fees Interface
export interface MerchantFees {
  transactionFee: number;
  settlementFee: number;
  currency: string;
}

// Payment Interface (from both instruction documents)
export interface Payment {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  paymentMethod: string;
  pspResponse: any;
  userId: string;
  merchantId?: string;
  metadata: Record<string, any>;
  fraudScore?: number;
  fraudFlags?: string[];
  createdAt: string;
  completedAt?: string;
}

// Group Split Interface (from MerchantBackendInstruction.md)
export interface GroupSplit {
  id: string;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  organizerId: string;
  participants: Participant[];
  status: 'active' | 'completed' | 'cancelled';
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

// Participant Interface
export interface Participant {
  userId: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
}

// Settlement Interface (from both instruction documents)
export interface Settlement {
  id: string;
  merchantId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalAmount: number;
  feeAmount: number;
  netAmount: number;
  transactionCount: number;
  status: SettlementStatus;
  bankAccount: BankAccount;
  processedAt?: string;
  reference?: string;
}

// Refund Interface (from AdminBackendInstruction.md)
export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: SettlementStatus;
  requestedBy: string;
  processedBy?: string;
  createdAt: string;
  processedAt?: string;
}

// Audit Log Interface (from AdminBackendInstruction.md)
export interface AuditLog {
  id: string;
  adminUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// WebSocket Events Interface (from both instruction documents)
export interface WebSocketEvents {
  'payment:created': Payment;
  'payment:updated': Payment;
  'settlement:completed': Settlement;
  'dispute:created': any;
  'user:login': { userId: string; timestamp: string };
  'merchant:approved': Merchant;
  'system:alert': any;
  'transaction:created': Payment;
  'transaction:updated': Payment;
  'settlement:processed': Settlement;
  'payment:received': Payment;
}

// API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Pagination Interface
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// JWT Payload Interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}

// Request with User Interface
export interface RequestWithUser extends Request {
  user?: JWTPayload;
}

// Error Response Interface
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}