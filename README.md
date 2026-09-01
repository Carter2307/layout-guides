# layout-guide

Draw a grid, columns or rows over any React page and adjust them from a floating
panel — Figma's _Layout guide_, in the browser.

Guides update live, can be hidden or removed one by one, and survive a reload.
The tool is meant for development and disappears from production builds on its
own.

## Install

```sh
pnpm add -D layout-guide
```

`react` and `react-dom` (18 or 19) are peer dependencies.

## Use

Render it once, as high in the tree as you like:

```tsx
import { LayoutGuide } from "layout-guide"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <LayoutGuide />
      </body>
    </html>
  )
}
```

The stylesheet is imported by the entry point, so nothing else is needed. If your
bundler refuses CSS from `node_modules`, import it yourself with
`import "layout-guide/styles.css"`.

Start from a preset instead of an empty panel:

```tsx
<LayoutGuide
  defaultGuides={[
    {
      type: "columns",
      count: 12,
      alignment: "stretch",
      margin: 64,
      gutter: 24,
    },
  ]}
/>
```

Only `type` is required — every other field falls back to that type's default.

## The panel

It sits 24px from the top-right corner of the viewport.

| Action        | How                                             |
| ------------- | ----------------------------------------------- |
| Add a guide   | **+**, then pick Grid, Columns or Rows          |
| Edit a guide  | Click its row                                   |
| Hide / show   | The eye icon — a hidden guide is struck through |
| Remove        | The **−** icon                                  |
| Hide the tool | `⌘⇧G` (`Ctrl⇧G` on Windows and Linux)           |

Number inputs accept typing, arrow keys (×10 with Shift), a horizontal drag on
their label, and the mouse wheel.

## Guides

### Grid

| Field   | Description             | Default        |
| ------- | ----------------------- | -------------- |
| `size`  | Cell size in pixels     | `32`           |
| `color` | Line colour and opacity | `FF0000` @ 10% |

### Columns and rows

Columns and rows are the same computation on a different axis: columns have a
`width`, rows a `height`. Alignment is `left`/`right` for columns, `top`/`bottom`
for rows, plus `center` and `stretch` for both.

| Field              | Description             | Default (columns / rows) |
| ------------------ | ----------------------- | ------------------------ |
| `count`            | Number of tracks        | `12` / `5`               |
| `color`            | Fill colour and opacity | `FF0000` @ 10%           |
| `alignment`        | Where the set sits      | `stretch` / `top`        |
| `width` / `height` | Track size              | `64` / `32`              |
| `margin`           | Space at both ends      | `24`                     |
| `offset`           | Shift of the whole set  | `0`                      |
| `gutter`           | Space between tracks    | `20`                     |

Alignment decides which fields matter, and the editor only shows those:

| Alignment          | Size    | Margin | Offset        | Gutter |
| ------------------ | ------- | ------ | ------------- | ------ |
| `left` / `top`     | ✅      | —      | ✅            | ✅     |
| `right` / `bottom` | ✅      | —      | ✅            | ✅     |
| `center`           | ✅      | —      | derived (`0`) | ✅     |
| `stretch`          | derived | ✅     | —             | ✅     |

With `stretch`, the track size is whatever is left once the margins and gutters
are taken out:
`size = (viewport − 2 × margin − (count − 1) × gutter) / count`.

Hidden fields keep their value, so switching alignment back and forth never
loses what you had typed.

## Props

| Prop            | Type                                                           | Default                                 | Description                                                   |
| --------------- | -------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------- |
| `defaultGuides` | `GuideInput[]`                                                 | `[]`                                    | Guides used when nothing has been persisted yet               |
| `enabled`       | `boolean`                                                      | `process.env.NODE_ENV !== "production"` | Whether the tool renders at all                               |
| `persist`       | `boolean`                                                      | `true`                                  | Save guides to `localStorage`                                 |
| `storageKey`    | `string`                                                       | `"layout-guide"`                        | Storage key                                                   |
| `theme`         | `"inherit" \| "light" \| "dark"`                               | `"inherit"`                             | `inherit` follows the host                                    |
| `position`      | `"top-right" \| "top-left" \| "bottom-right" \| "bottom-left"` | `"top-right"`                           | Panel corner                                                  |
| `offset`        | `number`                                                       | `24`                                    | Distance from the viewport edges, in pixels                   |
| `zIndex`        | `number`                                                       | `2147483000`                            | Stacking order of the whole tool                              |
| `shortcut`      | `string \| false`                                              | `"mod+shift+g"`                         | Shows and hides the tool; `mod` is ⌘ on Apple, Ctrl elsewhere |

Types are exported too: `Guide`, `GuideInput`, `GridGuide`, `ColumnsGuide`,
`RowsGuide`, `ColorValue`, and the alignment unions.

## Theming

- **Colour scheme** — `theme="inherit"` watches `<html>` for a `.dark` / `.light`
  class or a `data-theme` attribute, and falls back to `prefers-color-scheme`.
  Works with `next-themes` out of the box.
- **Font** — `var(--font-sans, "Geist", ui-sans-serif, system-ui, sans-serif)`:
  your font if you define `--font-sans`, Geist if it is installed, then the
  system stack. No font file is bundled.

## Isolation

The package ships Tailwind-generated CSS, which would otherwise collide with a
host that also uses Tailwind. It cannot: preflight is not shipped, every utility
is emitted as `.layout-guide .flex` rather than `.flex`, and design tokens live
on the tool's root instead of `:root`.

## Development

```sh
pnpm dev        # playground on http://localhost:5173
pnpm build      # dist/index.js + dist/index.css + types
pnpm typecheck
```

Consumers in this repository depend on `dist`, so the package is built before the
application runs — `pnpm dev` and `pnpm build` at the root do it for you.
