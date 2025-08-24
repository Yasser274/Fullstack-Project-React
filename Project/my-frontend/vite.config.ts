import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
   plugins: [react(), svgr()],
   server: {
      // This proxy section is the rulebook
      proxy: {
         // Any request starting with '/api' will be handled by this rule
         "/api": {
            // The request will be forwarded to this target address
            target: "http://localhost:3001",
            // This is needed for the backend to correctly receive the request
            changeOrigin: true,
         },
      },
   },
});
