/**
 * Seed script — jalankan sekali untuk membuat data awal
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Pengajian = require('./models/Pengajian');
const GelarTerpal = require('./models/GelarTerpal');
const Dashboard = require('./models/Dashboard');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Terhubung ke MongoDB');

  // ── Users ──
  const existAdmin = await User.findOne({ username: 'admin' });
  if (!existAdmin) {
    await User.create({
      username: 'admin',
      password: 'admin123',
      nama: 'Super Admin',
      role: 'admin',
    });
    console.log('👤 User admin dibuat  (username: admin | password: admin123)');
  }

  const existPanitia = await User.findOne({ username: 'panitia' });
  if (!existPanitia) {
    await User.create({
      username: 'panitia',
      password: 'panitia123',
      nama: 'Ahmad Panitia',
      role: 'panitia',
    });
    console.log('👤 User panitia dibuat (username: panitia | password: panitia123)');
  }

  const existKetua = await User.findOne({ username: 'ketua1' });
  if (!existKetua) {
    await User.create({
      username: 'ketua1',
      password: 'ketua123',
      nama: 'Budi Ketua',
      role: 'ketua_kelas',
      kelas: 'XII IPA 1',
    });
    console.log('👤 User ketua kelas dibuat (username: ketua1 | password: ketua123)');
  }

  // ── Dashboard ──
  const existDash = await Dashboard.findOne({ singleton: 'main' });
  if (!existDash) {
    await Dashboard.create({
      singleton: 'main',
      namaOrganisasi: 'Organisasi Kurma',
      motto: 'Bersama Meraih Ridho Allah',
      deskripsi: 'Organisasi pengajian malam yang mengedepankan ukhuwah islamiyah dan ilmu yang bermanfaat bagi seluruh civitas sekolah.',
      kontak: {
        email: 'kurma@example.com',
        whatsapp: '08123456789',
        instagram: '@kurma_official',
      },
      registerTerbuka: false,
      fotoBanner: [],
      fotoGaleri: [],
      fotoAktivitas: [],
    });
    console.log('⚙️  Dashboard settings dibuat');
  }

  // ── Pengajian contoh ──
  const countP = await Pengajian.countDocuments();
  if (countP === 0) {
    await Pengajian.insertMany([
      {
        tanggal: new Date('2025-03-15'),
        tema: 'Keutamaan Shalat Berjamaah',
        lokasi: 'Aula Utama',
        status: 'selesai',
        daftarKelas: ['XII IPA 1', 'XII IPA 2', 'XII IPS 1'],
        jadwal: [
          { waktu: '19.30', kegiatan: 'Pembukaan & Tilawah', keterangan: '' },
          { waktu: '19.45', kegiatan: 'Materi Utama', keterangan: 'Keutamaan shalat berjamaah' },
          { waktu: '20.30', kegiatan: 'Tanya Jawab', keterangan: '' },
          { waktu: '21.00', kegiatan: 'Penutup & Doa', keterangan: '' },
        ],
        panitia: [
          { nama: 'Ahmad Fajar', jabatan: 'Ketua Panitia' },
          { nama: 'Siti Aminah', jabatan: 'Sekretaris' },
        ],
        petugas: [
          { nama: 'Muhammad Rizki', tugas: 'MC' },
          { nama: 'Abdullah Hakim', tugas: 'Tilawah' },
        ],
        pendamping: [{ nama: 'Ust. Mahmud, S.Pd.I', jabatan: 'Pembina' }],
        pembimbing: [{ nama: 'Ust. Dr. Hasan', jabatan: 'Penceramah' }],
      },
      {
        tanggal: new Date('2025-04-20'),
        tema: 'Adab dalam Kehidupan Sehari-hari',
        lokasi: 'Masjid Sekolah',
        status: 'upcoming',
        daftarKelas: ['XI IPA 1', 'XI IPA 2', 'XI IPS 1', 'XI IPS 2'],
        jadwal: [
          { waktu: '19.30', kegiatan: 'Registrasi & Tilawah', keterangan: '' },
          { waktu: '19.45', kegiatan: 'Materi: Adab Islami', keterangan: 'Adab kepada orang tua, guru, dan teman' },
          { waktu: '20.45', kegiatan: 'Diskusi Kelompok', keterangan: '' },
          { waktu: '21.15', kegiatan: 'Penutup', keterangan: '' },
        ],
        panitia: [{ nama: 'Fatimah Azzahra', jabatan: 'Ketua Panitia' }],
        petugas: [
          { nama: 'Yusuf Rahman', tugas: 'MC' },
          { nama: 'Khadijah', tugas: 'Tilawah' },
        ],
        pendamping: [{ nama: 'Ust. Ibrahim', jabatan: 'Wali Kelas' }],
        pembimbing: [{ nama: 'Ust. Ali Hassan', jabatan: 'Penceramah' }],
      },
      {
        tanggal: new Date('2025-05-10'),
        tema: 'Bulan Mulia, Kesempatan Mulia',
        lokasi: 'Aula Utama',
        status: 'upcoming',
        daftarKelas: ['X IPA 1', 'X IPA 2', 'X IPS 1'],
        jadwal: [
          { waktu: '19.30', kegiatan: 'Pembukaan', keterangan: '' },
          { waktu: '19.45', kegiatan: 'Ceramah Utama', keterangan: 'Keutamaan bulan-bulan haram' },
          { waktu: '20.30', kegiatan: 'Muhasabah', keterangan: '' },
          { waktu: '21.00', kegiatan: 'Doa Penutup', keterangan: '' },
        ],
        panitia: [{ nama: 'Ridwan Al-Faruq', jabatan: 'Koordinator' }],
        petugas: [{ nama: 'Hamzah', tugas: 'MC' }],
        pendamping: [{ nama: 'Ust. Salim', jabatan: 'Pendamping' }],
        pembimbing: [{ nama: 'Ust. Prof. Umar', jabatan: 'Narasumber' }],
      },
    ]);
    console.log('🌙 3 data pengajian contoh dibuat');
  }

  // ── GelarTerpal contoh ──
  const countGT = await GelarTerpal.countDocuments();
  if (countGT === 0) {
    await GelarTerpal.insertMany([
      {
        tanggal: new Date('2025-02-14'),
        tema: 'Gelar Terpal Semester Genap 2025',
        lokasi: 'Lapangan Utama',
        status: 'selesai',
        daftarKelas: ['XII IPA 1', 'XII IPA 2', 'XII IPS 1', 'XII IPS 2'],
        ruangan: [
          { namaRuang: 'Ruang A', kelas: ['XII IPA 1'], pendamping: 'Budi Santoso' },
          { namaRuang: 'Ruang B', kelas: ['XII IPA 2'], pendamping: 'Siti Rahma' },
          { namaRuang: 'Ruang C', kelas: ['XII IPS 1', 'XII IPS 2'], pendamping: 'Ahmad Fauzi' },
        ],
      },
    ]);
    console.log('🏕️  1 data gelar terpal contoh dibuat');
  }

  console.log('\n🎉 Seed selesai!\n');
  console.log('='.repeat(40));
  console.log('Akun yang tersedia:');
  console.log('  Admin   : admin / admin123');
  console.log('  Panitia : panitia / panitia123');
  console.log('  Ketua   : ketua1 / ketua123');
  console.log('='.repeat(40));

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
