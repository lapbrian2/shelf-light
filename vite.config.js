import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: mode === 'production' ? 'hidden' : true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
        }
      }
    }
  },
  define: {
    __DEV__: JSON.stringify(mode !== 'production'),
  }
}));
