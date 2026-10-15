import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The widget bundle for the Verso site: one JS file and one CSS file, copied into Verso's
// output. It always runs without a Lean server (Lean's saved answers are bundled in).
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_STATIC': JSON.stringify('1'),
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: '../site/assets',
    emptyOutDir: false,
    lib: { entry: 'src/verso/widgets.tsx', name: 'LeanForAll', formats: ['iife'], fileName: () => 'lfa-widgets.js' },
    rollupOptions: { output: { inlineDynamicImports: true, assetFileNames: 'lfa-widgets[extname]' } },
  },
})
