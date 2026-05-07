import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import { formatTanggal } from '../../utils/helpers';
import HTMLFlipBook from 'react-pageflip';

// ==================================================
// FUNGSI BANTUAN UNTUK MENGUBAH ANGKA KE ANGKA ARAB
// ==================================================
const toArabicNumeral = (number) => {
  return number.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
};

// ==================================================
// KOMPONEN BANTUAN UI
// ==================================================

// 1. Desain selembar kertas Quran bergaya Mushaf Premium
const Page = React.forwardRef((props, ref) => {
  return (
    <div 
      className="bg-[#f2e8c9] shadow-2xl flex flex-col items-center relative overflow-hidden" 
      ref={ref}
    >
      {/* Ornamen Luar */}
      <div className="w-full h-full p-2 md:p-3">
        {/* Ornamen Dalam (Border Emas) */}
        <div className="w-full h-full border-[6px] border-double border-[#c5a059] bg-[#FFFDF0] p-4 md:p-6 flex flex-col items-center relative rounded-sm shadow-inner">
          {props.children}
          
          {/* Footer Halaman (Angka Arab) */}
          <div className="absolute bottom-2 md:bottom-4 w-full flex justify-center px-6">
            <span className="text-[10px] md:text-xs text-[#8b6508] font-bold bg-[#f2e8c9] px-3 py-1 rounded-full border border-[#c5a059]">
              {props.number}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

// 2. Card Video
const VideoCard = ({ video }) => {
  const videoSrc = `https://www.youtube.com/embed/${video.embedId}`;

  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-shadow">
      <div className="relative w-full pb-[56.25%] mb-3 rounded-lg overflow-hidden bg-gray-100">
        <iframe 
          className="absolute top-0 left-0 w-full h-full"
          src={videoSrc} 
          title={video.title}
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      </div>
      
      <a 
        href={`https://www.youtube.com/watch?v=${video.embedId}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block group"
      >
        <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {video.title}
        </h3>
      </a>
      
      <p className="text-sm text-gray-500 mt-1">{video.channel}</p>
    </div>
  );
};

export default function GuestDakwah() {
  // ==================================================
  // 1. LOGIKA ASLI DAKWAH
  // ==================================================
  const [dakwah, setDakwah] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dakwah') 
      .then(res => setDakwah(res.data))
      .catch(err => console.error("Gagal load dakwah:", err))
      .finally(() => setLoading(false));
  }, []);

  // ==================================================
  // 2. LOGIKA AL-QURAN 30 JUZ
  // ==================================================
  const [listSurat, setListSurat] = useState([]);
  const [selectedSurat, setSelectedSurat] = useState(1);
  const [quranData, setQuranData] = useState(null);
  const [loadingQuran, setLoadingQuran] = useState(true);

  useEffect(() => {
    fetch('https://equran.id/api/v2/surat')
      .then(res => res.json())
      .then(data => setListSurat(data.data))
      .catch(err => console.error("Gagal load list surat:", err));
  }, []);

  useEffect(() => {
    setLoadingQuran(true);
    fetch(`https://equran.id/api/v2/surat/${selectedSurat}`)
      .then(res => res.json())
      .then(data => setQuranData(data.data))
      .catch(err => console.error("Gagal load ayat:", err))
      .finally(() => setLoadingQuran(false));
  }, [selectedSurat]);

  const chunkAyat = (ayatArray, size) => {
    if (!ayatArray) return [];
    const chunks = [];
    for (let i = 0; i < ayatArray.length; i += size) {
      chunks.push(ayatArray.slice(i, i + size));
    }
    return chunks;
  };

  const quranPages = chunkAyat(quranData?.ayat, 4);

  // ==================================================
  // MENYIAPKAN ARRAY HALAMAN UNTUK DIBALIK (RTL HACK)
  // ==================================================
  const allPages = [];

  if (quranData) {
    // 1. Cover Depan
    allPages.push(
      <Page key="cover" number="">
        <div className="bg-[#0b2918] w-full h-full text-white flex flex-col justify-center items-center border-8 border-double border-[#d4af37] p-4 relative shadow-inner">
          <div className="absolute top-8 left-8 right-8 bottom-8 border border-[#d4af37] opacity-50"></div>
          <h1 className="text-5xl md:text-7xl font-bold text-[#d4af37] mb-6 drop-shadow-lg font-serif">القرآن</h1>
          <div className="bg-[#d4af37] text-[#0b2918] px-6 py-2 rounded-full font-bold text-xl md:text-2xl mb-4 shadow-md">
            {quranData.nama}
          </div>
          <p className="text-sm md:text-base text-[#e5c974] tracking-widest uppercase font-semibold">
            {quranData.namaLatin} • {quranData.jumlahAyat} Ayat
          </p>
          <p className="text-xs text-[#d4af37] mt-8 opacity-70 border-t border-[#d4af37] pt-2">Diturunkan di {quranData.tempatTurun}</p>
        </div>
      </Page>
    );

    // 2. Halaman-halaman Ayat
    quranPages.forEach((pageAyat, pageIndex) => {
      allPages.push(
        <Page key={`page-${pageIndex}`} number={`صَفْحَة ${toArabicNumeral(pageIndex + 1)}`}>
          <div className="flex justify-between items-center w-full border-b-2 border-[#c5a059] pb-2 mb-4 md:mb-6">
            <h3 className="text-sm md:text-lg font-bold text-[#8b6508]">
              {quranData.namaLatin}
            </h3>
            <h3 className="text-sm md:text-lg font-bold text-[#8b6508] font-serif">
              {quranData.nama}
            </h3>
          </div>
          
          <div className="flex flex-col gap-6 md:gap-8 w-full px-1 md:px-3 pb-8 h-full overflow-y-auto">
            {/* Bismillah Otomatis di Halaman Pertama */}
            {pageIndex === 0 && selectedSurat != 1 && selectedSurat != 9 && (
              <div className="w-full text-center mb-2 mt-2">
                <p className="text-2xl md:text-4xl text-gray-800 font-serif" dir="rtl">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              </div>
            )}

            {pageAyat.map((ayat) => (
              <div key={ayat.nomorAyat} className="flex flex-col gap-3 group border-b border-gray-200 border-dashed pb-4 last:border-0">
                <div className="w-full" dir="rtl">
                  <p className="text-2xl md:text-4xl leading-[2.5rem] md:leading-[3.5rem] text-gray-900 text-justify" style={{ fontFamily: 'Traditional Arabic, serif' }}>
                    {ayat.teksArab}
                    <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#c5a059] bg-[#FFFDF0] text-[#8b6508] text-sm md:text-lg mx-2 my-1 align-middle font-bold">
                      {toArabicNumeral(ayat.nomorAyat)}
                    </span>
                  </p>
                </div>
                <div className="w-full mt-2" dir="ltr">
                  <p className="text-xs md:text-sm text-gray-600 text-left italic">
                    "{ayat.teksIndonesia}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Page>
      );
    });

    // 3. Cover Belakang
    allPages.push(
      <Page key="back-cover" number="">
        <div className="bg-[#0b2918] w-full h-full flex flex-col items-center justify-center border-8 border-double border-[#d4af37] p-4 relative shadow-inner">
           <div className="absolute top-8 left-8 right-8 bottom-8 border border-[#d4af37] opacity-50"></div>
          <h2 className="text-[#d4af37] text-2xl md:text-4xl font-bold mb-4 font-serif">صَدَقَ اللهُ العَظِيمُ</h2>
          <p className="text-[#e5c974] text-xs md:text-sm tracking-widest text-center">
            Maha benar Allah dengan segala firman-Nya
          </p>
        </div>
      </Page>
    );
  }

  // KUNCI RTL: Balik urutan array dan mulai dari index paling belakang
  const rtlPages = [...allPages].reverse();
  const startPageIndex = rtlPages.length > 0 ? rtlPages.length - 1 : 0;

  // ==================================================
  // 3. DATA YOUTUBE
  // ==================================================
  const videoList = [
    {
      id: 1,
      title: "Kajian Rutin: Keutamaan Membaca Al-Quran",
      embedId: "oV87CfmOTtY", 
      channel: "Masjid Pusat"
    },
    {
      id: 2,
      title: "Murottal Juz 30 Full Merdu",
      embedId: "oV87CfmOTtY", 
      channel: "Qari Channel"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 pt-4 px-4">
      
      {/* ===== BAGIAN DAKWAH ===== */}
      <h1 className="text-xl font-bold">Dakwah</h1>

      {loading ? (
        <p>Loading...</p>
      ) : dakwah.length === 0 ? (
        <p>Belum ada data dakwah</p>
      ) : (
        dakwah.map((item) => (
          <div key={item._id} className="p-4 bg-white rounded-xl shadow">
            <h2 className="font-bold">{item.judul}</h2>
            <p className="text-sm text-gray-500">
              {formatTanggal(item.tanggal)}
            </p>
            <p className="mt-2">{item.deskripsi}</p>
          </div>
        ))
      )}

      {/* ===== FITUR AL-QURAN 30 JUZ ===== */}
      <hr className="my-10 border-gray-300" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-gray-800">Baca Al-Quran</h1>
          <p className="text-sm text-gray-500 font-semibold text-blue-600">
            Geser halaman dari Kiri ke Kanan (Mode Mushaf Arab)
          </p>
        </div>
        
        <select 
          className="p-3 border-2 border-[#d4af37] rounded-lg bg-[#FFFDF0] text-gray-800 font-semibold outline-none w-full md:w-auto shadow-sm focus:ring-2 focus:ring-[#d4af37]"
          value={selectedSurat}
          onChange={(e) => setSelectedSurat(e.target.value)}
        >
          {listSurat.map((surat) => (
            <option key={surat.nomor} value={surat.nomor}>
              {surat.nomor}. {surat.namaLatin} ({surat.nama})
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-gray-900 p-4 md:p-10 rounded-3xl shadow-2xl overflow-hidden min-h-[500px] md:min-h-[700px] items-center w-full relative">
        {loadingQuran ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#d4af37] text-base md:text-lg animate-pulse font-semibold">Menyiapkan Lembaran Mushaf...</p>
          </div>
        ) : (
          <HTMLFlipBook
            key={`${selectedSurat}-${startPageIndex}`} // Paksa re-render jika halaman ganti
            width={450}        
            height={650}        
            size="stretch"
            minWidth={300}
            maxWidth={550}
            minHeight={450}
            maxHeight={800}
            maxShadowOpacity={0.6}
            showCover={true}
            mobileScrollSupport={true}
            usePortrait={true}  
            startPage={startPageIndex} // Mulai dari Cover yang sekarang ada di index terakhir
            className="w-full h-full shadow-2xl"
          >
            {rtlPages}
          </HTMLFlipBook>
        )}
      </div>

      {/* ===== FITUR VIDEO YOUTUBE ===== */}
      <hr className="my-10 border-gray-300" />
      
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1">Video Inspirasi</h1>
        <p className="text-sm text-gray-500">Klik video untuk memutar dengan suara penuh</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videoList.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

    </div>
  );
}