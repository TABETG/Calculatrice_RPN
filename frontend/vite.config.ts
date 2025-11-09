import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Calculatrice_RPN/', // nom exact du repo GitHub
})
