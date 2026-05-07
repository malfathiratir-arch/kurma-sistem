const mongoose = require('mongoose');

const fotoSchema = new mongoose.Schema({
  url:   { type: String, required: true },
  title: { type: String, default: '' },
  desc:  { type: String, default: '' },
}, { _id: false });

const dashboardSchema = new mongoose.Schema({
  singleton:       { type: String, default: 'main', unique: true },
  namaOrganisasi:  { type: String, default: 'Organisasi Kurma' },
  motto:           { type: String, default: 'Bersama Meraih Ridho Allah' },
  deskripsi:       { type: String, default: 'Organisasi pengajian malam yang mengedepankan ukhuwah islamiyah dan ilmu yang bermanfaat.' },
  kontak: {
    email:    { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    instagram:{ type: String, default: '' },
  },
  fotoBanner:    [fotoSchema],
  fotoGaleri:    [fotoSchema],
  fotoAktivitas: [fotoSchema],
  registerTerbuka: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Dashboard', dashboardSchema);
