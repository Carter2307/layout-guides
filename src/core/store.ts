import * as React from "react"

import type { Guide, GuideInput, GuidePatch, GuideType } from "../types"
import { convertGuide, createGuide, sanitizeGuides } from "./defaults"

export interface UseGuidesOptions {
  defaultGuides?: GuideInput[]
  persist: boolean
  storageKey: string
}

export interface GuidesApi {
  guides: Guide[]
  addGuide: (type: GuideType) => string
  removeGuide: (id: string) => void
  toggleGuideVisibility: (id: string) => void
  setGuideType: (id: string, type: GuideType) => void
  updateGuide: (id: string, patch: GuidePatch) => void
}

/** Reads persisted guides, treating any unusable payload as "nothing stored". */
function readStoredGuides(storageKey: string): Guide[] | null {
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw === null ? null : sanitizeGuides(JSON.parse(raw))
  } catch {
    // A corrupt or unreadable payload must never break the host page.
    return null
  }
}

export function useGuides({
  defaultGuides,
  persist,
  storageKey,
}: UseGuidesOptions): GuidesApi {
  /**
   * Storage is read synchronously in the initialiser rather than in an effect.
   * That is safe because this hook only ever runs on the client: the root
   * renders nothing until the tool has mounted, so there is no server pass to
   * diverge from and no hydration flash to guard against.
   */
  const [guides, setGuides] = React.useState<Guide[]>(
    () =>
      (persist ? readStoredGuides(storageKey) : null) ??
      sanitizeGuides(defaultGuides)
  )

  React.useEffect(() => {
    if (!persist) return

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(guides))
    } catch {
      // Private mode or a full quota: running without persistence is fine.
    }
  }, [guides, persist, storageKey])

  const addGuide = React.useCallback((type: GuideType) => {
    const guide = createGuide(type)
    setGuides((current) => [...current, guide])
    return guide.id
  }, [])

  const removeGuide = React.useCallback((id: string) => {
    setGuides((current) => current.filter((guide) => guide.id !== id))
  }, [])

  const toggleGuideVisibility = React.useCallback((id: string) => {
    setGuides((current) =>
      current.map((guide) =>
        guide.id === id ? { ...guide, visible: !guide.visible } : guide
      )
    )
  }, [])

  const setGuideType = React.useCallback((id: string, type: GuideType) => {
    setGuides((current) =>
      current.map((guide) =>
        guide.id === id ? convertGuide(guide, type) : guide
      )
    )
  }, [])

  const updateGuide = React.useCallback((id: string, patch: GuidePatch) => {
    setGuides((current) =>
      current.map((guide) =>
        // The cast is safe because the editor only ever emits keys that belong
        // to the guide it is editing; the union cannot express that on its own.
        guide.id === id ? ({ ...guide, ...patch } as Guide) : guide
      )
    )
  }, [])

  return {
    guides,
    addGuide,
    removeGuide,
    toggleGuideVisibility,
    setGuideType,
    updateGuide,
  }
}
