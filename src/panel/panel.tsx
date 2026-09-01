import type { GuidesApi } from "../core/store"
import type { PanelPosition } from "../types"
import { GuideRow } from "./guide-row"
import { PanelHeader } from "./panel-header"

function positionStyle(
  position: PanelPosition,
  offset: number
): React.CSSProperties {
  const [vertical, horizontal] = position.split("-")
  return {
    top: vertical === "top" ? offset : undefined,
    bottom: vertical === "bottom" ? offset : undefined,
    left: horizontal === "left" ? offset : undefined,
    right: horizontal === "right" ? offset : undefined,
  }
}

export function Panel({
  api,
  position,
  offset,
}: {
  api: GuidesApi
  position: PanelPosition
  offset: number
}) {
  return (
    <div
      className="absolute z-10 flex w-62 flex-col gap-1 rounded-xl bg-popover p-2 text-popover-foreground shadow-lg ring-1 ring-foreground/10 dark:ring-foreground/15"
      style={positionStyle(position, offset)}
    >
      <PanelHeader onAdd={api.addGuide} />

      {api.guides.length === 0 ? (
        <p className="px-1.5 pb-1 text-[11px] text-muted-foreground">
          No guides yet — add one with the + button.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {api.guides.map((guide) => (
            <GuideRow
              key={guide.id}
              guide={guide}
              onChange={(patch) => api.updateGuide(guide.id, patch)}
              onTypeChange={(type) => api.setGuideType(guide.id, type)}
              onToggleVisibility={() => api.toggleGuideVisibility(guide.id)}
              onRemove={() => api.removeGuide(guide.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
