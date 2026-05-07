import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleLabel, getRoleBadgeClass } from '../../utils/helpers';
import { FcMoneyTransfer } from "react-icons/fc";
import { TbMoneybag } from "react-icons/tb";
import { LuSparkles } from "react-icons/lu";
import { TbClipboardList } from "react-icons/tb";
const navByRole = {
  ketua_kelas: [
    { to: '/ketua', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/ketua/pengajian', label: 'Pengajian Malam', icon: '🌙' },
    { to: '/ketua/gelar-terpal', label: 'Gelar Terpal', icon: '🏕️' },
    { to: '/ketua/uang-makan', label: 'Uang Makan', icon:<FcMoneyTransfer /> },
  ],
  panitia: [
    { to: '/panitia', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/panitia/pengajian', label: 'Pengajian Malam', icon: '🌙' },
    { to: '/panitia/gelar-terpal', label: 'Gelar Terpal', icon: '🏕️' },
    { to: '/panitia/foto', label: 'Kelola Foto', icon: '🖼️' },
    { to: '/panitia/users', label: 'Ketua Kelas', icon: '👥' },
    { to: '/panitia/uang-makan', label: 'Gelar Terpal', icon: '🏕️' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/admin/pengajian', label: 'Pengajian Malam', icon: '🌙' },
    { to: '/admin/gelar-terpal', label: 'Gelar Terpal', icon: '🏕️' },
    { to: '/admin/users', label: 'Kelola Pengguna', icon: '👥' },
    { to: '/admin/uang-sumbangan', label: 'Uang sumbangan', icon: <TbMoneybag /> },
    { to: '/admin/uangmakan', label: 'Uang makan', icon: <FcMoneyTransfer /> },
    { to: '/admin/piket', label: 'Piket masjid', icon: <LuSparkles color="#3b82f6" />  },
    { to: '/admin/absen', label: 'Absen', icon: <TbClipboardList /> },
    { to: '/admin/organisasi', label: 'Organisasi', icon: '⚙️' },
    { to: '/admin/settings', label: 'Pengaturan', icon: '⚙️' },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = navByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-stone-100">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-kurma-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            ☪
          </div>
          <div>
            <span className="font-bold text-stone-800 leading-none block">Kurma</span>
            <span className="text-xs text-stone-400 leading-none">Sistem Organisasi</span>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-stone-100 bg-stone-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-kurma-100 text-kurma-700 flex items-center justify-center font-bold text-lg">
            {user?.nama?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-stone-800 text-sm truncate">{user?.nama}</p>
            <span className={getRoleBadgeClass(user?.role)}>{getRoleLabel(user?.role)}</span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-kurma-50 text-kurma-700 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-stone-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <span>🚪</span> Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-stone-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-64 bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="md:hidden bg-white border-b border-stone-100 h-14 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-stone-100">
            <div className="w-5 h-0.5 bg-stone-700 mb-1"></div>
            <div className="w-5 h-0.5 bg-stone-700 mb-1"></div>
            <div className="w-5 h-0.5 bg-stone-700"></div>
          </button>
          <span className="font-bold text-stone-800">Kurma</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
