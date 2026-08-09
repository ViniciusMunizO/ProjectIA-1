import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      allow: ['.', '../shared'],
    },
    watch: {
      // Generated PDFs and debug scripts land in temp/ (e.g. pedido PDFs
      // mid-write); watching them isn't needed for HMR and Windows can
      // throw EBUSY on a locked file mid-write, crashing the dev server.
      ignored: ['**/temp/**'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
    headers: {
      // Anti-framing only: safe to set unconditionally, unlike a full CSP,
      // since it never restricts which scripts/styles Vite's dev server
      // (HMR, React Fast Refresh) is allowed to load.
      'X-Frame-Options': 'SAMEORIGIN',
    },
  },
})
