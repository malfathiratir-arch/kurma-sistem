const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifikasi token JWT
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token tidak ditemukan, silakan login' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Select hanya field yang dibutuhkan untuk menghemat memori
    const user = await User.findById(decoded.id).select('nama email role'); 
    
    if (!user) {
      return res.status(401).json({ message: 'User sudah tidak terdaftar' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ 
      message: 'Sesi telah berakhir, silakan login kembali',
      error: err.name === 'TokenExpiredError' ? 'expired' : 'invalid' 
    });
  }
};

// Cek role (Pondasi)
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Tidak terautentikasi' });
  
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: `Akses ditolak: Role ${req.user.role} tidak memiliki izin.` 
    });
  }
  next();
};

// --- Shortcut Role ---
const isAdmin     = requireRole('admin');
const isPanitia   = requireRole('admin', 'panitia');
// Tambahan: Bendahara biasanya khusus untuk fitur uang sumbangan
const isBendahara = requireRole('admin', 'bendahara', 'panitia'); 
const isKetua     = requireRole('admin', 'panitia', 'ketua_kelas');

module.exports = { 
  auth, 
  requireRole, 
  isAdmin, 
  isPanitia, 
  isBendahara, // <--- Tambahan baru
  isKetua 
};