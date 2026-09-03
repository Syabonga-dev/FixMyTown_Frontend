import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Optional: proxy /api requests straight to the ASP.NET Core backend
    // during local development, so the browser only ever talks to one origin
    // and you avoid CORS entirely while developing.
    // Uncomment if you prefer this over calling VITE_API_BASE_URL directly.
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:5174",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
});
