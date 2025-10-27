# Settlement Management API Specification

## Overview
This document specifies the API endpoints required for the Settlement Management feature in the SpleetPay Merchant dashboard.

## Base URL
- Development: `http://localhost:4500/api`
- Production: `https://backendapi.spleetpay.com/api`

## Authentication
All endpoints require JWT Bearer token authentication in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Get Merchant Settlement Statistics

### Endpoint
```
GET /merchants/stats
```

### Description
Returns comprehensive merchant statistics including settlement data, balance information, and settlement history.

### Request Headers
```
Authorization: Bearer <token>
```

### Query Parameters
None

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "totalTransactions": 1542,
    "completedTransactions": 1450,
    "totalRevenue": 15750000,
    "pendingAmount": 850000,
    "recentTransactions": [
      {
        "id": "tx_123456789",
        "merchantId": "merchant_123",
        "qrCodeId": "qr_987654321",
        "amount": 5000,
        "status": "completed",
        "type": "group_split",
        "description": "Group payment for Invoice #123",
        "payerName": "John Doe",
        "payerEmail": "john@example.com",
        "payerPhone": "+2348012345678",
        "reference": "REF123456789",
        "createdAt": "2025-01-09T10:30:00.000Z",
        "updatedAt": "2025-01-09T10:30:00.000Z"
      }
    ],
    "availableBalance": 4500000,
    "pendingSettlement": 325000,
    "todaySettlements": 2,
    "settlementHistory": [
      {
        "id": "STL001234567890",
        "amount": 450000,
        "status": "completed",
        "bankAccount": "GTBank • ****4567",
        "reference": "STL789012",
        "initiatedAt": "2025-01-09T10:30:00.000Z",
        "completedAt": "2025-01-09T14:30:00.000Z",
        "transactionCount": 45
      },
      {
        "id": "STL001234567891",
        "amount": 325000,
        "status": "processing",
        "bankAccount": "Access Bank • ****8901",
        "reference": "STL789013",
        "initiatedAt": "2025-01-09T14:00:00.000Z",
        "completedAt": null,
        "transactionCount": 32
      },
      {
        "id": "STL001234567892",
        "amount": 180000,
        "status": "pending",
        "bankAccount": "First Bank • ****2345",
        "reference": "STL789014",
        "initiatedAt": "2025-01-09T15:30:00.000Z",
        "completedAt": null,
        "transactionCount": 18
      }
    ]
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Request status |
| `data.availableBalance` | number | Total amount ready for settlement (in kobo/smallest currency unit) |
| `data.pendingSettlement` | number | Total amount currently being processed for settlement |
| `data.todaySettlements` | number | Count of settlements processed today |
| `data.settlementHistory` | array | Array of settlement records |
| `settlementHistory[].id` | string | Unique settlement ID |
| `settlementHistory[].amount` | number | Settlement amount (in kobo/smallest currency unit) |
| `settlementHistory[].status` | string | Settlement status: `pending`, `processing`, `completed`, `failed` |
| `settlementHistory[].bankAccount` | string | Display text for bank account (e.g., "GTBank • ****4567") |
| `settlementHistory[].reference` | string | Settlement reference number |
| `settlementHistory[].initiatedAt` | string | ISO 8601 Safer Date string when settlement was initiated |
| `settlementHistory[].completedAt` | string\|null | ISO 8601 Safer Date string when settlement completed, or null if pending |
| `settlementHistory[].transactionCount` | number | Number of transactions included in this settlement |

### Error Responses

| Status Code | Error Response |
|-------------|----------------|
| 401 Unauthorized | `{"success": false, "error": {"message": "Authentication required", "code": "AUTHENTICATION_ERROR"}}` |
| 500 Internal Server Error | `{"success": false, "error": {"message": "Failed to fetch settlement statistics"}}` |

---

## 2. Request Settlement

### Endpoint
```
POST /merchants/settlements/request
```

### Description
Initiates a new settlement request to transfer the merchant's available balance to their registered bank account(s).

### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body
```json
{
  "amount": 450000,
  "bankAccountId": "bank_123456",
  "description": "Regular settlement request"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Amount to settle (in kobo/smallest currency unit). Must not exceed available balance |
| `bankAccountId` | string | No | ID of the bank account to settle to. If omitted, uses merchant's primary bank account |
| `description` | string | No | Optional description for the settlement |

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "settlementId": "STL001234567890",
    "amount": 450000,
    "status": "pending",
    "bankAccount": "GTBank • ****4567",
    "reference": "STL789012",
    "initiatedAt": "2025-01-09T16:00:00.000Z",
    "estimatedCompletion": "2025-01-10T14:00:00.000Z"
  },
  "message": "Settlement request submitted successfully"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Request status |
| `data.settlementId` | string | Unique settlement ID |
| `data.amount` | number | Settlement amount |
| `data.status` | string | Initial status (typically "pending") |
| `data.bankAccount` | string | Bank account display text |
| `data.reference` | string | Settlement reference number |
| `data.initiatedAt` | string | ISO 8601 Safer Date string when initiated |
| `data.estimatedCompletion` | string | ISO 8601 Safer Date string for estimated completion |
| `message` | string | Success message |

### Error Responses

| Status Code | Error Response |
|-------------|----------------|
| 400 Bad Request | `{"success": false, "error": {"message": "Amount exceeds available balance", "code": "VALIDATION_ERROR"}}` |
| 400 Bad Request | `{"success": false, "error": {"message": "No available balance to settle", "code": "VALIDATION_ERROR"}}` |
| 400 Bad Request | `{"success": false, "error": {"message": "No bank account configured", "code": "VALIDATION_ERROR"}}` |
| 401 Unauthorized | `{"success": false, "error": {"message": "Authentication required", "code": "AUTHENTICATION_ERROR"}}` |
| 403 Forbidden | `{"success": false, "error": {"message": "KYC not approved", "code": "KYC_NOT_APPROVED"}}` |
| 500 Internal Server Error | `{"success": false, "error": {"message": "Failed to initiate settlement"}}` |

---

## 3. Get Settlement Details

### Endpoint
```
GET /merchants/settlements/:settlementId
```

### Description
Retrieves detailed information about a specific settlement including transaction breakdown.

### Request Headers
```
Authorization: Bearer <token>
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `settlementId` | string | Unique settlement ID |

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "STL001234567890",
    "amount": 450000,
    "status": "completed",
    "bankAccount": "GTBank • ****4567",
    "bankAccountDetails": {
      "accountName": "ABC Company Limited",
      "accountNumber": "0123456789",
      "bankName": "GTBank",
      "bankCode": "058"
    },
    "reference": "STL789012",
    "initiatedAt": "2025-01-09T10:30:00.000Z",
    "completedAt": "2025-01-09T14:30:00.000Z",
    "transactionCount": 45,
    "fee": 5000,
    "netAmount": 445000,
    "transactions": [
      {
        "id": "tx_001",
        "amount": 5000,
        "type": "group_split",
        "status": "completed",
        "reference": "REF001",
        "createdAt": "2025-01-08T10:30:00.000Z"
      }
    ],
    "settlementBreakdown": {
      "currency": "NGN",
      "grossAmount": 450000,
      "fee": 5000,
      "netAmount": 445000
    }
  }
}
```

### Error Responses

| Status Code | Error Response |
|-------------|----------------|
| 404 Not Found | `{"success": false, "error": {"message": "Settlement not found", "code": "NOT_FOUND"}}` |
| 401 Unauthorized | `{"success": false, "error": {"message": "Authentication required", "code": "AUTHENTICATION_ERROR"}}` |

---

## 4. List All Settlements

### Endpoint
```
GET /merchants/settlements
```

### Description
Retrieves a paginated list of all settlements for the merchant.

### Request Headers
```
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 20, max: 100) |
| `status` | string | Filter by status: `pending`, `processing`, `completed`, `failed` |
| `startDate` | string | Filter settlements from this date (ISO 8601 Safer Date) |
| `endDate` | string | Filter settlements until this date (ISO 8601 Safer Date) |

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "settlements": [
      {
        "id": "STL001234567890",
        "amount": 450000,
        "status": "completed",
        "bankAccount": "GTBank • ****4567",
        "reference": "STL789012",
        "initiatedAt": "2025-01-09T10:30:00.000Z",
        "completedAt": "2025-01-09T14:30:00.000Z",
        "transactionCount": 45
      }
    ],
    "pagination": {
      "total": processos proprietario 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

### Error Responses

| Status Code | Error Response |
|-------------|----------------|
| 401 Unauthorized | `{"success": false, "error": {"message": "Authentication required", "code": "AUTHENTICATION_ERROR"}}` |
| 400 Bad Request | `{"success": false, "error": {"message": "Invalid query parameters", "code": "VALIDATION_ERROR"}}` |

---

## 5. Export Settlement Report

### Endpoint
```
 EstablishGET /merchants/settlements/export
```

### Description
Exports settlement data in a specified format for download.

### Request Headers
```
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | Export format: `csv`, `xlsx`, `pdf` (default: csv) |
| `startDate` | string | Filter settlements from this date (ISO 8601 Safer Date) |
| `endDate` | string | Filter settlements until this date (ISO 8601 Safer Date) |
| `status` | string | Filter by status |

### Success Response (200 OK)
For CSV/XLSX:
- Content-Type: `application/csv` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Returns file download

For PDF:
- Content-Type: `application/pdf`
- Returns file download

### Error Responses

| Status Code | Error Response |
|-------------|----------------|
| 401 Unauthorized | `{"success": false, "error": {"message": "Authentication required", "code": "AUTHENTICATION_ERROR"}}` |
| 400 Bad Request | `{"success": false, "error": {"message": "Unsupported export format", "code": "VALIDATION_ERROR"}}` |

---

## 6. Get Bank Accounts

### Endpoint
```
GET /merchants/bank-accounts
```

### Description
Retrieves all bank accounts associated with the merchant.

### Request Headers
```
Authorization: Bearer <token>
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "bank_123456",
      "accountName": "ABC Company Limited",
      "accountNumber": "0123456789",
      "bankName": "GTBank",
      "bankCode": "058",
      "maskedAccountNumber": "****4567",
      "isPrimary": true,
      "status": "active",
      "lastSettlement": {
        "settlementId": "STL001234567890",
        "amount": 450000,
        "date": "2025-01-09T14:30:00.000Z"
      },
      "createdAt": "2024-12-01T10:00:00.000Z"
    },
    {
      "id": "bank_123457",
      "accountName": "ABC Company Limited",
      "accountNumber": "0123456790",
      "bankName": "Access Bank",
      "bankCode": "044",
      "maskedAccountNumber": "****8901",
      "isPrimary": false,
      "status": "active",
      "lastSettlement": {
        "settlementId": "STL001234567891",
        "amount": 325000,
        "date": "2025-01-09T16:00:00.000Z",
        "status": "processing"
      },
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data[].id` | string | Bank account ID |
| `data[].accountName` | string | Account holder name |
| `data[].accountNumber` | string | Full account number |
| `data[].bankName` | string | Bank name |
| `data[].bankCode` | string | Bank code |
| `data[].maskedAccountNumber` | string | Last 4 digits with mask (e.g., "****4567") |
| `data[].isPrimary` | boolean | Whether this is the primary settlement account |
| `data[].status` | string | Account status: `active`, `inactive`, `pending` |
| `data[].lastSettlement` | object | Details of last settlement to this account |
| `data[].lastSettlement.settlementId` | string | Settlement ID |
| `data[].lastSettlement.amount` | number | Settlement amount |
| `data[].lastSettlement.date` | string | ISO 8601 Safer Date string when settled |
| `data[].lastSettlement.status` | string | Settlement status (optional) |
| `data[].createdAt` | string | ISO 8601 Safer Date string when account was added |

### Error Responses

| Status Code | Error Response |
|-------------|----------------|
| 401 Unauthorized | `{"success": false, "error": {"message": "Authentication required", "code": "AUTHENTICATION_ERROR"}}` |

---

## 7. Add Bank Account

### Endpoint
```
POST /merchants/bank-accounts
```

### Description
Adds a new bank account for settlements.

### Request Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body
```json
{
  "accountNumber": "0123456789",
  "bankCode": "058",
  "accountName": "ABC Company Limited",
  "setAsPrimary": false
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accountNumber` | string | Yes | 10-digit account number |
| `bankCode` | string | Yes | Nigerian bank code (e.g., "058" for GTBank) |
| `accountName` | string | Yes | Account holder name |
| `setAsPrimary` | boolean | No | Set as primary account (default: false) |

### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "bank_123456",
    "accountName": "ABC Company Limited",
    "accountNumber": "0123456789",
    "bankName": "GTBank",
    "bankCode": "058",
    "maskedAccountNumber": "****4567",
    "isPrimary": true,
    "status": "active",
    "createdAt": "2025-01-09T17:00:00.000Z"
  },
  "message": "Bank account added successfully"
}
```

### Error Responses

| Status Code | Error Response |
|-------------|----------------|
| 400 Bad Request | `{"success": false, "error": {"message": "Account verification failed", "code": "VALIDATION_ERROR"}}` |
| 400 Bad Request | `{"success": false, "error": {"message": "Bank account already exists", "code": "VALIDATION_ERROR"}}` |
| 401 Unauthorized | `{"success": false, "error": {"message": "Authentication required", "code": "AUTHENTICATION_ERROR"}}` |

---

## Analysis of Required Changes

### Current API vs Required API

Looking at the current implementation in `src/services/api.ts` (lines 327-338), the `merchantAPI.getStats()` method currently returns:

```typescript
{
  totalTransactions: number;
  completedTransactions: number;
  totalRevenue: number;
  pendingAmount: number;
  recentTransactions: Transaction[];
}
```

**Required Addition**: The endpoint needs to also return:
- `availableBalance` - amount ready for settlement
- `pendingSettlement` - amount currently being processed
- `todaySettlements` - count of today's settlements
- `settlementHistory` - array of settlement records

### Recommended Implementation Approach

1. **Extend the existing `/merchants/stats` endpoint** to include the new settlement-related fields
2. **Create new endpoints** for:
   - Settlement request (`POST /merchants/settlements/request`)
   - Settlement details (`GET /merchants/settlements/:id`)
   - List settlements (`GET /merchants/settlements`)
   - Export settlements (`GET /merchants/settlements/export`)
   - Bank account management (`GET`/`POST /merchants/bank-accounts`)

### Database Schema Recommendations

```sql
-- Settlement Records Table
CREATE TABLE settlements (
  id VARCHAR(50) PRIMARY KEY,
  merchant_id VARCHAR(50) NOT NULL,
  bank_account_id VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  reference VARCHAR(100) UNIQUE NOT NULL,
  fee DECIMAL(15, 2) DEFAULT 0,
  net_amount DECIMAL(15, 2) NOT NULL,
  transaction_count INT DEFAULT 0,
  description TEXT,
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_merchant_status (merchant_id, status),
  INDEX idx_initiated_at (initiated_at),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id),
  FOREIGN KEY (bank_account_id) REFERENCES merchant_bank_accounts(id)
);

-- Merchant Bank Accounts Table
CREATE TABLE merchant_bank_accounts (
  id VARCHAR(50) PRIMARY KEY,
  merchant_id VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  bank_code VARCHAR(10) NOT NULL,
  masked_account_number VARCHAR(20) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  verification_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_merchant (merchant_id),
  FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

-- Settlement Transactions Junction Table
CREATE TABLE settlement_transactions (
  settlement_id VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (settlement_id, transaction_id),
  FOREIGN KEY (settlement_id) REFERENCES settlements(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);
```

### Business Logic Requirements

1. **Available Balance Calculation**:
   - Sum of all completed transactions that haven't been included in any settlement
   - Subtract any pending settlements from available balance

2. **Pending Settlement**:
   - Sum of all settlement amounts with status `pending` or `processing`

3. **Today's Settlements**:
   - Count of settlements completed today (`completedAt` is within today)

4. **Settlement Request**:
   - Validate amount doesn't exceed available balance
   - Create settlement record with status `pending`
   - Queue for processing by settlement service
   - Mark associated transactions as "settled"

5. **Status Updates**:
   - Implement webhook or polling mechanism to update settlement status
   - Update `completedAt` when settlement is finalized

### Testing Recommendations

1. Test with various balance scenarios (zero, negative after fees, large amounts)
2. Test concurrent settlement requests
3. Test bank account verification
4. Test settlement failure scenarios
5. Test pagination and filtering

---

## Integration Notes

The frontend component `SettlementManager.tsx` uses:
- `useMerchantStats()` hook which calls `merchantAPI.getStats()`
- Settlement request button triggers the new settlement endpoint
- Expects real-time updates for settlement status changes

Ensure the backend implements:
1. All endpoints listed above
2. Proper error handling and validation
3. Settlement status updates via webhook or polling
4. Bank account verification with Nigerian banks
5. Fee calculation logic
6. Transaction settling mechanism

