import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginLess } from '@rsbuild/plugin-less';
import path from 'path';

const { REACT_APP_ENV = 'dev' } = process.env;
const isDev = process.env.NODE_ENV === 'development';

// 代理配置
const proxyConfig = {
  dev: {
    '/api': {
      target: 'http://127.0.0.1:7890',
      changeOrigin: true,
    },
  },
};

export default defineConfig({
  plugins: [pluginReact(), pluginLess()],
  server: {
    port: 7020,
    proxy: proxyConfig[REACT_APP_ENV as keyof typeof proxyConfig] || proxyConfig.dev,
  },
  html: {
    title: 'AI 教育',
    template: './public/index.html',
    script: [
      // 解决首次加载时白屏的问题
      { src: '/scripts/loading.js', async: true },
    ],
  },
  source: {
    entry: {
      index: './src/index.tsx',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ai-education/shared-frontend': path.resolve(__dirname, '../../packages/shared-frontend/dist'),
    },
  },
  output: {
    distPath: {
      root: 'dist',
    },
    filename: {
      js: '[name].[contenthash:8].js',
      css: '[name].[contenthash:8].css',
    },
  },
  tools: {
    rspack: {
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
  },
  define: {
    'process.env.WS_API': isDev ? 'ws://127.0.0.1:8000/api' : 'wss://ai.ixxl.me/api',
  },
});

