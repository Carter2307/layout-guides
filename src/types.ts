export type GuideType = "grid" | "columns" | "rows"

export type PanelPosition =
  "top-right" | "top-left" | "bottom-right" | "bottom-left"

/** An RGB hex colour plus an opacity, mirroring the Figma colour row. */
export interface ColorValue {
  /** Six digit RGB hex, uppercase, without the leading `#`. */
  hex: string
  /** Opacity as a percentage, `0`–`100`. */
  alpha: number
}

export type ColumnsAlignment = "left" | "right" | "center" | "stretch"
export type RowsAlignment = "top" | "bottom" | "center" | "stretch"
export type TrackAlignment = ColumnsAlignment | RowsAlignment

interface GuideBase {
  id: string
  visible: boolean
  color: ColorValue
}

export interface GridGuide extends GuideBase {
  type: "grid"
  /** Cell size in pixels. */
  size: number
}

/**
 * `width` / `offset` stay populated even when the current alignment ignores
 * them, so switching alignment back and forth restores the previous values
 * instead of resetting them.
 */
export interface ColumnsGuide extends GuideBase {
  type: "columns"
  count: number
  alignment: ColumnsAlignment
  /** Column width in pixels. Ignored when `alignment` is `stretch`. */
  width: number
  /** Left and right margin. Only used when `alignment` is `stretch`. */
  margin: number
  /** Shift of the whole set. Ignored when `alignment` is `center` or `stretch`. */
  offset: number
  gutter: number
}

export interface RowsGuide extends GuideBase {
  type: "rows"
  count: number
  alignment: RowsAlignment
  /** Row height in pixels. Ignored when `alignment` is `stretch`. */
  height: number
  /** Top and bottom margin. Only used when `alignment` is `stretch`. */
  margin: number
  /** Shift of the whole set. Ignored when `alignment` is `center` or `stretch`. */
  offset: number
  gutter: number
}

export type TrackGuide = ColumnsGuide | RowsGuide
export type Guide = GridGuide | TrackGuide

export function isTrackGuide(guide: Guide): guide is TrackGuide {
  return guide.type === "columns" || guide.type === "rows"
}

/**
 * Columns and rows are the same computation on a different axis. These two
 * helpers are the only place the `width` / `height` naming difference is
 * resolved, so the geometry and the overlay stay axis agnostic.
 */
export function trackSizeOf(guide: TrackGuide): number {
  return guide.type === "columns" ? guide.width : guide.height
}

export function withTrackSize(guide: TrackGuide, size: number): TrackGuide {
  return guide.type === "columns"
    ? { ...guide, width: size }
    : { ...guide, height: size }
}

/** `"Width"` for columns, `"Height"` for rows. */
export function trackSizeLabel(guide: TrackGuide): "Width" | "Height" {
  return guide.type === "columns" ? "Width" : "Height"
}

/**
 * A partial update coming from the editor.
 *
 * The union cannot express "a patch for whichever member this guide is", so
 * this flat shape is the single place where the widening happens. `store`
 * narrows it back when merging.
 */
export interface GuidePatch {
  visible?: boolean
  color?: ColorValue
  /** Grid cell size. */
  size?: number
  count?: number
  alignment?: TrackAlignment
  width?: number
  height?: number
  margin?: number
  offset?: number
  gutter?: number
}

/**
 * A guide as supplied by the host through `defaultGuides`.
 *
 * Only `type` is required: every other field falls back to the type's default,
 * and a missing `id` is generated. The same tolerant parsing is used for
 * persisted state, so both paths behave identically.
 */
export type GuideInput = GuidePatch & { type: GuideType }
