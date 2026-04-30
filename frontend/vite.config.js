import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all network interfaces so other devices on the LAN can connect
    host: '0.0.0.0',
    // Forward /api requests to the backend during development
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
