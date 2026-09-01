import { RiCloseLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { Guide, GuidePatch, GuideType } from "../types"
import { GuideFields } from "./fields/guide-fields"
import { GUIDE_ICONS, GUIDE_TYPE_OPTIONS } from "./guide-icon"

/**
 * Body of the popover attached to a guide row: the type switcher, then the
 * fields for that type.
 */
export function GuideEditor({
  guide,
  onTypeChange,
  onChange,
  onClose,
}: {
  guide: Guide
  onTypeChange: (type: GuideType) => void
  onChange: (patch: GuidePatch) => void
  onClose: () => void
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1">
        <Select
          value={guide.type}
          items={GUIDE_TYPE_OPTIONS}
          onValueChange={(value) => onTypeChange(value as GuideType)}
        >
          <SelectTrigger
            size="sm"
            aria-label="Guide type"
            className="h-6 min-w-0 flex-1 rounded-md px-2 text-[11px] focus-visible:ring-2 [&_svg:not([class*='size-'])]:size-3.5"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {GUIDE_TYPE_OPTIONS.map((option) => {
              const Icon = GUIDE_ICONS[option.value]
              return (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="gap-2 rounded-lg py-1.5 pl-2.5 text-[11px] [&_svg:not([class*='size-'])]:size-3.5"
                >
                  <Icon className="text-muted-foreground" />
                  {option.label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Close editor"
          onClick={onClose}
          className="rounded-md text-muted-foreground hover:text-foreground"
        >
          <RiCloseLine />
        </Button>
      </div>

      <Separator className="-mx-2.5 w-auto" />

      <GuideFields guide={guide} onChange={onChange} />
    </div>
  )
}
