import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Pages
import GuestAbsensi from './pages/guest/GuestAbsensi';
import GuestDashboard from './pages/guest/GuestDashboard';
import GuestPengajian from './pages/guest/GuestPengajian';
import GuestGaleri from './pages/guest/GuestGaleri';
import GuestDakwah from './pages/guest/GuestDakwah';
import GuestPiket from './pages/guest/GuestPiket';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import KetuaDashboard from './pages/ketua/KetuaDashboard';
import KetuaPengajian from './pages/ketua/KetuaPengajian';
import KetuaGelarTerpal from './pages/ketua/KetuaGelarTerpal';

import PanitiaDashboard from './pages/panitia/PanitiaDashboard';
import PanitiaPengajian from './pages/panitia/PanitiaPengajian';
import PanitiaGelarTerpal from './pages/panitia/PanitiaGelarTerpal';
import PanitiaFoto from './pages/panitia/PanitiaFoto';
import PanitiaUsers from './pages/panitia/PanitiaUsers';
import PanitiaUangmakan from "./pages/panitia/PanitiaUangmakan";

import AdminOrganisasi from './pages/admin/AdminOrganisasi';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPengajian from './pages/admin/AdminPengajian';
import AdminGelarTerpal from './pages/admin/AdminGelarTerpal';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import GuestTerpal from './pages/guest/GuestTerpal';
import GuestUangsumbangan from './pages/guest/GuestUangsumbangan';
import AdminUangsumbangan from './pages/admin/AdminUangsumbangan';
import AdminUangmakan from './pages/admin/AdminUangmakan';
import AdminPiket from './pages/admin/AdminPiket';
import KetuaUangmakan from './pages/ketua/KetuaUangmakan';
import AdminAbsensi from './pages/admin/AdminAbsensi';
import GuestOrganisasi from './pages/guest/GuestOrganisasi';


// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner text-kurma-600 w-10 h-10 border-4 inline-block mb-3"></div>
        <p className="text-stone-500">Memuat...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role === 'ketua_kelas' ? 'ketua' : user.role}`} replace />;
  }
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<GuestDashboard />} />
        <Route path="/pengajian" element={<GuestPengajian />} />
        <Route path="/uang-sumbangan" element={<GuestUangsumbangan />} />
        <Route path="/galeri" element={<GuestGaleri />} />
        <Route path="/terpal" element={<GuestTerpal/>}/>
        <Route path="/dakwah" element={<GuestDakwah/>}/>
        <Route path="/piket" element={<GuestPiket/>}/>
        <Route path="/absen" element={<GuestAbsensi/>}/>
        <Route path="/organisasi" element={<GuestOrganisasi/>}/>
      </Route>

      {/* Auth */}
      <Route path="/login" element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <RegisterPage />} />

      {/* Ketua Kelas */}
      <Route path="/ketua" element={
        <ProtectedRoute allowedRoles={['ketua_kelas']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<KetuaDashboard />} />
        <Route path="pengajian" element={<KetuaPengajian />} />
        <Route path="gelar-terpal" element={<KetuaGelarTerpal />} />
        <Route path="/ketua/uang-makan" element={<KetuaUangmakan />} />
      </Route>

      {/* Panitia */}
      <Route path="/panitia" element={
        <ProtectedRoute allowedRoles={['panitia']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<PanitiaDashboard />} />
        <Route path="pengajian" element={<PanitiaPengajian />} />
        <Route path="gelar-terpal" element={<PanitiaGelarTerpal />} />
        <Route path="foto" element={<PanitiaFoto />} />
        <Route path="users" element={<PanitiaUsers />} />
        <Route path="uang-makan" element={<PanitiaUangmakan/>}/>
      </Route>

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="pengajian" element={<AdminPengajian />} />
        <Route path="gelar-terpal" element={<AdminGelarTerpal />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="uang-sumbangan" element={<AdminUangsumbangan/>}/>
        <Route path="uangmakan" element={<AdminUangmakan/>}/>
        <Route path="piket" element={<AdminPiket/>}/>
        <Route path="absen" element={<AdminAbsensi/>}/>
        <Route path="organisasi" element={<AdminOrganisasi/>}/>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function getDashboardPath(role) {
  const map = { admin: '/admin', panitia: '/panitia', ketua_kelas: '/ketua' };
  return map[role] || '/';
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
