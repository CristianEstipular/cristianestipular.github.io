import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/assign': 'http://localhost:5000',
      '/admin': 'http://localhost:5000',
      '/user': 'http://localhost:5000',
      '/prof': 'http://localhost:5000',
      '/incidents': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
})
