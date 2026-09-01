import js from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import { defineConfig, globalIgnores } from "eslint/config"
import tseslint from "typescript-eslint"

/**
 * The React rules are the ones that matter here: `recommended-latest` carries
 * the React 19 compiler checks, which is what keeps effects, refs and render
 * side effects honest in this codebase.
 */
export default defineConfig([
  globalIgnores(["dist"]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat["recommended-latest"],
])
