const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { authMiddleware } = require('../middleware/auth');

// Get chat history for a specific lead and stageContext
router.get('/:leadId/:stageContext', authMiddleware, async (req, res) => {
  try {
    const { leadId, stageContext } = req.params;
    let chat = await Chat.findOne({ lead: leadId, stageContext })
      .populate('messages.sender', 'email role');
    
    // Auto-initialize if it doesn't exist
    if (!chat) {
      chat = new Chat({ lead: leadId, stageContext, messages: [] });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Post a new message
router.post('/:leadId/:stageContext', authMiddleware, async (req, res) => {
  try {
    const { leadId, stageContext } = req.params;
    const { text, attachmentUrl } = req.body;

    let chat = await Chat.findOne({ lead: leadId, stageContext });
    if (!chat) {
      chat = new Chat({ lead: leadId, stageContext, messages: [] });
    }

    chat.messages.push({
      sender: req.user._id,
      text,
      attachmentUrl
    });

    await chat.save();
    // Re-fetch to populate sender for immediate UI display
    chat = await Chat.findOne({ _id: chat._id }).populate('messages.sender', 'email role');
    
    res.status(201).json(chat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
