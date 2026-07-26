const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const pengurusRoute = require('./routes/pengurus');
require('dotenv').config();
const app = express();

// ── Middleware ──────────────────────────────────────────────
// ── Middleware ──────────────────────────────────────────────
// ── Middleware CORS (Updated untuk Flutter & React) ──────────
app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (Mobile App Flutter, Postman, Android/iOS Native)
    if (!origin) return callback(null, true);

    // Izinkan localhost / 127.0.0.1 port berapa pun (Flutter Web / Dev)
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('http://192.168.') || // IP Lokal HP/Emulator
      origin.startsWith('http://10.0.2.2:')    // IP Emulator Android
    ) {
      return callback(null, true);
    }

    // Izinkan website React kamu
    if (origin === 'https://project-ylnn9.vercel.app') {
      return callback(null, true);
    }

    // Izinkan semua origin saat development jika belum terdaftar
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// Static file serving untuk upload foto
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/pengajian',   require('./routes/pengajian'));
app.use('/api/gelar-terpal',require('./routes/gelarTerpal'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/dashboard',   require('./routes/dashboard'));
app.use('/api/sumbangan',   require('./routes/sumbangan'));
app.use('/api/uang-Makan',   require('./routes/uangmakan'));
app.use('/api/piket',   require('./routes/piket'));
app.use('/api/absensi', require('./routes/absensi'));
app.use('/api/pengurus', require('./routes/pengurus'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'OK', time: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route tidak ditemukan' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── Connect DB & Start ──────────────────────────────────────
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB terhubung');
    app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ Gagal terhubung ke MongoDB:', err.message);
    process.exit(1);
  });
