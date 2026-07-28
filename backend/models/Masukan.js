const mongoose = require('mongoose');

const masukanSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, 'Nama wajib diisi'],
      trim: true,
    },
    rombel: {
      type: String,
      required: [true, 'Rombel wajib diisi'],
      trim: true,
    },
    masukan: {
      type: String,
      required: [true, 'Pesan masukan tidak boleh kosong'],
      trim: true,
    },
    tanggal: {
      type: Date,
      default: Date.now,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Otomatis membuat createdAt dan updatedAt
  }
);

module.exports = mongoose.model('Masukan', masukanSchema);