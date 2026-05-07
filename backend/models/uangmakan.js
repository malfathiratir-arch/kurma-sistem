const mongoose = require('mongoose');

const uangMakanSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  nominal: { type: Number, required: true },
  kelas: { type: String, required: true },
  tanggal: { type: Date, default: Date.now },
  adminInput: { type: String } // Opsional: untuk mencatat siapa yang input
});

module.exports = mongoose.model('UangMakan', uangMakanSchema);