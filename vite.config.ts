import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  // https://github.com/pouchdb/pouchdb/issues/8516#issuecomment-1546129302
  define: { global: typeof window === "undefined" ? "self" : "window" },
  plugins: [
    react(),
    visualizer({
      // brotliSize: true,
      filename: "dist/bundle-analysis.html",
      gzipSize: true,
      open: true,
      template: "sunburst",
    }),
  ],
  resolve: {
    alias: {
      src: "/src",
    },
  },
})
