import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    basicSsl(),
  ],

  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        plCounter: 'pl-counter/index.html',
      },
    },
  },

  optimizeDeps: {
    // Prevent esbuild from pre-bundling onnxruntime-web.
    // esbuild mangles ORT's WASM initialization glue code ("K is not a function").
    exclude: ['onnxruntime-web'],
  },
})
