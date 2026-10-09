import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': process.env.QN_PROXY_PROD
        ? { target: 'https://qutenote.com', changeOrigin: true }
        : {
            target: 'http://localhost:4000',
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
    },
  },
})
