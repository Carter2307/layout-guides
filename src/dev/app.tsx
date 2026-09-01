import * as React from "react"

import { LayoutGuide, type GuideInput } from "../index"

function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = React.useState(false)

  React.useEffect(() => {
    // Both classes are set, the way `next-themes` does: it lets the tool read
    // an explicit preference instead of falling back to the OS setting.
    document.documentElement.classList.toggle("dark", dark)
    document.documentElement.classList.toggle("light", !dark)
  }, [dark])

  return [dark, () => setDark((current) => !current)]
}

const DEFAULT_GUIDES: GuideInput[] = [
  { type: "columns", count: 12, alignment: "stretch", margin: 64, gutter: 24 },
  {
    type: "rows",
    count: 8,
    alignment: "top",
    height: 48,
    offset: 0,
    gutter: 16,
    visible: false,
  },
  { type: "grid", size: 32, visible: false },
]

const SECTIONS = [
  {
    title: "Baseline",
    body: "Guides are painted under the panel and above the page, so alignment can be checked against real content rather than a screenshot.",
  },
  {
    title: "Columns",
    body: "Left, right and center keep an explicit width; stretch derives it from the margins so the set always fills the viewport.",
  },
  {
    title: "Rows",
    body: "The same computation on the vertical axis: top, bottom, center and stretch, with height instead of width.",
  },
]

export function App() {
  const [dark, toggleDark] = useDarkMode()

  return (
    <div className="min-h-dvh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-8 py-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Layout guide
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Playground — press{" "}
            <kbd className="rounded border border-zinc-300 px-1 py-0.5 text-[11px] dark:border-zinc-700">
              ⌘⇧G
            </kbd>{" "}
            to toggle the tool.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleDark}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {dark ? "Light" : "Dark"}
        </button>
      </header>

      <main className="mx-auto max-w-3xl space-y-10 px-8 pb-32">
        {SECTIONS.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-lg font-medium">{section.title}</h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {section.body}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-24 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      <LayoutGuide defaultGuides={DEFAULT_GUIDES} />
    </div>
  )
}
