const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function main() {
  console.log('--- PROSES DIMULAI ---'); // Cek apakah script jalan
  
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI tidak ditemukan di environment!');
    }

    console.log('Menghubungkan ke:', process.env.MONGODB_URI.split('@')[1]); // Log host saja agar aman
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB');

    // 1. Bersihkan Admin Lama
    const deleted = await User.deleteMany({ username: 'admin' });
    console.log(`🗑️  Menghapus admin lama: ${deleted.deletedCount} dokumen`);

    // 2. Buat Admin Baru (Tanpa hashing manual, biarkan model yang bekerja)
    const newAdmin = new User({
      nama: 'Super Admin',
      username: 'admin',
      password: 'admin123', // Model User.js akan meng-hash ini otomatis
      role: 'admin',
      aktif: true
    });

    console.log('Menyimpan ke database...');
    await newAdmin.save();
    console.log('✅ BERHASIL! Admin baru tersimpan.');
    
    // 3. Verifikasi Hasil Simpan
    const check = await User.findOne({ username: 'admin' });
    console.log('Data di DB:', {
      username: check.username,
      passwordTerhash: check.password.substring(0, 10) + '...'
    });

    console.log('--- SELESAI ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ TERJADI ERROR:', err.message);
    process.exit(1);
  }
}

main();