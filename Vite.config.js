import { defineConfig } from "vite";

// base "./" faz o build funcionar tanto no GitHub Pages
// quanto dentro do app Android (Capacitor).
export default defineConfig({
  base: "./"
});