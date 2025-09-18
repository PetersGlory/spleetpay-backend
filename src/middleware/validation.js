const Joi = require('joi');

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: validationErrors
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // User registration
  userRegistration: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    firstName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name must not exceed 100 characters',
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name must not exceed 100 characters',
      'any.required': 'Last name is required'
    }),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
  }),

  // User login
  userLogin: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  // Admin user creation
  adminUserCreation: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    name: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 255 characters',
      'any.required': 'Name is required'
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    role: Joi.string().valid('super_admin', 'admin', 'moderator', 'analyst').required().messages({
      'any.only': 'Role must be one of: super_admin, admin, moderator, analyst',
      'any.required': 'Role is required'
    }),
    permissions: Joi.array().items(Joi.string()).default([]),
    department: Joi.string().max(100).optional()
  }),

  // Transaction creation
  transactionCreation: Joi.object({
    type: Joi.string().valid('pay_for_me', 'group_split').required().messages({
      'any.only': 'Type must be either pay_for_me or group_split',
      'any.required': 'Transaction type is required'
    }),
    amount: Joi.number().positive().precision(2).required().messages({
      'number.positive': 'Amount must be a positive number',
      'any.required': 'Amount is required'
    }),
    currency: Joi.string().length(3).uppercase().default('NGN').messages({
      'string.length': 'Currency must be a 3-letter code',
      'string.uppercase': 'Currency must be uppercase'
    }),
    description: Joi.string().max(1000).optional(),
    customerName: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Customer name must be at least 2 characters long',
      'string.max': 'Customer name must not exceed 255 characters',
      'any.required': 'Customer name is required'
    }),
    customerEmail: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid customer email address',
      'any.required': 'Customer email is required'
    }),
    customerPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    expiresAt: Joi.date().greater('now').optional().messages({
      'date.greater': 'Expiration date must be in the future'
    }),
    contributors: Joi.when('type', {
      is: 'group_split',
      then: Joi.array().items(
        Joi.object({
          name: Joi.string().min(2).max(255).required(),
          email: Joi.string().email().required(),
          phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
          amount: Joi.number().positive().precision(2).required()
        })
      ).min(1).required(),
      otherwise: Joi.forbidden()
    })
  }),

  // KYC submission
  kycSubmission: Joi.object({
    businessName: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Business name must be at least 2 characters long',
      'string.max': 'Business name must not exceed 255 characters',
      'any.required': 'Business name is required'
    }),
    businessEmail: Joi.string().email().optional().messages({
      'string.email': 'Please provide a valid business email address'
    }),
    businessPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    businessAddress: Joi.string().max(1000).optional(),
    cacNumber: Joi.string().max(50).optional(),
    businessType: Joi.string().max(100).optional(),
    websiteUrl: Joi.string().uri().optional().messages({
      'string.uri': 'Please provide a valid website URL'
    }),
    settlementAccount: Joi.object({
      accountNumber: Joi.string().pattern(/^\d{10}$/).required().messages({
        'string.pattern.base': 'Account number must be 10 digits'
      }),
      bankCode: Joi.string().length(3).required().messages({
        'string.length': 'Bank code must be 3 characters'
      }),
      accountName: Joi.string().min(2).max(255).required().messages({
        'string.min': 'Account name must be at least 2 characters long',
        'string.max': 'Account name must not exceed 255 characters',
        'any.required': 'Account name is required'
      })
    }).required(),
    directors: Joi.array().items(
      Joi.object({
        fullName: Joi.string().min(2).max(255).required(),
        bvn: Joi.string().pattern(/^\d{11}$/).required().messages({
          'string.pattern.base': 'BVN must be 11 digits'
        }),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
        email: Joi.string().email().optional(),
        ownershipPercentage: Joi.number().min(0).max(100).precision(2).optional()
      })
    ).min(1).required()
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  // Date range
  dateRange: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
  }),

  // UUID parameter
  uuidParam: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid ID format',
      'any.required': 'ID is required'
    })
  })
};

module.exports = {
  validate,
  schemas
};
