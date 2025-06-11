import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap:true
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
        quietDeps: true
      }
    }
  },
  resolve: {
    alias: {
        '~bootstrap': path.resolve('node_modules/bootstrap'),
    }
}
});
