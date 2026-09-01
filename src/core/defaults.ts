import {
  isTrackGuide,
  trackSizeOf,
  type ColorValue,
  type ColumnsAlignment,
  type ColumnsGuide,
  type Guide,
  type GridGuide,
  type GuideType,
  type RowsAlignment,
  type RowsGuide,
} from "../types"
import { clamp, normalizeHex } from "./color"
import { convertAlignment } from "./field-rules"

export const DEFAULT_COLOR: ColorValue = { hex: "FF0000", alpha: 10 }

let sequence = 0

export function createGuideId(): string {
  sequence += 1
  return `guide-${Date.now().toString(36)}-${sequence.toString(36)}`
}

export function createGuide(type: GuideType): Guide {
  const base = { id: createGuideId(), visible: true, color: DEFAULT_COLOR }

  switch (type) {
    case "grid":
      return { ...base, type: "grid", size: 32 }
    case "columns":
      return {
        ...base,
        type: "columns",
        count: 12,
        alignment: "stretch",
        width: 64,
        margin: 24,
        offset: 0,
        gutter: 20,
      }
    case "rows":
      return {
        ...base,
        type: "rows",
        count: 5,
        alignment: "top",
        height: 32,
        margin: 24,
        offset: 0,
        gutter: 20,
      }
  }
}

/**
 * Retypes a guide in place, keeping everything the target type can express.
 * Switching columns to rows should feel like changing an axis, not like
 * starting over.
 */
export function convertGuide(guide: Guide, type: GuideType): Guide {
  if (guide.type === type) return guide

  const base = { id: guide.id, visible: guide.visible, color: guide.color }

  if (type === "grid") {
    return {
      ...base,
      type: "grid",
      size: isTrackGuide(guide)
        ? Math.max(1, Math.round(trackSizeOf(guide)))
        : 32,
    }
  }

  const fallback = createGuide(type) as ColumnsGuide | RowsGuide
  const shared = isTrackGuide(guide)
    ? {
        count: guide.count,
        margin: guide.margin,
        offset: guide.offset,
        gutter: guide.gutter,
        size: trackSizeOf(guide),
        alignment: convertAlignment(guide.alignment, type),
      }
    : {
        count: fallback.count,
        margin: fallback.margin,
        offset: fallback.offset,
        gutter: fallback.gutter,
        size: guide.size,
        alignment: fallback.alignment,
      }

  if (type === "columns") {
    return {
      ...base,
      type: "columns",
      count: shared.count,
      alignment: shared.alignment as ColumnsAlignment,
      width: shared.size,
      margin: shared.margin,
      offset: shared.offset,
      gutter: shared.gutter,
    }
  }

  return {
    ...base,
    type: "rows",
    count: shared.count,
    alignment: shared.alignment as RowsAlignment,
    height: shared.size,
    margin: shared.margin,
    offset: shared.offset,
    gutter: shared.gutter,
  }
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function sanitizeColor(value: unknown): ColorValue {
  if (typeof value !== "object" || value === null) return DEFAULT_COLOR

  const candidate = value as Partial<ColorValue>
  const hex =
    typeof candidate.hex === "string" ? normalizeHex(candidate.hex) : null

  return {
    hex: hex ?? DEFAULT_COLOR.hex,
    alpha: clamp(toFiniteNumber(candidate.alpha, DEFAULT_COLOR.alpha), 0, 100),
  }
}

const COLUMNS_ALIGNMENT_VALUES: ColumnsAlignment[] = [
  "left",
  "right",
  "center",
  "stretch",
]
const ROWS_ALIGNMENT_VALUES: RowsAlignment[] = [
  "top",
  "bottom",
  "center",
  "stretch",
]

/**
 * Rebuilds a trustworthy guide from unknown input. Used for both persisted
 * state and the `defaultGuides` prop, so a stale `localStorage` payload can
 * never crash the host application.
 */
export function sanitizeGuide(value: unknown): Guide | null {
  if (typeof value !== "object" || value === null) return null

  const candidate = value as Record<string, unknown>
  const type = candidate.type
  if (type !== "grid" && type !== "columns" && type !== "rows") return null

  const base = {
    id: typeof candidate.id === "string" ? candidate.id : createGuideId(),
    visible: candidate.visible !== false,
    color: sanitizeColor(candidate.color),
  }

  if (type === "grid") {
    const fallback = createGuide("grid") as GridGuide
    return {
      ...base,
      type: "grid",
      size: Math.max(1, toFiniteNumber(candidate.size, fallback.size)),
    }
  }

  const fallback = createGuide(type) as ColumnsGuide | RowsGuide
  const count = Math.max(
    1,
    Math.round(toFiniteNumber(candidate.count, fallback.count))
  )
  const margin = Math.max(0, toFiniteNumber(candidate.margin, fallback.margin))
  const offset = toFiniteNumber(candidate.offset, fallback.offset)
  const gutter = Math.max(0, toFiniteNumber(candidate.gutter, fallback.gutter))

  if (type === "columns") {
    const alignment = COLUMNS_ALIGNMENT_VALUES.includes(
      candidate.alignment as ColumnsAlignment
    )
      ? (candidate.alignment as ColumnsAlignment)
      : (fallback.alignment as ColumnsAlignment)

    return {
      ...base,
      type: "columns",
      count,
      alignment,
      width: Math.max(
        0,
        toFiniteNumber(candidate.width, (fallback as ColumnsGuide).width)
      ),
      margin,
      offset,
      gutter,
    }
  }

  const alignment = ROWS_ALIGNMENT_VALUES.includes(
    candidate.alignment as RowsAlignment
  )
    ? (candidate.alignment as RowsAlignment)
    : (fallback.alignment as RowsAlignment)

  return {
    ...base,
    type: "rows",
    count,
    alignment,
    height: Math.max(
      0,
      toFiniteNumber(candidate.height, (fallback as RowsGuide).height)
    ),
    margin,
    offset,
    gutter,
  }
}

export function sanitizeGuides(value: unknown): Guide[] {
  if (!Array.isArray(value)) return []
  return value
    .map(sanitizeGuide)
    .filter((guide): guide is Guide => guide !== null)
}
