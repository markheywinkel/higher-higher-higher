import { defineConfig } from "vite";
import { fileURLToPath, URL } from "url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "./",
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main: `${root}index.html`,
        editor: `${root}editor.html`,
      },
    },
  },
});
