import { RiAddLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { GuideType } from "../types"
import { GUIDE_ICONS, GUIDE_TYPE_OPTIONS } from "./guide-icon"

export function PanelHeader({ onAdd }: { onAdd: (type: GuideType) => void }) {
  return (
    <div className="flex h-6 items-center justify-between gap-2 pl-1.5">
      <span className="text-[11px] font-medium">Layout guide</span>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Add a guide"
              className="rounded-md text-muted-foreground hover:text-foreground"
            />
          }
        >
          <RiAddLine />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-36 rounded-xl p-1">
          {GUIDE_TYPE_OPTIONS.map((option) => {
            const Icon = GUIDE_ICONS[option.value]
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onAdd(option.value)}
                className="gap-2 rounded-lg px-2 py-1.5 text-[11px] [&_svg:not([class*='size-'])]:size-3.5"
              >
                <Icon className="text-muted-foreground" />
                {option.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
