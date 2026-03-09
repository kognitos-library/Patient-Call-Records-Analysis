# Design System — Patient Call Records Analysis

## Component Library

**Lattice UI** (`@kognitos/lattice` v1.18.0) installed from local tarball.

## Tokens

- Colors: Lattice semantic tokens (`bg-primary`, `text-muted-foreground`, `bg-success`, etc.)
- Chart colors: `var(--chart-1)` through `var(--chart-10)`
- Typography: Lattice `Title` (h1–h4) and `Text` (xSmall/small/base/large)
- Icons: Lattice `Icon` component (re-exported Lucide icons)

## Layout

- `SidebarProvider open={true}` — always-open sidebar, no toggle
- `ThemeProvider defaultTheme="light"` — no `enableSystem`
- Page content in `SidebarInset` > `div.flex-1.overflow-auto`
- Each page manages its own padding and title

## Component Mapping

- Metric cards: `InsightsCard`
- Status badges: `Badge` with `variant` (success, warning, destructive, secondary)
- Data tables: `Table` (simple HTML tables)
- Charts: `ChartContainer` + `ChartTooltip` wrapping Recharts v3
- Sidebar: `Sidebar` + `SidebarMenu` + `SidebarMenuItem` + `SidebarMenuButton`
- Loading: `Skeleton`
- Errors: `Alert` + `AlertTitle` + `AlertDescription`
- Markdown rendering: Lattice `Markdown` with `textProps`

## Dark Mode

- `ModeToggle` in sidebar footer
- Chat bubbles use explicit `text-primary-foreground` on `Text` components
- Chat markdown sized via `.chat-markdown` CSS overrides

## No Overrides

Using Lattice UI as-is with default tokens. No custom theme overrides.
