const mongoose = require('mongoose');

// Schema untuk personil (Panitia, Petugas, dll)
const personilSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  jabatan: { type: String }, // Bisa untuk jabatan panitia atau pendamping
  tugas: { type: String },   // Khusus untuk petugas
  kelas: { type: String }
}, { _id: false });

const gelarTerpalSchema = new mongoose.Schema({
  // Relasi ke Pengajian (ID)
  pengajianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pengajian', required: true },
  
  // Data Meta (Diambil dari pengajian saat save)
  tanggal: { type: Date, required: true },
  tema:    { type: String, required: true },
  tanggalHari: { type: String }, // Menyimpan string seperti "Senin, 1 Januari 2024"
  // Data Inti Form
  kelas:   { type: String, required: true }, // Contoh: "XI IPA 1"
  lokasi:  { type: String, required: true }, // Contoh: "Masjid Lantai 1"
  
  // Array of Objects (Sesuai dengan FieldSection di React)
  pendamping: [personilSchema],
  pembimbing: [personilSchema],
  panitia:    [personilSchema],
  petugas:    [personilSchema],
  
  catatan:    { type: String },
  status:     { type: String, enum: ['upcoming', 'ongoing', 'selesai'], default: 'upcoming' }
}, { timestamps: true });

module.exports = mongoose.model('GelarTerpal', gelarTerpalSchema);