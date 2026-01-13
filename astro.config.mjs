import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://arcade-cabinet.github.io',
  base: '/neo-tokyo-rival-academies',
  integrations: [
    react({
      include: ['**/react/*'],
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['three', '@react-three/fiber', '@react-three/drei'],
    },
  },
});
