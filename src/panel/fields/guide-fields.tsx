import * as React from "react"

import {
  NumberField,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "@/components/ui/number-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  COLUMNS_ALIGNMENTS,
  ROWS_ALIGNMENTS,
  trackFieldRules,
  type FieldRule,
} from "../../core/field-rules"
import {
  isTrackGuide,
  trackSizeLabel,
  trackSizeOf,
  type ColumnsGuide,
  type Guide,
  type GuidePatch,
  type RowsGuide,
  type TrackAlignment,
} from "../../types"
import { ColorField } from "./color-field"

const ROW_CLASS = "grid grid-cols-[62px_1fr] items-center gap-2"
const LABEL_CLASS = "text-[11px] text-muted-foreground"

function FieldRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className={ROW_CLASS}>
      <span className={LABEL_CLASS}>{label}</span>
      {children}
    </div>
  )
}

/**
 * A `disabled` field shows its implied value as a placeholder rather than as a
 * greyed out value: that is what Figma does for `Center`'s offset, and it makes
 * clear the number is derived rather than merely locked.
 */
function NumberRow({
  label,
  value,
  onChange,
  rule = "editable",
  min,
  max,
  disabledPlaceholder = "0",
}: {
  label: string
  value: number
  onChange: (value: number) => void
  rule?: FieldRule
  /** Omitted for fields that accept negative values, such as `Offset`. */
  min?: number
  max?: number
  disabledPlaceholder?: string
}) {
  const id = React.useId()

  if (rule === "hidden") return null

  const disabled = rule === "disabled"

  return (
    <NumberField
      id={id}
      value={disabled ? null : value}
      min={min}
      max={max}
      disabled={disabled}
      onValueChange={(next) => onChange(next ?? min ?? 0)}
      className={ROW_CLASS}
    >
      <NumberFieldScrubArea>
        <label htmlFor={id} className={`${LABEL_CLASS} cursor-ew-resize`}>
          {label}
        </label>
      </NumberFieldScrubArea>
      <NumberFieldInput
        placeholder={disabled ? disabledPlaceholder : undefined}
      />
    </NumberField>
  )
}

function AlignmentRow({
  guide,
  onChange,
}: {
  guide: ColumnsGuide | RowsGuide
  onChange: (alignment: TrackAlignment) => void
}) {
  const options =
    guide.type === "columns" ? COLUMNS_ALIGNMENTS : ROWS_ALIGNMENTS

  return (
    <FieldRow label="Type">
      <Select
        value={guide.alignment}
        items={options}
        onValueChange={(value) => onChange(value as TrackAlignment)}
      >
        <SelectTrigger
          size="sm"
          aria-label="Alignment"
          className="h-6 w-full rounded-md px-2 text-[11px] focus-visible:ring-2 [&_svg:not([class*='size-'])]:size-3.5"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-lg py-1.5 pl-2.5 text-[11px] [&_svg:not([class*='size-'])]:size-3.5"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldRow>
  )
}

/** The body of the editor: the fields that belong to the given guide. */
export function GuideFields({
  guide,
  onChange,
}: {
  guide: Guide
  onChange: (patch: GuidePatch) => void
}) {
  const color = (
    <FieldRow label="Color">
      <ColorField
        value={guide.color}
        onChange={(value) => onChange({ color: value })}
      />
    </FieldRow>
  )

  if (!isTrackGuide(guide)) {
    return (
      <div className="flex flex-col gap-1.5">
        <NumberRow
          label="Size"
          value={guide.size}
          min={1}
          onChange={(size) => onChange({ size })}
        />
        {color}
      </div>
    )
  }

  const rules = trackFieldRules(guide.alignment)
  const sizeKey = guide.type === "columns" ? "width" : "height"

  return (
    <div className="flex flex-col gap-1.5">
      <NumberRow
        label="Count"
        value={guide.count}
        min={1}
        onChange={(count) => onChange({ count })}
      />
      {color}
      <AlignmentRow
        guide={guide}
        onChange={(alignment) => onChange({ alignment })}
      />
      <NumberRow
        label={trackSizeLabel(guide)}
        value={trackSizeOf(guide)}
        rule={rules.size}
        min={0}
        onChange={(size) => onChange({ [sizeKey]: size })}
      />
      <NumberRow
        label="Margin"
        value={guide.margin}
        rule={rules.margin}
        min={0}
        onChange={(margin) => onChange({ margin })}
      />
      <NumberRow
        label="Offset"
        value={guide.offset}
        rule={rules.offset}
        onChange={(offset) => onChange({ offset })}
      />
      <NumberRow
        label="Gutter"
        value={guide.gutter}
        rule={rules.gutter}
        min={0}
        onChange={(gutter) => onChange({ gutter })}
      />
    </div>
  )
}
