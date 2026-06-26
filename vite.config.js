import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Tells Vite the root is where this config file sits
  server: {
    port: 5173,
    open: true, // Automatically opens the browser when you run npm run dev
  },
  build: {
    outDir: 'dist', // Where the production bundle will go
    cleanCss: true,
  }
});