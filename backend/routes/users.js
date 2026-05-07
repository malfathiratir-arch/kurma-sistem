const router = require('express').Router();
const User = require('../models/User');
const { auth, isPanitia, isAdmin } = require('../middleware/auth');

// GET /api/users — panitia/admin
router.get('/', auth, isPanitia, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// POST /api/users — panitia/admin (tambah user)
router.post('/', auth, isPanitia, async (req, res) => {
  try {
    const { username, password, nama, role, kelas } = req.body;
    if (!username || !password || !nama)
      return res.status(400).json({ message: 'Username, password, dan nama wajib diisi' });

    const exists = await User.findOne({ username: username.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'Username sudah digunakan' });

    // Hanya admin yang bisa buat admin/panitia
    if (['admin', 'panitia'].includes(role) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa membuat akun panitia/admin' });
    }

    const user = await User.create({
      username: username.toLowerCase().trim(),
      password,
      nama,
      role: role || 'ketua_kelas',
      kelas,
    });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Username sudah digunakan' });
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id — panitia/admin
router.put('/:id', auth, isPanitia, async (req, res) => {
  try {
    const { password, role, ...data } = req.body;

    // Hanya admin yang bisa ubah role ke admin/panitia
    if (['admin', 'panitia'].includes(role) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa mengubah role ini' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    Object.assign(user, data);
    if (role) user.role = role;
    if (password && password.length >= 6) user.password = password;

    await user.save();
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/users/:id — admin only
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json({ message: 'User dihapus' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// PATCH /api/users/:id/toggle-aktif — panitia/admin
router.patch('/:id/toggle-aktif', auth, isPanitia, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    user.aktif = !user.aktif;
    await user.save();
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
