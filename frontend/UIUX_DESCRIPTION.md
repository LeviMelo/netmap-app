# Concept Map Builder UI/UX & Visual Design Guidelines

A comprehensive “frontend bible” that defines every visual, interactive, and architectural aspect of the Concept Map Builder application. This document covers:

1. **Overarching Visual Language & Design Principles**
2. **Color Palette & Theming (Light & Dark Modes)**
3. **Typography, Spacing & Layout Grids**
4. **Navigation Structure & Component Anatomy**
5. **UI Component Styles (Cards, Buttons, Forms, Tabs, Panels, etc.)**
6. **Interactions, Animations & Motion Principles**
7. **Mode-Based Behavior & Input Gestures**
8. **User Flows in Detail**
9. **Accessibility & Responsive Design Considerations**

Each section details guidelines that ensure a modern, polished, and consistent experience for college-age students—the primary audience. The app leans heavily on **dark blue** and **orange/gold** accents with glassmorphic overlays, glows, and shadows; it must feel dynamic and alive while remaining coherent and easy to navigate.

---

## 1. Overarching Visual Language & Design Principles

### 1.1 Design Philosophy

1. **Modern & Energetic**

   * Target users are college students accustomed to sleek, interactive web experiences.
   * Interfaces should feel “alive” through subtle animations (hover glows, soft shadows, fluid transitions) without overwhelming.

2. **Glassmorphism + Depth**

   * Employ layered transparencies and background blurs for navigational bars and panels, creating depth.
   * Background blur combined with colored glass “panes” distinguishes navigation layers while allowing underlying context to remain visible.

3. **Consistency & Scalability**

   * All components share a unified design language: consistent border radii, shadow styles, animation timing, and color usage.
   * Define reusable tokens for colors, spacing, typography, and z-index to ensure cross-component consistency.

4. **Mobile-First & Responsive**

   * Design for small screen priorities: simple layouts, larger touch targets, clear feedback.
   * Components adapt fluidly to various breakpoints; major UI elements may collapse or shift based on screen width.

5. **Contextual UI**

   * Only show controls relevant to the current user activity.
   * Primary navigation (sidebar or topbar) is fully visible; contextual subnavigation is semi-transparent; utility panels are more transparent.
   * Each new level of UI hierarchy “floats” above the previous, aided by increasing glass transparency.

6. **Accessible & Inclusive**

   * All text and controls meet WCAG AA contrast.
   * Keyboard navigation is seamless (e.g., focus outlines, logical tab order).
   * ARIA roles and labels ensure compatibility with screen readers.

---

## 2. Color Palette & Theming

The app supports **Light** and **Dark** modes. Colors are drawn from a core palette of **Dark Blue**, **Orange/Gold**, neutrals (grays, whites, blacks), and accent hues.

### 2.1 Primary Brand Colors

| Role                  | Light Mode Hex | Dark Mode Hex | Usage                                                 |
| --------------------- | -------------- | ------------- | ----------------------------------------------------- |
| Dark Blue (Primary)   | `#0d1f3c`      | `#04102a`     | Primary buttons, active icons, links, highlights      |
| Orange/Gold (Accent)  | `#f59e0b`      | `#d97706`     | Call-to-action buttons, hover glows, alert indicators |
| Soft Cyan (Secondary) | `#06b6d4`      | `#0e4f56`     | Secondary actions, toggle switches                    |
| Warm Pink (Accent 2)  | `#ec4899`      | `#be185d`     | Error/red highlights, selection indicators            |

### 2.2 Neutral & Semantic Colors

| Role               | Light Mode            | Dark Mode             | Usage                          |
| ------------------ | --------------------- | --------------------- | ------------------------------ |
| Background         | `#f8fafc` (slate-50)  | `#1e293b` (slate-800) | App canvas background          |
| Surface / Cards    | `#ffffff` (white)     | `#2e3a51` (slate-700) | Card backgrounds, panels       |
| Text Primary       | `#1e293b` (slate-800) | `#f1f5f9` (slate-100) | Main body text                 |
| Text Secondary     | `#475569` (slate-600) | `#cbd5e1` (slate-300) | Subdued text (hints, metadata) |
| Text Tertiary      | `#64748b` (slate-500) | `#94a3b8` (slate-400) | Footnotes, disabled text       |
| Border / Divider   | `#e2e8f0` (slate-200) | `#475569` (slate-600) | Separator lines, borders       |
| Overlay / Backdrop | `rgba(0,0,0,0.25)`    | `rgba(0,0,0,0.5)`     | Modal/backdrop shading         |

### 2.3 Glassmorphism Layers

Define three levels of glass transparency (light and dark variants):

1. **Layer 1 (Opaque)**

   * Light: `rgba(255, 255, 255, 1)`
   * Dark:  `rgba(30, 41, 59, 1)`
   * Usage: Sidebar, primary topbar backgrounds.

2. **Layer 2 (Semi-Transparent)**

   * Light: `rgba(255, 255, 255, 0.8)` with `backdrop-blur: 16px`
   * Dark:  `rgba(30, 41, 59, 0.8)` with `backdrop-blur: 16px`
   * Usage: Contextual topbar, modals, dropdowns.

3. **Layer 3 (Highly Transparent)**

   * Light: `rgba(255, 255, 255, 0.6)` with `backdrop-blur: 8px`
   * Dark:  `rgba(30, 41, 59, 0.6)` with `backdrop-blur: 8px`
   * Usage: Utility side/bottom panels, floating toolbars, tooltips.

---

## 3. Typography, Spacing & Layout Grids

### 3.1 Typography System

Use a **system font stack** for responsiveness and performance:

* **Primary Sans-Serif**:

  ```
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  ```

* **Monospace** (for code/text areas):

  ```
  font-family: "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace;
  ```

**Font Sizes & Weights:**

| Role         | Size (rem) | Weight         | Usage                      |
| ------------ | ---------- | -------------- | -------------------------- |
| Display / H1 | 2.25 rem   | 700 (bold)     | Page titles, major headers |
| H2           | 1.875 rem  | 600 (semibold) | Section headings           |
| H3           | 1.5 rem    | 600            | Subsection headings        |
| Body Large   | 1.125 rem  | 400 (normal)   | Main text, form labels     |
| Body Regular | 1.0 rem    | 400            | Standard paragraphs        |
| Small / Fine | 0.875 rem  | 400            | Secondary text, captions   |

* **Line Heights**:

  * Headings: 1.2
  * Body: 1.5

### 3.2 Spacing & Sizing Scale

Use a consistent 4-point scale: multiples of 4 px (0.25 rem), 8 px (0.5 rem), 16 px (1 rem), 24 px (1.5 rem), 32 px (2 rem), etc.

| Token      | rem  | px | Typical Usage            |
| ---------- | ---- | -- | ------------------------ |
| `space-1`  | 0.25 | 4  | Tiny gap (between icons) |
| `space-2`  | 0.5  | 8  | Small padding            |
| `space-4`  | 1.0  | 16 | Standard padding/margin  |
| `space-6`  | 1.5  | 24 | Larger separation        |
| `space-8`  | 2.0  | 32 | Section padding          |
| `space-12` | 3.0  | 48 | Large containers         |

### 3.3 Layout Grid System

1. **Desktop & Tablet (≥ 768 px)**

   * Use a **12-column** fluid grid with 16 px gutters.
   * Sidebar “occupies” 3–4 columns (fixed 250 px wide), content spans remaining.

2. **Mobile (< 768 px)**

   * Collapse to a **single-column** layout.
   * Sidebar hidden under hamburger; utility panel bottom-docked.

3. **Canvas Area**

   * Should fill remaining viewport after navbars; flexible width/height to maintain full graph visibility.

4. **Component Alignment**

   * Snap to grid or use Auto Layout principles: containers “hug” their content and expand based on min/max constraints in Tailwind.

---

## 4. Navigation Structure & Component Anatomy

### 4.1 Primary Navigation (Sidebar or Topbar)

1. **Desktop (Sidebar)**:

   * Position: Left side, full height.
   * Width: 250 px (Level 1 opaque glass).
   * Content:

     * App logo at top (icon only).
     * Vertical list of **primary tabs**:

       1. **Home / Load** (icon + label)
       2. **Edit** (icon + label)
       3. **Layout** (icon + label)
       4. **Analyze** (icon + label)
       5. **Export** (icon + label)
       6. **Settings** (icon + label)
     * Use active highlight style: background fill in primary color (dark blue/orange) plus slight glow shadow when selected.

2. **Mobile (Topbar)**:

   * Collapse Sidebar into a hamburger menu (icon only).
   * Primary Topbar remains at top, 60 px tall:

     * Left: Hamburger icon toggles sidebar drawer.
     * Center: App name or current section title.
     * Right: Theme toggle (light/dark).
   * Entire Topbar is opaque (no transparency) in mobile to maximize contrast.

3. **Primary Tab Behavior**:

   * Clicking a tab sets global `mode` (e.g., “Edit”).
   * Primary Topbar (Mobile) or Sidebar (Desktop) indicates active tab with a **glow outline** (orange/gold) and slight shadow.

### 4.2 Contextual Navigation (Secondary Topbar)

1. **Desktop & Mobile (Below Primary)**:

   * Height: 50 px.
   * Background: semi-transparent glass (Level 2).
   * Contains horizontally scrollable list of **secondary tabs** relevant to active primary tab.

     * Example, under **Edit**: “Nodes,” “Edges,” “Tags.”
     * Under **Layout**: “Manual,” “Physics,” “Hierarchy,” “Flow,” “Grid,” “Snapshots.”
     * Under **Analyze**: “Summary,” “Components,” “Degree,” “Centrality,” “Cycles.”
     * Under **Export**: “PNG,” “SVG,” “CSV,” “JSON.”

2. **Visual Styling**:

   * Each tab is a pill-shaped button with center-aligned icon + label.
   * Active subtab: bold text, underlined with a small gradient bar (dark blue → orange).
   * On hover (desktop) / tap (mobile), tab background momentarily glows with primary accent color (orange/gold).

3. **Scroll Behavior**:

   * If tabs overflow, allow horizontal swipe on mobile or horizontal scroll on desktop.
   * Provide subtle left/right arrow fade indicators to show hidden tabs.

### 4.3 Utility Sidebar / Bottom Panel

1. **Desktop (Right-Docked)**:

   * Width: initial 300 px, resizable by dragging left edge.
   * Background: highly transparent glass (Level 3).
   * Contains context-sensitive controls:

     * In **Edit**: Node/edge properties, color picker (for manual mode), connector toggle.
     * In **Layout**: Layout parameter sliders, dropdowns.
     * In **Analyze**: Charts, tables, metric toggles.
     * In **Export**: File type options, previews.
     * In **Data I/O**: JSON textarea, validation results, Merge/Replace toggle.
   * Collapsible via a chevron icon at top right of panel; when collapsed, a thin “tab” of glass remains visible.

2. **Mobile (Bottom-Docked)**:

   * Height: initial 300 px (⅘ of viewport height), resizable by dragging top edge.
   * Background: highly transparent glass (Level 3).
   * Shows same context-sensitive controls as desktop, but stacked vertically for narrower width.
   * When collapsed, only a small bar (\~40 px high) with a handle icon remains at bottom; swiping up expands full panel.

3. **Panel Behavior & Animations**:

   * **Open/Close**: slide in/out from right (desktop) or bottom (mobile) with an ease-in-out transition (0.3 s).
   * **Resize**: dragging handle shows a vertical/horizontal ghost line indicating new boundary; upon release, panel snaps to nearest multiple of spacing token (e.g., 16 px increments) for consistency.

---

## 5. UI Component Styles

A unified component library ensures consistency. Below are guidelines for each key component.

### 5.1 Cards & Panels

1. **Card Base**

   * Background:

     * Light: `#ffffff`
     * Dark:  `#2e3a51`
   * Border: `1 px solid`

     * Light: `#e2e8f0`
     * Dark:  `#475569`
   * Border-Radius: `8 px` (0.5 rem)
   * Box-Shadow (light mode): `0 2 px 4 px rgba(0,0,0,0.05)`
   * Box-Shadow (dark mode): `0 2 px 4 px rgba(0,0,0,0.3)`
   * Padding: `16 px` (1 rem) internal spacing.

2. **Card Elevated (e.g., utility panel container)**

   * Background: glassmorphic Level 3 or solid surface with `bg-slate-700/90`.
   * Border-Radius: `12 px`.
   * Box-Shadow: `0 4 px 8 px rgba(0,0,0,0.15)` (light) or `rgba(0,0,0,0.5)` (dark).
   * Backdrop-Blur:

     * Light: `12 px`.
     * Dark:  `16 px`.

### 5.2 Buttons

1. **Primary Button**

   * Background: linear gradient from Dark Blue (`#0d1f3c`) → Orange (`#f59e0b`).
   * Text: white, semibold.
   * Border-Radius: `8 px`.
   * Padding: `8 px 16 px` (0.5 rem 1 rem).
   * Box-Shadow: `0 2 px 4 px rgba(0, 31, 60, 0.2)`.
   * Hover: reverse gradient direction + slight scale (1.02x) + glow outline (`0 0 8 px rgba(245,158,11,0.6)`).
   * Active: scale (0.98x), darker gradient, inset shadow.

2. **Secondary Button**

   * Background: neutral (light: `#e2e8f0`; dark: `#475569`).
   * Text: primary neutral (light: `#1e293b`; dark: `#f1f5f9`).
   * Border: `1 px solid` darker neutral (`#cbd5e1` light, `#94a3b8` dark).
   * Hover: background darkens slightly (`#d1d5db` or `#374151`).

3. **Ghost/Outline Button**

   * Background: transparent.
   * Text & Border: primary neutral.
   * Hover: background `#f1f5f9/10` (light), `#1f2937/20` (dark).

4. **Icon Button** (e.g., for collapsing panels)

   * Background: transparent
   * Icon Color: primary accent (Orange) when hovered, neutral otherwise.
   * Padding: `8 px`.
   * Hover: circular background `rgba(6,182,212,0.1)` (cyan) or `rgba(236,72,153,0.1)` (pink) in dark mode.

### 5.3 Inputs & Forms

1. **Text Inputs / Textareas**

   * Background:

     * Light: `#ffffff`
     * Dark:  `#2e3a51` (with slight transparency if over glass)
   * Border: `1 px solid`

     * Light: `#cbd5e1`
     * Dark:  `#475569`
   * Border-Radius: `6 px`.
   * Padding: `8 px 12 px`.
   * Placeholder Text:

     * Light: `#94a3b8`
     * Dark:  `#64748b`
   * Focus: outline `2 px` in primary accent color (Orange in light, Cyan in dark).

2. **Dropdowns / Selects**

   * Same styling as input; open panel is Level 2 glass with slight shadow.
   * Selected item highlighted in primary gradient background with white text.

3. **Sliders** (Layout controls)

   * Track: neutral gray.
   * Thumb: circle, background Orange (light) or Cyan (dark), slight glow effect.
   * On drag: emit a glow ring around thumb.

4. **Checkboxes / Toggles**

   * Checkboxes: custom styled—box with 2 px border, tick icon appears in Orange when checked.
   * Toggles (switches):

     * Track: neutral background (light: `#e2e8f0`, dark: `#475569`).
     * Thumb: primary accent, transitions on toggle.

### 5.4 Tabs & Pills

1. **Tab Container**

   * Display: inline-flex, wrap if needed.
   * Spacing: `8 px` between tabs.

2. **Individual Tab**

   * Background: transparent, with neutral border radius.
   * Text: semibold, neutral color.
   * Active Tab:

     * Text color: primary accent (Orange).
     * Underline: 3 px tall, full width of tab, gradient from Dark Blue → Orange.
     * Box-Shadow: subtle glow (`0 0 6 px rgba(245,158,11, 0.6)`).
   * Hover: text color shifts to primary accent; background `rgba(6,182,212,0.1)`.

### 5.5 Modals & Popovers

1. **Backdrop**

   * Semi-opaque black: `rgba(0,0,0,0.4)` (light) or `rgba(0,0,0,0.6)` (dark).
   * Fade in/out animation (0.2 s opacity transition).

2. **Modal Window**

   * Background: Level 2 glass (light: `rgba(255,255,255,0.8)`; dark: `rgba(30,41,59,0.8)`).
   * Border-Radius: `12 px`.
   * Box-Shadow: `0 8 px 16 px rgba(0,0,0,0.2)`.
   * Padding: `24 px`.
   * Maximum width: `90%` of viewport (mobile), `600 px` on desktop.
   * Entrance: scale from 0.95 → 1 with opacity 0 → 1 in 0.25 s.

3. **Popover (Contextual Hints)**

   * Background: Level 3 glass (light: `rgba(255,255,255,0.6)`; dark: `rgba(30,41,59,0.6)`).
   * Border: `1 px solid` neutral border.
   * Border-Radius: `6 px`.
   * Box-Shadow: `0 4 px 8 px rgba(0,0,0,0.15)` (light), `rgba(0,0,0,0.5)` (dark).
   * Arrow: small glass arrow that points to the triggering element.

### 5.6 Tooltips & Toasts

1. **Tooltips**

   * Background: solid neutral (light: `#1e293b`/text white; dark: `#f1f5f9`/text black).
   * Text size: 0.875 rem; padding: `4 px 8 px`.
   * Border-Radius: `4 px`; slight drop shadow.
   * Display: on hover (desktop) or long-press (mobile) of icons.

2. **Toasts (Notifications)**

   * Position: top-center or bottom-center.
   * Background: primary accent (Orange) for success; warm pink for errors; cyan for info.
   * Text: white, semibold.
   * Border-Radius: `8 px`.
   * Padding: `8 px 16 px`.
   * Show duration: 3 s, fade in/out at 0.3 s.
   * Allow swipe (mobile) or click (desktop) to dismiss early.

---

## 6. Interactions, Animations & Motion Principles

### 6.1 Motion Design Philosophy

1. **Subtle Entrances & Exits**

   * Fade in/out combined with slight translate (Y or X).
   * Example: opening Utility Panel → slide in from right (translateX: 100% → 0) + fade from 0 → 1 in 0.3 s.

2. **Hover & Focus Feedback**

   * Buttons and interactive elements glow on hover: `0 0 8 px rgba(245,158,11, 0.4)`.
   * Inputs highlight border on focus with accent color.
   * On desktop, hover should slightly scale up clickable cards (`scale(1.02)`) and add shadow.

3. **Active & Pressed States**

   * Buttons and tabs press down slightly (`scale(0.98)`) with an inset shadow.
   * Nodes in Cytoscape: scale up (1.05) and add glow on grab.

4. **Layout Transitions**

   * When user switches from one layout to another, animate node movements smoothly over 0.5 s.
   * Edges fade out, nodes reposition, then edges fade in—gently communicating change.

5. **Gesture Feedback (Mobile)**

   * On long-press, display ripple or “pop” animation around node.
   * On drag, node moves fluidly under finger with slight scale (1.1).
   * When using edge handle, ghost edge trail follows fingertip.

6. **Scroll & Carousel**

   * Secondary tabs scroll horizontally with smooth inertia.
   * Show partial next tab to indicate scrollable content.

7. **Glass & Backdrop Blur**

   * For glass panels, animate backdrop-blur changes (e.g., `backdrop-blur: 0 → 16 px` on open).
   * Avoid heavy blur in low-end devices; fallback to solid background with slight opacity if blur not supported.

### 6.2 Animation Durations & Easing

* **Standard Ease**: `ease-in-out` cubic-bezier(0.4, 0, 0.2, 1).
* **Fast transitions** (hover, focus): 0.1 – 0.15 s.
* **Moderate transitions** (modals, panels): 0.3 – 0.35 s.
* **Slow transitions** (layout changes): 0.5 – 0.6 s.
* **Dropdowns / Tooltips**: 0.2 – 0.25 s.

---

## 7. Mode-Based Behavior & Input Gestures

The app operates in distinct **Interaction Modes**. Each mode unlocks specific gestures and UI controls.

### 7.1 Interaction Modes Overview

| Mode           | Purpose                                                           | UI Indicators & Controls                                                                      |
| -------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **View**       | Browse or inspect graph without changes                           | No edge handles. Canvas zoom/pan active. Topbar subtle “View” highlight.                      |
| **ManualEdit** | Structural editing (add/delete nodes & edges, rename, reposition) | Active edge handles on nodes. “Lock Canvas” toggled by default. Manual edit icon highlighted. |
| **Paint**      | Apply color/style to nodes/edges                                  | Color palette shows in Utility Panel. Tapping applies style; edge inheritance logic active.   |
| **Layout**     | Select and apply layout algorithms                                | Layout submenu visible. Utility Panel shows sliders. Node lock icons enabled.                 |
| **DataIO**     | Load / validate / import / export graph                           | Utility Panel shows data input area and validation UI. Canvas editing disabled.               |
| **Analyze**    | Run graph metrics & filtering                                     | Utility Panel shows charts, tables. Highlight toggles appear.                                 |

### 7.2 Input Gesture Mapping

1. **View Mode (Default)**

   * **Desktop**:

     * Click + drag background → pan.
     * Scroll wheel → zoom.
     * Hover over interactive UI elements → glow.
   * **Mobile**:

     * Two-finger drag → pan.
     * Pinch → zoom.
     * Single tap on node/edge → select (highlight).

2. **Manual Edit Mode**

   * **Desktop**:

     * Click + drag node → reposition (node pops, shadow intensifies).
     * Shift + drag from node → create edge (ghost edge appears while dragging).
     * Double-click node label → rename inline.
     * Right-click node/edge → context menu (Delete, Lock/Unlock).
   * **Mobile**:

     * Long-press + drag node → reposition (node pops under finger).
     * Tap node → reveal small edge-handle circle.
     * Drag handle → create edge to target node (ghost edge follows touch).
     * Double-tap node → inline rename prompt.
     * Long-press blank canvas → “Add Node” create prompt at release position.

3. **Paint Mode**

   * **Desktop**:

     * Click node/edge → apply currently selected color.
     * Ctrl + drag over nodes → paint sweep.
   * **Mobile**:

     * Single tap node/edge → apply color.
     * Drag finger over multiple nodes → apply color sequentially.
     * Utility Panel “Propagate to Outgoing Edges” checked by default; if source node is connector, skip inheritance.

4. **Layout Mode**

   * **Desktop**:

     * Click layout subtab → adjust controls in Utility Panel.
     * Click “Apply” → run layout with animation.
     * Click node → toggle lock/unlock icon appears.
     * Click + drag unlocked node → manual tweak after layout.
   * **Mobile**:

     * Tap layout subtab → Utility Panel slides up with controls.
     * Tap “Apply” → layout runs with animated node moves.
     * Tap node → toggle lock (lock icon appears).
     * Tap-hold + drag unlocked node → reposition manually.

5. **Data I/O Mode**

   * **Desktop & Mobile**:

     * Utility Panel shows Merge/Replace toggle and JSON input.
     * Tap “Validate” → errors appear in list.
     * Tap suggestion dropdown to fix errors.
     * Tap “Import” → merges or replaces graph accordingly; new edges inherit color from source node unless source is a connector.

6. **Analyze Mode**

   * **Desktop**:

     * Click metric button (e.g., “Connected Components”) → chart appears in Utility Panel.
     * Click “Highlight” → nodes/edges styled to indicate metric result.
   * **Mobile**:

     * Tap metric tab → Utility Panel bottom drawer shows results.
     * Tap “Highlight” → apply highlighting on canvas.

---

## 8. Detailed User Flows

Below are several in-depth, step-by-step user flows that synthesize navigation, modes, UI changes, interactions, animations, and data state transitions.

### 8.1 Flow 1: Creating a New Map from JSON & Exporting

1. **Home / Data I/O**

   * User lands on the blank canvas page. Primary Sidebar is visible (Home tab active, glassmorphic & opaque). Secondary Topbar is hidden because no context yet.

2. **Switch to Data I/O Mode**

   * User clicks “Home / Load” in Sidebar. Sidebar highlight glows in dark blue.
   * Secondary Topbar appears with two subtabs: “Merge” and “Replace” (glass Level 2).
   * Default: “Replace” selected; highlight is orange underline; text is bold.

3. **Enter JSON Data**

   * Utility Panel (Level 3) slides in from right (desktop) or bottom (mobile) with a blur animation.
   * It displays a toggle (“Mode: Replace”) plus a large textarea with placeholder text “Paste JSON here…”.
   * Below textarea, “Validate” button (Primary style) is visible.

4. **Validate Data**

   * User pastes a well-formed JSON.
   * Clicks “Validate.”
   * In 0.2 s, the app checks schema and integrity. If valid, a green toast (“JSON valid”) appears at top-center (orange border, white text).
   * If invalid, utility panel lists issues: e.g., “Edge e7 references missing node n3. Suggested: n2.” Each suggestion shows as clickable pill. User taps to auto-fix.

5. **Import & Render Graph**

   * With validation passed, user clicks “Import.”
   * Utility Panel shows a brief spinner (animation: rotating gradient from dark blue → orange).
   * Canvas gradually renders nodes in “Preset” mode (random positions). Nodes fade in (\~0 → 1 in 0.3 s) and appear with slight upward translate, giving a “rise” effect.
   * Edges draw as lines between nodes, animating from alpha 0 → 1 in 0.2 s.
   * Outgoing edges inherit source node color (e.g., if “Concept A” is red, all its edges appear red). If any source is a connector node, those edges stay default gray.

6. **Manual Refinement**

   * Sidebar now highlights “Edit” as available. User clicks “Edit.”
   * Secondary Topbar updates to “Nodes | Edges | Tags.”
   * User selects “Nodes.” Buttons in Utility Panel are hidden because manual gestures suffice.

7. **Rename a Node**

   * User double-taps (mobile) / double-clicks (desktop) the node labeled “Concept A.”
   * Inline text input fades in over the node’s label (glass background, semi-opaque). Cursor blinks.
   * User types “Introduction” and presses Enter; text transitions seamlessly.

8. **Add a Node via Gesture**

   * User long-presses blank canvas for 0.5 s → a small glass-styled “+” icon (16 px) appears under finger.
   * User drags finger slightly → a translucent node outline follows. On release, a modal appears to enter node details (ID, Label, Color).
   * Modal is tiny (max width 300 px), glass Level 2, with fields and “Add” button.
   * User enters “Subtopic 1,” picks a cyan color, and taps “Add.”
   * New node appears at that position with a fade‐in animation.

9. **Create an Edge**

   * User taps the newly created “Subtopic 1” node. It “pops” (scaled to 1.1 briefly). A small circular handle (12 px diameter) appears at north edge.
   * User drags handle to “Introduction” node. As finger moves, a dashed “ghost” line (50% alpha) follows.
   * On release over “Introduction,” a solid edge appears, animating from length 0 to full length in 0.25 s. Because “Introduction” is blue, the new edge’s default color is blue.

10. **Paint Mode for Styling**

    * User taps “Paint” icon in Primary Topbar (brush icon).
    * Secondary Topbar switches to show “Node Paint | Edge Paint.”
    * Utility Panel shows color palette swatches (row of circles: orange, gold, dark blue, pink, cyan, etc.) plus a “Propagate to Outgoing Edges” toggle (checked by default).
    * User selects Orange. A small circle of Orange follows cursor.
    * User taps “Subtopic 1.” Node’s fill animates to Orange (0 → 1 in 0.2 s). Because “Propagate” is checked and “Subtopic 1” is not a connector, its outgoing edges also update to Orange.

11. **Save Checkpoint**

    * User clicks “Layout” in Sidebar to reveal layout options.
    * Secondary Topbar shows “Manual | Physics | Hierarchy | Flow | Grid | Snapshots.”
    * User clicks “Snapshots.” Utility Panel lists “No snapshots yet.” A “Save Snapshot” button appears.
    * User clicks “Save Snapshot.” A prompt appears: “Name this snapshot.”
    * User types “Initial Draft” and taps “Save.”
    * In Utility Panel, “Initial Draft – Today 2:45 PM” appears with a small thumbnail preview.

12. **Export as PNG**

    * User clicks “Export” in Sidebar. Secondary Topbar shows “PNG | SVG | CSV | JSON.”
    * “PNG” is selected; Utility Panel displays “Include Labels” toggle (checked), “Scale: 1×” dropdown.
    * User taps “Download.” App generates PNG via Cytoscape, shows a progress spinner for 0.3 s, then triggers a download of “concept-map.png.”
    * Toast at bottom says “Export complete.”

13. **Session Persistence**

    * User refreshes the browser. App reads LocalStorage, finds saved state.
    * Modal pops: “Restore Previous Session?” with “Yes | No” buttons.
    * User taps “Yes.” App restores entire graph, layout, styles, snapshots seamlessly; nodes and edges reappear with no layout change to avoid confusion.

---

### 8.2 Flow 2: Layout Exploration & Snapshot Comparison

1. **Begin with Manual Arrangement**

   * User has an existing graph in “Preset” layout, arranged manually.

2. **Switch to Physics (Auto-Arrange)**

   * User clicks “Layout” in Sidebar. Secondary Topbar now displays layout modes. “Manual” is active.
   * User clicks “Physics.”
   * Utility Panel slides in with controls:

     * Slider: “Edge Length Bias: 200” (draggable).
     * Slider: “Node Repulsion: 100.”
     * Toggle: “Run Simulation” (off by default).
     * Button: “Lock Selected Node” (disabled until node is selected).
   * User drags “Edge Length Bias” to 300; slides in a real-time preview.
   * User taps “Run Simulation”; nodes animate into force-directed positions (0.5 s ease).

3. **Lock a Key Node**

   * User taps “Introduction.” Node “pops,” and a small lock icon appears.
   * User taps lock icon; node dims slightly and a small lock badge appears on it—indicating it is locked. Other nodes continue simulation around it.

4. **Save Physics Layout Snapshot**

   * In Utility Panel, user taps “Save Snapshot,” names it “Physics View,” and saves.
   * Snapshot appears under “Snapshots” with timestamp and a mini preview.

5. **Switch to Hierarchy (Concentric)**

   * User taps “Hierarchy” in Secondary Topbar.
   * Utility Panel updates:

     * Dropdown: “Select Root Node” (default “Introduction”).
     * Slider: “Level Spacing: 100.”
     * Toggle: “Invert Levels.”
   * User confirms defaults and taps “Apply.”
   * Nodes animate into concentric rings around “Introduction” (0.5 s ease).
   * Utility toast: “Concentric layout applied.”

6. **Compare with Physics Snapshot**

   * User taps “Snapshots,” sees “Physics View” and “Initial Draft.”
   * Taps “Physics View → Restore.”
   * Entire canvas animates back to the saved physics positions (transition over 0.5 s).
   * Secondary Topbar remains on “Snapshots” until user picks a layout mode again.

7. **Manual Tweak in Concentric Layout**

   * User switches back to “Hierarchy,” reselects it.
   * Node positions from concentric are restored.
   * User long-press + drags a node a small distance away from ring to emphasize. That node adopts a slight drop shadow increase to signify override.
   * User taps “Lock Canvas” toggle in Primary Topbar to lock panning/zoom so reposition is accurate.

8. **Return to Manual Mode**

   * User taps “Manual” in Secondary Topbar.
   * Nodes remain at their current (user-tweaked) positions.
   * Edge “ghost” handles reappear; user can continue structural edits.

---

### 8.3 Flow 3: Connector Node vs. Edge Label Mode

1. **Enable Connector Mode**

   * User goes to “Settings” in Sidebar. Secondary Topbar shows “Appearance,” “Behavior,” “Shortcuts.”
   * Under “Behavior,” user toggles “Use Connector Nodes Instead of Edge Labels.”
   * Settings save automatically; a toast says “Connector Mode Enabled.”

2. **Manual Edit with Connector**

   * User in “Manual”
   * To add a new relationship, user long-press + drag from “Colors” node.
   * Utility Panel notices connector mode is on and shows a small note: “Creating connector node for ‘is’.”
   * User drags handle to blank area; on release, a “Create Connector” form appears:

     * Field: “Connector Label” (prefilled with “is”).
   * User enters “is” (default), taps “Add.”
   * A new connector node labeled “is” appears between “Colors” and the blank area; edges connect “Colors” → “is” and later “is” → new target.
   * The connector node’s `isConnectorNode` flag is set true. Its color defaults to neutral gray.
   * When user later connects “is” to “Red,” both new edges remain gray (no inheritance from connector).
   * If user repaints “Red” node to Orange, that does not recolor edges from “is”; edges color remains manually editable only.

3. **Visual Feedback for Connector Nodes**

   * Connector nodes use a distinctive shape (diamond) and smaller size (20 px vs. 28 px for standard) with neutral border.
   * On hover/tap, connector node glows in warm pink (`#ec4899`), indicating special mode.

4. **Switch Back to Edge Label Mode**

   * User returns to “Settings,” toggles off “Connector Nodes” mode.
   * Now, dragging from “Colors” to “Red” automatically creates a single edge labeled “is” (prompt form to enter label).
   * Edges now display label text near their midpoint, styled (font size 0.875 rem, semibold) with a mild background bubble.

---

## 9. Accessibility & Responsive Design

### 9.1 Accessible Color & Contrast

* **Text Contrast**: Ensure primary text (dark mode: `#f1f5f9` on `#1e293b`) > 4.5:1.
* **Interactive Elements**: Buttons, toggles, icons meet 3:1 contrast against their backgrounds.
* **Color-blind Friendly**: Use both hue and shape/texture to indicate status (e.g., locked nodes have lock icon, not just color).

### 9.2 Keyboard & Screen-Reader Support

1. **Tab Order**

   * Sidebar (focusable icons/labels) → Secondary Topbar (tabs) → Canvas (graph elements) → Utility Panel (controls) → Screenshot/Export controls → Settings.

2. **ARIA Roles & Labels**

   * `<nav role="navigation" aria-label="Primary Navigation">` around Sidebar.
   * `<div role="tablist" aria-label="Edit Options">` for Secondary Topbar under Edit.
   * Graph canvas: `<div role="region" aria-label="Concept Map Editor">`.
   * Nodes: `<div role="button" aria-label="Node: Introduction">` (plus `aria-describedby` pointing to label text).
   * Edge handles: `<button role="button" aria-label="Drag to create edge">`.

3. **Focus Styles**

   * All focusable elements (buttons, tabs, inputs) show a `2 px` outline in primary accent (Orange).
   * Keyboard “Enter” on node triggers select or rename.
   * Arrow keys navigate among lists (snapshots, metrics, tags in dropdowns).

### 9.3 Mobile-First Responsive Layout

1. **Breakpoints**

   * `sm` < 640 px: mobile layout.
   * `md` ≥ 768 px: tablet.
   * `lg` ≥ 1024 px: small desktop.
   * `xl` ≥ 1280 px: desktop.

2. **Sidebar Behavior**

   * **Mobile**: Sidebar collapsed by default; hamburger appears in Primary Topbar.
   * Expanding Sidebar on mobile overlays entire screen as a drawer (glass Level 2).
   * **Tablet/Desktop**: Sidebar always visible, fixed width (250 px).

3. **Contextual Topbar Behavior**

   * **Mobile (< md)**: appears as scrollable pill menu under Primary Topbar, height = 50 px, glass Level 2.
   * **Desktop (≥ md)**: same behavior with more horizontal room; context bar extends full width.

4. **Utility Panel Behavior**

   * **Mobile**: bottom drawer; initial height = 70% viewport; can collapse to 40 px high.
   * **Tablet/Desktop**: right sidebar; initial width = 300 px; draggable to expand up to 40% of viewport.

5. **Touch Targets**

   * Minimum 44 × 44 px for buttons and icons.
   * Entire node “hitbox” extends beyond shape by 6 px to facilitate taps.

---

## 10. Summary & Developer Guidance

These guidelines serve as the definitive reference for implementing every aspect of the Concept Map Builder’s frontend. Below is a quick checklist for developers:

1. **Set Up Core Styles**

   * Integrate Tailwind tokens using the color palette, spacing scale, and border radii defined above.
   * Define CSS custom properties for Light/Dark mode colors.
   * Create reusable classes for Level 1, Level 2, Level 3 glass backgrounds with appropriate opacities and backdrop-blur settings.

2. **Build Global Layout**

   * Implement Sidebar (Level 1) and Primary Topbar (Level 1) as opaque glass.
   * Add Contextual Topbar (Level 2) with horizontal scrolling and glass styling.
   * Reserve a flexible canvas container in the center that resizes dynamically.
   * Build Utility Panel (Level 3) as a collapsible, resizable component to the right (desktop) or bottom (mobile).

3. **Implement Mode Switching**

   * Connect primary tabs to set `mode` in global store.
   * Secondary tabs for each mode appear dynamically based on active mode.
   * Utility Panel content changes according to mode and subtab.
   * Ensure buttons and tabs visually reflect active state with accent gradients and glows.

4. **Gesture & Interaction Handlers**

   * **Manual Edit**: enable `cytoscape-edgehandles` in this mode; implement “pop” animation on long-press and drag.
   * **Paint Mode**: disable edge handles; show color palette; apply inheritance logic.
   * **Layout Mode**: show layout controls; run Cytoscape layout with animated transitions; respect locked nodes.
   * **Data I/O Mode**: disable canvas interactions; show validation UI.
   * **Analyze Mode**: disable canvas editing; show metrics UI; highlight graph elements per selection.

5. **Component Library**

   * Build generic components (Button, Input, Modal, Slider, Card, Tab, Tooltip) styled per this guideline.
   * Use consistent border radii (8 px for controls, 12 px for modals) and shadows.
   * Ensure each component’s light/dark variants are tested for contrast.

6. **Animations & Transitions**

   * Standardize on `ease-in-out` cubic-bezier for all transitions.
   * Use 0.1 s for hovers, 0.3 s for panel open/close, 0.5 s for layout transitions.
   * Define keyframe animations for node “pop” (`scale: 1 → 1.1 → 1`) and handle drags.

7. **Accessibility**

   * Add ARIA roles/labels to all interactive elements.
   * Define keyboard navigation order consistent with logical reading and usage flow.
   * Provide focus outlines in accent color for all focusable components.
   * Test color usage for colorblind accessibility, include patterns or textures where needed.

8. **Testing & Quality Assurance**

   * Write unit tests for validation logic and store actions.
   * Manually test mobile gestures with an actual device or emulator.
   * Conduct accessibility audits with Lighthouse and screen reader.
   * Verify performance with 100+ nodes and edges; optimize style rendering if needed.

---

By following these guidelines rigorously, the development team will produce an **engaging**, **feature-rich**, and **consistent** concept map builder that resonates with college students’ expectations for a modern, animated, and visually appealing application—while ensuring robust functionality, accessibility, and maintainability.
