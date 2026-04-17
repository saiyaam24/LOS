const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  type: { 
    type: String, 
    required: true 
  },
  
  fileUrl: { type: String, required: true },
  originalName: { type: String },

  status: {
    type: String,
    enum: ['pending_verification', 'verified', 'rejected'],
    default: 'pending_verification'
  },
  
  rejectionReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
