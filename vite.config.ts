import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '') // предзагрузка env
  
  return {
    plugins: [
      tailwindcss(),
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@micro-apps': path.resolve(__dirname, './src/micro-apps'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://dev.api.tipbot.qu1nqqy.ru',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('Proxying:', req.method, req.url, '→', proxyReq.path);
            });
          },
        }
      }
    }
  }
})