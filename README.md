# 🌙 Sistem Organisasi Kurma

Platform pengelolaan kegiatan pengajian malam dan Gelar Terpal dengan sistem kontrol berbasis role.

---

## 📁 Struktur Project

```
kurma-system/
├── backend/          # Express.js API Server
│   ├── models/       # MongoDB Schemas (User, Pengajian, GelarTerpal, Dashboard)
│   ├── routes/       # API Routes
│   ├── middleware/   # Auth & Upload middleware
│   ├── server.js
│   └── .env.example
│
└── frontend/         # React + Vite App
    └── src/
        ├── pages/
        │   ├── auth/      # Login, Register
        │   ├── guest/     # Dashboard publik, Pengajian, Galeri
        │   ├── ketua/     # Dashboard ketua kelas
        │   ├── panitia/   # Dashboard panitia
        │   └── admin/     # Dashboard super admin
        ├── components/
        │   └── layouts/   # PublicLayout, DashboardLayout
        ├── contexts/      # AuthContext
        └── utils/         # api.js, helpers.js
```

---

## 🚀 Cara Menjalankan

### 1. Backend

```bash
cd backend
npm install

# Salin .env.example ke .env dan isi konfigurasi
cp .env.example .env

# Jalankan server
npm run dev       # development (nodemon)
npm start         # production
```

**Isi `.env`:**
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/kurma-db
JWT_SECRET=rahasia_jwt_anda_disini
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Frontend

```bash
cd frontend
npm install

# Jalankan dev server
npm run dev

# Build untuk production
npm run build
```

**Buat file `frontend/.env`:**
```
VITE_API_URL=http://localhost:5000/api
```

---

## 👥 Level Akses

| Role | Akses |
|------|-------|
| **Guest (Publik)** | Lihat dashboard, pengajian, galeri — tanpa login |
| **Ketua Kelas** | Lihat semua data + kirim komentar |
| **Panitia (Kurma)** | CRUD pengajian, gelar terpal, upload foto, kelola ketua kelas |
| **Admin (Super)** | Akses penuh: + pendamping, pembimbing, kelola semua user, pengaturan sistem |

---

## 🗄️ MongoDB Atlas Setup

1. Buat cluster gratis di [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Buat database user dan whitelist IP (atau `0.0.0.0/0` untuk Railway)
3. Salin connection string ke `MONGODB_URI` di `.env`

---

## ☁️ Deploy

### Backend → Railway
1. Push backend ke GitHub repo
2. Create new project di Railway → Deploy from GitHub
3. Set Environment Variables sesuai `.env`
4. Railway otomatis detect Node.js dan jalankan `npm start`

### Frontend → Vercel
1. Push frontend ke GitHub repo
2. Import di [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` ke URL backend Railway (contoh: `https://kurma-backend.railway.app/api`)
4. Deploy!

---

## 🔑 Membuat Admin Pertama

Karena belum ada UI untuk register admin, buat langsung via script Node.js:

```js
// scripts/createAdmin.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await User.create({
    nama: 'Super Admin',
    username: 'admin',
    password: 'password123',
    role: 'admin',
    aktif: true
  });
  console.log('Admin berhasil dibuat!');
  process.exit(0);
});
```

Jalankan: `node scripts/createAdmin.js`

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register (jika register terbuka)
- `GET /api/auth/me` — Info user saat ini
- `GET /api/auth/register-status` — Status register terbuka/tutup

### Pengajian
- `GET /api/pengajian` — Daftar pengajian (publik)
- `GET /api/pengajian/:id` — Detail pengajian (publik)
- `POST /api/pengajian` — Tambah (panitia/admin)
- `PUT /api/pengajian/:id` — Edit (panitia/admin — admin bisa edit pendamping+pembimbing)
- `DELETE /api/pengajian/:id` — Hapus (admin)
- `POST /api/pengajian/:id/foto` — Upload foto (panitia/admin)
- `POST /api/pengajian/:id/komentar` — Tambah komentar (ketua/panitia/admin)

### Gelar Terpal
- `GET /api/gelar-terpal?pengajianId=X` — List per pengajian (publik)
- `POST /api/gelar-terpal` — Tambah (panitia/admin)
- `PUT /api/gelar-terpal/:id` — Edit (panitia/admin)
- `DELETE /api/gelar-terpal/:id` — Hapus (panitia/admin)

### Dashboard
- `GET /api/dashboard` — Info publik
- `PUT /api/dashboard` — Update (panitia/admin)
- `POST /api/dashboard/foto-banner` — Upload banner
- `POST /api/dashboard/foto-galeri` — Upload galeri
- `POST /api/dashboard/foto-aktivitas` — Upload aktivitas
- `DELETE /api/dashboard/foto` — Hapus foto
- `PATCH /api/dashboard/toggle-register` — Buka/tutup register (admin)

### Users
- `GET /api/users` — Daftar user (admin/panitia)
- `POST /api/users` — Tambah user
- `PUT /api/users/:id` — Edit user (admin)
- `DELETE /api/users/:id` — Hapus user (admin)
- `PATCH /api/users/:id/toggle-aktif` — Aktifkan/nonaktifkan (admin)

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Express.js, Node.js |
| Database | MongoDB (Atlas) |
| Auth | JWT (jsonwebtoken) |
| Upload | Multer |
| Deploy FE | Vercel |
| Deploy BE | Railway |
| Font | Plus Jakarta Sans, Amiri |

---

Dibuat dengan ❤️ untuk Organisasi Kurma
