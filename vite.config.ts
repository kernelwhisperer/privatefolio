import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  // https://github.com/pouchdb/pouchdb/issues/8516#issuecomment-1546129302
  define: { global: typeof window === "undefined" ? "self" : "window" },
  plugins: [react()],
})
