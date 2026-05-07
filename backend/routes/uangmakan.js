const express = require('express');
const router = express.Router();

// 🔥 pakai lowercase biar aman
const UangMakan = require('../models/uangmakan');

const { auth, isKetua } = require('../middleware/auth');

// 1. GET ALL
router.get('/', auth, async (req, res) => {
  try {
    const data = await UangMakan.find().sort({ tanggal: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST
router.post('/', auth, isKetua, async (req, res) => {
  try {
    const { nama, nominal, kelas } = req.body;

    const baru = new UangMakan({
      nama,
      nominal,
      kelas
    });

    await baru.save();
    res.status(201).json(baru);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. DELETE
router.delete('/:id', auth, isKetua, async (req, res) => {
  try {
    const data = await UangMakan.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json({ message: 'Data berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;