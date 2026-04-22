import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use environment variable for API URL, fallback to localhost for local development
const API_URL = process.env.VITE_API_URL || 'http://localhost:5004'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: true, // Allow all hosts for Cloudflare tunnel
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true,
      },
    },
  },
})