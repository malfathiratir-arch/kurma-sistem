import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { getRoleBadgeClass, getRoleLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';

const emptyForm = { nama: '', kelas: '', username: '', password: '', role: 'ketua_kelas', aktif: true };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } finally { setLoading(false); }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditMode(false);
    setShowForm(true);
  };

  const openEdit = (u) => {
    setForm({ ...u, password: '' });
    setEditMode(true);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editMode) {
        await api.put(`/users/${form._id}`, payload);
        toast.success('User diperbarui!');
      } else {
        await api.post('/users', payload);
        toast.success('User ditambahkan!');
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User dihapus');
      fetchUsers();
    } catch { toast.error('Gagal menghapus'); }
  };

  const handleToggleAktif = async (id) => {
    try {
      const res = await api.patch(`/users/${id}/toggle-aktif`);
      toast.success(res.data.message);
      fetchUsers();
    } catch { toast.error('Gagal'); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.nama?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) return <div className="flex justify-center py-16"><div className="loading-spinner text-kurma-600 w-10 h-10 border-4"></div></div>;

  return (
    <div className="px-1 sm:px-0">
      {/* Header: Stack di HP, Row di Desktop */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title text-xl sm:text-2xl">👥 Kelola Pengguna</h1>
          <p className="page-subtitle text-sm">Tambah, edit, dan atur akun seluruh pengguna sistem</p>
        </div>
        <button onClick={openCreate} className="btn-primary w-full sm:w-auto text-center">+ Tambah User</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editMode ? 'Edit' : 'Tambah'} Pengguna</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-700 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nama Lengkap *</label>
                  <input type="text" className="input-field" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Kelas</label>
                  <input type="text" className="input-field" placeholder="XI IPA 1" value={form.kelas} onChange={e => setForm({...form, kelas: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">Username *</label>
                <input type="text" className="input-field" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
              </div>
              <div>
                <label className="label">Password {editMode && <span className="text-stone-400 font-normal text-xs">(kosongkan jika tidak diubah)</span>}</label>
                <input type="password" className="input-field" placeholder={editMode ? 'Biarkan kosong jika tidak diubah' : 'Min. 6 karakter'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={editMode ? 0 : 6} required={!editMode} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Role</label>
                  <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="ketua_kelas">Ketua Kelas</option>
                    <option value="panitia">Panitia</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={form.aktif ? 'true' : 'false'} onChange={e => setForm({...form, aktif: e.target.value === 'true'})}>
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary w-full sm:w-auto">Batal</button>
                <button type="submit" className="btn-primary w-full sm:w-auto" disabled={saving}>
                  {saving ? <span className="loading-spinner"></span> : (editMode ? 'Simpan' : 'Tambah')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter & Search: Stack di HP */}
      <div className="flex flex-col gap-3 mb-5">
        <input
          type="text"
          className="input-field w-full sm:max-w-xs"
          placeholder="🔍 Cari nama atau username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto no-scrollbar whitespace-nowrap">
          {['all', 'admin', 'panitia', 'ketua_kelas'].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterRole === r ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>
              {r === 'all' ? 'Semua' : getRoleLabel(r)}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-stone-400 text-sm">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filtered.map(u => (
              <div key={u._id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'panitia' ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {u.nama?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-stone-700 text-sm truncate">{u.nama}</p>
                      <span className={`${getRoleBadgeClass(u.role)} text-[10px] px-1.5 py-0.5`}>{getRoleLabel(u.role)}</span>
                      {!u.aktif && <span className="badge bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5">Nonaktif</span>}
                    </div>
                    <p className="text-xs text-stone-400 truncate">{u.kelas ? `${u.kelas} · ` : ''}@{u.username}</p>
                  </div>
                </div>
                
                {/* Tombol Aksi: Berjejer di HP agar hemat tempat */}
                <div className="flex gap-2 justify-end sm:justify-start border-t sm:border-t-0 pt-3 sm:pt-0">
                  <button onClick={() => handleToggleAktif(u._id)}
                    className={`flex-1 sm:flex-none text-[11px] py-1.5 px-3 rounded-lg font-medium transition-all ${u.aktif ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {u.aktif ? 'Nonaktif' : 'Aktifkan'}
                  </button>
                  <button onClick={() => openEdit(u)} className="flex-1 sm:flex-none text-[11px] py-1.5 px-3 rounded-lg font-medium bg-stone-100 text-stone-600">Edit</button>
                  <button onClick={() => handleDelete(u._id)} className="flex-1 sm:flex-none text-[11px] py-1.5 px-3 rounded-lg font-medium bg-red-50 text-red-600">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}