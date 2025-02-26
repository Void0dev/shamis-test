import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
// import mkcert from 'vite-plugin-mkcert';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    nodePolyfills({
      include: ['buffer', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    }),
    // Allows using React dev server along with building a React application with Vite.
    // https://npmjs.com/package/@vitejs/plugin-react-swc
    react(),
    // mkcert(),
    // Allows using the compilerOptions.paths property in tsconfig.json.
    // https://www.npmjs.com/package/vite-tsconfig-paths
    tsconfigPaths(),
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: '/index.html',
      },
      output: {
        assetFileNames: (assetInfo) => {
          // Keep original names only for images
          if (assetInfo.originalFileNames?.some(name => /\.(gif|jpe?g|png|svg|webp)$/.test(name))) {
            return 'assets/[name][extname]';
          }
          // Use hash for other assets
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  publicDir: './public',
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'infinite-maggot-relaxing.ngrok-free.app',
      '.ngrok-free.app'  // Allow all ngrok-free.app subdomains
    ]
  }
});
