import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Vite builds the app; the "test" block configures Vitest (run with `npm test`).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  },
});
