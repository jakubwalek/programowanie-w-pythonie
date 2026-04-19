import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Zmień na nazwę repozytorium GitHub (ścieżka pod GitHub Pages)
const repoName = 'programowanie-w-pythonie'

export default defineConfig({
  plugins: [react()],
  base: process.env.GH_PAGES === 'true' ? `/${repoName}/` : '/',
})
