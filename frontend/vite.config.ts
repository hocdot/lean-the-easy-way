import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// /api goes to the local Lean backend (backend/server.ts).
// For GitHub Pages, set BASE_PATH to the repository sub-path, e.g. /lean-instructor-website/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    port: 5180,
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
})
