const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // Phase 1: Lead Creation & Pre-Screening
  companyName: { type: String, required: true },
  constitution: { 
    type: String, 
    enum: ['Private Limited', 'Limited', 'Partnership', 'LLP', 'Sole Prop'],
    required: true
  },
  gstin: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  expectedProduct: { type: String, required: true },
  expectedQuantum: { type: Number, required: true },
  pocDetails: { type: String, required: true },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  assignedAnalyst: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Data gates populated by Analyst in Phase 1
  turnover: { type: Number },
  profit: { type: Number },
  industry: { type: String },
  dateOfIncorporation: { type: Date },

  // Phase 3 & 4 additions
  recommendedAmount: { type: Number },
  recommendedTenure: { type: Number },
  internalNotes: { type: String },
  rejectionReason: { type: String },

  // Lifecycle state machine
  stage: {
    type: String,
    enum: [
      'pre_screening', 
      'underwriting', 
      'cam_assessment', 
      'rcm_review', 
      'closed_won', 
      'closed_lost'
    ],
    default: 'pre_screening'
  }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
