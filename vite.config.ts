import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "figma:asset": path.resolve(__dirname, "./src/react/assets"),
      "@": path.resolve(__dirname, "./src/react/app"),
      "motion/react": "framer-motion",
    },
  },
});
