import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '')
  
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
    build: {
      minify: 'oxc',          // ← Vite 8 использует oxc вместо esbuild
      cssMinify: 'lightningcss',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React core
            if (id.includes('node_modules/react/') || 
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/scheduler/')) {
              return 'react-vendor';
            }
            
            // React Query
            if (id.includes('node_modules/@tanstack/')) {
              return 'data-vendor';
            }
            
            // Radix UI
            if (id.includes('node_modules/@radix-ui/')) {
              return 'ui-vendor';
            }
            
            // Motion
            if (id.includes('node_modules/framer-motion/') ||
                id.includes('node_modules/motion/') ||
                id.includes('node_modules/motion-dom/') ||
                id.includes('node_modules/motion-utils/')) {
              return 'motion-vendor';
            }
            
            // Chart.js
            if (id.includes('node_modules/chart.js/') ||
                id.includes('node_modules/react-chartjs-2/')) {
              return 'chart-vendor';
            }
            
            // Floating UI
            if (id.includes('node_modules/@floating-ui/')) {
              return 'floating-vendor';
            }
            
            // Lucide Icons
            if (id.includes('node_modules/lucide-react/')) {
              return 'icon-vendor';
            }
          },
        },
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