const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Pengurus = require('../models/Pengurus');

// Konfigurasi Simpan Foto
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''));
  }
});
const upload = multer({ storage });

// [GET] Ambil Semua Pengurus
router.get('/', async (req, res) => {
  try {
    const data = await Pengurus.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// [POST] Tambah Pengurus
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const newPengurus = new Pengurus({
      nama: req.body.nama,
      jabatan: req.body.jabatan,
      foto: req.file ? req.file.filename : 'default.jpg'
    });
    await newPengurus.save();
    res.status(201).json(newPengurus);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// [PUT] Update Pengurus
router.put('/:id', upload.single('foto'), async (req, res) => {
  try {
    const updateData = {
      nama: req.body.nama,
      jabatan: req.body.jabatan,
    };
    if (req.file) updateData.foto = req.file.filename;

    const updated = await Pengurus.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// [DELETE] Hapus Pengurus
router.delete('/:id', async (req, res) => {
  try {
    const pengurus = await Pengurus.findById(req.params.id);
    if (pengurus && pengurus.foto !== 'default.jpg') {
      const pathFoto = path.join(__dirname, '../uploads/', pengurus.foto);
      if (fs.existsSync(pathFoto)) fs.unlinkSync(pathFoto);
    }
    await Pengurus.findByIdAndDelete(req.params.id);
    res.json({ message: 'Terhapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;