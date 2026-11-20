import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Sesuaikan dengan alamat publik: https://meskowan.github.io/portfolio-aplannymw/
  base: '/portfolio-aplannymw/',
});
