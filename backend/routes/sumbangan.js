const express = require('express');
const router = express.Router();
const Sumbangan = require('../models/Sumbangan');
const authMiddleware = require('../middleware/auth'); 

// Pastikan kita mengambil fungsinya, bukan object-nya
const auth = typeof authMiddleware === 'function' ? authMiddleware : authMiddleware.auth;

router.post('/', auth, async (req, res) => {
  try {
    const { nama, nominal, tipe } = req.body;
    const newSumbangan = new Sumbangan({ nama, nominal, tipe });
    await newSumbangan.save();
    res.status(201).json(newSumbangan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const data = await Sumbangan.find().sort({ tanggal: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Sumbangan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Data dihapus' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;