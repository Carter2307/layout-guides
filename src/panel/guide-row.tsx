import * as React from "react"

import { RiEyeLine, RiEyeOffLine, RiSubtractLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { guideLabel } from "../core/labels"
import type { Guide, GuidePatch, GuideType } from "../types"
import { GuideEditor } from "./guide-editor"
import { GUIDE_ICONS } from "./guide-icon"

/**
 * `[type icon] [summary] [visibility] [remove]`.
 *
 * The icon and the summary are a single trigger rather than two: they open the
 * same editor, and one trigger keeps the popover anchoring and the keyboard
 * order simple. The icon picks up the open state through `data-popup-open`.
 */
export function GuideRow({
  guide,
  onChange,
  onTypeChange,
  onToggleVisibility,
  onRemove,
}: {
  guide: Guide
  onChange: (patch: GuidePatch) => void
  onTypeChange: (type: GuideType) => void
  onToggleVisibility: () => void
  onRemove: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const Icon = GUIDE_ICONS[guide.type]
  const label = guideLabel(guide)

  return (
    <div className="flex items-center gap-0.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="group/row flex h-6 min-w-0 flex-1 items-center gap-1 rounded-md pr-1.5 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 data-[popup-open]:bg-muted"
          aria-label={`Edit ${label}`}
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground group-data-[popup-open]/row:text-primary">
            <Icon className="size-3.5" />
          </span>
          <span
            className={cn(
              "truncate text-[11px]",
              !guide.visible && "text-muted-foreground line-through"
            )}
          >
            {label}
          </span>
        </PopoverTrigger>
        <PopoverContent
          side="left"
          align="start"
          alignOffset={-8}
          sideOffset={12}
          className="w-56 gap-0 rounded-xl p-2.5"
        >
          <GuideEditor
            guide={guide}
            onChange={onChange}
            onTypeChange={onTypeChange}
            onClose={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={guide.visible ? `Hide ${label}` : `Show ${label}`}
        aria-pressed={!guide.visible}
        onClick={onToggleVisibility}
        className="rounded-md text-muted-foreground hover:text-foreground"
      >
        {guide.visible ? <RiEyeLine /> : <RiEyeOffLine />}
      </Button>

      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        className="rounded-md text-muted-foreground hover:text-foreground"
      >
        <RiSubtractLine />
      </Button>
    </div>
  )
}
