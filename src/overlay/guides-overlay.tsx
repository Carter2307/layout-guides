import type { Size } from "../hooks/use-viewport-size"
import type { Guide } from "../types"
import { GridOverlay } from "./grid-overlay"
import { TracksOverlay } from "./tracks-overlay"

export function GuidesOverlay({
  guides,
  container,
}: {
  guides: Guide[]
  container: Size
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {guides
        .filter((guide) => guide.visible)
        .map((guide) =>
          guide.type === "grid" ? (
            <GridOverlay key={guide.id} guide={guide} />
          ) : (
            <TracksOverlay key={guide.id} guide={guide} container={container} />
          )
        )}
    </div>
  )
}
