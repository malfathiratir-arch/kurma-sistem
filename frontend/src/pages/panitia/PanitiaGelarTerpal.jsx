import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatTanggal } from '../../utils/helpers';
import toast from 'react-hot-toast';

// Fungsi helper untuk ambil tanggal & hari (contoh: Senin, 2023-10-30)
const getTodayDate = () => {
  const date = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
};

const emptyForm = { pengajianId: '', kelas: '', lokasi: '', catatan: '', tanggalHari: getTodayDate(), panitia: [], petugas: [], pendamping: [], pembimbing: [] };

// 1. TAMBAHKAN PROPS DI SINI (form, inputs, setInputs, dll)
const FieldSection = ({ label, field, keys, colorClass = '', form, inputs, setInputs, addItem, removeItem }) => (
  <div className={colorClass ? `${colorClass} rounded-xl p-3` : ''}>
    <label className={`label ${colorClass ? 'text-purple-700' : ''}`}>{label}</label>
    <div className="space-y-1 mb-2">
      {/* Tambahkan ?.map supaya aman jika data undefined */}
      {form[field]?.map((item, i) => (
        <div key={i} className="flex items-center gap-2 bg-white/60 rounded-lg p-2 text-sm">
          <span className="flex-1">{item.nama}</span>
          <span className="text-stone-400 text-xs">{item.jabatan || item.tugas}</span>
          <button type="button" onClick={() => removeItem(field, i)} className="text-red-400 text-xs">✕</button>
        </div>
      ))}
    </div>
    <div className="flex gap-2">
      {keys.map(k => (
        <input 
          key={k.key} 
          type="text" 
          className="input-field" 
          style={{ width: k.width || 'auto', flex: k.flex || '1' }}
          placeholder={k.placeholder}
          // Tambahkan fallback '' agar input lancar diketik
          value={inputs[field][k.key] || ''}
          onChange={e => setInputs(prev => ({ ...prev, [field]: { ...prev[field], [k.key]: e.target.value } }))} 
        />
      ))}
      <button type="button" onClick={() => addItem(field, keys.map(k => k.key))} className="btn-secondary px-3">+</button>
    </div>
  </div>
);

export default function AdminGelarTerpal() {
  const [pengajianList, setPengajianList] = useState([]);
  const [selectedPengajian, setSelectedPengajian] = useState(null);
  const [gelarList, setGelarList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [inputs, setInputs] = useState({
    panitia: { nama: '', kelas: '', jabatan: '' },
    petugas: { nama: '', kelas: '', tugas: '' },
    pendamping: { nama: '', jabatan: '' },
    pembimbing: { nama: '', jabatan: '' },
  });

  useEffect(() => {
    api.get('/pengajian').then(res => {
      setPengajianList(res.data);
      if (res.data.length > 0) selectPengajian(res.data[0]);
    }).finally(() => setLoading(false));
  }, []);

  const selectPengajian = async (p) => {
    setSelectedPengajian(p);
    const res = await api.get(`/gelar-terpal?pengajianId=${p._id}`);
    setGelarList(res.data);
  };

  const openCreate = () => {
    setForm({ ...emptyForm, pengajianId: selectedPengajian?._id || '', tanggalHari: getTodayDate() });
    setEditMode(false);
    setShowForm(true);
  };

  const openEdit = (gt) => {
    setForm({ ...gt });
    setEditMode(true);
    setShowForm(true);
  };

const handleSave = async (e) => {
  e.preventDefault();
  setSaving(true);

  // Bungkus data form ditambah data pengajian yang sedang aktif
  const payload = {
    ...form,
    tema: selectedPengajian?.tema,    // Ini yang diminta backend
    tanggal: selectedPengajian?.tanggal // Ini juga yang diminta backend
  };

  try {
    if (editMode) {
      await api.put(`/gelar-terpal/${form._id}`, payload); // Kirim payload, bukan form
      toast.success('Gelar Terpal diperbarui!');
    } else {
      await api.post('/gelar-terpal', payload); // Kirim payload, bukan form
      toast.success('Gelar Terpal ditambahkan!');
    }
    setShowForm(false);
    selectPengajian(selectedPengajian);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Gagal menyimpan');
  } finally { setSaving(false); }
};

  const handleDelete = async (id) => {
    if (!confirm('Hapus Gelar Terpal ini?')) return;
    try {
      await api.delete(`/gelar-terpal/${id}`);
      toast.success('Berhasil dihapus');
      selectPengajian(selectedPengajian);
    } catch { toast.error('Gagal menghapus'); }
  };

const addItem = (field, defaultKeys) => {
  const input = inputs[field];
  
  // 1. VALIDASI: Jika input 'nama' kosong, fungsi berhenti.
  if (!input.nama) return; 

  // 2. UPDATE FORM: Menambahkan isi 'inputs' ke array di dalam 'form'
  setForm(f => ({ 
    ...f, 
    [field]: [...f[field], { ...input }] 
  }));

  // 3. RESET INPUT: Mengosongkan kembali kolom input setelah tombol [+] diklik
  setInputs(prev => ({ 
    ...prev, 
    [field]: Object.fromEntries(defaultKeys.map(k => [k, ''])) 
  }));
};

  const removeItem = (field, idx) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

  if (loading) return <div className="flex justify-center py-16"><div className="loading-spinner text-kurma-600 w-10 h-10 border-4"></div></div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="page-header mb-0">
          <h1 className="page-title">🏕️ Gelar Terpal</h1>
          <p className="page-subtitle">Atur pendamping, pembimbing, dan petugas setiap kelas</p>
        </div>
        {selectedPengajian && <button onClick={openCreate} className="btn-primary">+ Tambah</button>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editMode ? 'Edit' : 'Tambah'} Gelar Terpal</h2>
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-700 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* INPUT TANGGAL & HARI (HANYA DITAMBAHKAN) */}
              <div>
                <label className="label">📅 Tanggal & Hari</label>
                <input type="text" className="input-field bg-stone-50" value={form.tanggalHari} onChange={e => setForm({...form, tanggalHari: e.target.value})} placeholder="Senin, 1 Januari 2024" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Kelas *</label>
                  <input type="text" className="input-field" placeholder="XI IPA 1" value={form.kelas} onChange={e => setForm({...form, kelas: e.target.value})} required />
                </div>
                <div>
                  <label className="label">Lokasi *</label>
                  <input type="text" className="input-field" value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})} required />
                </div>
              </div>

              {/* 2. KIRIM PROPS form={form}, inputs={inputs}, dsb... */}
              <FieldSection 
                label="👤 Pendamping (Hanya Admin)" field="pendamping" colorClass="bg-purple-50 border border-purple-100"
                keys={[{ key: 'nama', placeholder: 'Nama pendamping' }, { key: 'jabatan', placeholder: 'Jabatan', width: '130px' }]} 
                form={form} inputs={inputs} setInputs={setInputs} addItem={addItem} removeItem={removeItem}
              />

              <FieldSection 
                label="📖 Pembimbing (Hanya Admin)" field="pembimbing" colorClass="bg-purple-50 border border-purple-100"
                keys={[{ key: 'nama', placeholder: 'Nama pembimbing' }, { key: 'jabatan', placeholder: 'Jabatan', width: '130px' }]} 
                form={form} inputs={inputs} setInputs={setInputs} addItem={addItem} removeItem={removeItem}
              />

              <FieldSection 
                label="👔 Panitia" field="panitia"
                keys={[{ key: 'nama', placeholder: 'Nama' }, { key: 'jabatan', placeholder: 'Jabatan', width: '130px' }]} 
                form={form} inputs={inputs} setInputs={setInputs} addItem={addItem} removeItem={removeItem}
              />

              <FieldSection 
                label="🛠️ Petugas" field="petugas"
                keys={[{ key: 'nama', placeholder: 'Nama' }, { key: 'tugas', placeholder: 'Tugas', width: '130px' }]} 
                form={form} inputs={inputs} setInputs={setInputs} addItem={addItem} removeItem={removeItem}
              />

              <div>
                <label className="label">Catatan</label>
                <textarea className="input-field" rows={3} value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <span className="loading-spinner"></span> : (editMode ? 'Simpan' : 'Tambah')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Kode sisa (GelarList render) tetap sama di bawah... */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-1">Pilih Pengajian</p>
          {pengajianList.map(p => (
            <button key={p._id} onClick={() => selectPengajian(p)} className={`w-full text-left card card-hover ${selectedPengajian?._id === p._id ? 'ring-2 ring-kurma-400 bg-kurma-50' : ''}`}>
              <p className="font-bold text-stone-800 text-sm">{p.tema}</p>
              <p className="text-xs text-stone-400 mt-1">{formatTanggal(p.tanggal)}</p>
              
            </button>
          ))}
        </div>

        <div className="md:col-span-2">
          {gelarList.length === 0 ? (
            <div className="card text-center py-14">
              <div className="text-4xl mb-3">🏕️</div>
              <p className="text-stone-500 text-sm mb-4">Belum ada data untuk pengajian ini</p>
              {selectedPengajian && <button onClick={openCreate} className="btn-primary text-sm">+ Tambah Gelar Terpal</button>}
            </div>
          ) : (
            <div className="space-y-4">
              {gelarList.map(gt => (
                <div key={gt._id} className="card animate-fade-in">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-stone-800">Kelas {gt.kelas}</h3>
                      <p className="text-stone-400 text-sm">📍 {gt.lokasi}</p>
                      {gt.tanggalHari && (
    <p className="text-kurma-600 text-[11px] font-bold mt-1 uppercase tracking-wider">
      📅 {gt.tanggalHari}
    </p>
  )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(gt)} className="btn-secondary text-xs py-1 px-3">Edit</button>
                      <button onClick={() => handleDelete(gt._id)} className="btn-danger text-xs py-1 px-3">Hapus</button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {gt.pendamping?.length > 0 && (
                      <div className="bg-purple-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-purple-500 mb-1">Pendamping</p>
                        {gt.pendamping.map((p, i) => <p key={i} className="text-sm text-stone-700">{p.nama}</p>)}
                      </div>
                    )}
                    {gt.pembimbing?.length > 0 && (
                      <div className="bg-purple-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-purple-500 mb-1">Pembimbing</p>
                        {gt.pembimbing.map((p, i) => <p key={i} className="text-sm text-stone-700">{p.nama}</p>)}
                      </div>
                    )}
                    {gt.panitia?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-stone-400 mb-1">Panitia</p>
                        {gt.panitia.map((p, i) => <p key={i} className="text-sm text-stone-700">{p.nama} <span className="text-stone-400">· {p.jabatan}</span></p>)}
                      </div>
                    )}
                    {gt.petugas?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-stone-400 mb-1">Petugas</p>
                        {gt.petugas.map((p, i) => <p key={i} className="text-sm text-stone-700">{p.nama} <span className="text-stone-400">· {p.tugas}</span></p>)}
                      </div>
                    )}
                  </div>
                  {gt.catatan && <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-800">📝 {gt.catatan}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}