import { defineConfig } from 'vite';

export default defineConfig({
  // Verified GitHub remote: neranjani17092007-create/GAME1.
  // Override for another static host, e.g. STATIC_BASE_PATH=/ npm run build.
  base: process.env.STATIC_BASE_PATH || '/GAME1/',
});
