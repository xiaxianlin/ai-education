import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    port: 7030,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7891',
        changeOrigin: true,
      },
    },
  },
  html: {
    title: 'Student',
    template: './public/index.html',
    favicon: './public/logo.ico',
  },
  source: {
    entry: {
      index: './src/index.tsx',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  output: {
    distPath: {
      root: 'dist',
    },
  },
});
