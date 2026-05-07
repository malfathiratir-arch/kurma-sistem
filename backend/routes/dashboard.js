const router = require('express').Router();
const Dashboard = require('../models/Dashboard');
const { auth, isPanitia, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Helper: ambil atau buat singleton dashboard
const getDash = async () => {
  let d = await Dashboard.findOne({ singleton: 'main' });
  if (!d) d = await Dashboard.create({ singleton: 'main' });
  return d;
};

// Helper: hapus file fisik
const deleteFile = (url) => {
  if (!url || !url.startsWith('/uploads/')) return;
  const fp = path.join(__dirname, '../', url);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
};

// ── PUBLIC ──────────────────────────────────────────────────

// GET /api/dashboard — publik, untuk guest
router.get('/', async (req, res) => {
  try {
    const d = await getDash();
    res.json(d);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// ── ADMIN/PANITIA ───────────────────────────────────────────

// PATCH /api/dashboard/settings — update motto, deskripsi, kontak, dll
router.put('/', auth, isPanitia, async (req, res) => {
  try {
    // Pastikan nama field di req.body sama dengan yang ada di allowed
    const allowed = ['motto', 'deskripsi', 'kontakInfo']; 
    const d = await getDash();
    
    allowed.forEach(k => { 
      if (req.body[k] !== undefined) d[k] = req.body[k]; 
    });
    
    await d.save();
    res.json(d);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// PATCH /api/dashboard/toggle-register — admin only
router.patch('/toggle-register', auth, isAdmin, async (req, res) => {
  try {
    const d = await getDash();
    d.registerTerbuka = !d.registerTerbuka;
    await d.save();
    res.json({ registerTerbuka: d.registerTerbuka });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// ── UPLOAD FOTO ─────────────────────────────────────────────
// Mendukung 3 jenis: foto-banner, foto-galeri, foto-aktivitas
// POST /api/dashboard/:jenis  (multipart/form-data, field "foto")

const JENIS_MAP = {
  'foto-banner':    'fotoBanner',
  'foto-galeri':    'fotoGaleri',
  'foto-aktivitas': 'fotoAktivitas',
};

router.post('/:jenis', auth, isPanitia, upload.array('foto', 20), async (req, res) => {
  try {
    const field = JENIS_MAP[req.params.jenis];
    if (!field) return res.status(400).json({ message: 'Jenis foto tidak valid' });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });

    const d = await getDash();
    const { title = '', desc = '' } = req.body;

    req.files.forEach(f => {
      d[field].push({ url: `/uploads/${f.filename}`, title, desc });
    });
    await d.save();
    res.json(d);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/dashboard/foto — hapus satu foto (by URL)
// Body: { tipe: 'fotoGaleri'|'fotoBanner'|'fotoAktivitas', url: '/uploads/...' }
router.delete('/foto', auth, isPanitia, async (req, res) => {
  try {
    const { tipe, url } = req.body;
    const validFields = ['fotoBanner', 'fotoGaleri', 'fotoAktivitas'];
    if (!validFields.includes(tipe)) return res.status(400).json({ message: 'Tipe tidak valid' });

    const d = await getDash();
    d[tipe] = d[tipe].filter(f => (f.url || f) !== url);
    await d.save();
    deleteFile(url);
    res.json(d);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// PATCH /api/dashboard/foto — update title/desc foto
// Body: { tipe, url, title, desc }
router.patch('/foto', auth, isPanitia, async (req, res) => {
  try {
    const { tipe, url, title, desc } = req.body;
    const validFields = ['fotoBanner', 'fotoGaleri', 'fotoAktivitas'];
    if (!validFields.includes(tipe)) return res.status(400).json({ message: 'Tipe tidak valid' });

    const d = await getDash();
    const foto = d[tipe].find(f => (f.url || f) === url);
    if (foto) {
      if (title !== undefined) foto.title = title;
      if (desc  !== undefined) foto.desc  = desc;
    }
    await d.save();
    res.json(d);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
