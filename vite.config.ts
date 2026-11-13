import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
export default defineConfig(({mode})=>({ base:mode==='pages'?'/nuestra-ia/':'/', plugins: [react(), tailwind()], build: { rollupOptions: { output: { manualChunks(id) {
  if (!id.includes('node_modules')) return;
  if (/recharts|d3-|victory|react-smooth|decimal|redux|immer|reselect|use-sync-external-store/.test(id)) return 'charts';
  if (/leaflet|topojson/.test(id)) return 'maps';
} } } } }));
