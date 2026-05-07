import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Halo! Saya Robot Kurma. Tanya saya soal pengajian atau galeri ya!' }
  ]);

  const quickReplies = [
    "Jadwal Pengajian",
    "Gelar Terpal",
    "Lokasi",
    "Cara Gabung",
    "Motivasi"
  ];
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- LOGIKA AI BUATAN SENDIRI (JS PURE) ---
const dapatkanJawabanAI = (pertanyaan) => {
    const tanya = pertanyaan.toLowerCase();

    if (tanya.includes('assalam')) return "Wa'alaikumussalam Warahmatullahi Wabarakatuh! Semoga harimu diberkahi Allah. Ada yang bisa saya bantu, Akhi/Ukhti?";
    if (tanya.includes('sampurasun')) return "Rampes! Wilujeng sumping di chatbot Kurma. Aya nu tiasa dibantos?";
    if (tanya.includes('pagi') || tanya.includes('shubuh')) return "Selamat pagi! Awali hari dengan zikir pagi yuk. Ada yang bisa saya bantu?";
    if (tanya.includes('siang')) return "Selamat siang! Jangan lupa sholat Dzuhur dan jaga lisan ya. Ada yang bisa saya bantu?";
    if (tanya.includes('sore') || tanya.includes('ashar')) return "Selamat sore! Waktunya ngeteh sambil nunggu Maghrib. Ada yang bisa saya bantu?";

    if (tanya.includes('sedih') || tanya.includes('galau') || tanya.includes('masalah')) {
      return "Jangan bersedih, Allah berfirman: 'Janganlah kamu berduka cita, sesungguhnya Allah bersama kita' (QS. At-Tawbah: 40). Yuk, coba wudhu dan sholat dua rakaat.";
    }
    if (tanya.includes('malas') || tanya.includes('futur')) {
      return "Wajar kalau iman naik turun. Coba kumpul lagi bareng teman-teman Kurma di pengajian, biasanya semangatnya bakal balik lagi!";
    }
    if (tanya.includes('motivasi')) return "Tetap semangat! Hijrah itu proses, bukan perlombaan. Yang penting istiqomah.";
    
    if (tanya.includes('kurma itu apa') || tanya.includes('singkatan')) {
      return "Kurma adalah wadah dakwah kreatif (Kumpulan Remaja Masjid / Komunitas Utama Remaja Muslim Aktif). Kami fokus di syiar Islam yang menyenangkan.";
    }
    if (tanya.includes('gelar terpal')) {
      return "Gelar Terpal adalah konsep kajian lesehan yang fleksibel. Bisa di trotoar, taman, atau pelataran masjid. Intinya: Ilmu didapat, ukhuwah erat!";
    }

    if (tanya.includes('jadwal') || tanya.includes('pengajian') || tanya.includes('kapan')) return "Scroll saja ke bawah sampai ketemu judul 'Pengajian Terkini'. Semua jadwal terbaru ada di situ!";
    if (tanya.includes('lokasi') || tanya.includes('alamat')) return "Kegiatan kami berpindah-pindah (mobile) sesuai jadwal. Cek detail di daftar pengajian ya.";
    if (tanya.includes('gabung') || tanya.includes('daftar')) return "Langsung datang saja ke lokasi kajian! Tidak ada syarat ribet, semua saudara di sini.";

    if (tanya.includes('wa') || tanya.includes('nomor')) return "Hubungi Admin via WhatsApp di bagian paling bawah halaman (Footer).";
    if (tanya.includes('makasih') || tanya.includes('nuhun') || tanya.includes('syukron')) return "Sama-sama! Semoga bermanfaat. Jangan sungkan tanya lagi ya.";

    const bingung = [
      "Wah, pertanyaan sulit nih. Coba tanya admin via WhatsApp ya!",
      "Hm, saya belum paham. Coba ketik kata kunci lain seperti 'Pengajian' atau 'Gabung'.",
      "Sepertinya saya butuh kopi. Coba tanya soal jadwal saja ya!"
    ];
    return bingung[Math.floor(Math.random() * bingung.length)];
  };
  // ------------------------------------------

 const handleQuickReply = (pertanyaan) => {
    // 1. Kirim pertanyaan tombol ke chat
    setMessages(prev => [...prev, { role: 'user', text: pertanyaan }]);

    // 2. Jawab otomatis
    setTimeout(() => {
      const jawaban = dapatkanJawabanAI(pertanyaan);
      setMessages(prev => [...prev, { role: 'ai', text: jawaban }]);
    }, 600);
  };

  const handleKirim = () => {
    if (!input.trim()) return;
    const inputSimpan = input;
    setMessages(prev => [...prev, { role: 'user', text: inputSimpan }]);
    setInput('');
    setTimeout(() => {
      const jawaban = dapatkanJawabanAI(inputSimpan);
      setMessages(prev => [...prev, { role: 'ai', text: jawaban }]);
    }, 600);
  };

  

  

  return (
    <div className="flex flex-col items-end inline-max">
      {/* Jendela Chat */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[450px] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-orange-500 p-4 text-white flex justify-between items-center shadow-md font-sans">
            <div className="flex items-center gap-2">
              <Bot size={22} className="animate-pulse" />
              <span className="font-bold">Asisten Kurma</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
              <X size={20} />
            </button>
          </div>

          {/* Body Chat */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 font-sans">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-orange-500 text-white rounded-tr-none' 
                    : 'bg-white text-stone-800 border border-stone-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 bg-white flex gap-2 overflow-x-auto no-scrollbar border-t">
  {quickReplies.map((reply, index) => (
    <button
      key={index}
      onClick={() => handleQuickReply(reply)}
      className="flex-shrink-0 bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1 rounded-full text-xs font-medium hover:bg-orange-500 hover:text-white transition-all shadow-sm"
    >
      {reply}
    </button>
  ))}
</div>

          {/* Input */}
          <div className="p-3 bg-white border-t flex gap-2 font-sans">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleKirim()}
              placeholder="Tanya robot..."
              className="flex-1 bg-stone-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <button 
              onClick={handleKirim}
              className="bg-orange-500 text-white p-2 rounded-xl hover:bg-orange-600 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Tombol Robot Oren */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-orange-500 text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 ${isOpen ? 'rotate-90 bg-stone-700' : ''}`}
      >
        {isOpen ? <X size={32} /> : <Bot size={32} />}
      </button>
    </div>
  );
}