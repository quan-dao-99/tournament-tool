import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` must match the GitHub Pages project subpath so built asset URLs
// resolve correctly: https://quan-dao-99.github.io/tournament-tool/
export default defineConfig({
  base: '/tournament-tool/',
  plugins: [react()],
});
