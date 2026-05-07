import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function GuestGaleri() {
  const [dashboard, setDashboard] = useState(null);
  const [tab, setTab] = useState('galeri');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setDashboard(res.data))
      .finally(() => setLoading(false));
  }, []);

  const openLightbox = (fotos, idx) => setLightbox({ fotos, idx });
  const closeLightbox = () => setLightbox(null);
  const prevPhoto = (e) => {
    e.stopPropagation();
    setLightbox(lb => ({ ...lb, idx: (lb.idx - 1 + lb.fotos.length) % lb.fotos.length }));
  };
  const nextPhoto = (e) => {
    e.stopPropagation();
    setLightbox(lb => ({ ...lb, idx: (lb.idx + 1) % lb.fotos.length }));
  };

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  setLightbox(lb => ({ ...lb, idx: (lb.idx - 1 + lb.fotos.length) % lb.fotos.length }));
      if (e.key === 'ArrowRight') setLightbox(lb => ({ ...lb, idx: (lb.idx + 1) % lb.fotos.length }));
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading-spinner text-kurma-600 w-10 h-10 border-4"></div>
    </div>
  );

  const normFoto = (f) => ({
    url:   typeof f === 'string' ? f : f.url,
    title: typeof f === 'string' ? '' : (f.title || ''),
    desc:  typeof f === 'string' ? '' : (f.desc  || ''),
  });

  const tabs = [
    { key: 'galeri',    label: '🖼️ Galeri',    data: (dashboard?.fotoGaleri    || []).map(normFoto) },
    { key: 'aktivitas', label: '✨ Aktivitas', data: (dashboard?.fotoAktivitas  || []).map(normFoto) },
    { key: 'banner',    label: '🌟 Banner',    data: (dashboard?.fotoBanner     || []).map(normFoto) },
  ];

  const activeTab   = tabs.find(t => t.key === tab);
  const activeFotos = activeTab?.data || [];
  const currentPhoto = lightbox ? lightbox.fotos[lightbox.idx] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="page-header">
        <h1 className="page-title text-3xl dark:text-white">🖼️ Galeri Foto</h1>
        <p className="page-subtitle">Koleksi foto dan dokumentasi kegiatan Organisasi Kurma</p>
      </div>

      <div className="flex gap-2 mb-8 bg-stone-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-stone-400">({t.data.length})</span>
          </button>
        ))}
      </div>

      {activeFotos.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-xl font-bold text-stone-700 mb-2">Belum ada foto</h3>
          <p className="text-stone-500">Foto akan segera ditambahkan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {activeFotos.map((foto, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => openLightbox(activeFotos, i)}
            >
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={foto.url}
                  alt={foto.title || `Foto ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { e.target.style.display='none'; }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 text-xl">🔍</div>
                </div>
              </div>
              {(foto.title || foto.desc) && (
                <div className="p-3">
                  {foto.title && <h3 className="text-sm font-semibold text-stone-800 line-clamp-1">{foto.title}</h3>}
                  {foto.desc  && <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">{foto.desc}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && currentPhoto && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4" onClick={closeLightbox}>
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10"
            onClick={closeLightbox}
          >✕</button>

          <div className="absolute top-4 left-4 text-white/60 text-sm bg-black/30 px-3 py-1 rounded-full">
            {lightbox.idx + 1} / {lightbox.fotos.length}
          </div>

          <div className="relative flex items-center justify-center w-full max-w-4xl" onClick={e => e.stopPropagation()}>
            {lightbox.fotos.length > 1 && (
              <button
                className="absolute -left-12 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors text-xl"
                onClick={prevPhoto}
              >‹</button>
            )}

            <img
              src={currentPhoto.url}
              alt={currentPhoto.title || 'Foto'}
              className="max-w-full max-h-[72vh] rounded-2xl shadow-2xl object-contain"
            />

            {lightbox.fotos.length > 1 && (
              <button
                className="absolute -right-12 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors text-xl"
                onClick={nextPhoto}
              >›</button>
            )}
          </div>

          {(currentPhoto.title || currentPhoto.desc) && (
            <div className="mt-4 text-center max-w-lg" onClick={e => e.stopPropagation()}>
              {currentPhoto.title && <p className="text-white font-semibold">{currentPhoto.title}</p>}
              {currentPhoto.desc  && <p className="text-white/60 text-sm mt-1">{currentPhoto.desc}</p>}
            </div>
          )}

          {lightbox.fotos.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto max-w-xl pb-2" onClick={e => e.stopPropagation()}>
              {lightbox.fotos.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(lb => ({ ...lb, idx: i }))}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    i === lightbox.idx ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={f.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
