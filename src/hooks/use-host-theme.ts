import * as React from "react"

export type ThemePreference = "inherit" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"

function readHostTheme(): ResolvedTheme {
  const root = document.documentElement

  if (root.classList.contains("dark")) return "dark"
  if (root.classList.contains("light")) return "light"

  const attribute =
    root.getAttribute("data-theme") ?? document.body.getAttribute("data-theme")
  if (attribute === "dark") return "dark"
  if (attribute === "light") return "light"

  if (document.body.classList.contains("dark")) return "dark"

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

/**
 * Resolves the theme the panel should paint itself with.
 *
 * The resolved value is always applied as a class on the tool's own root, which
 * covers hosts that signal dark mode with a `.dark` class, with `data-theme`,
 * or not at all (in which case the OS preference decides).
 */
export function useResolvedTheme(preference: ThemePreference): ResolvedTheme {
  const [hostTheme, setHostTheme] = React.useState<ResolvedTheme>("light")

  React.useEffect(() => {
    if (preference !== "inherit") return

    const update = () => setHostTheme(readHostTheme())
    update()

    const observer = new MutationObserver(update)
    const options: MutationObserverInit = {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    }
    observer.observe(document.documentElement, options)
    observer.observe(document.body, options)

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    media.addEventListener("change", update)

    return () => {
      observer.disconnect()
      media.removeEventListener("change", update)
    }
  }, [preference])

  return preference === "inherit" ? hostTheme : preference
}
