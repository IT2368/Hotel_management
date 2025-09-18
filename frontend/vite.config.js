import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // 👈 Your backend server
        changeOrigin: true,
        secure: false,
        // Ensure all frontend calls to "/api/*" are forwarded to backend "/api/v1/*"
        // but don't double-prefix if it's already "/api/v1/*"
        rewrite: (path) => (path.startsWith("/api/v1") ? path : path.replace(/^\/api/, "/api/v1")),
      },
    },
  },
});
