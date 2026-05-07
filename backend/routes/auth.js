const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Dashboard = require('../models/Dashboard');
const { auth } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username dan password wajib diisi' });

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Username atau password salah' });
    if (!user.aktif) return res.status(403).json({ message: 'Akun tidak aktif, hubungi admin' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Username atau password salah' });

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    // Cek apakah register dibuka
    const dash = await Dashboard.findOne({ singleton: 'main' });
    if (dash && !dash.registerTerbuka) {
      return res.status(403).json({ message: 'Pendaftaran sedang ditutup. Hubungi admin.' });
    }

    const { username, password, nama, kelas } = req.body;
    if (!username || !password || !nama)
      return res.status(400).json({ message: 'Username, password, dan nama wajib diisi' });

    const exists = await User.findOne({ username: username.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'Username sudah digunakan' });

    const user = await User.create({
      username: username.toLowerCase().trim(),
      password,
      nama,
      kelas,
      role: 'ketua_kelas',
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Username sudah digunakan' });
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/register-status — publik, untuk cek apakah register dibuka
router.get('/register-status', async (req, res) => {
  try {
    const dash = await Dashboard.findOne({ singleton: 'main' });
    res.json({ registerTerbuka: dash?.registerTerbuka ?? false });
  } catch {
    res.json({ registerTerbuka: false });
  }
});

module.exports = router;
