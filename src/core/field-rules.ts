import type { TrackAlignment } from "../types"

/**
 * How a field behaves for a given alignment.
 *
 * `hidden` fields keep their stored value; they are simply not part of the
 * computation. `disabled` is used where Figma greys a field out because the
 * value is implied — `Center` derives its offset, so the input shows `0` and
 * cannot be edited.
 */
export type FieldRule = "editable" | "disabled" | "hidden"

export interface TrackFieldRules {
  /** `Width` for columns, `Height` for rows. */
  size: FieldRule
  margin: FieldRule
  offset: FieldRule
  gutter: FieldRule
}

export function trackFieldRules(alignment: TrackAlignment): TrackFieldRules {
  if (alignment === "stretch") {
    return {
      size: "hidden",
      margin: "editable",
      offset: "hidden",
      gutter: "editable",
    }
  }

  return {
    size: "editable",
    margin: "hidden",
    offset: alignment === "center" ? "disabled" : "editable",
    gutter: "editable",
  }
}

export const COLUMNS_ALIGNMENTS = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "center", label: "Center" },
  { value: "stretch", label: "Stretch" },
] as const

export const ROWS_ALIGNMENTS = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "center", label: "Center" },
  { value: "stretch", label: "Stretch" },
] as const

/**
 * Alignments are per axis, so converting a guide between columns and rows has
 * to translate the alignment too.
 */
export function convertAlignment(
  alignment: TrackAlignment,
  to: "columns" | "rows"
): TrackAlignment {
  if (to === "rows") {
    if (alignment === "left") return "top"
    if (alignment === "right") return "bottom"
    return alignment
  }

  if (alignment === "top") return "left"
  if (alignment === "bottom") return "right"
  return alignment
}
