const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Pengurus = require('../models/Pengurus');

// ── Konfigurasi Multer (DIPERBAIKI) ──────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Menggunakan path absolut agar folder selalu ditemukan
    const dir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Nama file: timestamp-namafile tanpa spasi
    const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s/g, '');
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit 5MB
});

// ── Helper Function untuk Hapus File (TAMBAHAN BIAR AMAN) ─────
const deleteFile = (fileName) => {
  if (fileName && fileName !== 'default.jpg') {
    const filePath = path.join(process.cwd(), 'uploads', fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Gagal menghapus file fisik:", err);
      }
    }
  }
};

// ── Routes ──────────────────────────────────────────────────

// 1. Ambil Semua Data
router.get('/', async (req, res) => {
  try {
    const data = await Pengurus.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Tambah Pengurus Baru
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const newPengurus = new Pengurus({
      nama: req.body.nama,
      jabatan: req.body.jabatan,
      foto: req.file ? req.file.filename : 'default.jpg'
    });
    const saved = await newPengurus.save();
    res.status(201).json(saved);
  } catch (err) {
    // Jika DB gagal simpan tapi file sudah terupload, hapus lagi filenya
    if (req.file) deleteFile(req.file.filename);
    res.status(400).json({ message: err.message });
  }
});

// 3. Update Pengurus (PUT)
router.put('/:id', upload.single('foto'), async (req, res) => {
  try {
    const pengurus = await Pengurus.findById(req.params.id);
    if (!pengurus) {
        if (req.file) deleteFile(req.file.filename); // Hapus file jika data pengurus tdk ada
        return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const updateData = {
      nama: req.body.nama,
      jabatan: req.body.jabatan
    };

    if (req.file) {
      // Simpan nama foto lama sebelum diganti
      const oldFoto = pengurus.foto;
      updateData.foto = req.file.filename;

      // Hapus foto lama dari server
      deleteFile(oldFoto);
    }

    const updated = await Pengurus.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    if (req.file) deleteFile(req.file.filename);
    res.status(400).json({ message: err.message });
  }
});

// 4. Hapus Pengurus
router.delete('/:id', async (req, res) => {
  try {
    const pengurus = await Pengurus.findById(req.params.id);
    if (!pengurus) return res.status(404).json({ message: 'Data tidak ditemukan' });

    // Hapus file fisik foto
    deleteFile(pengurus.foto);

    await Pengurus.findByIdAndDelete(req.params.id);
    res.json({ message: 'Data dan foto berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;