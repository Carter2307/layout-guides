import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"

import { cn } from "@/lib/utils"

/**
 * Dense numeric input in the Luma language.
 *
 * Not available in the `base-luma` registry, so it is built directly on the
 * Base UI primitive: that brings wheel scrubbing, arrow-key stepping (×10 with
 * Shift) and label dragging without hand-rolling any of it.
 */
function NumberField({ className, ...props }: NumberFieldPrimitive.Root.Props) {
  return (
    <NumberFieldPrimitive.Root
      data-slot="number-field"
      allowWheelScrub
      className={cn("min-w-0", className)}
      {...props}
    />
  )
}

function NumberFieldScrubArea({
  className,
  children,
  ...props
}: NumberFieldPrimitive.ScrubArea.Props) {
  return (
    <NumberFieldPrimitive.ScrubArea
      data-slot="number-field-scrub-area"
      direction="horizontal"
      className={cn("cursor-ew-resize select-none", className)}
      {...props}
    >
      <NumberFieldPrimitive.ScrubAreaCursor>
        <svg
          width="26"
          height="14"
          viewBox="0 0 24 14"
          fill="none"
          className="drop-shadow-[0_1px_1px_rgb(0_0_0_/_0.4)]"
        >
          <path
            d="M19.5 5.5 23 7l-3.5 1.5V5.5ZM4.5 5.5 1 7l3.5 1.5V5.5ZM4 7h16"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="white"
          />
        </svg>
      </NumberFieldPrimitive.ScrubAreaCursor>
      {children}
    </NumberFieldPrimitive.ScrubArea>
  )
}

function NumberFieldInput({
  className,
  ...props
}: NumberFieldPrimitive.Input.Props) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      className={cn(
        "h-6 w-full min-w-0 rounded-md border border-transparent bg-input/50 px-2 text-[11px] tabular-nums transition-[color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

export { NumberField, NumberFieldInput, NumberFieldScrubArea }
