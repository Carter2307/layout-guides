import * as React from "react"

export interface Size {
  width: number
  height: number
}

/**
 * Tracks the viewport in CSS pixels.
 *
 * `clientWidth` / `clientHeight` exclude the classic scrollbar, which is also
 * what a `position: fixed; inset: 0` overlay covers — so guides line up with
 * what the page actually shows. This hook is the single source of the container
 * measurement, so pointing guides at an element instead of the viewport later
 * only changes this file.
 */
export function useViewportSize(): Size {
  const [size, setSize] = React.useState<Size>({ width: 0, height: 0 })

  React.useEffect(() => {
    const element = document.documentElement

    const update = () => {
      setSize((current) =>
        current.width === element.clientWidth &&
        current.height === element.clientHeight
          ? current
          : { width: element.clientWidth, height: element.clientHeight }
      )
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(element)
    window.addEventListener("resize", update)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])

  return size
}
