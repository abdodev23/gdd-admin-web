import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // Admin runs on 5174 so it doesn't collide with the user web on 5173.
  // Backend's CORS_ORIGINS already includes this port.
  server: {
    port: 5174,
  },
  preview: {
    port: 5174,
    allowedHosts: ['admin.cairo.galadedanza.com'],
  },
})
