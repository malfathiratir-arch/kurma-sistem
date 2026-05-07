const mongoose = require('mongoose');

const sumbanganSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  nominal: { type: Number, required: true },
  tipe: { 
    type: String, 
    enum: ['Takziah', 'Infaq', 'Acara'], 
    default: 'Infaq' 
  },
  tanggal: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sumbangan', sumbanganSchema);