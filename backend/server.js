const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const documentRoutes = require('./routes/documents');
const chatRoutes = require('./routes/chats');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
// Authentication routes
app.use('/api/auth', authRoutes);
// LOS Routes
app.use('/api/leads', leadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chats', chatRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
