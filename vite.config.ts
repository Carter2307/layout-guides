import { fileURLToPath } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { libInjectCss } from "vite-plugin-lib-inject-css"

const src = fileURLToPath(new URL("./src", import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    libInjectCss(),
    dts({ include: ["src"], exclude: ["src/dev"] }),
  ],
  resolve: {
    alias: { "@": src },
  },
  build: {
    sourcemap: true,
    lib: {
      entry: `${src}/index.ts`,
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        /*
         * `@base-ui/react` reaches for this CommonJS shim, whose `require("react")`
         * survives bundling as a runtime `require` once React is external —
         * something Turbopack refuses to evaluate when the package is imported
         * from a React Server Component. Left external, it stays an ordinary
         * `node_modules` dependency that the host bundler resolves normally.
         */
        /^use-sync-external-store(\/|$)/,
      ],
      output: {
        /*
         * Bundling flattens the source modules, and with them the `"use client"`
         * directive on the root component. Re-stating it on the emitted chunk is
         * what keeps the package importable from a React Server Component.
         */
        banner: '"use client";',
      },
    },
  },
})
