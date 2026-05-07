const express = require('express');
const router = express.Router();
const Pengajian = require('../models/Pengajian');
const { protect, authorize } = require('../middleware/auth');

// DELETE /api/komentar/:pengajianId/:komentarId — Admin
router.delete('/:pengajianId/:komentarId', protect, authorize('admin'), async (req, res) => {
  try {
    const pengajian = await Pengajian.findById(req.params.pengajianId);
    if (!pengajian) return res.status(404).json({ message: 'Pengajian tidak ditemukan' });

    pengajian.komentar = pengajian.komentar.filter(
      k => k._id.toString() !== req.params.komentarId
    );
    await pengajian.save();

    res.json({ message: 'Komentar berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
