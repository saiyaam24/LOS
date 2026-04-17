const mongoose = require('mongoose');

// Item schema definition
const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  // Reference back to the User who created the item
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Export the Item model
module.exports = mongoose.model('Item', itemSchema);
