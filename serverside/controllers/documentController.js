const Document = require('../models/Document');
const fs = require('fs');

// @desc    Get all documents
exports.getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user.id }).populate('familyMember', 'name relationship');
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document
exports.getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id).populate('familyMember', 'name relationship');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload document
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    console.log('Upload request body:', req.body);
    console.log('FamilyMember ID:', req.body.familyMember);

    const documentData = {
      user: req.user.id,
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      type: req.file.mimetype
    };

    // Add familyMember if provided
    if (req.body.familyMember && req.body.familyMember !== 'null' && req.body.familyMember !== '') {
      documentData.familyMember = req.body.familyMember;
    }

    const document = await Document.create(documentData);
    
    // Populate familyMember data before sending response
    await document.populate('familyMember', 'name relationship');

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
};

// @desc    Delete document
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (document.path && fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    await document.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download document
exports.downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (document.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!fs.existsSync(document.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.download(document.path, document.originalName);
  } catch (error) {
    next(error);
  }
};