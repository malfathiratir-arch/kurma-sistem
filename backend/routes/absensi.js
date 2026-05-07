const express = require('express');
const router = express.Router();
const Absensi = require('../models/Absensi');

// ─── GET SEMUA DATA ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const data = await Absensi.find().sort({ kelas: 1, rombel: 1 }).lean();
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Gagal mengambil data' });
  }
});

// ─── POST TAMBAH SISWA (SINGLE) ──────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { nama, kelas, rombel, rayon, gender, absensi } = req.body;
    if (!nama || !kelas || !rombel || !rayon)
      return res.status(400).json({ message: 'Data tidak lengkap' });

    const newData = await Absensi.create({
      nama: nama.trim(), kelas: kelas.trim(), rombel: rombel.trim(),
      rayon: rayon.trim(), gender: gender || 'L',
      absensi: Array.isArray(absensi) ? absensi : [false, false, false, false, false],
    });
    res.status(201).json(newData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── POST BULK INSERT (IMPORT EXCEL / TAMBAH BANYAK SEKALIGUS) ───────────────
router.post('/bulk', async (req, res) => {
  try {
    const { rows } = req.body; // [{ nama, kelas, rombel, rayon, gender }]
    if (!Array.isArray(rows) || rows.length === 0)
      return res.status(400).json({ message: 'Rows tidak valid' });

    const docs = rows.map((r) => ({
      nama: String(r.nama || '').trim(),
      kelas: String(r.kelas || '').trim(),
      rombel: String(r.rombel || '').trim(),
      rayon: String(r.rayon || '').trim(),
      gender: ['L', 'P'].includes(r.gender) ? r.gender : 'L',
      absensi: [false, false, false, false, false],
    })).filter((r) => r.nama && r.kelas && r.rombel && r.rayon);

    if (docs.length === 0)
      return res.status(400).json({ message: 'Tidak ada data valid' });

    // insertMany jauh lebih cepat dari loop satu-satu
    const inserted = await Absensi.insertMany(docs, { ordered: false });
    res.status(201).json({ count: inserted.length, message: `${inserted.length} siswa berhasil ditambahkan` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── DELETE BULK (HAPUS GRUP SEKALIGUS) ──────────────────────────────────────
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ message: 'IDs tidak valid' });

    const result = await Absensi.deleteMany({ _id: { $in: ids } });
    res.json({ deleted: result.deletedCount, message: `${result.deletedCount} data dihapus` });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus data' });
  }
});

// ─── PATCH UPDATE GRUP SEKALIGUS ─────────────────────────────────────────────
// ⚠️ HARUS DI ATAS /:id SUPAYA TIDAK BENTROK
router.patch('/group/update', async (req, res) => {
  try {
    const { ids, kelas, rombel } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ message: 'IDs tidak valid' });

    if (!kelas || !rombel)
      return res.status(400).json({ message: 'Kelas & rombel tidak boleh kosong' });

    const result = await Absensi.updateMany(
      { _id: { $in: ids } },
      { $set: { kelas: kelas.trim(), rombel: rombel.trim() } }
    );
    res.json({ updated: result.modifiedCount, message: 'Grup berhasil diupdate' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal update grup' });
  }
});

// ─── PATCH TOGGLE ABSENSI ─────────────────────────────────────────────────────
router.patch('/:id/check', async (req, res) => {
  try {
    const { indexHari } = req.body;
    if (indexHari === undefined || indexHari < 0 || indexHari > 4)
      return res.status(400).json({ message: 'Index hari tidak valid' });

    // Pakai $bit atau conditional $set langsung tanpa fetch dulu
    const data = await Absensi.findById(req.params.id).select('absensi');
    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });

    const field = `absensi.${indexHari}`;
    const updated = await Absensi.findByIdAndUpdate(
      req.params.id,
      { $set: { [field]: !data.absensi[indexHari] } },
      { new: true }
    ).lean();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal update absensi' });
  }
});

// ─── PATCH UPDATE DATA SISWA ──────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const { nama, kelas, rombel, rayon, gender } = req.body;
    const update = {};
    if (nama) update.nama = nama.trim();
    if (kelas) update.kelas = kelas.trim();
    if (rombel) update.rombel = rombel.trim();
    if (rayon) update.rayon = rayon.trim();
    if (gender) update.gender = gender;

    const updated = await Absensi.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).lean();
    if (!updated) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal update data' });
  }
});

// ─── DELETE SISWA (SINGLE) ────────────────────────────────────────────────────
router.delete('/all', async (req, res) => {
  try {
    const result = await Absensi.deleteMany({});
    res.json({ 
      count: result.deletedCount, 
      message: 'Semua data berhasil dihapus' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal hapus semua' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const data = await Absensi.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json({ message: 'Berhasil dihapus' });
  } catch {
    res.status(500).json({ message: 'Gagal menghapus data' });
  }
});

module.exports = router;