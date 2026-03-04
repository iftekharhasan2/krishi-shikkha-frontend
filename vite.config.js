import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // Dev proxy — only active during `vite dev`
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    },
    // Production build settings
    build: {
      outDir: 'dist',
      sourcemap: false,    // disable in prod for security
      chunkSizeWarningLimit: 1000,
    },
    define: {
      // Make env vars available in the app
      __API_BASE__: JSON.stringify(env.VITE_API_BASE_URL || ''),
    }
  }
})
