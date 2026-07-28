const express = require('express');
const router = express.Router();
const Masukan = require('../models/Masukan');

// 🟢 [POST] /api/masukan - Dikirim dari Flutter Guest (guest_berimasukan.dart)
router.post('/', async (req, res) => {
  try {
    const { nama, rombel, masukan, tanggal } = req.body;

    // Validasi sederhana
    if (!nama || !rombel || !masukan) {
      return res.status(400).json({
        success: false,
        message: 'Nama, Rombel, dan Masukan wajib diisi!',
      });
    }

    const newMasukan = new Masukan({
      nama,
      rombel,
      masukan,
      tanggal: tanggal || Date.now(),
    });

    await newMasukan.save();

    return res.status(201).json({
      success: true,
      message: 'Masukan berhasil disimpan',
      data: newMasukan,
    });
  } catch (error) {
    console.error('Error post masukan:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan masukan ke server',
      error: error.message,
    });
  }
});

// 🔵 [GET] /api/masukan - Diambil oleh Flutter Admin (admin_berimasukan.dart)
router.get('/', async (req, res) => {
  try {
    // Mengambil semua masukan, diurutkan dari yang terbaru
    const listMasukan = await Masukan.find().sort({ tanggal: -1 });

    return res.status(200).json({
      success: true,
      count: listMasukan.length,
      data: listMasukan,
    });
  } catch (error) {
    console.error('Error get masukan:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data masukan',
      error: error.message,
    });
  }
});

// 🔴 [DELETE] /api/masukan/:id - Menghapus masukan (oleh Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Masukan.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Data masukan tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Masukan berhasil dihapus',
    });
  } catch (error) {
    console.error('Error delete masukan:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus masukan',
      error: error.message,
    });
  }
});
// 🟡 [PATCH] /api/masukan/:id/toggle - Toggle status isVisible oleh Admin
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const masukanItem = await Masukan.findById(id);

    if (!masukanItem) {
      return res.status(404).json({
        success: false,
        message: 'Data masukan tidak ditemukan',
      });
    }

    masukanItem.isVisible = !masukanItem.isVisible;
    await masukanItem.save();

    return res.status(200).json({
      success: true,
      message: `Masukan berhasil ${masukanItem.isVisible ? 'ditampilkan' : 'disembunyikan'}`,
      data: masukanItem,
    });
  } catch (error) {
    console.error('Error toggle visibility:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah status masukan',
      error: error.message,
    });
  }
});
const Setting = require('../models/Setting');

// 🟢 [GET] /api/masukan/setting - Ambil status ON/OFF fitur (Diakses oleh Guest & Admin)
router.get('/setting', async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: 'show_masukan' });
    if (!setting) {
      // Default pertama kali true (ditampilkan)
      setting = await Setting.create({ key: 'show_masukan', value: true });
    }
    return res.status(200).json({
      success: true,
      showMasukan: setting.value,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 🟡 [PATCH] /api/masukan/setting - Ubah status ON/OFF fitur (Diatur oleh Admin)
router.patch('/setting', async (req, res) => {
  try {
    const { showMasukan } = req.body;
    let setting = await Setting.findOneAndUpdate(
      { key: 'show_masukan' },
      { value: showMasukan },
      { new: true, upsert: true }
    );
    return res.status(200).json({
      success: true,
      showMasukan: setting.value,
      message: `Fitur Beri Masukan berhasil ${setting.value ? 'Diaktifkan' : 'Dimatikan'}`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;