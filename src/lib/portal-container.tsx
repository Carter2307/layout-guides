import * as React from "react"

const PortalContainerContext =
  React.createContext<React.RefObject<HTMLElement | null> | null>(null)

/**
 * Base UI portals its popups into `<body>` by default, which would place them
 * outside the `.layout-guide` element that carries our design tokens — popovers
 * and menus would render unstyled.
 *
 * The vendored shadcn components therefore read this context and portal into
 * the tool's own root instead.
 */
export function PortalContainerProvider({
  container,
  children,
}: {
  container: React.RefObject<HTMLElement | null>
  children: React.ReactNode
}) {
  return (
    <PortalContainerContext.Provider value={container}>
      {children}
    </PortalContainerContext.Provider>
  )
}

export function usePortalContainer():
  React.RefObject<HTMLElement | null> | undefined {
  return React.useContext(PortalContainerContext) ?? undefined
}
