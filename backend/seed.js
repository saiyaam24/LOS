const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Document = require('./models/Document');
const Chat = require('./models/Chat');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Lead.deleteMany({});
    await Document.deleteMany({});
    await Chat.deleteMany({});
    console.log('Existing data cleared.');

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const usersData = [
      { email: 'sales@example.com', password, role: 'sales' },
      { email: 'management@example.com', password, role: 'management' },
      { email: 'analyst@example.com', password, role: 'analyst' },
      { email: 'rcm@example.com', password, role: 'rcm' },
    ];

    await User.insertMany(usersData);
    console.log('Role-specific users created (Password: password123):');
    usersData.forEach(u => console.log(`- ${u.email} (${u.role})`));

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
