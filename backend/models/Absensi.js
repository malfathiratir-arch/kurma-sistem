const mongoose = require('mongoose');

const absensiSchema = new mongoose.Schema({
  nama:   { type: String, required: true, trim: true },
  kelas:  { type: String, required: true, trim: true },
  rombel: { type: String, required: true, trim: true },
  rayon:  { type: String, required: true, trim: true },
  gender: { type: String, enum: ['L', 'P'], default: 'L' },
  absensi: { type: [Boolean], default: [false, false, false, false, false] },
}, { timestamps: true });

// Index supaya query sort kelas+rombel cepat
absensiSchema.index({ kelas: 1, rombel: 1 });

module.exports = mongoose.model('Absensi', absensiSchema);