import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  base: '/smth-not-interesting/',
  server: {
    https: true,
    host: true,
    allowedHosts: ['.loca.lt', '.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'https://smth-not-interesting-back.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/hub': {
        target: 'https://smth-not-interesting-back.onrender.com',
        ws: true,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})