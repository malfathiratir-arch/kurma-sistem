const router = require('express').Router();
const mongoose = require('mongoose'); // Wajib di-import untuk cek validitas ID
const Piket = require('../models/Piket');
const { auth, isPanitia } = require('../middleware/auth');

// Middleware Helper: Mencegah server crash (Error 500) jika format ID ngaco
const cekValidId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Format ID tidak valid' });
  }
  next();
};

// GET — Semua Paket Piket
router.get('/', async (req, res) => {
  try {
    const list = await Piket.find().sort({ tanggal: -1 });
    res.json(list);
  } catch (err) { 
    console.error("GET Piket Error:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message }); 
  }
});

// GET — Detail Paket Berdasarkan ID
router.get('/:id', cekValidId, async (req, res) => {
  try {
    const piket = await Piket.findById(req.params.id);
    if (!piket) return res.status(404).json({ message: 'Paket tidak ditemukan' });
    res.json(piket);
  } catch (err) { 
    res.status(500).json({ message: 'Server error' }); 
  }
});

// POST — Tambah Paket Piket Baru (Admin/Panitia)
router.post('/', auth, isPanitia, async (req, res) => {
  try {
    console.log("Ada request POST ke /api/piket masuk!"); // <--- Cek ini di log Railway
    console.log("Data yang diterima:", req.body); 

    const baru = await Piket.create(req.body);
    res.status(201).json(baru);
  } catch (err) { 
    console.error("POST Piket Error:", err.message);
    res.status(400).json({ message: err.message }); 
  }
});

// PUT — Update Paket Piket (Admin/Panitia)
router.put('/:id', auth, isPanitia, cekValidId, async (req, res) => {
  try {
    const update = await Piket.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!update) return res.status(404).json({ message: 'Paket tidak ditemukan' });
    res.json(update);
  } catch (err) { 
    res.status(400).json({ message: err.message }); 
  }
});

// DELETE — Hapus Satu Paket (Admin/Panitia)
router.delete('/:id', auth, isPanitia, cekValidId, async (req, res) => {
  try {
    const hapus = await Piket.findByIdAndDelete(req.params.id);
    if (!hapus) return res.status(404).json({ message: 'Paket tidak ditemukan' });
    res.json({ message: 'Paket piket berhasil dihapus' });
  } catch (err) { 
    res.status(500).json({ message: 'Server error' }); 
  }
});

module.exports = router;