import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import fs from 'fs'
import path from 'path'

// Strips type="module" from the final HTML so it works via file:// in Chrome
function fixFileProtocol() {
  return {
    name: 'fix-file-protocol',
    closeBundle() {
      const file = path.resolve('dist/index.html')
      const html = fs.readFileSync(file, 'utf-8')
      fs.writeFileSync(file, html.replace(/<script type="module"/g, '<script'))
    },
  }
}

export default defineConfig({
  plugins: [react(), viteSingleFile(), fixFileProtocol()],
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
})
