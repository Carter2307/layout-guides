import type { TrackAlignment } from "../types"

/** Axis agnostic alignment. `left`/`top` map to `start`, `right`/`bottom` to `end`. */
export type TrackAlign = "start" | "end" | "center" | "stretch"

export interface Track {
  /** Offset from the container's start edge, in pixels. */
  start: number
  /** Track length along the axis, in pixels. */
  size: number
}

export interface ComputeTracksOptions {
  containerSize: number
  count: number
  /** Track length. Ignored when `align` is `stretch`. */
  size: number
  gutter: number
  /** Start and end margin. Only used when `align` is `stretch`. */
  margin: number
  /** Shift of the whole set. Ignored when `align` is `center` or `stretch`. */
  offset: number
  align: TrackAlign
}

export function toTrackAlign(alignment: TrackAlignment): TrackAlign {
  switch (alignment) {
    case "left":
    case "top":
      return "start"
    case "right":
    case "bottom":
      return "end"
    case "center":
      return "center"
    case "stretch":
      return "stretch"
  }
}

/**
 * Positions `count` tracks along a single axis.
 *
 * Pure and axis agnostic: the caller decides whether `start`/`size` mean
 * left/width or top/height, and supplies the container measurement. Keeping the
 * container size as a plain number is what makes targeting an arbitrary element
 * later a change of caller rather than a change of algorithm.
 */
export function computeTracks({
  containerSize,
  count,
  size,
  gutter,
  margin,
  offset,
  align,
}: ComputeTracksOptions): Track[] {
  const total = Math.max(1, Math.floor(count) || 1)
  const gap = Math.max(0, gutter)
  const container = Math.max(0, containerSize)

  if (align === "stretch") {
    const edge = Math.max(0, margin)
    const available = container - edge * 2 - gap * (total - 1)
    const trackSize = Math.max(0, available / total)

    return Array.from({ length: total }, (_, index) => ({
      start: edge + index * (trackSize + gap),
      size: trackSize,
    }))
  }

  const trackSize = Math.max(0, size)
  const span = total * trackSize + gap * (total - 1)

  let origin: number
  switch (align) {
    case "start":
      origin = offset
      break
    case "end":
      origin = container - span - offset
      break
    case "center":
      origin = (container - span) / 2
      break
  }

  return Array.from({ length: total }, (_, index) => ({
    start: origin + index * (trackSize + gap),
    size: trackSize,
  }))
}
