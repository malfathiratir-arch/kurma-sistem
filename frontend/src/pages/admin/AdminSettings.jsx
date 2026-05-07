import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const FotoSection = ({
  type, label, field, icon,
  dashboard, formUpload, setFormUpload,
  handleUploadFoto, uploading, handleDeleteFoto
}) => {
  const fotos = dashboard?.[field] || [];

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-50">
        <div>
          <h3 className="font-bold text-stone-800">{icon} {label}</h3>
          <p className="text-sm text-stone-400 mt-0.5">{fotos.length} foto tersimpan</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="p-6 border-b border-stone-50 bg-stone-50/50">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Upload Foto Baru</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">Pilih File</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormUpload(prev => ({ ...prev, [type]: { ...prev[type], file: e.target.files[0] } }))}
                className="w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">Judul Foto</label>
              <input
                type="text"
                placeholder="Masukkan judul foto..."
                value={formUpload[type].title}
                onChange={(e) => setFormUpload(prev => ({ ...prev, [type]: { ...prev[type], title: e.target.value } }))}
                className="input-field text-sm"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">Deskripsi Foto</label>
              <textarea
                placeholder="Deskripsikan foto ini..."
                value={formUpload[type].desc}
                onChange={(e) => setFormUpload(prev => ({ ...prev, [type]: { ...prev[type], desc: e.target.value } }))}
                className="input-field text-sm resize-none"
                rows={3}
              />
            </div>
            <button
              onClick={() => handleUploadFoto(type, formUpload[type].file, formUpload[type].title, formUpload[type].desc)}
              className="btn-primary text-sm w-full py-2.5 flex items-center justify-center gap-2"
              disabled={uploading[type]}
            >
              {uploading[type] ? (
                <><span className="loading-spinner w-4 h-4 border-2" /> Mengupload...</>
              ) : (
                <><span>📤</span> Upload Foto</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="p-6">
        {fotos.length === 0 ? (
          <div className="border-2 border-dashed border-stone-200 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">🖼️</div>
            <p className="text-stone-400 text-sm font-medium">Belum ada foto</p>
            <p className="text-stone-300 text-xs mt-1">Upload foto di atas untuk mulai</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto, i) => {
              // LOGIKA FIX: Pastikan URL terambil dengan benar baik string atau object
              const urlGambar = typeof foto === 'string' ? foto : foto.url;
              const judulFoto = foto.title || '';
              const deskripsiFoto = foto.desc || '';
              
              return (
                <div key={i} className="group relative rounded-xl overflow-hidden bg-stone-100 shadow-sm border border-stone-100">
                  <div className="aspect-video">
                    <img src={urlGambar} alt={judulFoto || ''} className="w-full h-full object-cover" />
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-end p-3">
                    <button
                      type="button"
                      onClick={() => handleDeleteFoto(field, urlGambar)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-lg w-7 h-7 flex items-center justify-center text-xs shadow-lg z-10"
                    >
                      🗑️
                    </button>
                    {judulFoto && <p className="text-white text-xs font-semibold truncate">{judulFoto}</p>}
                    {deskripsiFoto && <p className="text-white/70 text-xs mt-0.5 line-clamp-2">{deskripsiFoto}</p>}
                  </div>
                  {/* Caption below */}
                  {(judulFoto || deskripsiFoto) && (
                    <div className="p-2 bg-white">
                      {judulFoto && <p className="text-xs font-semibold text-stone-700 truncate">{judulFoto}</p>}
                      {deskripsiFoto && <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{deskripsiFoto}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminSettings() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [form, setForm] = useState({ 
    motto: '', 
    deskripsi: '', 
    kontakInfo: { email: '', telepon: '', alamat: '' } 
  });
  const [formUpload, setFormUpload] = useState({
    banner: { file: null, title: '', desc: '' },
    galeri: { file: null, title: '', desc: '' },
    aktivitas: { file: null, title: '', desc: '' }
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/dashboard');
      const d = res.data;
      setDashboard(d);
      setForm({
        motto: d.motto || '',
        deskripsi: d.deskripsi || '',
        kontakInfo: {
          email: d.kontakInfo?.email || '',
          telepon: d.kontakInfo?.telepon || '',
          alamat: d.kontakInfo?.alamat || ''
        }
      });
    } catch (err) {
      toast.error("Gagal memuat data");
    } finally { setLoading(false); }
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // FIX: Kirim data form yang bersih
      await api.put('/dashboard', form);
      toast.success('Pengaturan disimpan!');
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Gagal menyimpan'); 
    } finally { setSaving(false); }
  };

  const handleUploadFoto = async (type, file, title, desc) => {
    if (!file) { toast.error('Pilih file terlebih dahulu'); return; }
    const endpointMap = { banner: 'foto-banner', galeri: 'foto-galeri', aktivitas: 'foto-aktivitas' };
    setUploading(u => ({ ...u, [type]: true }));
    
    const formData = new FormData();
    formData.append('foto', file);
    formData.append('title', title || '');
    formData.append('desc', desc || '');

    try {
      await api.post(`/dashboard/${endpointMap[type]}`, formData);
      toast.success('Foto berhasil diupload!');
      setFormUpload(prev => ({ ...prev, [type]: { file: null, title: '', desc: '' } }));
      fetchData();
    } catch (err) {
      toast.error('Upload gagal');
    } finally {
      setUploading(u => ({ ...u, [type]: false }));
    }
  };

  const handleDeleteFoto = async (tipeField, url) => {
    if (!confirm('Hapus foto ini?')) return;
    
    // Mapping agar sesuai dengan key di database (fotoBanner, fotoGaleri, fotoAktivitas)
    try {
      await api.delete('/dashboard/foto', {
        data: { tipe: tipeField, url: url }
      });
      toast.success('Foto dihapus');
      fetchData();
    } catch (err) {
      toast.error('Gagal menghapus foto');
    }
  };

  const handleToggleRegister = async () => {
    try {
      const res = await api.patch('/dashboard/toggle-register');
      toast.success(res.data.message);
      fetchData();
    } catch { toast.error('Gagal merubah status register'); }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="loading-spinner text-purple-600 w-10 h-10 border-4" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Tetap Sama */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">⚙️ Pengaturan Sistem</h1>
        <p className="text-slate-300 text-sm mt-1">Konfigurasi konten dan tampilan dashboard publik</p>
      </div>

      {/* Register Toggle Tetap Sama */}
      <div className={`rounded-2xl p-5 flex items-center justify-between border-2 ${
        dashboard?.registerTerbuka ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${dashboard?.registerTerbuka ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {dashboard?.registerTerbuka ? '🔓' : '🔒'}
          </div>
          <div>
            <h3 className={`font-bold ${dashboard?.registerTerbuka ? 'text-emerald-800' : 'text-red-800'}`}>
              {dashboard?.registerTerbuka ? 'Register Dibuka' : 'Register Ditutup'}
            </h3>
            <p className={`text-sm ${dashboard?.registerTerbuka ? 'text-emerald-600' : 'text-red-600'}`}>
              {dashboard?.registerTerbuka ? 'Ketua kelas dapat mendaftar sendiri' : 'Pendaftaran manual oleh admin/panitia'}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggleRegister}
          className={`font-semibold px-5 py-2.5 rounded-xl text-sm text-white transition-all shadow-sm ${
            dashboard?.registerTerbuka ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          {dashboard?.registerTerbuka ? 'Tutup' : 'Buka'}
        </button>
      </div>

      {/* Info Umum */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-50">
          <h3 className="font-bold text-stone-800">📝 Informasi Umum</h3>
          <p className="text-sm text-stone-400 mt-0.5">Motto, deskripsi dan informasi kontak organisasi</p>
        </div>
        <form onSubmit={handleSaveInfo} className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Motto Organisasi</label>
              <input type="text" className="input-field" placeholder="Masukkan motto..." value={form.motto} onChange={e => setForm({ ...form, motto: e.target.value })} />
            </div>
            <div>
              <label className="label">Deskripsi</label>
              <textarea className="input-field" rows={2} placeholder="Deskripsi singkat organisasi..." value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label mb-3">Informasi Kontak</label>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-stone-400 mb-1.5">📧 Email</label>
                <input type="email" className="input-field text-sm" placeholder="email@example.com" value={form.kontakInfo.email} onChange={e => setForm({ ...form, kontakInfo: { ...form.kontakInfo, email: e.target.value } })} />
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1.5">📱 Telepon</label>
                <input type="text" className="input-field text-sm" placeholder="08xx..." value={form.kontakInfo.telepon} onChange={e => setForm({ ...form, kontakInfo: { ...form.kontakInfo, telepon: e.target.value } })} />
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1.5">📍 Alamat</label>
                <input type="text" className="input-field text-sm" placeholder="Alamat lengkap..." value={form.kontakInfo.alamat} onChange={e => setForm({ ...form, kontakInfo: { ...form.kontakInfo, alamat: e.target.value } })} />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <span className="loading-spinner w-4 h-4 border-2" /> : '💾 Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>

      {/* Foto Sections - Disesuaikan field agar matching dengan database */}
      <FotoSection type="banner" label="Foto Banner" field="fotoBanner" icon="🌟"
        dashboard={dashboard} formUpload={formUpload} setFormUpload={setFormUpload}
        handleUploadFoto={handleUploadFoto} uploading={uploading} handleDeleteFoto={handleDeleteFoto} />
      <FotoSection type="galeri" label="Galeri Foto" field="fotoGaleri" icon="🖼️"
        dashboard={dashboard} formUpload={formUpload} setFormUpload={setFormUpload}
        handleUploadFoto={handleUploadFoto} uploading={uploading} handleDeleteFoto={handleDeleteFoto} />
      <FotoSection type="aktivitas" label="Foto Aktivitas" field="fotoAktivitas" icon="✨"
        dashboard={dashboard} formUpload={formUpload} setFormUpload={setFormUpload}
        handleUploadFoto={handleUploadFoto} uploading={uploading} handleDeleteFoto={handleDeleteFoto} />
    </div>
  );
}