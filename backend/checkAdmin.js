require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOne({ username: 'admin' });
  if (!user) return console.log('❌ User admin tidak ditemukan di DB backend');

  console.log('✅ User admin ditemukan:', user.username);
  const match = await bcrypt.compare('admin123', user.password);
  console.log('Password cocok?', match);

  process.exit();
}

check();