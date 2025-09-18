const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const path = require('path');

// Configure AWS S3
const s3Client = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// S3 storage configuration
const s3Storage = multerS3({
  s3: s3Client,
  bucket: process.env.AWS_BUCKET_NAME || 'spleetpay-uploads',
  acl: 'private',
  key: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const folder = req.route?.path.includes('kyc') ? 'kyc' : 'uploads';
    const merchantId = req.user?.merchantId || req.adminUser?.id || 'anonymous';
    
    cb(null, `${folder}/${merchantId}/${file.fieldname}-${uniqueSuffix}.${file.originalname.split('.').pop()}`);
  },
  metadata: (req, file, cb) => {
    cb(null, {
      fieldName: file.fieldname,
      originalName: file.originalname,
      uploadedBy: req.user?.id || req.adminUser?.id || 'anonymous',
      uploadedAt: new Date().toISOString()
    });
  }
});

// Memory storage as fallback
const memoryStorage = multer.memoryStorage();

// File filter for KYC documents
const kycFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG and JPG are allowed for KYC documents.'), false);
  }
};

// File filter for general uploads
const generalFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDF files are allowed.'), false);
  }
};

// Configure multer instances
const kycUpload = multer({
  storage: process.env.AWS_ACCESS_KEY_ID ? s3Storage : memoryStorage,
  fileFilter: kycFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for KYC documents
    files: 10 // Maximum 10 files per upload
  }
});

const generalUpload = multer({
  storage: process.env.AWS_ACCESS_KEY_ID ? s3Storage : memoryStorage,
  fileFilter: generalFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for general uploads
    files: 5 // Maximum 5 files per upload
  }
});

// Single file upload middleware
const uploadSingle = (fieldName = 'file') => {
  return generalUpload.single(fieldName);
};

// Multiple files upload middleware
const uploadMultiple = (fieldName = 'files', maxCount = 5) => {
  return generalUpload.array(fieldName, maxCount);
};

// KYC document upload middleware
const uploadKYCDocument = (fieldName = 'document') => {
  return kycUpload.single(fieldName);
};

// Multiple KYC documents upload middleware
const uploadKYCDocuments = (fieldName = 'documents', maxCount = 10) => {
  return kycUpload.array(fieldName, maxCount);
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds the maximum allowed limit'
        }
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_FILES',
          message: 'Too many files uploaded'
        }
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_FIELD',
          message: 'Unexpected file field'
        }
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: error.message
      }
    });
  }
  
  next(error);
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadKYCDocument,
  uploadKYCDocuments,
  handleUploadError,
  s3Client
}; 