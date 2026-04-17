const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// Create a new lead (Sales only)
router.post('/', authMiddleware, authorizeRoles('sales'), async (req, res) => {
  try {
    const { companyName, constitution, gstin, source, expectedProduct, expectedQuantum, pocDetails } = req.body;

    // GSTIN uniqueness check
    let existingLead = await Lead.findOne({ gstin });
    if (existingLead) {
      return res.status(400).json({ message: 'Lead with this GSTIN already exists in the system.' });
    }

    const lead = new Lead({
      companyName,
      constitution,
      gstin,
      source,
      expectedProduct,
      expectedQuantum,
      pocDetails,
      createdBy: req.user._id,
      stage: 'pre_screening'
    });

    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get leads based on role
router.get('/', authMiddleware, async (req, res) => {
  try {
    let leads;
    if (req.user.role === 'sales') {
      leads = await Lead.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    } else if (req.user.role === 'management') {
      leads = await Lead.find().populate('assignedAnalyst', 'email').sort({ createdAt: -1 });
    } else if (req.user.role === 'analyst') {
      leads = await Lead.find({ assignedAnalyst: req.user._id }).sort({ createdAt: -1 });
    } else if (req.user.role === 'rcm') {
      leads = await Lead.find({ stage: 'rcm_review' }).populate('assignedAnalyst', 'email').sort({ createdAt: -1 });
    }
    
    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Management assign analyst
router.put('/:id/assign', authMiddleware, authorizeRoles('management'), async (req, res) => {
  try {
    const { analystId } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { assignedAnalyst: analystId },
      { new: true }
    );
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update lead attributes / move stage
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    // Simple state mutation validation could be added here
    Object.assign(lead, updates);
    await lead.save();
    
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('createdBy', 'email')
      .populate('assignedAnalyst', 'email');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
