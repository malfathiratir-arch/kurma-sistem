import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import ChatBot from "../../components/layouts/chatBot/Chatbot";
import { MdMusicNote, MdMusicOff } from "react-icons/md";
import { MdClose, MdMenu } from "react-icons/md";
export default function PublicLayout() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Hamburger Menu Kiri Bawah
  const [isPlaying, setIsPlaying] = useState(false); // Status Musik
  // Logic Dark Mode (Tetap di sini agar konsisten di semua halaman)
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);
  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };
  const getDashboardPath = () => {
    if (!user) return "/login";
    const map = { admin: "/admin", panitia: "/panitia", ketua_kelas: "/ketua" };
    return map[user.role] || "/login";
  };

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    // PERBAIKAN: Gunakan flex-col dan min-h-screen agar footer tetap di bawah
    // dan tidak ada pembungkus yang merusak 'fixed' position
    <div className="min-h-screen flex flex-col bg-white dark:bg-stone-950 transition-colors duration-500">
      {/* Navbar (Tetap menggunakan logic lama kamu) */}
      <nav className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/Screenshot 2026-04-08 090722.png"
                alt="Logo Kurma"
                className="rounded-xl w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-sm group-hover:rotate-6 transition-all duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-stone-800 dark:text-white text-xl tracking-tight leading-none uppercase">
                Kurma
              </span>
              <span className="text-[10px] font-bold text-kurma-600 tracking-widest uppercase mt-0.5">
                Organisasi Pengajian
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 mr-4">
              {[
                { name: "Beranda", path: "/" },
                { name: "Pengajian", path: "/pengajian" },
                { name: "Galeri", path: "/galeri" },
                { name: "Terpal", path: "/terpal" },
                { name: "Uang Sumbangan", path: "/uang-sumbangan" },
                { name: "Dakwah", path: "/dakwah" },
                { name: "piket", path: "/piket" },
                { name: "absen", path: "/absen" },
                { name: "struktur", path: "/organisasi" },

              ].map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) => `
                    relative text-sm font-semibold transition-colors duration-200 py-1
                    ${isActive ? "text-kurma-600" : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white"}
                  `}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            {isLoggedIn ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="bg-stone-900 dark:bg-stone-700 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-kurma-600 hover:shadow-lg active:scale-95 transition-all"
              >
                Dashboard
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-kurma-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-kurma-700 hover:shadow-lg active:scale-95 transition-all"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile Burger Icon */}
          <button
            className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div
              className={`w-6 h-0.5 bg-stone-700 dark:bg-white transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-stone-700 dark:bg-white transition-all ${menuOpen ? "opacity-0" : ""}`}
            ></div>
            <div
              className={`w-6 h-0.5 bg-stone-700 dark:bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            ></div>
          </button>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={`md:hidden overflow transition-all duration-300 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="px-6 py-6 flex flex-col gap-4">
            <NavLink
              to="/"
              end
              className="text-stone-600 dark:text-stone-300 font-bold text-lg"
              onClick={() => setMenuOpen(false)}
            >
              Beranda
            </NavLink>
            <NavLink
              to="/pengajian"
              className="text-stone-600 dark:text-stone-300 font-bold text-lg"
              onClick={() => setMenuOpen(false)}
            >
              Pengajian
            </NavLink>
            <NavLink
              to="/galeri"
              className="text-stone-600 dark:text-stone-300 font-bold text-lg"
              onClick={() => setMenuOpen(false)}
            >
              Galeri
            </NavLink>
            <NavLink
              to="/terpal"
              className="text-stone-600 dark:text-stone-300 font-bold text-lg"
              onClick={() => setMenuOpen(false)}
            >
              Terpal
            </NavLink>
            <NavLink
              to="/uang-sumbangan"
              className="text-stone-600 dark:text-stone-300 font-bold text-lg"
              onClick={() => setMenuOpen(false)}
            >
              Uang Sumbangan
            </NavLink>
            <NavLink
              to="/dakwah"
              className="text-stone-600 dark:text-stone-300 font-bold text-lg"
              onClick={() => setMenuOpen(false)}
            >
              Dakwah
            </NavLink>
            <NavLink
              to="/piket"
              className="text-stone-600 dark:text-stone-300 font-bold text-lg"
              onClick={() => setMenuOpen(false)}
            >
             Piket
            </NavLink>
            <NavLink
              to="/absen"
              className="text-stone-600 dark:text-stone-300 font-bold text-lg"
              onClick={() => setMenuOpen(false)}
            >
             Piket
            </NavLink>
            <hr className="border-stone-100 dark:border-stone-800" />
            {isLoggedIn ? (
              <button
                onClick={() => {
                  navigate(getDashboardPath());
                  setMenuOpen(false);
                }}
                className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold text-center"
              >
                Dashboard
              </button>
            ) : (
              <Link
                to="/login"
                className="w-full bg-kurma-600 text-white py-3 rounded-xl font-bold text-center"
                onClick={() => setMenuOpen(false)}
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
     <footer className="py-12 text-center bg-[#0a0806] border-t border-stone-800/60">
            <div className="max-w-4xl mx-auto px-5">
              <p className="font-arabic text-amber-500/40 text-3xl tracking-widest mb-4">﷽</p>
              <h3 className="font-cormorant text-white text-2xl font-bold mb-2">Organisasi Kurma</h3>
              <p className="font-arabic text-amber-400/60 text-sm mb-2">بِرَحْمَةِ اللَّهِ نَعِيشُ</p>
              <p className="font-dm text-stone-600 text-xs mb-6 italic">Bersama Meraih Ridho Allah</p>
              <div className="ornament-divider max-w-xs mx-auto mb-6"><span className="text-amber-600/40">✦</span></div>
              <div className="flex justify-center gap-6 mb-6">
                {['/pengajian', '/galeri'].map((path, i) => (
                  <Link key={i} to={path} className="font-dm text-stone-500 text-xs hover:text-amber-500 transition-colors uppercase tracking-widest">
                    {path.replace('/', '')}
                  </Link>
                ))}
              </div>
              <p className="font-dm text-stone-700 text-xs">© {new Date().getFullYear()} Organisasi Kurma · Semua Hak Dilindungi</p>
            </div>
          </footer>
    

      {/* --- TOMBOL MELAYANG (FLOATING CONTROLS) --- */}
      {/* Posisinya dipindah ke sini agar selalu mengikuti layar di halaman manapun */}
      {/* --- TOMBOL MELAYANG (FLOATING MENU) KIRI BAWAH --- */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-4">
        {/* Menu yang "Meledak" ke Atas */}
        <div
          className={`flex flex-col gap-4 transition-all duration-300 transform ${isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-0 pointer-events-none"}`}
        >
          <audio ref={audioRef} loop>
            <source src="/music/∥ Yasser Al-Dosari ∥ Al-Fatiha, Al-Kahf, Yaseen, Ar-Rahman, Al-Waqi'a, and Al-Mulk ∥ [k59c6JYtJQ8].mp3" />
          </audio>
          {/* Musik */}
          <button
            onClick={toggleMusic}
            className={`w-14 h-14 flex items-center justify-center rounded-full shadow-xl text-white transition-all hover:scale-110 active:scale-95 ${
              isPlaying ? "bg-green-500 animate-pulse" : "bg-slate-500"
            }`}
          >
            {isPlaying ? <MdMusicNote size={24} /> : <MdMusicOff size={24} />}
          </button>

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="w-14 h-14 flex items-center justify-center rounded-full shadow-xl bg-indigo-600 text-white hover:scale-110 transition-all active:scale-95"
          >
            {isDark ? <MdLightMode size={24} /> : <MdDarkMode size={24} />}
          </button>

          {/* AI Chatbot */}
          <div className="hover:scale-110 transition-all  ">
            <ChatBot />
          </div>
        </div>

        {/* Tombol Hamburger Utama */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-5 rounded-full shadow-2xl text-white transition-all duration-300 transform ${isOpen ? "bg-red-500 rotate-90" : "bg-kurma-600 hover:bg-kurma-700"}`}
        >
          {isOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
        </button>
      </div>
    </div>
  );
}
