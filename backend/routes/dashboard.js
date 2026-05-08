const router = require('express').Router();
const Dashboard = require('../models/Dashboard');
const { auth, isPanitia, isAdmin } = require('../middleware/auth');

// Integrasi Cloudinary
const uploadCloud = require('../config/cloudinary'); 
const cloudinary = require('cloudinary').v2;

// Helper: ambil atau buat singleton dashboard
const getDash = async () => {
  let d = await Dashboard.findOne({ singleton: 'main' });
  if (!d) d = await Dashboard.create({ singleton: 'main' });
  return d;
};

// ── PUBLIC ──────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const d = await getDash();
    res.json(d);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// ── ADMIN/PANITIA ───────────────────────────────────────────
router.put('/', auth, isPanitia, async (req, res) => {
  try {
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

router.patch('/toggle-register', auth, isAdmin, async (req, res) => {
  try {
    const d = await getDash();
    d.registerTerbuka = !d.registerTerbuka;
    await d.save();
    res.json({ registerTerbuka: d.registerTerbuka });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// ── UPLOAD FOTO ─────────────────────────────────────────────
const JENIS_MAP = {
  'foto-banner':    'fotoBanner',
  'foto-galeri':    'fotoGaleri',
  'foto-aktivitas': 'fotoAktivitas',
};

router.post('/:jenis', auth, isPanitia, uploadCloud.single('foto'), async (req, res) => {
  try {
    const field = JENIS_MAP[req.params.jenis];
    if (!field) return res.status(400).json({ message: 'Jenis foto tidak valid' });
    if (!req.file) return res.status(400).json({ message: 'Tidak ada file yang diupload' });

    const d = await getDash();
    const { title = '', desc = '' } = req.body;

    d[field].push({ 
      url: req.file.path,           
      public_id: req.file.filename, 
      title, 
      desc 
    });

    await d.save();
    res.json(d);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/foto', auth, isPanitia, async (req, res) => {
  try {
    const { tipe, url } = req.body;
    const d = await getDash();

    const fotoIndex = d[tipe].findIndex(f => f.url === url);
    if (fotoIndex === -1) return res.status(404).json({ message: 'Foto tidak ditemukan' });
    
    const foto = d[tipe][fotoIndex];

    if (foto.public_id) {
      await cloudinary.uploader.destroy(foto.public_id);
    }

    d[tipe].splice(fotoIndex, 1);
    await d.save();
    res.json(d);
  } catch (err) { res.status(500).json({ message: 'Gagal menghapus foto' }); }
});

router.patch('/foto', auth, isPanitia, async (req, res) => {
  try {
    const { tipe, url, title, desc } = req.body;
    const validFields = ['fotoBanner', 'fotoGaleri', 'fotoAktivitas'];
    if (!validFields.includes(tipe)) return res.status(400).json({ message: 'Tipe tidak valid' });

    const d = await getDash();
    const foto = d[tipe].find(f => f.url === url);
    if (foto) {
      if (title !== undefined) foto.title = title;
      if (desc  !== undefined) foto.desc  = desc;
    }
    await d.save();
    res.json(d);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;