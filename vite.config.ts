// Configuración principal de Vite con PWA para Lumina.
// En GitHub Pages el sitio vive en /lumina/; en desarrollo usamos la raíz.
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/lumina/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Lumina',
        short_name: 'Lumina',
        description: 'Curso-laboratorio web de óptica',
        theme_color: '#0a0908',
        background_color: '#0a0908',
        display: 'standalone',
        start_url: '/lumina/',
        scope: '/lumina/',
        icons: [
          { src: '/lumina/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/lumina/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
}));
