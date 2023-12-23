import { defineConfig } from "vitest/config"

// https://vitest.dev/config/
export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "html"],
    },
    environment: "node",
    globals: true,
    maxConcurrency: 32,
    reporters: ["verbose"],
    testTimeout: 10_000,
  },
})
