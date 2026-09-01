import { trackSizeOf, type Guide, type GuideType } from "../types"

/** Trims float noise so `32` renders as `32`, not `32.00`. */
export function formatNumber(value: number): string {
  return Number.parseFloat(value.toFixed(2)).toString()
}

export function guideTypeLabel(type: GuideType): string {
  switch (type) {
    case "grid":
      return "Grid"
    case "columns":
      return "Columns"
    case "rows":
      return "Rows"
  }
}

/** `Grid 32px`, `5 rows (32px)`, `12 columns (stretch)`. */
export function guideLabel(guide: Guide): string {
  if (guide.type === "grid") {
    return `Grid ${formatNumber(guide.size)}px`
  }

  const noun = guide.type === "columns" ? "column" : "row"
  const plural = guide.count === 1 ? noun : `${noun}s`
  const detail =
    guide.alignment === "stretch"
      ? "stretch"
      : `${formatNumber(trackSizeOf(guide))}px`

  return `${guide.count} ${plural} (${detail})`
}
