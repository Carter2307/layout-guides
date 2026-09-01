"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "./lib/utils"
import { PortalContainerProvider } from "./lib/portal-container"
import { useGuides } from "./core/store"
import { useResolvedTheme, type ThemePreference } from "./hooks/use-host-theme"
import { useShortcut } from "./hooks/use-shortcut"
import { useViewportSize } from "./hooks/use-viewport-size"
import { GuidesOverlay } from "./overlay/guides-overlay"
import { Panel } from "./panel/panel"
import type { GuideInput, PanelPosition } from "./types"

export interface LayoutGuideProps {
  /** Guides to start from when nothing has been persisted yet. */
  defaultGuides?: GuideInput[]
  /**
   * Whether the tool renders at all.
   *
   * Defaults to `process.env.NODE_ENV !== "production"`, so the tool disappears
   * from production builds without any change at the call site.
   */
  enabled?: boolean
  /** Persist guides to `localStorage`. @default true */
  persist?: boolean
  /** @default "layout-guide" */
  storageKey?: string
  /** @default "inherit" — follows the host's `.dark` class or `data-theme`. */
  theme?: ThemePreference
  /** @default "top-right" */
  position?: PanelPosition
  /** Distance from the viewport edges, in pixels. @default 24 */
  offset?: number
  /** @default 2147483000 */
  zIndex?: number
  /** Toggles the whole tool. Pass `false` to disable. @default "mod+shift+g" */
  shortcut?: string | false
}

const DEFAULT_Z_INDEX = 2147483000

/** Never fires: "has this mounted on the client" is not a changing value. */
const subscribeToNothing = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function LayoutGuide({
  enabled = process.env.NODE_ENV !== "production",
  ...props
}: LayoutGuideProps) {
  /**
   * `localStorage` and the viewport size are unavailable while rendering on the
   * server, so nothing is rendered until after mount. Going through
   * `useSyncExternalStore` rather than an effect means React knows the server
   * and client snapshots differ and schedules the switch itself, instead of a
   * `setState` that cascades an extra render.
   */
  const mounted = React.useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot
  )

  if (!enabled || !mounted) return null

  // Split in two so none of the hooks below run — no observers, no storage
  // access — when the tool is disabled.
  return <LayoutGuideRoot {...props} />
}

function LayoutGuideRoot({
  defaultGuides,
  persist = true,
  storageKey = "layout-guide",
  theme = "inherit",
  position = "top-right",
  offset = 24,
  zIndex = DEFAULT_Z_INDEX,
  shortcut = "mod+shift+g",
}: Omit<LayoutGuideProps, "enabled">) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(true)

  const api = useGuides({ defaultGuides, persist, storageKey })
  const resolvedTheme = useResolvedTheme(theme)
  const viewport = useViewportSize()

  useShortcut(shortcut, () => setOpen((current) => !current))

  if (!open) return null

  return createPortal(
    <div
      ref={containerRef}
      data-layout-guide-root=""
      // `globals.css` gives this element its box: it is the tool's single
      // stacking context and lets clicks through to the host page. Utility
      // classes would not apply here — they are nested under `.layout-guide`.
      className={cn("layout-guide", resolvedTheme)}
      style={{ zIndex, colorScheme: resolvedTheme }}
    >
      <PortalContainerProvider container={containerRef}>
        <GuidesOverlay guides={api.guides} container={viewport} />
        <Panel api={api} position={position} offset={offset} />
      </PortalContainerProvider>
    </div>,
    document.body
  )
}
