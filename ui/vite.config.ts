import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  base: 'cse333-lock-visualizer',
  plugins: [react()],
  resolve: {
    alias: {
      core: path.resolve(__dirname, "../core")
    }
  }
});
