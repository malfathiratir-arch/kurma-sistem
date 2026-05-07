const router = require('express').Router();
const Pengajian = require('../models/Pengajian');
const { auth, isPanitia } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// GET /api/pengajian — publik
router.get('/', async (req, res) => {
  try {
    const list = await Pengajian.find().sort({ tanggal: -1 });
    res.json(list);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// GET /api/pengajian/:id — publik
router.get('/:id', async (req, res) => {
  try {
    const p = await Pengajian.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Tidak ditemukan' });
    res.json(p);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// POST /api/pengajian — panitia/admin
router.post('/', auth, isPanitia, async (req, res) => {
  try {
    const p = await Pengajian.create(req.body);
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/pengajian/:id — panitia/admin
router.put('/:id', auth, isPanitia, async (req, res) => {
  try {
    const p = await Pengajian.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: 'Tidak ditemukan' });
    res.json(p);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/pengajian/:id — panitia/admin
router.delete('/:id', auth, isPanitia, async (req, res) => {
  try {
    const p = await Pengajian.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: 'Tidak ditemukan' });
    res.json({ message: 'Pengajian dihapus' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// POST /api/pengajian/:id/foto — upload foto
router.post('/:id/foto', auth, isPanitia, upload.array('foto', 10), async (req, res) => {
  try {
    const p = await Pengajian.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Tidak ditemukan' });

    const base = process.env.VITE_API_URL?.replace('/api', '') || `http://localhost:${process.env.PORT || 5000}`;
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    p.foto.push(...urls);
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/pengajian/:id/foto — hapus foto
router.delete('/:id/foto', auth, isPanitia, async (req, res) => {
  try {
    const { url } = req.body;
    const p = await Pengajian.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Tidak ditemukan' });
    p.foto = p.foto.filter(f => f !== url);
    await p.save();

    // Hapus file fisik
    if (url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../', url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json(p);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
