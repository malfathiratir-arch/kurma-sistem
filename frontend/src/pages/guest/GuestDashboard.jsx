import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatTanggal, getStatusBadge } from '../../utils/helpers';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { FcHome } from "react-icons/fc";
import { FcCameraAddon } from "react-icons/fc";
import { MdOutlineDateRange } from "react-icons/md";
import { IoImagesOutline } from "react-icons/io5";
import ChatBot from '../../components/layouts/chatBot/Chatbot';
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// ──────────────────────────────────────────────
// 3D Sub-components
// ──────────────────────────────────────────────

/** Bulan penuh dengan glow hangat + mengikuti mouse secara halus */
function Moon({ mouseRef }) {
  const moonRef = useRef();
  const outerGlowRef = useRef();
  const innerGlowRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    if (moonRef.current) {
      // Rotasi lambat pada sumbu Y
      moonRef.current.rotation.y = t * 0.04;
      moonRef.current.rotation.x = t * 0.015;

      // Ikuti mouse (sangat halus)
      moonRef.current.position.x = THREE.MathUtils.lerp(
        moonRef.current.position.x,
        mx * 1.2,
        0.025
      );
      moonRef.current.position.y = THREE.MathUtils.lerp(
        moonRef.current.position.y,
        my * 0.8 + 0.5,
        0.025
      );
    }

    // Pulse glow
    if (outerGlowRef.current) {
      const pulse = Math.sin(t * 0.8) * 0.04 + 0.08;
      outerGlowRef.current.material.opacity = pulse;
      outerGlowRef.current.position.x = moonRef.current?.position.x || 0;
      outerGlowRef.current.position.y = moonRef.current?.position.y || 0.5;
    }
    if (innerGlowRef.current) {
      const pulse2 = Math.sin(t * 0.8 + 1) * 0.05 + 0.13;
      innerGlowRef.current.material.opacity = pulse2;
      innerGlowRef.current.position.x = moonRef.current?.position.x || 0;
      innerGlowRef.current.position.y = moonRef.current?.position.y || 0.5;
    }
  });

  return (
    <group>
      {/* Bulan utama */}
      <mesh ref={moonRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshStandardMaterial
          color="#f5e4a0"
          emissive="#c8962a"
          emissiveIntensity={0.55}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={innerGlowRef} position={[0, 0.5, -0.05]}>
        <sphereGeometry args={[1.45, 32, 32]} />
        <meshBasicMaterial
          color="#e8b84b"
          transparent
          opacity={0.13}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glow (lebih besar, lebih transparan) */}
      <mesh ref={outerGlowRef} position={[0, 0.5, -0.1]}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial
          color="#d4891a"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Partikel debu / bintang kecil melayang */
function FloatingDust({ count = 120, mouseRef }) {
  const mesh = useRef();

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      vel[i * 3]     = (Math.random() - 0.5) * 0.004;
      vel[i * 3 + 1] = Math.random() * 0.003 + 0.001;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return [pos, vel];
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    const pos = mesh.current.geometry.attributes.position.array;
    const mx = mouseRef.current.x * 0.003;

    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i * 3] + mx;
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];

      // wrap around
      if (pos[i * 3 + 1] > 5)  pos[i * 3 + 1] = -5;
      if (pos[i * 3]     > 9)  pos[i * 3]     = -9;
      if (pos[i * 3]     < -9) pos[i * 3]     =  9;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f5d87a"
        size={0.055}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** Scene lengkap */
function IslamicNightScene({ mouseRef }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 3, 3]} intensity={1.2} color="#f5d07a" />
      <pointLight position={[-4, -2, 2]} intensity={0.3} color="#7c6a2a" />

      <Stars
        radius={60}
        depth={30}
        count={700}
        factor={3}
        saturation={0.1}
        fade
        speed={0.4}
      />

      <FloatingDust count={100} mouseRef={mouseRef} />
      <Moon mouseRef={mouseRef} />
    </>
  );
}

// ──────────────────────────────────────────────
// Section 3D wrapper (dipasang di bagian bawah)
// ──────────────────────────────────────────────

function IslamicNight3DSection() {
  const mouseRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef();

  // Track mouse hanya ketika cursor ada di dalam section
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
        y: -((e.clientY - rect.top)  / rect.height - 0.5) * 2,
      };
    };
    const handleLeave = () => { mouseRef.current = { x: 0, y: 0 }; };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: '520px', background: 'linear-gradient(to bottom, #0c0a09, #1a120a)' }}
    >
      {/* Gradient transisi dari section sebelumnya */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: '120px',
          background: 'linear-gradient(to bottom, #1c1917, transparent)',
        }}
      />

      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ position: 'absolute', inset: 0 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <IslamicNightScene mouseRef={mouseRef} />
      </Canvas>

      {/* Siluet masjid SVG – di atas canvas */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <svg
          viewBox="0 0 1200 220"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax meet"
          style={{ width: '100%', display: 'block' }}
        >
          {/* Fill bawah */}
          <rect x="0" y="160" width="1200" height="60" fill="#0c0a09" />

          {/* Masjid tengah – kubah utama */}
          <g fill="#0c0a09">
            {/* Badan tengah */}
            <rect x="480" y="110" width="240" height="110" />
            {/* Kubah utama */}
            <ellipse cx="600" cy="110" rx="90" ry="55" />
            {/* Menara kiri */}
            <rect x="460" y="60" width="28" height="160" />
            <ellipse cx="474" cy="60" rx="14" ry="20" />
            <polygon points="474,25 464,60 484,60" />
            {/* Menara kanan */}
            <rect x="712" y="60" width="28" height="160" />
            <ellipse cx="726" cy="60" rx="14" ry="20" />
            <polygon points="726,25 716,60 736,60" />
            {/* Sayap kiri */}
            <rect x="360" y="130" width="130" height="90" />
            <ellipse cx="425" cy="130" rx="50" ry="28" />
            {/* Sayap kanan */}
            <rect x="710" y="130" width="130" height="90" />
            <ellipse cx="775" cy="130" rx="50" ry="28" />
            {/* Dinding samping kiri */}
            <rect x="0" y="170" width="370" height="50" />
            {/* Dinding samping kanan */}
            <rect x="830" y="170" width="370" height="50" />
          </g>

          {/* Garis cahaya bulan di atas masjid */}
          <defs>
            <radialGradient id="moonGlow" cx="50%" cy="0%" r="60%">
              <stop offset="0%" stopColor="#d4a84b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#d4a84b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="600" cy="0" rx="300" ry="180" fill="url(#moonGlow)" />
        </svg>
      </div>

      {/* Teks tengah */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pb-24 pointer-events-none select-none">
        <p
          className="text-amber-300/80 text-2xl md:text-3xl mb-2 tracking-widest"
          style={{ fontFamily: 'Amiri, serif', textShadow: '0 0 20px rgba(212,168,75,0.5)' }}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="text-stone-400 text-xs tracking-[0.3em] uppercase mt-1">
          Organisasi Kurma · Bersama Meraih Ridho Allah
        </p>
      </div>

      {/* Gradient penutup bawah */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: '60px',
          background: 'linear-gradient(to bottom, transparent, #0c0a09)',
        }}
      />
    </section>
  );
}

// ──────────────────────────────────────────────
// Main component (TIDAK DIUBAH – hanya ditambah section 3D di bawah)
// ──────────────────────────────────────────────

export default function GuestDashboard() {
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [dashboard, setDashboard] = useState(null);
  const [pengajianList, setPengajianList] = useState([]);
  const [gelarTerpalList, setGelarTerpalList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard'),
      api.get('/pengajian'),
      api.get('/gelar-terpal')
    ]).then(([d, p, g]) => {
      setDashboard(d.data);
      setPengajianList(p.data.slice(0, 3));
      setGelarTerpalList(g.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading-spinner text-kurma-600 w-10 h-10 border-4"></div>
    </div>
  );

  const heroImages = [
    '/sheikh-zayed-mosque-abu-dhabi-united-arab-emirates-uhd-4k-wallpaper.jpg',
    '/Masjid-Nafsul-Kifaah-berada-dikawasan-Anjungan-Maleo-Jl-Moh-Hatta-Kelurahan-Pasangkayu.webp',
    '/masjid_di_madinah.jpg',
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 bg-white dark:bg-stone-950">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden group min-h-[600px]">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          className="absolute inset-0 w-full h-full"
        >
          {heroImages.map((img, i) => (
            <SwiperSlide key={i}>
              <div
                className="w-full h-full bg-cover transition-transform duration-[7000ms] group-hover:scale-110"
                style={{ backgroundImage: `url(${img})`, backgroundPosition: 'center 70%' }}
              >
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute bottom-0 left-0 w-full h-40 z-10 bg-gradient-to-b from-transparent to-stone-950" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[140%] h-52 z-10 pointer-events-none bg-stone-950 blur-3xl opacity-70" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[120%] h-72 z-20 pointer-events-none bg-gradient-to-b from-stone-950/40 via-stone-950/70 to-stone-950 blur-2xl opacity-80" />

        <div className="relative z-30 max-w-4xl mx-auto text-center py-24 px-4">
          <div className="text-6xl ornament mb-4 drop-shadow-lg text-white">☪</div>
          <p className="text-kurma-100 text-lg mb-3 ornament drop-shadow-md" style={{ fontFamily: 'Amiri, serif' }}>
            السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-2xl">
            Organisasi Kurma
          </h1>
          <p className="text-white text-lg mb-2 italic drop-shadow-md">
            "{dashboard?.motto || 'Bersama Meraih Ridho Allah'}"
          </p>
          <p className="text-kurma-50 text-sm max-w-xl mx-auto leading-relaxed mt-4 drop-shadow">
            {dashboard?.deskripsi}
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link
              to="/pengajian"
              className="bg-white text-kurma-700 font-semibold px-6 py-3 rounded-xl hover:bg-kurma-50 transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-2"
            >
              <MdOutlineDateRange className="text-2xl" />
              Lihat Jadwal Pengajian
            </Link>
            <Link to="/galeri" className="flex items-center justify-center gap-2 border-2 border-white/70 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm">
              <IoImagesOutline />Galeri Foto
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="relative z-40 -mt-5 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Pengajian Malam', value: pengajianList.length + '+', icon: '🌙', color: 'from-amber-500 to-orange-600' },
            { label: 'Foto Galeri', value: (dashboard?.fotoGaleri?.length || 0) + '+', icon: <FcCameraAddon />, color: 'from-orange-500 to-amber-600' },
            { label: 'Aktivitas Rutin', value: (dashboard?.fotoAktivitas?.length || 0) + '+', icon: '✨', color: 'from-amber-600 to-yellow-500' },
            { label: 'Gelar Terpal', value: gelarTerpalList.length + '+', icon: <FcHome />, color: 'from-orange-600 to-amber-700' },
          ].map((s, i) => (
            <div key={i} className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-xl shadow-amber-900/10 border-b-4 border-amber-500 transition-all duration-300 hover:-translate-y-2 group">
              <div className={`absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-br ${s.color} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
              <div className="relative z-10 text-center">
                <div className="flex justify-center text-4xl mb-3 filter drop-shadow-sm">{s.icon}</div>
                <div className={`text-3xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mt-2 text-center">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent Pengajian ─────────────────────────────── */}
      <section className="py-14 px-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-800 dark:text-white">Pengajian Terkini</h2>
            <p className="text-stone-500 text-sm mt-1">Kegiatan pengajian malam terbaru</p>
          </div>
          <Link to="/pengajian" className="text-kurma-600 font-semibold text-sm hover:text-kurma-700">Lihat Semua →</Link>
        </div>

        {pengajianList.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🌙</div>
            <p className="text-stone-500">Belum ada jadwal pengajian</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {pengajianList.map(p => {
              const status = getStatusBadge(p.status);
              return (
                <div key={p._id} className="card card-hover">
                  {p.foto?.length > 0 ? (
                    <img src={p.foto[0]} alt={p.tema} className="w-full h-40 object-cover rounded-xl mb-4" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-kurma-100 to-kurma-200 rounded-xl mb-4 flex items-center justify-center text-4xl">🌙</div>
                  )}
                  <span className={`badge ${status.class} mb-2`}>{status.label}</span>
                  <h3 className="font-bold text-stone-800 mb-1">{p.tema}</h3>
                  <p className="text-xs text-stone-500">{formatTanggal(p.tanggal)}</p>
                  <p className="text-xs text-stone-400 mt-1">📍 {p.lokasi}</p>
                  {p.daftarKelas?.length > 0 && (
                    <p className="text-xs text-stone-400 mt-1">🎓 {p.daftarKelas.join(', ')}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Galeri preview ───────────────────────────────── */}
      {dashboard?.fotoGaleri?.length > 0 && (
        <section className="py-14 px-4 bg-stone-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-stone-800">Galeri Foto</h2>
                <p className="text-stone-500 text-sm mt-1">Momen-momen kebersamaan kita</p>
              </div>
              <Link to="/galeri" className="text-kurma-600 font-semibold text-sm hover:text-kurma-700">Lihat Semua →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dashboard.fotoGaleri.slice(0, 8).map((foto, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden card-hover cursor-pointer">
                  <img src={foto.url || foto} alt={`Galeri ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Aktivitas ────────────────────────────────────── */}
      {dashboard?.fotoAktivitas?.length > 0 && (
        <section className="py-14 px-4 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Aktivitas Sehari-hari</h2>
          <p className="text-stone-500 text-sm mb-8">Dokumentasi kegiatan rutin organisasi</p>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {dashboard.fotoAktivitas.map((foto, i) => (
              <div key={i} className="flex-shrink-0 w-48 h-48 rounded-2xl overflow-hidden card-hover">
                <img src={foto.url || foto} alt={`Aktivitas ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ✨ NEW: Islamic Night 3D Section ─────────────── */}
      <IslamicNight3DSection />

    </div>
  );
}