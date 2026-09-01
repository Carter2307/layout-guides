import { toCssColor } from "../core/color"
import type { GridGuide } from "../types"

/**
 * Drawn with two repeating gradients rather than one element per cell, so the
 * cost stays constant no matter how small the cell size or how large the
 * viewport.
 */
export function GridOverlay({ guide }: { guide: GridGuide }) {
  const color = toCssColor(guide.color)
  const size = Math.max(1, guide.size)

  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: [
          `repeating-linear-gradient(to right, ${color} 0 1px, transparent 1px ${size}px)`,
          `repeating-linear-gradient(to bottom, ${color} 0 1px, transparent 1px ${size}px)`,
        ].join(", "),
      }}
    />
  )
}
