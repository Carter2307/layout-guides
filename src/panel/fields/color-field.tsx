import * as React from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { NumberField, NumberFieldInput } from "@/components/ui/number-field"
import { clamp, normalizeHex, toCssColor } from "../../core/color"
import type { ColorValue } from "../../types"
import { CHECKERBOARD_STYLE, ColorPicker } from "./color-picker"

/**
 * The `[swatch] [hex] [alpha %]` control.
 *
 * The hex sub-field keeps a local draft so a partially typed value is never
 * rewritten under the caret; it is normalised on blur or `Enter` and reverts
 * when it cannot be parsed.
 */
export function ColorField({
  value,
  onChange,
}: {
  value: ColorValue
  onChange: (value: ColorValue) => void
}) {
  const [draft, setDraft] = React.useState(value.hex)

  // Adjusting state during render: the draft only follows the value when the
  // value changed elsewhere, so typing is never interrupted.
  const [syncedHex, setSyncedHex] = React.useState(value.hex)
  if (syncedHex !== value.hex) {
    setSyncedHex(value.hex)
    setDraft(value.hex)
  }

  const commitDraft = () => {
    const normalized = normalizeHex(draft)
    if (normalized) onChange({ ...value, hex: normalized })
    else setDraft(value.hex)
  }

  return (
    <div className="flex h-6 items-center gap-1 rounded-md bg-input/50 pl-1 focus-within:bg-transparent">
      <Popover>
        <PopoverTrigger
          aria-label="Pick a color"
          className="relative size-4 shrink-0 overflow-hidden rounded-[4px] ring-1 ring-foreground/15 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={CHECKERBOARD_STYLE}
        >
          <span
            className="absolute inset-0"
            style={{ backgroundColor: toCssColor(value) }}
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="left"
          sideOffset={12}
          className="w-56 gap-3 rounded-xl p-3"
        >
          <ColorPicker value={value} onChange={onChange} />
        </PopoverContent>
      </Popover>

      <input
        value={draft}
        aria-label="Hex color"
        spellCheck={false}
        autoComplete="off"
        maxLength={7}
        onChange={(event) => setDraft(event.target.value.replace(/^#/, ""))}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            commitDraft()
          }
          if (event.key === "Escape") setDraft(value.hex)
        }}
        className="h-6 w-full min-w-0 bg-transparent text-[11px] uppercase outline-none"
      />

      <NumberField
        value={value.alpha}
        min={0}
        max={100}
        onValueChange={(next) =>
          onChange({ ...value, alpha: clamp(next ?? 0, 0, 100) })
        }
        className="shrink-0"
      >
        <NumberFieldInput
          aria-label="Opacity"
          className="w-11 rounded-none border-l border-border/60 bg-transparent px-1.5 text-right focus-visible:border-l-ring"
        />
      </NumberField>
    </div>
  )
}
