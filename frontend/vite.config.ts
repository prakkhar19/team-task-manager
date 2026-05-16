import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: true, // Binds to 0.0.0.0 which is required for Railway
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    allowedHosts: true, // Allow all hosts to avoid invalid host header errors
  }
})
