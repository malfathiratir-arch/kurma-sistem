const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config();
const app = express();

// ── Middleware ──────────────────────────────────────────────
// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  // Tambahkan domain Vercel kamu di dalam array ini
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://project-ylnn9.vercel.app' // <--- WAJIB TAMBAH INI
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
