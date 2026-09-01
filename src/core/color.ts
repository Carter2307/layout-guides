import type { ColorValue } from "../types"

export interface Rgb {
  r: number
  g: number
  b: number
}

export interface Hsv {
  /** Hue in degrees, `0`–`360`. */
  h: number
  /** Saturation, `0`–`1`. */
  s: number
  /** Value, `0`–`1`. */
  v: number
}

const HEX_PATTERN = /^[0-9a-f]{3}$|^[0-9a-f]{6}$/i

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Accepts `#abc`, `abc`, `#aabbcc` or `aabbcc` and returns a six digit
 * uppercase hex. Returns `null` when the input cannot be understood, so callers
 * can keep showing what the user typed instead of fighting their cursor.
 */
export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, "")
  if (!HEX_PATTERN.test(raw)) return null

  const expanded =
    raw.length === 3
      ? raw
          .split("")
          .map((char) => char + char)
          .join("")
      : raw

  return expanded.toUpperCase()
}

export function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex) ?? "000000"
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return [r, g, b]
    .map((channel) =>
      Math.round(clamp(channel, 0, 255))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")
    .toUpperCase()
}

export function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const red = r / 255
  const green = g / 255
  const blue = b / 255

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min

  let hue = 0
  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6
    else if (max === green) hue = (blue - red) / delta + 2
    else hue = (red - green) / delta + 4
  }

  hue = Math.round(hue * 60)
  if (hue < 0) hue += 360

  return { h: hue, s: max === 0 ? 0 : delta / max, v: max }
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const hue = ((h % 360) + 360) % 360
  const chroma = v * s
  const secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const match = v - chroma

  let rgb: [number, number, number]
  if (hue < 60) rgb = [chroma, secondary, 0]
  else if (hue < 120) rgb = [secondary, chroma, 0]
  else if (hue < 180) rgb = [0, chroma, secondary]
  else if (hue < 240) rgb = [0, secondary, chroma]
  else if (hue < 300) rgb = [secondary, 0, chroma]
  else rgb = [chroma, 0, secondary]

  return {
    r: Math.round((rgb[0] + match) * 255),
    g: Math.round((rgb[1] + match) * 255),
    b: Math.round((rgb[2] + match) * 255),
  }
}

export function hexToHsv(hex: string): Hsv {
  return rgbToHsv(hexToRgb(hex))
}

export function hsvToHex(hsv: Hsv): string {
  return rgbToHex(hsvToRgb(hsv))
}

/** `rgb(r g b / a%)` — the form used to paint guides. */
export function toCssColor({ hex, alpha }: ColorValue): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgb(${r} ${g} ${b} / ${clamp(alpha, 0, 100)}%)`
}

/** Fully opaque swatch colour, so the picker preview ignores the alpha. */
export function toOpaqueCssColor(hex: string): string {
  return `#${normalizeHex(hex) ?? "000000"}`
}
