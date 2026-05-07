const mongoose = require('mongoose');

const PetugasSchema = new mongoose.Schema({
  nis: { type: String, required: true },
  nama: { type: String, required: true },
  rombel: { type: String, required: true },
  rayon: { type: String, required: true },
  gender: { type: String, enum: ['Ikhwan', 'Akhwat'], default: 'Ikhwan' },
  tugas: {type:String, default:"Umum"}
}, { _id: false }); // <--- Tambahkan ini jika tidak ingin Mongoose membuat ID untuk tiap nama anak

const PiketSchema = new mongoose.Schema({
  tanggal: { 
    type: Date, 
    required: true 
  },
  petugas: [PetugasSchema], // Menampung banyak petugas dalam satu paket
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Piket', PiketSchema);