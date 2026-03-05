import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import fs from 'fs'
import path from 'path'

// Fixes file:// compatibility:
// 1. Removes type="module" (Chrome blocks ES modules over file://)
// 2. Moves the inlined <script> to end of <body> so the DOM exists when it runs
function fixFileProtocol() {
  return {
    name: 'fix-file-protocol',
    closeBundle() {
      const file = path.resolve('dist/index.html')
      let html = fs.readFileSync(file, 'utf-8')

      // Strip type="module" from the inlined script tag
      html = html.replace(/<script type="module" crossorigin>/g, '<script crossorigin>')

      // Move the inlined script block out of <head> and into end of <body>
      const scriptMatch = html.match(/<script crossorigin>[\s\S]*?<\/script>/)
      if (scriptMatch) {
        html = html.replace(scriptMatch[0], '')
        html = html.replace('</body>', scriptMatch[0] + '\n</body>')
      }

      fs.writeFileSync(file, html)
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
