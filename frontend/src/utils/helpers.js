import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatTanggal = (date) => {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'EEEE, dd MMMM yyyy', { locale: id });
  } catch {
    return date;
  }
};

export const formatTanggalPendek = (date) => {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMM yyyy', { locale: id });
  } catch {
    return date;
  }
};

export const formatWaktu = (date) => {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'HH:mm', { locale: id });
  } catch {
    return date;
  }
};

export const getRoleBadgeClass = (role) => {
  const map = {
    admin: 'badge-admin',
    panitia: 'badge-panitia',
    ketua_kelas: 'badge-ketua',
    guest: 'badge-guest',
  };
  return map[role] || 'badge-guest';
};

export const getRoleLabel = (role) => {
  const map = {
    admin: 'Admin',
    panitia: 'Panitia',
    ketua_kelas: 'Ketua Kelas',
    guest: 'Tamu',
  };
  return map[role] || role;
};

export const getStatusBadge = (status) => {
  const map = {
    upcoming: { label: 'Akan Datang', class: 'bg-blue-100 text-blue-700' },
    ongoing: { label: 'Berlangsung', class: 'bg-emerald-100 text-emerald-700 animate-pulse' },
    selesai: { label: 'Selesai', class: 'bg-stone-100 text-stone-600' },
  };
  return map[status] || { label: status, class: 'bg-stone-100 text-stone-600' };
};

export const truncate = (str, n = 100) => {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '...' : str;
};

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
  return base + path;
};
