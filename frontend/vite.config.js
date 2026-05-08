import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Saat development (lokal), arahkan ke localhost
        // Saat produksi, ini biasanya tidak terpakai jika Anda menggunakan URL lengkap di axios/api utils
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // BAGIAN /uploads DIHAPUS karena gambar sekarang pakai URL Cloudinary (https://res.cloudinary.com/...)
    }
  }
})