import * as React from "react"

/**
 * Matches a shortcut written as `"mod+shift+g"`.
 *
 * `mod` is the platform's primary modifier: Command on Apple hardware, Control
 * elsewhere. Matching happens on `event.code` (`KeyG`) rather than `event.key`
 * so the shortcut survives non-QWERTY layouts and the Shift modifier.
 */
export function useShortcut(
  shortcut: string | false,
  onTrigger: () => void
): void {
  const handler = React.useRef(onTrigger)

  React.useEffect(() => {
    handler.current = onTrigger
  }, [onTrigger])

  React.useEffect(() => {
    if (!shortcut) return

    const parts = shortcut
      .toLowerCase()
      .split("+")
      .map((part) => part.trim())
    const key = parts[parts.length - 1]
    if (!key) return

    const needsMod = parts.includes("mod")
    const needsShift = parts.includes("shift")
    const needsAlt = parts.includes("alt")
    const expectedCode = key.length === 1 ? `Key${key.toUpperCase()}` : null

    const onKeyDown = (event: KeyboardEvent) => {
      const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.platform)
      const mod = isApple ? event.metaKey : event.ctrlKey

      if (needsMod !== mod) return
      if (needsShift !== event.shiftKey) return
      if (needsAlt !== event.altKey) return

      const matches = expectedCode
        ? event.code === expectedCode
        : event.key.toLowerCase() === key
      if (!matches) return

      event.preventDefault()
      handler.current()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [shortcut])
}
