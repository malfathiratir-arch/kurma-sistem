import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatTanggal, getStatusBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';

const emptyForm = {
  tanggal: '', tema: '', lokasi: 'Aula Utama', status: 'upcoming',
  daftarKelas: '', jadwal: [], panitia: [], petugas: [],
  pembagianRuang: []
};

export default function PanitiaPengajian() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const [jadwalInput, setJadwalInput] = useState({ waktu: '', kegiatan: '', keterangan: '' });
  const [panitiaInput, setPanitiaInput] = useState({ nama: '', kelas: '', jabatan: '' });
  const [petugasInput, setPetugasInput] = useState({ nama: '', kelas: '', tugas: '' });
  const [ruangInput, setRuangInput] = useState({ namaRuang: '', kelas: '', pendamping: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/pengajian');
      setList(res.data);
      if (res.data.length > 0 && !selected) setSelected(res.data[0]);
    } finally { setLoading(false); }
  };

  const handleSelect = async (p) => {
    try {
      const res = await api.get(`/pengajian/${p._id}`);
      setSelected(res.data);
    } catch { setSelected(p); }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditMode(false);
    setActiveTab('info');
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      ...p,
      tanggal: p.tanggal ? p.tanggal.slice(0, 10) : '',
      daftarKelas: Array.isArray(p.daftarKelas) ? p.daftarKelas.join(', ') : '',
      pembagianRuang: p.pembagianRuang || [],
    });
    setEditMode(true);
    setActiveTab('info');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        daftarKelas: form.daftarKelas.split(',').map(k => k.trim()).filter(Boolean),
      };
      if (editMode) {
        await api.put(`/pengajian/${form._id}`, payload);
        toast.success('Pengajian diperbarui!');
      } else {
        await api.post('/pengajian', payload);
        toast.success('Pengajian ditambahkan!');
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus pengajian ini?')) return;
    try {
      await api.delete(`/pengajian/${id}`);
      toast.success('Pengajian dihapus');
      setSelected(null);
      fetchData();
    } catch { toast.error('Gagal menghapus'); }
  };

  const addItem = (field, item, reset) => {
    setForm(f => ({ ...f, [field]: [...f[field], { ...item }] }));
    reset();
  };

  const removeItem = (field, idx) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

  const tabs = [
    { id: 'info', label: '📋 Info Dasar' },
    { id: 'ruang', label: '🏫 Pembagian Ruang' },
    { id: 'jadwal', label: '⏰ Jadwal' },
    { id: 'panitia', label: '👔 Panitia & Petugas' },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="loading-spinner text-blue-600 w-10 h-10 border-4" />
      <p className="text-stone-400 text-sm">Memuat data...</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">🌙 Pengajian Malam</h1>
          <p className="text-stone-500 text-sm mt-1">Kelola jadwal, pembagian ruang, panitia & petugas</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Tambah</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editMode ? '✏️ Edit Pengajian' : '➕ Tambah Pengajian'}</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-700 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-stone-100 px-6 gap-1">
              {tabs.map(t => (
                <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                  className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all -mb-px ${
                    activeTab === t.id ? 'border-blue-500 text-blue-700' : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">

                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Tanggal *</label>
                        <input type="date" className="input-field" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} required />
                      </div>
                      <div>
                        <label className="label">Status</label>
                        <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                          <option value="upcoming">Akan Datang</option>
                          <option value="ongoing">Berlangsung</option>
                          <option value="selesai">Selesai</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">Tema *</label>
                      <input type="text" className="input-field" placeholder="Tema pengajian..." value={form.tema} onChange={e => setForm({ ...form, tema: e.target.value })} required />
                    </div>
                    <div>
                      <label className="label">Lokasi</label>
                      <input type="text" className="input-field" value={form.lokasi} onChange={e => setForm({ ...form, lokasi: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Daftar Kelas (pisah koma)</label>
                      <input type="text" className="input-field" placeholder="XI IPA 1, XI IPA 2, XI IPS 1" value={form.daftarKelas} onChange={e => setForm({ ...form, daftarKelas: e.target.value })} />
                    </div>
                  </div>
                )}

                {activeTab === 'ruang' && (
                  <div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                      <p className="text-xs font-semibold text-blue-700 mb-1">🏫 Pembagian Ruang Pengajian Malam</p>
                      <p className="text-xs text-blue-500 mb-3">Tentukan kelas & pendamping untuk setiap ruang</p>
                      <div className="space-y-1.5 mb-3">
                        {form.pembagianRuang.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl p-2.5 text-sm">
                            <span className="font-bold text-blue-700">{r.namaRuang}</span>
                            {r.kelas && <span className="text-stone-500 text-xs bg-stone-100 px-2 py-0.5 rounded-full">{r.kelas}</span>}
                            {r.pendamping && <span className="text-stone-400 text-xs">👤 {r.pendamping}</span>}
                            <button type="button" onClick={() => removeItem('pembagianRuang', i)} className="text-red-400 text-xs ml-auto">✕</button>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input type="text" className="input-field text-sm" placeholder="Nama Ruang" value={ruangInput.namaRuang} onChange={e => setRuangInput({ ...ruangInput, namaRuang: e.target.value })} />
                        <input type="text" className="input-field text-sm" placeholder="Kelas" value={ruangInput.kelas} onChange={e => setRuangInput({ ...ruangInput, kelas: e.target.value })} />
                        <div className="flex gap-1">
                          <input type="text" className="input-field text-sm flex-1" placeholder="Pendamping" value={ruangInput.pendamping} onChange={e => setRuangInput({ ...ruangInput, pendamping: e.target.value })} />
                          <button type="button" onClick={() => addItem('pembagianRuang', ruangInput, () => setRuangInput({ namaRuang: '', kelas: '', pendamping: '' }))} className="btn-secondary px-3 text-lg">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'jadwal' && (
                  <div>
                    <label className="label">⏰ Jadwal Kegiatan</label>
                    <div className="space-y-1.5 mb-3">
                      {form.jadwal.map((j, i) => (
                        <div key={i} className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-xl p-2.5 text-sm">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg font-mono text-xs font-bold">{j.waktu}</span>
                          <span className="flex-1 text-stone-700">{j.kegiatan}</span>
                          <button type="button" onClick={() => removeItem('jadwal', i)} className="text-red-400 text-xs">✕</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="time" className="input-field w-28 text-sm" value={jadwalInput.waktu} onChange={e => setJadwalInput({ ...jadwalInput, waktu: e.target.value })} />
                      <input type="text" className="input-field flex-1 text-sm" placeholder="Nama kegiatan" value={jadwalInput.kegiatan} onChange={e => setJadwalInput({ ...jadwalInput, kegiatan: e.target.value })} />
                      <button type="button" onClick={() => addItem('jadwal', jadwalInput, () => setJadwalInput({ waktu: '', kegiatan: '', keterangan: '' }))} className="btn-secondary px-3 text-lg">+</button>
                    </div>
                  </div>
                )}

                {activeTab === 'panitia' && (
                  <div className="space-y-5">
                    <div>
                      <label className="label">👔 Panitia</label>
                      <div className="space-y-1.5 mb-3">
                        {form.panitia.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-xl p-2.5 text-sm">
                            <span className="flex-1 font-medium text-stone-700">{p.nama}</span>
                            <span className="text-stone-400 text-xs">{p.jabatan}</span>
                            <button type="button" onClick={() => removeItem('panitia', i)} className="text-red-400 text-xs">✕</button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" className="input-field flex-1 text-sm" placeholder="Nama panitia" value={panitiaInput.nama} onChange={e => setPanitiaInput({ ...panitiaInput, nama: e.target.value })} />
                        <input type="text" className="input-field w-32 text-sm" placeholder="Jabatan" value={panitiaInput.jabatan} onChange={e => setPanitiaInput({ ...panitiaInput, jabatan: e.target.value })} />
                        <button type="button" onClick={() => addItem('panitia', panitiaInput, () => setPanitiaInput({ nama: '', kelas: '', jabatan: '' }))} className="btn-secondary px-3 text-lg">+</button>
                      </div>
                    </div>
                    <div>
                      <label className="label">🛠️ Petugas</label>
                      <div className="space-y-1.5 mb-3">
                        {form.petugas.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-xl p-2.5 text-sm">
                            <span className="flex-1 font-medium text-stone-700">{p.nama}</span>
                            <span className="text-stone-400 text-xs">{p.tugas}</span>
                            <button type="button" onClick={() => removeItem('petugas', i)} className="text-red-400 text-xs">✕</button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" className="input-field flex-1 text-sm" placeholder="Nama petugas" value={petugasInput.nama} onChange={e => setPetugasInput({ ...petugasInput, nama: e.target.value })} />
                        <input type="text" className="input-field w-32 text-sm" placeholder="Tugas" value={petugasInput.tugas} onChange={e => setPetugasInput({ ...petugasInput, tugas: e.target.value })} />
                        <button type="button" onClick={() => addItem('petugas', petugasInput, () => setPetugasInput({ nama: '', kelas: '', tugas: '' }))} className="btn-secondary px-3 text-lg">+</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center gap-3 p-6 border-t border-stone-100 bg-stone-50/50">
                <div className="flex gap-1">
                  {tabs.map(t => (
                    <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                      className={`w-2 h-2 rounded-full transition-all ${activeTab === t.id ? 'bg-blue-500 w-5' : 'bg-stone-300'}`} />
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? <span className="loading-spinner w-4 h-4 border-2" /> : (editMode ? '💾 Simpan' : '➕ Tambah')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm text-center py-20">
          <div className="text-6xl mb-4">🌙</div>
          <p className="text-stone-500 mb-4 font-medium">Belum ada pengajian</p>
          <button onClick={openCreate} className="btn-primary">+ Tambah Pengajian</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            {list.map(p => {
              const status = getStatusBadge(p.status);
              return (
                <button key={p._id} onClick={() => handleSelect(p)}
                  className={`w-full text-left bg-white rounded-2xl border p-4 transition-all shadow-sm hover:shadow-md ${
                    selected?._id === p._id ? 'ring-2 ring-blue-400 border-blue-200 bg-blue-50/30' : 'border-stone-100 hover:border-stone-200'
                  }`}>
                  <span className={`badge ${status.class} mb-2`}>{status.label}</span>
                  <p className="font-bold text-stone-800 text-sm leading-tight">{p.tema}</p>
                  <p className="text-xs text-stone-400 mt-1.5">📅 {formatTanggal(p.tanggal)}</p>
                  {p.pembagianRuang?.length > 0 && (
                    <p className="text-xs text-blue-500 mt-1">🏫 {p.pembagianRuang.length} ruang</p>
                  )}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="md:col-span-2 animate-fade-in">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <span className={`badge ${getStatusBadge(selected.status).class} mb-2`}>{getStatusBadge(selected.status).label}</span>
                    <h2 className="text-xl font-bold text-stone-800 leading-tight">{selected.tema}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-stone-500 text-sm">📅 {formatTanggal(selected.tanggal)}</p>
                      <p className="text-stone-400 text-sm">📍 {selected.lokasi}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(selected)} className="btn-secondary text-sm py-1.5 px-3">✏️ Edit</button>
                    <button onClick={() => handleDelete(selected._id)} className="btn-danger text-sm py-1.5 px-3">🗑️</button>
                  </div>
                </div>

                {selected.daftarKelas?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {selected.daftarKelas.map((k, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{k}</span>
                    ))}
                  </div>
                )}

                {/* Pembagian Ruang */}
                {selected.pembagianRuang?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">🏫 Pembagian Ruang</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selected.pembagianRuang.map((r, i) => (
                        <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <p className="font-bold text-blue-800 text-sm">{r.namaRuang}</p>
                          {r.kelas && <p className="text-xs text-blue-600 mt-0.5">👥 {r.kelas}</p>}
                          {r.pendamping && <p className="text-xs text-blue-500 mt-0.5">👤 {r.pendamping}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.jadwal?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">⏰ Jadwal</p>
                    <div className="space-y-2">
                      {selected.jadwal.map((j, i) => (
                        <div key={i} className="flex gap-3 items-center text-sm">
                          <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">{j.waktu}</span>
                          <span className="text-stone-700">{j.kegiatan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {selected.panitia?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">👔 Panitia ({selected.panitia.length})</p>
                      {selected.panitia.map((p, i) => (
                        <p key={i} className="text-sm text-stone-700">{p.nama} <span className="text-stone-400">· {p.jabatan}</span></p>
                      ))}
                    </div>
                  )}
                  {selected.petugas?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">🛠️ Petugas ({selected.petugas.length})</p>
                      {selected.petugas.map((p, i) => (
                        <p key={i} className="text-sm text-stone-700">{p.nama} <span className="text-stone-400">· {p.tugas}</span></p>
                      ))}
                    </div>
                  )}
                </div>

                {selected.komentar?.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-stone-100">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">💬 Komentar ({selected.komentar.length})</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selected.komentar.map((k, i) => (
                        <div key={i} className="bg-stone-50 rounded-xl p-3 text-sm">
                          <p className="text-stone-700">{k.isi}</p>
                          <p className="text-xs text-stone-400 mt-1">{k.nama} · {k.kelas}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
