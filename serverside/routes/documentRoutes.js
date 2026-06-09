const express = require('express');
const {
  getDocuments,
  getDocument,
  uploadDocument,
  deleteDocument,
  downloadDocument  // ← MAKE SURE THIS IS IMPORTED
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Document routes
router.route('/')
  .get(getDocuments)
  .post(upload.single('document'), uploadDocument);

router.route('/:id')
  .get(getDocument)
  .delete(deleteDocument);

// Download route - MAKE SURE THIS LINE EXISTS AND downloadDocument IS DEFINED
router.get('/:id/download', downloadDocument);

module.exports = router;