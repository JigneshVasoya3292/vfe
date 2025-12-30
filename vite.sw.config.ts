import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: './sw.js',
      output: {
        entryFileNames: 'sw.bundle.js',
        format: 'es',
        inlineDynamicImports: true,
      },
      // Don't externalize any dependencies - bundle everything
      external: [],
    },
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: false,
    minify: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis',
  },
  resolve: {
    conditions: ['worker', 'import', 'module', 'browser', 'default'],
    mainFields: ['browser', 'module', 'main'],
  },
  optimizeDeps: {
    exclude: [],
  },
  worker: {
    format: 'es',
  },
});

