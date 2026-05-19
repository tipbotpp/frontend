import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import million from 'million/compiler'
import path from 'path'

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      million.vite({ auto: true }),
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
      minify: 'oxc',
      cssMinify: 'lightningcss',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || 
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/scheduler/')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/@tanstack/')) {
              return 'data-vendor';
            }
            if (id.includes('node_modules/@radix-ui/')) {
              return 'ui-vendor';
            }
            if (id.includes('node_modules/framer-motion/') ||
                id.includes('node_modules/motion/') ||
                id.includes('node_modules/motion-dom/') ||
                id.includes('node_modules/motion-utils/')) {
              return 'motion-vendor';
            }
            if (id.includes('node_modules/chart.js/') ||
                id.includes('node_modules/react-chartjs-2/')) {
              return 'chart-vendor';
            }
            if (id.includes('node_modules/@floating-ui/')) {
              return 'floating-vendor';
            }
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
        }
      }
    }
  }
})