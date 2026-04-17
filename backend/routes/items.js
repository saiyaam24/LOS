const express = require('express');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/items - Returns all items created by the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const items = await Item.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching items' });
  }
});

// POST /api/items - Create a new item
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newItem = new Item({
      title,
      content,
      user: req.user // attached by auth middleware
    });
    const item = await newItem.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error creating item' });
  }
});

// GET /api/items/:id - Returns a specific item
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching item' });
  }
});

// PUT /api/items/:id - Update a specific item
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    let item = await Item.findOne({ _id: req.params.id, user: req.user });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    item.title = title || item.title;
    item.content = content || item.content;
    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating item' });
  }
});

// DELETE /api/items/:id - Delete a specific item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting item' });
  }
});

module.exports = router;
