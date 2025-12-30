import { defineConfig } from 'vite';
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        bootloader: './bootloader.html',
        'sw.bundle': './sw.js',
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'sw.bundle') {
            return 'sw.bundle.js';
          }
          return 'assets/[name]-[hash].js';
        },
        format: 'es',
      },
    },
    // Copy config.json to dist after build
    write: true,
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: [],
  },
  plugins: [
    {
      name: 'copy-config',
      closeBundle() {
        const configPath = resolve(__dirname, 'config.json');
        const distPath = resolve(__dirname, 'dist', 'config.json');
        if (existsSync(configPath)) {
          copyFileSync(configPath, distPath);
        }
      },
    },
  ],
});

