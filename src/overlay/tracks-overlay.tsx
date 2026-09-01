import { toCssColor } from "../core/color"
import { computeTracks, toTrackAlign } from "../core/geometry"
import { trackSizeOf, type TrackGuide } from "../types"
import type { Size } from "../hooks/use-viewport-size"

/**
 * Columns and rows share this component: only the axis changes, so the geometry
 * runs once and the result is mapped onto either the x or the y axis.
 */
export function TracksOverlay({
  guide,
  container,
}: {
  guide: TrackGuide
  container: Size
}) {
  const horizontal = guide.type === "columns"
  const color = toCssColor(guide.color)

  const tracks = computeTracks({
    containerSize: horizontal ? container.width : container.height,
    count: guide.count,
    size: trackSizeOf(guide),
    gutter: guide.gutter,
    margin: guide.margin,
    offset: guide.offset,
    align: toTrackAlign(guide.alignment),
  })

  return (
    <>
      {tracks.map((track, index) => (
        <div
          key={index}
          className="absolute"
          style={
            horizontal
              ? {
                  insetBlock: 0,
                  left: track.start,
                  width: track.size,
                  backgroundColor: color,
                }
              : {
                  insetInline: 0,
                  top: track.start,
                  height: track.size,
                  backgroundColor: color,
                }
          }
        />
      ))}
    </>
  )
}
