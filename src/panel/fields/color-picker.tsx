import * as React from "react"

import { cn } from "@/lib/utils"
import { clamp, hexToHsv, hsvToHex, type Hsv } from "../../core/color"
import type { ColorValue } from "../../types"

export const CHECKERBOARD_STYLE: React.CSSProperties = {
  backgroundImage:
    "repeating-conic-gradient(rgb(0 0 0 / 0.22) 0% 25%, transparent 0% 50%)",
  backgroundSize: "8px 8px",
}

/**
 * Drives a pointer drag over an area, normalising the position to `0`–`1`.
 *
 * The element ref is supplied by the caller rather than created here: a ref
 * handed back inside a returned object cannot be told apart from a ref being
 * read during render.
 */
function useAreaDrag(
  ref: React.RefObject<HTMLDivElement | null>,
  onMove: (position: { x: number; y: number }) => void
): (event: React.PointerEvent<HTMLDivElement>) => void {
  const handler = React.useRef(onMove)

  React.useEffect(() => {
    handler.current = onMove
  }, [onMove])

  return React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const element = ref.current
      if (!element || event.button !== 0) return

      const rect = element.getBoundingClientRect()
      const report = (clientX: number, clientY: number) => {
        handler.current({
          x: clamp((clientX - rect.left) / rect.width, 0, 1),
          y: clamp((clientY - rect.top) / rect.height, 0, 1),
        })
      }

      element.setPointerCapture(event.pointerId)
      report(event.clientX, event.clientY)

      const onPointerMove = (moveEvent: PointerEvent) => {
        report(moveEvent.clientX, moveEvent.clientY)
      }
      const onPointerUp = () => {
        element.removeEventListener("pointermove", onPointerMove)
        element.removeEventListener("pointerup", onPointerUp)
        element.removeEventListener("pointercancel", onPointerUp)
      }

      element.addEventListener("pointermove", onPointerMove)
      element.addEventListener("pointerup", onPointerUp)
      element.addEventListener("pointercancel", onPointerUp)
    },
    [ref]
  )
}

function stepFor(event: React.KeyboardEvent): number | null {
  const large = event.shiftKey ? 10 : 1
  if (event.key === "ArrowRight" || event.key === "ArrowUp") return large
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") return -large
  return null
}

/**
 * Saturation/value square, hue slider and alpha slider.
 *
 * Hue is held in local state rather than derived from the hex on every render:
 * a fully black or fully desaturated colour has no recoverable hue, so round
 * tripping through hex would snap the hue slider back to red mid-drag.
 */
export function ColorPicker({
  value,
  onChange,
}: {
  value: ColorValue
  onChange: (value: ColorValue) => void
}) {
  const [hsv, setHsv] = React.useState<Hsv>(() => hexToHsv(value.hex))

  // Adjusting state during render rather than in an effect: the hue only has to
  // catch up when the hex changed somewhere other than this picker.
  const [syncedHex, setSyncedHex] = React.useState(value.hex)
  if (syncedHex !== value.hex) {
    setSyncedHex(value.hex)
    if (hsvToHex(hsv) !== value.hex) setHsv(hexToHsv(value.hex))
  }

  const applyHsv = (partial: Partial<Hsv>) => {
    const next = { ...hsv, ...partial }
    const hex = hsvToHex(next)
    setHsv(next)
    setSyncedHex(hex)
    onChange({ hex, alpha: value.alpha })
  }

  const saturationValueRef = React.useRef<HTMLDivElement>(null)
  const hueRef = React.useRef<HTMLDivElement>(null)
  const alphaRef = React.useRef<HTMLDivElement>(null)

  const onSaturationValuePointerDown = useAreaDrag(
    saturationValueRef,
    ({ x, y }) => applyHsv({ s: x, v: 1 - y })
  )
  const onHuePointerDown = useAreaDrag(hueRef, ({ x }) =>
    applyHsv({ h: x * 360 })
  )
  const onAlphaPointerDown = useAreaDrag(alphaRef, ({ x }) =>
    onChange({ hex: value.hex, alpha: Math.round(x * 100) })
  )

  const solidColor = `#${hsvToHex({ ...hsv, s: 1, v: 1 })}`
  const currentColor = `#${value.hex}`

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={saturationValueRef}
        onPointerDown={onSaturationValuePointerDown}
        onKeyDown={(event) => {
          const step = stepFor(event)
          if (step === null) return
          event.preventDefault()
          const horizontal =
            event.key === "ArrowLeft" || event.key === "ArrowRight"
          applyHsv(
            horizontal
              ? { s: clamp(hsv.s + step / 100, 0, 1) }
              : { v: clamp(hsv.v + step / 100, 0, 1) }
          )
        }}
        role="group"
        aria-label="Saturation and brightness"
        tabIndex={0}
        className="relative h-28 w-full cursor-crosshair touch-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        style={{ backgroundColor: solidColor }}
      >
        <div
          className="absolute inset-0 rounded-md"
          style={{
            backgroundImage: "linear-gradient(to right, #fff, transparent)",
          }}
        />
        <div
          className="absolute inset-0 rounded-md"
          style={{
            backgroundImage: "linear-gradient(to top, #000, transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0_/_0.3)]"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: currentColor,
          }}
        />
      </div>

      <div
        ref={hueRef}
        onPointerDown={onHuePointerDown}
        onKeyDown={(event) => {
          const step = stepFor(event)
          if (step === null) return
          event.preventDefault()
          applyHsv({ h: (((hsv.h + step) % 360) + 360) % 360 })
        }}
        role="slider"
        aria-label="Hue"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hsv.h)}
        tabIndex={0}
        className="relative h-3 w-full cursor-pointer touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        style={{
          backgroundImage:
            "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
        }}
      >
        <Thumb position={hsv.h / 360} color={solidColor} />
      </div>

      <div
        ref={alphaRef}
        onPointerDown={onAlphaPointerDown}
        onKeyDown={(event) => {
          const step = stepFor(event)
          if (step === null) return
          event.preventDefault()
          onChange({ hex: value.hex, alpha: clamp(value.alpha + step, 0, 100) })
        }}
        role="slider"
        aria-label="Opacity"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value.alpha)}
        tabIndex={0}
        className="relative h-3 w-full cursor-pointer touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        style={CHECKERBOARD_STYLE}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${currentColor})`,
          }}
        />
        <Thumb position={value.alpha / 100} color={currentColor} />
      </div>
    </div>
  )
}

function Thumb({ position, color }: { position: number; color: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0_/_0.3)]"
      )}
      style={{ left: `${position * 100}%`, backgroundColor: color }}
    />
  )
}
