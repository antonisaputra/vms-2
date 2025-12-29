import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This makes process.env available in the client-side code
    'process.env': process.env
  },
  server: {
    host: true,
    // Port default Vite adalah 5173, ini akan menghindarinya bentrok dengan backend
    port: 5173,
    // PROXY REMOVED
  }
})