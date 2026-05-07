import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function PanitiaUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nama: '', kelas: '', username: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/users', form);
      toast.success('Ketua kelas berhasil ditambahkan');
      setShowForm(false);
      setForm({ nama: '', kelas: '', username: '', password: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="loading-spinner text-kurma-600 w-10 h-10 border-4"></div></div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">👥 Ketua Kelas</h1>
          <p className="page-subtitle">Daftar ketua kelas yang terdaftar</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Tambah</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-bold">Tambah Ketua Kelas</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-700 text-xl">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="label">Nama Lengkap *</label>
                <input type="text" className="input-field" placeholder="Nama ketua kelas" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required />
              </div>
              <div>
                <label className="label">Kelas</label>
                <input type="text" className="input-field" placeholder="XI IPA 1" value={form.kelas} onChange={e => setForm({...form, kelas: e.target.value})} />
              </div>
              <div>
                <label className="label">Username *</label>
                <input type="text" className="input-field" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
              </div>
              <div>
                <label className="label">Password *</label>
                <input type="password" className="input-field" placeholder="Min. 6 karakter" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <span className="loading-spinner"></span> : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-stone-400 text-sm">Belum ada ketua kelas terdaftar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {u.nama?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-700 text-sm">{u.nama}</p>
                  <p className="text-xs text-stone-400">{u.kelas || 'Kelas tidak diset'} · @{u.username}</p>
                </div>
                <span className={`badge ${u.aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                  {u.aktif ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
