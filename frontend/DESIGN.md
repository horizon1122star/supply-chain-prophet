---
name: High-Density Logistics Visual Language
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#c4c6d1'
  on-secondary: '#2d3039'
  secondary-container: '#444650'
  on-secondary-container: '#b3b4c0'
  tertiary: '#c9c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#939090'
  on-tertiary-container: '#2a2929'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e0e2ee'
  secondary-fixed-dim: '#c4c6d1'
  on-secondary-fixed: '#181b24'
  on-secondary-fixed-variant: '#444650'
  tertiary-fixed: '#e6e1e1'
  tertiary-fixed-dim: '#c9c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#484646'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.0'
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  label-xs:
    fontFamily: Hanken Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: '1.0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 16px
  gutter: 12px
  tight: 4px
  base: 8px
  comfortable: 24px
---

## Brand & Style

This design system is engineered for high-velocity logistical environments where data density and rapid scanning are paramount. The aesthetic merges **Corporate Modern** efficiency with **Tactile/Skeuomorphic** lighting cues to create a "Command Center" atmosphere. 

The personality is authoritative, precise, and utilitarian. By using a dark-mode-only foundation, the system reduces eye strain for operators monitoring screens over long shifts. The visual style relies on "illuminated" surfaces—containers that appear slightly recessed or top-lit—to differentiate information layers without the need for excessive whitespace or heavy borders.

## Colors

The palette is strictly dark-mode, centered around a deep charcoal base to maximize the pop of data-driven accents.

- **Base Background (#10131B):** The foundational layer, providing a near-black "void" for the dashboard.
- **Surface Layer (#2B2A2A):** Used for all primary containers, tables, and sidebars. This provides a subtle contrast against the base.
- **Vibrant Blue Accent (#3B82F6):** The primary interactive color. Used sparingly for active states, primary data points, and "moving" logistical elements (like transit routes).
- **Functional Colors:** High-saturation greens, ambers, and reds are used strictly for status indicators (On-time, Delayed, Critical) to ensure they are the first things a user notices.

## Typography

This design system utilizes **Hanken Grotesk** for its exceptional legibility in dense layouts and its modern, geometric profile. 

To handle the complexity of logistics data:
- **Numerical Data:** While the system defaults to Hanken Grotesk, tabular data and tracking numbers may utilize a secondary Monospaced font (JetBrains Mono) for vertical alignment and clarity.
- **Labels:** Small labels use a higher font weight and increased letter spacing to remain legible even at 10px.
- **Hierarchy:** Contrast is achieved through weight and color (e.g., White for values, Slate-400 for labels) rather than significant jumps in size, maintaining high information density.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with a strict 4px baseline rhythm. This ensures that even with hundreds of rows of data, the interface remains structured and balanced.

- **Dashboard Grid:** A 12-column layout for desktop. Widgets and tables should span 3, 4, 6, or 12 columns.
- **Density:** Padding is intentionally tight (8px-12px) within table cells and list items to maximize the number of visible data points without scrolling.
- **Responsiveness:** On tablet/mobile, containers stack vertically. Sidebars collapse into a compact icon-only rail or a bottom-docked navigation bar.

## Elevation & Depth

Depth in this design system is created through light simulation rather than traditional drop shadows.

1.  **The Flashlight Effect:** Every primary container (#2B2A2A) features a subtle linear gradient from the top. The top 20% of the container should have a faint white overlay at 3-5% opacity, simulating a top-down light source.
2.  **Inner Glow:** Use a 1px inner shadow at the top edge (`inset 0 1px 0 rgba(255,255,255,0.1)`) to define the boundary between the container and the dark background.
3.  **Active Elevation:** When a card or row is hovered, increase the opacity of the "flashlight" gradient and add a primary blue 2px left-border accent.
4.  **Basement Layer:** Modals and popovers use the same #2B2A2A surface but add a heavy 24px diffused black shadow to separate them from the dashboard grid.

## Shapes

To maintain a professional and "industrial" feel, the system uses **Soft** (Level 1) roundedness. 

- **Standard Elements:** Buttons, inputs, and cards use a 4px (0.25rem) radius.
- **Status Pills:** Status indicators and tags may use a fully rounded "pill" shape to distinguish them from interactive buttons.
- **Data Points:** Small markers on maps or charts are perfectly circular to denote precision.

## Components

### Buttons & Inputs
- **Primary Button:** Solid #3B82F6 with white text. No gradient, but a subtle 1px top highlight.
- **Secondary/Ghost:** Transparent background with a #2B2A2A border.
- **Inputs:** Background matches the container (#2B2A2A). Focus state is indicated by a 1px #3B82F6 border and a faint blue outer glow.

### Tables (Core Component)
- **Header:** Darker than the row body, using `label-xs` typography for titles.
- **Rows:** Alternating "flashlight" gradients or subtle 1px separators (#FFFFFF at 5% opacity).
- **Cells:** High density. Use color-coded dots (Primary Blue, Success Green) next to text for status.

### Status Indicators & Chips
- Use high-saturation colors against the dark background. 
- Backgrounds for chips should be the status color at 10% opacity with a 100% opacity text color for maximum readability.

### Logistics-Specific Components
- **Timeline/Trace:** A vertical or horizontal line using the primary blue for "completed" segments and a dashed slate line for "planned" segments.
- **Telemetry Cards:** Small, square widgets displaying a single KPI (e.g., "ETA", "Temp") with a large `data-mono` value and a small sparkline at the bottom.