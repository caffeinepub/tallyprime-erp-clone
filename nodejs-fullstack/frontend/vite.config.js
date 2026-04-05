import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  logLevel: 'error',
  build: { emptyOutDir: true, sourcemap: false, minify: false },
  css: { postcss: './postcss.config.js' },
  optimizeDeps: {
    rolldownOptions: { input: {} },
    esbuildOptions: undefined,
  },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } }
  },
  plugins: [react()],
  resolve: { alias: [{ find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) }] }
});
