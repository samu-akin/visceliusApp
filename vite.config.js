import { defineConfig } from 'vite';
import reactSWC from '@vitejs/plugin-react-swc'; // Importe reactSWC

export default defineConfig({
  plugins: [reactSWC()], // Use reactSWC aqui
  server: {
    port: 5173, // Ou 3000, se preferir
  },
});
