import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatTanggal } from '../../utils/helpers';

export default function GuestUangsumbangan() {
  const [sumbangan, setSumbangan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sumbangan')
      .then(res => setSumbangan(res.data))
      .finally(() => setLoading(false));
  }, []);

  const config = {
    Takziah: { bg: 'bg-slate-100', text: 'text-slate-600', icon: '🖤', gradient: 'from-slate-500 to-slate-700' },
    Infaq: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '🕌', gradient: 'from-emerald-500 to-teal-600' },
    Acara: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🎊', gradient: 'from-blue-500 to-indigo-600' }
  };

  const totalSumbangan = sumbangan.reduce((acc, curr) => acc + curr.nominal, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24 pt-4 px-4 animate-fade-in">
      
      {/* Card Header Premium */}
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl transition-all duration-500 hover:shadow-indigo-200/50">
        {/* Animated Background Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl group-hover:bg-indigo-600/30 transition-colors" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-2">
          <div className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 mb-2">
            <p className="text-indigo-200 text-[10px] uppercase tracking-[0.2em] font-black">
              Total Dana Kolektif
            </p>
          </div>
          
          <div className="flex items-baseline gap-1">
            <span className="text-indigo-300 text-2xl font-light">Rp</span>
            <h1 className="text-6xl font-black text-white tracking-tighter italic">
              {totalSumbangan.toLocaleString('id-ID')}
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-2xl mt-4 border border-emerald-500/20">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <p className="text-emerald-400 text-[11px] font-bold tracking-wide uppercase">Sistem Laporan Otomatis</p>
          </div>
        </div>
      </div>

      {/* Konten Daftar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Riwayat Kontribusi</h2>
          <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm font-medium animate-pulse">Menyelaraskan data...</p>
            </div>
          ) : sumbangan.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-medium">Belum ada dana masuk hari ini.</p>
            </div>
          ) : (
            sumbangan.map((item) => (
              <div 
                key={item._id} 
                className="group relative bg-white hover:bg-slate-50 p-5 rounded-[2rem] flex items-center justify-between border border-slate-100 shadow-sm transition-all duration-300 active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110 duration-300 ${config[item.tipe].bg}`}>
                    {config[item.tipe].icon}
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-800 tracking-tight text-base leading-none">
                      {item.nama}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-medium italic">{formatTanggal(item.tanggal)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-lg font-black text-slate-900 tracking-tight">
                    <span className="text-emerald-500 text-sm mr-0.5">+</span>
                    {item.nominal.toLocaleString('id-ID')}
                  </p>
                  <div className={`inline-block px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-tighter ${config[item.tipe].bg} ${config[item.tipe].text}`}>
                    {item.tipe}
                  </div>
                </div>
                
                {/* Dekorasi kecil saat hover */}
                <div className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info tambahan di paling bawah */}
      <div className="text-center">
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
          Kurma System • 2026
        </p>
      </div>
    </div>
  );
}