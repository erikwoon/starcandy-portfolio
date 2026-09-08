import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // The Vite dev server has no idea /photos/* is served by the
      // deployed Worker from R2 — it just 404s. Proxy those requests to
      // the live site instead of trying to replicate the Worker/R2
      // binding locally.
      '/photos': {
        target: 'https://starcandy.org',
        changeOrigin: true,
      },
    },
  },
})
