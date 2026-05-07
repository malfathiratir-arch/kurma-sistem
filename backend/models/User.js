const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true,
    trim: true, minlength: 3, maxlength: 30,
  },
  password: { type: String, required: true, minlength: 6 },
  nama:     { type: String, required: true, trim: true },
  role:     {
    type: String,
    enum: ['admin', 'panitia', 'ketua_kelas'],
    default: 'ketua_kelas',
  },
  kelas:    { type: String, trim: true },
  aktif:    { type: Boolean, default: true },
}, { timestamps: true });

// Hash password sebelum simpan
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Cek password
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Jangan return password di JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
