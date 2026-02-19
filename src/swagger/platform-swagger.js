const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SpleetPay Platform API',
      version: '1.0.0',
      description: `
## SpleetPay Platform API

The SpleetPay Platform API allows verified merchants to integrate payment collection directly into their products and services.

### Authentication
All Platform API requests must include your secret API key in the \`X-API-Key\` header:
\`\`\`
X-API-Key: sk_live_xxxxxxxxxxxxxxxx
\`\`\`

Your API key is generated automatically when your KYC is approved. You can also regenerate it from your merchant dashboard.

> ⚠️ **Keep your API key secret.** Never expose it in frontend code or public repositories.

### Base URL
\`\`\`
https://backendapi.spleetpay.com/api/platform
\`\`\`

### Error Format
All errors follow a consistent format:
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
\`\`\`

### Supported Payment Types
| Type | Description |
|------|-------------|
| \`pay_for_me\` | Single payer — one person pays the full amount |
| \`group_split\` | Split among multiple participants |
      `,
      contact: {
        name: 'SpleetPay Developer Support',
        email: 'developers@spleetpay.com',
        url: 'https://spleetpay.com/docs'
      },
      license: {
        name: 'Proprietary',
      }
    },
    servers: [
      {
        url: 'http://localhost:4500/api/platform',
        description: 'Local Development'
      },
      {
        url: 'https://backendapi.spleetpay.com/api/platform',
        description: 'Production'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'Your merchant secret API key (sk_live_...)'
        }
      },
      schemas: {
        // ─── Shared / Primitives ────────────────────────────────────────────
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Human readable message' }
              }
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 5 }
          }
        },

        // ─── Merchant ────────────────────────────────────────────────────────
        MerchantProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            businessName: { type: 'string', example: 'Acme Corp' },
            businessEmail: { type: 'string', format: 'email', example: 'billing@acme.com' },
            businessPhone: { type: 'string', example: '+2348000000001' },
            businessAddress: { type: 'string', example: '1 Marina St, Lagos' },
            businessType: { type: 'string', example: 'retail' },
            websiteUrl: { type: 'string', example: 'https://acme.com' },
            kycStatus: { type: 'string', enum: ['pending', 'submitted', 'approved', 'rejected'] },
            onboardingStatus: { type: 'string', enum: ['draft', 'submitted', 'approved', 'active'] },
            settlementSchedule: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },

        // ─── Payment Requests ────────────────────────────────────────────────
        PaymentRequestCreate: {
          type: 'object',
          required: ['description', 'amount', 'currency'],
          properties: {
            description: { type: 'string', example: 'Invoice #1042 – Web design services' },
            amount: { type: 'number', format: 'double', example: 50000 },
            currency: { type: 'string', example: 'NGN', default: 'NGN' },
            expiresInHours: { type: 'integer', example: 72, description: 'How long before the link expires (hours)' },
            allowTips: { type: 'boolean', default: true }
          }
        },
        GroupSplitCreate: {
          type: 'object',
          required: ['description', 'totalAmount', 'currency', 'participants'],
          properties: {
            description: { type: 'string', example: 'Team dinner at Nok' },
            totalAmount: { type: 'number', format: 'double', example: 120000 },
            currency: { type: 'string', example: 'NGN' },
            splitType: { type: 'string', enum: ['equal', 'unequal'], default: 'equal' },
            expiresInHours: { type: 'integer', example: 48 },
            allowTips: { type: 'boolean', default: true },
            participants: {
              type: 'array',
              minItems: 2,
              items: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: { type: 'string', example: 'Tunde Bello' },
                  email: { type: 'string', format: 'email', example: 'tunde@example.com' },
                  phone: { type: 'string', example: '+2348011112222' },
                  amount: { type: 'number', description: 'Required when splitType is unequal', example: 40000 }
                }
              }
            }
          }
        },
        PaymentRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['pay_for_me', 'group_split'] },
            description: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'partially_paid', 'completed', 'expired'] },
            paymentLink: { type: 'string', example: 'https://receiver.spleetpay.com/p/abc123' },
            qrCodeUrl: { type: 'string', description: 'Base64 data URL of the QR code image' },
            allowTips: { type: 'boolean' },
            expiresAt: { type: 'string', format: 'date-time', nullable: true },
            totalCollected: { type: 'number', example: 50000 },
            participants: {
              type: 'array',
              items: { '$ref': '#/components/schemas/SplitParticipant' }
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        SplitParticipant: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', nullable: true },
            amount: { type: 'number' },
            hasPaid: { type: 'boolean' },
            paidAmount: { type: 'number' },
            paidAt: { type: 'string', format: 'date-time', nullable: true },
            participantLink: { type: 'string' }
          }
        },

        // ─── Transactions ─────────────────────────────────────────────────────
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            reference: { type: 'string', example: 'SPL_1700000000_abc123' },
            type: { type: 'string', enum: ['pay_for_me', 'group_split'] },
            description: { type: 'string' },
            customerName: { type: 'string' },
            customerEmail: { type: 'string', format: 'email' },
            customerPhone: { type: 'string', nullable: true },
            amount: { type: 'number' },
            tipAmount: { type: 'number', default: 0 },
            netAmount: { type: 'number', description: 'Amount after fees' },
            currency: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'partial', 'completed', 'failed', 'refunded', 'cancelled']
            },
            paymentMethod: { type: 'string', example: 'paystack' },
            providerTransactionId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },

        // ─── QR Codes ─────────────────────────────────────────────────────────
        QRCodeCreate: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: { type: 'string', example: 'Counter QR – Pay For Me' },
            type: { type: 'string', enum: ['pay_for_me', 'group_split'] },
            description: { type: 'string', example: 'Scan to pay for your order' },
            usageLimit: { type: 'integer', nullable: true, example: 100, description: 'Max number of times the code can be used. Omit for unlimited.' },
            expiresAt: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        QRCode: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['pay_for_me', 'group_split'] },
            description: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            usageLimit: { type: 'integer', nullable: true },
            usageCount: { type: 'integer' },
            paymentLink: { type: 'string', example: 'https://receiver.spleetpay.com/qr/abc123' },
            qrData: { type: 'string', description: 'Base64 PNG data URL of the QR code image' },
            expiresAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },

        // ─── Analytics ────────────────────────────────────────────────────────
        MerchantStats: {
          type: 'object',
          properties: {
            totalTransactions: { type: 'integer' },
            completedTransactions: { type: 'integer' },
            totalRevenue: { type: 'number' },
            pendingAmount: { type: 'number' },
            recentTransactions: {
              type: 'array',
              items: { '$ref': '#/components/schemas/Transaction' }
            }
          }
        }
      },

      // ─── Reusable parameters ────────────────────────────────────────────────
      parameters: {
        PageParam: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', default: 1 },
          description: 'Page number (1-indexed)'
        },
        LimitParam: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 20, maximum: 100 },
          description: 'Results per page'
        },
        StartDateParam: {
          in: 'query',
          name: 'startDate',
          schema: { type: 'string', format: 'date' },
          description: 'Filter from this date (YYYY-MM-DD)'
        },
        EndDateParam: {
          in: 'query',
          name: 'endDate',
          schema: { type: 'string', format: 'date' },
          description: 'Filter up to this date (YYYY-MM-DD)'
        }
      },

      // ─── Reusable responses ─────────────────────────────────────────────────
      responses: {
        Unauthorized: {
          description: 'Missing or invalid API key',
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' }
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: { code: 'NOT_FOUND', message: 'Resource not found' }
              }
            }
          }
        },
        ValidationError: {
          description: 'Request body or params failed validation',
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'amount must be greater than 0' }
              }
            }
          }
        },
        ServerError: {
          description: 'Unexpected server error',
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    },

    // ─── Global security ───────────────────────────────────────────────────────
    security: [{ ApiKeyAuth: [] }],

    // ─── Tag groupings ─────────────────────────────────────────────────────────
    tags: [
      { name: 'Account', description: 'Merchant profile, API keys, and onboarding status' },
      { name: 'Pay For Me', description: 'Single-payer payment request links' },
      { name: 'Group Split', description: 'Shared payment links for multiple payers' },
      { name: 'QR Codes', description: 'Generate and manage reusable payment QR codes' },
      { name: 'Transactions', description: 'Query completed and pending payment records' },
      { name: 'Analytics', description: 'Revenue and activity summaries' },
    ],

    // ─── Paths ─────────────────────────────────────────────────────────────────
    paths: {

      // ══════════════════════════════════════════════════════════════════════════
      // ACCOUNT
      // ══════════════════════════════════════════════════════════════════════════

      '/account': {
        get: {
          tags: ['Account'],
          summary: 'Get merchant profile',
          description: 'Returns the authenticated merchant\'s business profile along with KYC and onboarding status.',
          operationId: 'getMerchantProfile',
          responses: {
            200: {
              description: 'Merchant profile',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { '$ref': '#/components/schemas/MerchantProfile' }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        },
        put: {
          tags: ['Account'],
          summary: 'Update merchant profile',
          description: 'Update editable fields of the merchant business profile.',
          operationId: 'updateMerchantProfile',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    businessName: { type: 'string' },
                    businessEmail: { type: 'string', format: 'email' },
                    businessPhone: { type: 'string' },
                    businessAddress: { type: 'string' },
                    businessType: { type: 'string' },
                    websiteUrl: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Profile updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { '$ref': '#/components/schemas/MerchantProfile' },
                      message: { type: 'string', example: 'Profile updated successfully' }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      '/account/api-key': {
        post: {
          tags: ['Account'],
          summary: 'Regenerate API key',
          description: 'Generates a new secret API key. **The old key is immediately invalidated.** KYC must be approved before you can generate a key.',
          operationId: 'generateApiKey',
          responses: {
            200: {
              description: 'New API key generated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          apiKey: { type: 'string', example: 'sk_live_a1b2c3d4e5f6...' }
                        }
                      },
                      message: { type: 'string', example: 'API key generated successfully' }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            403: {
              description: 'KYC not yet approved',
              content: {
                'application/json': {
                  schema: { '$ref': '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    error: { code: 'AUTHORIZATION_ERROR', message: 'KYC must be approved to generate API key' }
                  }
                }
              }
            },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      '/account/stats': {
        get: {
          tags: ['Analytics'],
          summary: 'Merchant summary statistics',
          description: 'Returns total transactions, revenue, pending amounts, and the 5 most recent transactions for this merchant.',
          operationId: 'getMerchantStats',
          responses: {
            200: {
              description: 'Merchant statistics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { '$ref': '#/components/schemas/MerchantStats' }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      // ══════════════════════════════════════════════════════════════════════════
      // PAY FOR ME
      // ══════════════════════════════════════════════════════════════════════════

      '/payments/pay-for-me': {
        post: {
          tags: ['Pay For Me'],
          summary: 'Create a Pay-For-Me payment link',
          description: `
Creates a shareable payment link for a single payer.

**Flow:**
1. Call this endpoint → receive \`paymentLink\` and \`qrCodeUrl\`
2. Share the link with your customer (email, SMS, embed)
3. Customer pays → you receive a webhook and the payment appears in transactions
          `,
          operationId: 'createPayForMe',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/PaymentRequestCreate' },
                example: {
                  description: 'Invoice #1042 – Web design services',
                  amount: 150000,
                  currency: 'NGN',
                  expiresInHours: 72,
                  allowTips: true
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Payment link created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { '$ref': '#/components/schemas/PaymentRequest' },
                      message: { type: 'string', example: 'Payment request created successfully' }
                    }
                  }
                }
              }
            },
            400: { '$ref': '#/components/responses/ValidationError' },
            401: { '$ref': '#/components/responses/Unauthorized' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        },
        get: {
          tags: ['Pay For Me'],
          summary: 'List Pay-For-Me requests',
          description: 'Paginated list of all pay-for-me payment requests created by this merchant.',
          operationId: 'listPayForMe',
          parameters: [
            { '$ref': '#/components/parameters/PageParam' },
            { '$ref': '#/components/parameters/LimitParam' },
            { '$ref': '#/components/parameters/StartDateParam' },
            { '$ref': '#/components/parameters/EndDateParam' },
            {
              in: 'query', name: 'status',
              schema: { type: 'string', enum: ['pending', 'completed', 'expired'] },
              description: 'Filter by payment status'
            }
          ],
          responses: {
            200: {
              description: 'List of payment requests',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          payments: {
                            type: 'array',
                            items: { '$ref': '#/components/schemas/PaymentRequest' }
                          },
                          pagination: { '$ref': '#/components/schemas/Pagination' }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      '/payments/pay-for-me/{id}': {
        get: {
          tags: ['Pay For Me'],
          summary: 'Get a single Pay-For-Me request',
          description: 'Retrieve full details of a pay-for-me payment request including the total amount collected so far.',
          operationId: 'getPayForMe',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Payment request ID' }
          ],
          responses: {
            200: {
              description: 'Payment request details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { '$ref': '#/components/schemas/PaymentRequest' }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            404: { '$ref': '#/components/responses/NotFound' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      // ══════════════════════════════════════════════════════════════════════════
      // GROUP SPLIT
      // ══════════════════════════════════════════════════════════════════════════

      '/payments/group-split': {
        post: {
          tags: ['Group Split'],
          summary: 'Create a Group Split payment',
          description: `
Creates a group payment request and sends individual payment links to each participant by email.

**Flow:**
1. Call this endpoint with participant details → each participant receives their unique payment link via email
2. Each participant pays their share independently
3. As participants pay, the payment status updates: \`pending → partially_paid → completed\`
4. You receive webhook events for each payment

**Split Types:**
- \`equal\` — Total is divided evenly. You don't need to specify individual amounts.
- \`unequal\` — You specify each participant's exact amount. Must sum to \`totalAmount\`.
          `,
          operationId: 'createGroupSplit',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/GroupSplitCreate' },
                examples: {
                  equal_split: {
                    summary: 'Equal split (3 people, ₦120,000 total)',
                    value: {
                      description: 'Team dinner at Nok',
                      totalAmount: 120000,
                      currency: 'NGN',
                      splitType: 'equal',
                      expiresInHours: 48,
                      participants: [
                        { name: 'Tunde Bello', email: 'tunde@example.com' },
                        { name: 'Amaka Obi', email: 'amaka@example.com', phone: '+2348011112222' },
                        { name: 'Emeka Eze', email: 'emeka@example.com' }
                      ]
                    }
                  },
                  unequal_split: {
                    summary: 'Custom amounts per person',
                    value: {
                      description: 'Office supplies',
                      totalAmount: 90000,
                      currency: 'NGN',
                      splitType: 'unequal',
                      participants: [
                        { name: 'Tunde Bello', email: 'tunde@example.com', amount: 50000 },
                        { name: 'Amaka Obi', email: 'amaka@example.com', amount: 40000 }
                      ]
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Group split created. Emails dispatched to all participants.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { '$ref': '#/components/schemas/PaymentRequest' },
                      message: { type: 'string', example: 'Group split payment created successfully' }
                    }
                  }
                }
              }
            },
            400: { '$ref': '#/components/responses/ValidationError' },
            401: { '$ref': '#/components/responses/Unauthorized' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        },
        get: {
          tags: ['Group Split'],
          summary: 'List Group Split payments',
          description: 'Paginated list of group split payment requests with per-request contribution progress.',
          operationId: 'listGroupSplits',
          parameters: [
            { '$ref': '#/components/parameters/PageParam' },
            { '$ref': '#/components/parameters/LimitParam' },
            { '$ref': '#/components/parameters/StartDateParam' },
            { '$ref': '#/components/parameters/EndDateParam' },
            {
              in: 'query', name: 'status',
              schema: { type: 'string', enum: ['pending', 'partially_paid', 'completed', 'expired'] }
            },
            {
              in: 'query', name: 'search',
              schema: { type: 'string' },
              description: 'Search by description'
            }
          ],
          responses: {
            200: {
              description: 'Group split payments with stats',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          groupPayments: {
                            type: 'array',
                            items: {
                              allOf: [
                                { '$ref': '#/components/schemas/PaymentRequest' },
                                {
                                  type: 'object',
                                  properties: {
                                    totalCollected: { type: 'number', example: 80000 },
                                    paidParticipants: { type: 'integer', example: 2 },
                                    totalParticipants: { type: 'integer', example: 3 },
                                    completionPercentage: { type: 'number', example: 66.67 }
                                  }
                                }
                              ]
                            }
                          },
                          pagination: { '$ref': '#/components/schemas/Pagination' }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      '/payments/group-split/{id}': {
        get: {
          tags: ['Group Split'],
          summary: 'Get a Group Split payment',
          description: 'Full details of a group split request including all participants and their payment status.',
          operationId: 'getGroupSplit',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Payment request ID' }
          ],
          responses: {
            200: {
              description: 'Group split details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { '$ref': '#/components/schemas/PaymentRequest' }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            404: { '$ref': '#/components/responses/NotFound' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      // ══════════════════════════════════════════════════════════════════════════
      // QR CODES
      // ══════════════════════════════════════════════════════════════════════════

      '/qr-codes': {
        post: {
          tags: ['QR Codes'],
          summary: 'Generate a QR code',
          description: `
Creates a reusable QR code that customers can scan to pay.

**QR code types:**
- \`pay_for_me\` — Each scan opens a fresh payment page where the customer enters any amount
- \`group_split\` — First scanner organises a split; subsequent scanners pay their share

The response includes a \`qrData\` field with a base64 PNG you can print or display immediately.
          `,
          operationId: 'createQRCode',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/QRCodeCreate' },
                examples: {
                  pos_qr: {
                    summary: 'POS counter QR (pay for me, unlimited use)',
                    value: { name: 'Checkout Counter 1', type: 'pay_for_me', description: 'Scan to pay for your purchase' }
                  },
                  event_qr: {
                    summary: 'Event table QR (group split, 200-use limit, expires in 7 days)',
                    value: {
                      name: 'Table 12 – Owambe',
                      type: 'group_split',
                      description: 'Scan to split the table bill',
                      usageLimit: 200,
                      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'QR code created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { '$ref': '#/components/schemas/QRCode' },
                      message: { type: 'string', example: 'QR code generated successfully' }
                    }
                  }
                }
              }
            },
            400: { '$ref': '#/components/responses/ValidationError' },
            401: { '$ref': '#/components/responses/Unauthorized' },
            403: {
              description: 'KYC not approved',
              content: {
                'application/json': {
                  schema: { '$ref': '#/components/schemas/ErrorResponse' }
                }
              }
            },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        },
        get: {
          tags: ['QR Codes'],
          summary: 'List QR codes',
          description: 'Returns all QR codes belonging to the merchant.',
          operationId: 'listQRCodes',
          parameters: [
            { '$ref': '#/components/parameters/PageParam' },
            { '$ref': '#/components/parameters/LimitParam' },
            {
              in: 'query', name: 'type',
              schema: { type: 'string', enum: ['pay_for_me', 'group_split'] }
            },
            {
              in: 'query', name: 'isActive',
              schema: { type: 'boolean', default: true }
            }
          ],
          responses: {
            200: {
              description: 'QR code list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          qrCodes: { type: 'array', items: { '$ref': '#/components/schemas/QRCode' } },
                          pagination: { '$ref': '#/components/schemas/Pagination' }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      '/qr-codes/{id}': {
        get: {
          tags: ['QR Codes'],
          summary: 'Get a QR code',
          operationId: 'getQRCode',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: {
              description: 'QR code details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { '$ref': '#/components/schemas/QRCode' }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            404: { '$ref': '#/components/responses/NotFound' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        },
        put: {
          tags: ['QR Codes'],
          summary: 'Update a QR code',
          description: 'Update the name, description, usage limit, or expiry of a QR code. The QR image and payment link stay the same.',
          operationId: 'updateQRCode',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    usageLimit: { type: 'integer', nullable: true },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'QR code updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { '$ref': '#/components/schemas/QRCode' },
                      message: { type: 'string', example: 'QR code updated successfully' }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            404: { '$ref': '#/components/responses/NotFound' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        },
        delete: {
          tags: ['QR Codes'],
          summary: 'Deactivate a QR code',
          description: 'Marks the QR code as inactive. Existing scans will show an error. This cannot be undone via the API.',
          operationId: 'deactivateQRCode',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: {
              description: 'QR code deactivated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'QR code deactivated successfully' }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            404: { '$ref': '#/components/responses/NotFound' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      '/qr-codes/stats': {
        get: {
          tags: ['QR Codes'],
          summary: 'QR code usage statistics',
          description: 'Aggregate stats: total/active codes, total scans, type breakdown, and top 5 performing codes.',
          operationId: 'getQRCodeStats',
          responses: {
            200: {
              description: 'QR code statistics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          totalQRCodes: { type: 'integer' },
                          activeQRCodes: { type: 'integer' },
                          totalUsage: { type: 'integer' },
                          payForMeCount: { type: 'integer' },
                          groupSplitCount: { type: 'integer' },
                          topQRCodes: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', format: 'uuid' },
                                name: { type: 'string' },
                                type: { type: 'string' },
                                usageCount: { type: 'integer' }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      // ══════════════════════════════════════════════════════════════════════════
      // TRANSACTIONS
      // ══════════════════════════════════════════════════════════════════════════

      '/transactions': {
        get: {
          tags: ['Transactions'],
          summary: 'List transactions',
          description: 'Returns all transactions associated with your merchant account with optional filters.',
          operationId: 'listTransactions',
          parameters: [
            { '$ref': '#/components/parameters/PageParam' },
            { '$ref': '#/components/parameters/LimitParam' },
            { '$ref': '#/components/parameters/StartDateParam' },
            { '$ref': '#/components/parameters/EndDateParam' },
            {
              in: 'query', name: 'status',
              schema: { type: 'string', enum: ['pending', 'processing', 'partial', 'completed', 'failed', 'refunded', 'cancelled'] }
            },
            {
              in: 'query', name: 'type',
              schema: { type: 'string', enum: ['pay_for_me', 'group_split'] }
            },
            {
              in: 'query', name: 'search',
              schema: { type: 'string' },
              description: 'Search by reference, customer name, or customer email'
            }
          ],
          responses: {
            200: {
              description: 'Transaction list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          transactions: { type: 'array', items: { '$ref': '#/components/schemas/Transaction' } },
                          pagination: { '$ref': '#/components/schemas/Pagination' }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      '/transactions/{id}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get a transaction',
          description: 'Retrieve full details for a single transaction including any group split contributors.',
          operationId: 'getTransaction',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Transaction ID' }
          ],
          responses: {
            200: {
              description: 'Transaction details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { '$ref': '#/components/schemas/Transaction' }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            404: { '$ref': '#/components/responses/NotFound' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      '/transactions/{id}/reminders': {
        post: {
          tags: ['Transactions'],
          summary: 'Send payment reminders',
          description: 'Re-sends payment request emails to all **pending** contributors in a group split transaction.',
          operationId: 'sendReminders',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Group split transaction ID' }
          ],
          responses: {
            200: {
              description: 'Reminders sent',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Reminders sent to 2 contributors' }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            404: { '$ref': '#/components/responses/NotFound' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      '/transactions/{id}/cancel': {
        post: {
          tags: ['Transactions'],
          summary: 'Cancel a transaction',
          description: 'Cancels a **pending** transaction. Completed or already-cancelled transactions cannot be cancelled.',
          operationId: 'cancelTransaction',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: {
              description: 'Transaction cancelled',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Transaction cancelled successfully' }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Transaction is not in a cancellable state',
              content: {
                'application/json': {
                  schema: { '$ref': '#/components/schemas/ErrorResponse' }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            404: { '$ref': '#/components/responses/NotFound' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      },

      // ══════════════════════════════════════════════════════════════════════════
      // UTILITIES
      // ══════════════════════════════════════════════════════════════════════════

      '/utils/banks': {
        get: {
          tags: ['Analytics'],
          summary: 'List supported banks',
          description: 'Returns all NGN banks supported for settlement account setup.',
          operationId: 'getBanks',
          security: [{ ApiKeyAuth: [] }],
          responses: {
            200: {
              description: 'Bank list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      allBanks: {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'integer' },
                                name: { type: 'string', example: 'Access Bank' },
                                code: { type: 'string', example: '044' },
                                type: { type: 'string', example: 'nuban' }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: { '$ref': '#/components/responses/Unauthorized' },
            500: { '$ref': '#/components/responses/ServerError' }
          }
        }
      }
    }
  },
  apis: [] // No file scanning — spec is fully defined above
};

const platformSwaggerSpec = swaggerJsdoc(options);

module.exports = platformSwaggerSpec;