const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  attachmentUrl: { type: String }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  
  // Either 'credit_sales' or 'rcm_credit'
  stageContext: { 
    type: String, 
    enum: ['credit_sales', 'rcm_credit'],
    required: true 
  },
  
  messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
