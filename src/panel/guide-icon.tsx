import {
  RiGridLine,
  RiLayoutColumnLine,
  RiLayoutRowLine,
} from "@remixicon/react"

import type { GuideType } from "../types"

export type GuideIcon = React.ComponentType<{ className?: string }>

export const GUIDE_ICONS: Record<GuideType, GuideIcon> = {
  grid: RiGridLine,
  columns: RiLayoutColumnLine,
  rows: RiLayoutRowLine,
}

export const GUIDE_TYPE_OPTIONS = [
  { value: "grid", label: "Grid" },
  { value: "columns", label: "Columns" },
  { value: "rows", label: "Rows" },
] as const satisfies ReadonlyArray<{ value: GuideType; label: string }>
