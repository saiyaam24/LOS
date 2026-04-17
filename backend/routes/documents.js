const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Document = require('../models/Document');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\\s+/g, '_')}`);
  }
});
const upload = multer({ storage });

// Upload a document
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { leadId, type } = req.body;
    
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const document = new Document({
      lead: leadId,
      uploader: req.user._id,
      type,
      originalName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      status: 'pending_verification'
    });

    await document.save();
    res.status(201).json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Fetch documents for a specific lead
router.get('/:leadId', authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({ lead: req.params.leadId }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Verify / Reject a document (Analyst only)
router.put('/:id', authMiddleware, authorizeRoles('analyst'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: status === 'rejected' ? rejectionReason : undefined },
      { new: true }
    );
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete document (Sales or Analyst)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
