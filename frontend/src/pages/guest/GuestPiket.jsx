import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatTanggal } from "../../utils/helpers";
import {
  Calendar,
  Users,
  UserCheck,
  Sparkles,
  ClipboardList,
  Clock,
  Fingerprint,
  ChevronRight,
} from "lucide-react";

export default function GuestPiket() {
  const [jadwalPiket, setJadwalPiket] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/piket")
      .then((res) => setJadwalPiket(res.data))
      .catch((err) => console.error("Gagal mengambil jadwal:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading && jadwalPiket.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kurma-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-stone-800 flex items-center justify-center gap-3">
          <ClipboardList className="text-kurma-600" size={36} />
          <div className="dark:text-white uppercase tracking-tighter">
            Jadwal Piket Masjid
          </div>
        </h1>
        <p className="text-stone-500 mt-2 font-medium">
          Sistem Informasi Petugas Kebersihan Al-Ikram
        </p>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin inline-block rounded-full h-8 w-8 border-t-2 border-kurma-600 mb-2"></div>
          <p className="text-stone-400 text-sm italic">
            Menyinkronkan jadwal terbaru...
          </p>
        </div>
      ) : jadwalPiket.length > 0 ? (
        <div className="space-y-8">
          {jadwalPiket.map((piket) => (
            <div
              key={piket._id}
              className="bg-white rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              {/* Header Kartu (Tanggal) - Full Width Top */}
              <div className="bg-stone-50 px-8 py-4 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-kurma-600 p-2.5 rounded-2xl text-white shadow-lg shadow-kurma-100">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-kurma-600">
                      {new Date(piket.tanggal).toLocaleDateString("id-ID", {
                        weekday: "long",
                      })}
                    </span>
                    <h2 className="text-xl font-bold text-stone-800 leading-none">
                      {formatTanggal(piket.tanggal)}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-stone-400 bg-white px-4 py-2 rounded-full border border-stone-100 shadow-sm">
                  <Clock size={14} className="text-kurma-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Sebelum sholat
                  </span>
                </div>
              </div>

              {/* List Petugas - SEJAJAR & LEBAR */}
              <div className="p-4 sm:p-6 space-y-3">
                {piket.petugas.map((p, index) => (
                  <div
                    key={index}
                    className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl border-2 transition-all group/item ${
                      p.gender === "Ikhwan"
                        ? "bg-blue-50/20 border-blue-50 hover:border-blue-200"
                        : "bg-rose-50/20 border-rose-50 hover:border-rose-200"
                    }`}
                  >
                    {/* 1. NIS (Kiri) */}
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div
                        className={`p-2 rounded-lg ${p.gender === "Ikhwan" ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-600"}`}
                      >
                       
                      </div>
                      <span className="text-xs font-black text-stone-400 tracking-widest">
                        {p.nis || "---------"}
                      </span>
                    </div>

                    {/* 2. Nama (Tengah - Dominan) */}
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-base font-bold text-stone-800 tracking-tight group-hover/item:text-kurma-700 transition-colors">
                        {p.nama}
                      </h4>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-wider w-fit mx-auto md:mx-0">
                      <Sparkles size={12} className="text-amber-500" />
                      {p.tugas || "Umum"}
                    </span>
                    {/* 3. Info Rombel & Rayon (Kanan Nama) */}
                    <div className="flex items-center gap-3 px-4 py-1.5 bg-white/60 rounded-xl border border-stone-100">
                      <div className="text-center">
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter">
                          Rombel
                        </p>
                        <p className="text-xs font-bold text-stone-700">
                          {p.rombel}
                        </p>
                      </div>
                      <div className="w-[1px] h-4 bg-stone-200"></div>
                      <div className="text-center">
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter">
                          Rayon
                        </p>
                        <p className="text-xs font-bold text-stone-700">
                          {p.rayon}
                        </p>
                      </div>
                    </div>

                    {/* 4. Gender (Pojok Kanan) */}
                    <div
                      className={`min-w-[80px] text-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        p.gender === "Ikhwan"
                          ? "bg-blue-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      {p.gender}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dekorasi Background */}
              <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none p-4">
                <Sparkles size={120} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-100">
          <p className="text-stone-400 font-medium">
            Belum ada jadwal yang diunggah.
          </p>
        </div>
      )}
    </div>
  );
}
