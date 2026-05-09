const mongoose = require('mongoose');

const PengurusSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  jabatan: { type: String, required: true },
  foto: { type: String, required: true }, // Nama file foto
}, { timestamps: true });

module.exports = mongoose.model('Pengurus', PengurusSchema);