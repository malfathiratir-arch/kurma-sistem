const mongoose = require('mongoose');

const jadwalSchema = new mongoose.Schema({
  waktu:      { type: String },
  kegiatan:   { type: String },
  keterangan: { type: String },
}, { _id: false });

const orangSchema = new mongoose.Schema({
  nama:    { type: String },
  kelas:   { type: String },
  jabatan: { type: String },
  tugas:   { type: String },
}, { _id: false });

const ruangSchema = new mongoose.Schema({
  namaRuang:  { type: String },
  kelas:      [String],
  pendamping: { type: String },
}, { _id: false });

const pengajianSchema = new mongoose.Schema({
  tanggal:       { type: Date, required: true },
  tema:          { type: String, required: true, trim: true },
  lokasi:        { type: String, default: 'Aula Utama' },
  status:        { type: String, enum: ['upcoming', 'ongoing', 'selesai'], default: 'upcoming' },
  daftarKelas:   [String],
  jadwal:        [jadwalSchema],
  panitia:       [orangSchema],
  petugas:       [orangSchema],
  pendamping:    [orangSchema],
  pembimbing:    [orangSchema],
  pembagianRuang:[ruangSchema],
  foto:          [String],        // array URL foto
  catatan:       { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Pengajian', pengajianSchema);
