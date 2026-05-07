import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SECTIONS = [
  { key: 'foto-banner', label: 'Foto Banner', field: 'fotoBanner', icon: '🌟', desc: 'Foto yang tampil di hero/banner halaman publik' },
  { key: 'foto-galeri', label: 'Galeri Foto', field: 'fotoGaleri', icon: '🖼️', desc: 'Koleksi foto galeri organisasi' },
  { key: 'foto-aktivitas', label: 'Foto Aktivitas', field: 'fotoAktivitas', icon: '✨', desc: 'Foto aktivitas sehari-hari' },
];

export default function PanitiaFoto() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [activeTab, setActiveTab] = useState('foto-banner');
  const fileRefs = { 'foto-banner': useRef(), 'foto-galeri': useRef(), 'foto-aktivitas': useRef() };

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setDashboard(res.data);
    } finally { setLoading(false); }
  };

  const handleUpload = async (sectionKey, files) => {
    if (!files.length) return;
    setUploading(u => ({ ...u, [sectionKey]: true }));
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('foto', f));
    try {
      await api.post(`/dashboard/${sectionKey}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Foto berhasil diupload!');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload gagal');
    } finally {
      setUploading(u => ({ ...u, [sectionKey]: false }));
    }
  };

  const handleDelete = async (tipe, url) => {
    if (!confirm('Hapus foto ini?')) return;
    try {
      await api.delete('/dashboard/foto', { data: { tipe, url } });
      toast.success('Foto dihapus');
      fetchDashboard();
    } catch { toast.error('Gagal menghapus'); }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="loading-spinner text-kurma-600 w-10 h-10 border-4"></div></div>;

  const activeSection = SECTIONS.find(s => s.key === activeTab);
  const activeFotos = dashboard?.[activeSection?.field] || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🖼️ Kelola Foto Dashboard</h1>
        <p className="page-subtitle">Upload dan kelola foto yang tampil di halaman publik</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => setActiveTab(s.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === s.key ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>
            {s.icon} {s.label}
            <span className="ml-1 text-xs text-stone-400">({(dashboard?.[s.field] || []).length})</span>
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-stone-700">{activeSection?.icon} {activeSection?.label}</h3>
            <p className="text-sm text-stone-400">{activeSection?.desc}</p>
          </div>
          <input
            ref={fileRefs[activeTab]}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleUpload(activeTab, e.target.files)}
          />
          <button
            onClick={() => fileRefs[activeTab].current?.click()}
            className="btn-primary"
            disabled={uploading[activeTab]}
          >
            {uploading[activeTab] ? <span className="loading-spinner"></span> : '📤 Upload Foto'}
          </button>
        </div>

        {/* Drop hint */}
        <div
          className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center cursor-pointer hover:border-kurma-300 hover:bg-kurma-50 transition-all"
          onClick={() => fileRefs[activeTab].current?.click()}
        >
          <div className="text-4xl mb-2">📸</div>
          <p className="text-stone-500 text-sm">Klik atau drag & drop foto di sini</p>
          <p className="text-stone-400 text-xs mt-1">JPG, PNG, WEBP — Max 5MB per file</p>
        </div>
      </div>

      {/* Gallery */}
      {activeFotos.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-stone-400 text-sm">Belum ada foto di bagian ini</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-stone-500 mb-4">{activeFotos.length} foto</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeFotos.map((foto, i) => (
              <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100">
                <img src={foto} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(activeSection.field, foto)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-9 h-9 flex items-center justify-center transition-all hover:bg-red-600 shadow-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
