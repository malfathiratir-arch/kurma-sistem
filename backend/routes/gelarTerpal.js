const router = require('express').Router();
const GelarTerpal = require('../models/GelarTerpal');
const { auth, isPanitia } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// GET — publik
router.get('/', async (req, res) => {
  try {
    const list = await GelarTerpal.find().sort({ tanggal: -1 });
    res.json(list);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const gt = await GelarTerpal.findById(req.params.id);
    if (!gt) return res.status(404).json({ message: 'Tidak ditemukan' });
    res.json(gt);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// POST — panitia/admin
router.post('/', auth, isPanitia, async (req, res) => {
  try {
    const gt = await GelarTerpal.create(req.body);
    res.status(201).json(gt);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT — panitia/admin
router.put('/:id', auth, isPanitia, async (req, res) => {
  try {
    const gt = await GelarTerpal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!gt) return res.status(404).json({ message: 'Tidak ditemukan' });
    res.json(gt);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE — panitia/admin
router.delete('/:id', auth, isPanitia, async (req, res) => {
  try {
    const gt = await GelarTerpal.findByIdAndDelete(req.params.id);
    if (!gt) return res.status(404).json({ message: 'Tidak ditemukan' });
    res.json({ message: 'Gelar Terpal dihapus' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// POST /:id/foto
router.post('/:id/foto', auth, isPanitia, upload.array('foto', 10), async (req, res) => {
  try {
    const gt = await GelarTerpal.findById(req.params.id);
    if (!gt) return res.status(404).json({ message: 'Tidak ditemukan' });
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    gt.foto.push(...urls);
    await gt.save();
    res.json(gt);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /:id/foto
router.delete('/:id/foto', auth, isPanitia, async (req, res) => {
  try {
    const { url } = req.body;
    const gt = await GelarTerpal.findById(req.params.id);
    if (!gt) return res.status(404).json({ message: 'Tidak ditemukan' });
    gt.foto = gt.foto.filter(f => f !== url);
    await gt.save();
    if (url.startsWith('/uploads/')) {
      const fp = path.join(__dirname, '../', url);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    res.json(gt);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
