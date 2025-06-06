# Definitive Plan for a Cytoscape-Powered Concept Map Builder

Below is a structured, exhaustive blueprint covering **every aspect** of the concept map builder we’ve discussed: from its overarching purpose and audience to detailed technical architecture, UI/UX design, user flows, data handling, and implementation.

---

## 1. Project Overview

### 1.1 Purpose

* Build a **web‐only, mobile‐first concept map editor** that enables users to:

  * **Load** and merge or replace graph data from textual sources (e.g., JSON/CSV).
  * **Manually edit** graph structure (add/delete nodes & edges, rename, reposition).
  * **Visually style** graphs (color, shape, “painting” entire subgraphs).
  * **Apply different layouts** to reveal structure or hierarchy (force‐directed, concentric, dagre, grid, etc.).
  * **Analyze** and compute basic graph metrics.
  * **Save checkpoints** (snapshots) and persist state in localStorage (later to a backend).
  * **Export** final graphs in PNG, SVG, CSV, or JSON.
  * **Interact seamlessly** on both desktop and mobile with minimal confusion or accidental actions.

### 1.2 Target Audience

* **Students & Educators**: who need to brainstorm or publish concept maps in coursework or presentations.
* **Researchers & Professionals**: in domains like medicine, biology, design, or any field that benefits from knowledge‐network visualization.
* **Casual & Power Users**: who appreciate mobile editing on tablets/phones as well as desktop precision.

### 1.3 Core Use Cases

1. **Text‐to‐Graph Workflow**

   * User pastes or uploads a JSON/CSV defining nodes and edges → App validates → Graph appears → User edits, styles, lays out, and exports.
2. **Incremental Graph Building**

   * User starts with a blank map → Adds nodes/edges manually or via repeated JSON imports → Refines structure and styles.
3. **Experimentation & Layout Exploration**

   * Switch between “Manual,” “Physics,” “Hierarchy,” “Flow,” and “Grid” modes → Compare visually → Save snapshots for reference.
4. **Styling & Presentation**

   * Paint nodes/edges with coordinated colors → Ensure printer‐friendly palettes → Export high‐resolution graphics.
5. **Analysis & Reporting**

   * Compute connected components, degree distribution → Highlight key nodes → Export metrics for documentation.

---

## 2. Feature Inventory

1. **Data Input & Validation**

   * “Merge” vs. “Replace” toggle BEFORE parsing.
   * Schema validation, ID checks, referential integrity.
   * Fuzzy matching for mismatched IDs (offers suggestions).
   * Conflict resolution UI (rename, skip, overwrite).

2. **Manual Graph Editing**

   * Add/Edit/Delete nodes and edges via **gesture‐based interactions**.
   * Double‐tap to rename.
   * Drag node to reposition with visual “pop” feedback.
   * Edge creation via **dragging from node handle**.
   * Node locking/unlocking.

3. **Painting/Styling Mode**

   * Color palette for nodes/edges.
   * Options to propagate style to connected elements.
   * “Printable” color themes.
   * Save and load style presets.

4. **Layout Management**

   * **Preset (Manual)**: fully draggable, WYSIWYG.
   * **Physics (“Auto‐Arrange”)**: force‐directed (cola/cose).
   * **Hierarchy (Concentric)**: radial levels from a chosen root.
   * **Flowchart (Dagre)**: directed acyclic, top-down or left-right.
   * **Grid (Matrix)**: tabular layout based on tags or categories.
   * **Snapshot/Checkpoint**: freeze and restore any arrangement.
   * Per‐layout parameter controls (edge length bias, spacing, orientation).
   * Node lock support to preserve positions across layouts.

5. **Analysis & Metrics**

   * Node/edge count, connected components, degree distribution.
   * Centrality (betweenness, closeness) highlighting.
   * Cycle detection.
   * Graph filtering by tag or search by label.

6. **Export & Persistence**

   * Export as PNG or SVG (with label inclusion, DPI controls).
   * Export node/edge tables as CSV.
   * Export entire state as JSON.
   * Copyable link (future backend feature).
   * **LocalStorage**‐based session restore for frontend‐only demo.
   * Checkpoint management: save, rename, delete.

7. **Additional Utility Features**

   * Undo/Redo stack for every action.
   * Multi‐select & bulk edits (change color or tag multiple nodes).
   * Mini‐map overview for large graphs.
   * Keyboard shortcuts in desktop mode.
   * Accessibility (ARIA roles, focus management).

---

## 3. Tech Stack & Architecture

### 3.1 Frontend Framework

* **React** with **TypeScript** for component architecture and type safety.
* **Vite** for fast development, HMR, and build.

### 3.2 State Management

* **Zustand** (lightweight global store) or **Redux** if preferred.
* Store the entire `AppState` schema, including:

  ```ts
  type NodeData = {
    id: string;
    label: string;
    color?: string;
    shape?: string;
    tags?: string[];
    locked?: boolean;
  };
  type EdgeData = {
    id: string;
    source: string;
    target: string;
    length?: number;
    color?: string;
  };
  type LayoutMeta = {
    nodePositions?: Record<string, { x: number; y: number }>;
    lockedNodes?: string[];
    edgeLengths?: Record<string, number>;
    modeParams?: Record<string, any>;
  };
  type Snapshot = {
    name: string;
    timestamp: number;
    elements: { nodes: NodeData[]; edges: EdgeData[] };
    layouts: Record<LayoutMode, LayoutMeta>;
  };
  type AppState = {
    elements: { nodes: NodeData[]; edges: EdgeData[] };
    layouts: Record<LayoutMode, LayoutMeta>;
    currentLayout: LayoutMode;
    mode: InteractionMode;
    snapshots: Snapshot[];
    settings: { theme: 'light' | 'dark'; inputMode: 'auto' | 'mobile' | 'desktop' };
  };
  ```

  * **`LayoutMode`** ∈ { 'preset', 'physics', 'concentric', 'dagre', 'grid' }.
  * **`InteractionMode`** ∈ { 'view', 'manualEdit', 'paint', 'layout', 'dataIO' }.

### 3.3 Graph Engine

* **Cytoscape.js** as core renderer.
* **Plugins**:

  * `cytoscape-edgehandles` for edge creation handles.
  * Layout extensions: `cola`, `dagre` (bundled or installed separately).
  * Possibly `cytoscape-undo-redo` (or custom implementation).

### 3.4 Styling & UI Components

* **Tailwind CSS** (utility‐first framework) for rapid, consistent styling.
* **Headless UI / Radix / ShadCN** for accessible primitives (modals, drawers).
* **Glassmorphism** for navbars:

  * **First‐Level Navbars** (Sidebar & Primary Topbar): fully opaque background (e.g., `bg-white/100` or `dark:bg-slate-800/100`).
  * **Second‐Level Navbars** (Contextual Topbar): moderate transparency (e.g., `bg-white/80`, `dark:bg-slate-800/80`).
  * **Utility Sidebar/Bottom Panel**: higher transparency (e.g., `bg-white/60`, `dark:bg-slate-800/60`).
  * **Resizable & Collapsible** with drag handles styled using Tailwind (e.g., `cursor-col-resize`).

### 3.5 Persistence

* **LocalStorage** for the demo: store the entire `AppState` serialized as JSON.

  * Key: `"conceptMapAppState"`.
  * Offer “Restore previous session?” on load.
* **Future Backend**: plan for REST or GraphQL endpoint to store user‐owned graphs, snapshots, and preferences.

---

## 4. UI/UX Architecture

### 4.1 Overall Layout

```
┌───────────────────────────────────────────────────────────────────────────┐
│                                TOPBAR                                     │ 
│  (Primary Tab Selection: Home, Edit, Layout, Analyze, Export, Settings)   │
└───────────────────────────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────────────────────────┐
│ Contextual Topbar (Secondary)  →  Subtabs depend on current primary tab   │
│  - e.g., Under Edit: Nodes | Edges | Tags                                 │
│  - Under Layout: Manual | Physics | Hierarchy | Flow | Grid | Snapshots   │
└───────────────────────────────────────────────────────────────────────────┘
┌───────┬─────────────────────────────┬───────────────────────────────────────┐
│Sidebar│           CANVAS            │    Utility Sidebar / Bottom Panel     │
│(Primary│       (Cytoscape.js)       │     (Context‐sensitive tools)         │
│ Nav)   │ - Zoom & Pan on canvas      │  - Color palettes                     │
│       │   (pinch, scroll, drag)      │  - Layout sliders / checkboxes        │
│       │ - Node & edge interactions   │  - Validation results / merge options │
└───────┴─────────────────────────────┴───────────────────────────────────────┘
```

* **Sidebar** (left) houses **Primary Tabs**:

  * **Home/Data I/O**
  * **Edit**
  * **Layout**
  * **Analyze**
  * **Export**
  * **Settings**

* **Contextual Topbar** (just below Topbar) houses **Secondary Tabs** (subsections).

* **Utility Panel** appears on the right (desktop) or bottom (mobile) *only when needed* by the active mode/tab.

### 4.2 Glassmorphism Hierarchy

* **Sidebar & Primary Topbar (Level 1)**:

  * Fully opaque to convey “high priority, always visible.”

* **Contextual Topbar (Level 2)**:

  * `bg-white/80` (light) or `dark:bg-slate-800/80`. More transparent to indicate “contextual, secondary importance.”

* **Utility Panel (Level 3)**:

  * `bg-white/60` (light) or `dark:bg-slate-800/60`. Even more transparent; “tertiary, optional tools.”

* **Resize Handle / Collapse Controls**:

  * Always visible at the left edge (when utility panel is open) or top‐right corner of Sidebar/Topbar.

### 4.3 Responsive Behavior

* **Desktop & Tablet (> 768px)**:

  * Sidebar is fixed on the left (collapsible).
  * Contextual Topbar scrollable horizontally.
  * Utility panel on the right, resizable from its left edge.

* **Mobile (< 768px)**:

  * Sidebar collapses into a **hamburger menu** at top‐left.
  * Primary Topbar transforms into a horizontal scroll of icons.
  * Contextual Topbar shifts below Primary Topbar, also horizontally scrollable.
  * Utility panel appears as a **bottom drawer** that can be swiped up or toggled.

---

## 5. Interaction Modes & Gesture Mapping

### 5.1 Universal (Always‐Active) Interactions

| Action         | Desktop (Mouse/Keyboard)               | Mobile (Touch)          |
| -------------- | -------------------------------------- | ----------------------- |
| **Tap/Click**  | Select node/edge                       | Tap node/edge to select |
| **Double Tap** | (Optional) rename if in rename context | Double tap to rename    |
| **Zoom**       | Scroll wheel + `ctrl`                  | Pinch gesture           |
| **Pan**        | Click‐drag background                  | Two-finger drag         |

These are always enabled, in all modes.

### 5.2 Mode‐Specific Interactions

#### A. **Manual Edit Mode** (`mode = 'manualEdit'`)

* **Drag Node** (tap‐hold + drag) → reposition node. Visual feedback: node “pops” (slight scale up).
* **Create Edge**:

  * Show a small **edge‐handle circle** when node is tapped.
  * User taps handle, then drags to another node → previews “ghost” edge → release to finalize edge.
  * For desktop: `Shift + drag` from node center can also initiate edge creation.
* **Double Tap Node** → rename node (open inline text‐editor).
* **Long Press Node** → show a **contextual mini‐menu** (Delete, Lock/Unlock, Details) if needed (but avoid clutter; rely on modes).
* **Tap Empty Space** → if hold and drag, initiate “add new node here” interaction:

  * On release, show form to enter ID/Label (auto‐ID if left blank).

Effects in UI:

* Sidebar → “Add Node,” “Delete Node,” “Add Edge” options are disabled (gestures suffice).
* Utility panel shows no editing tools (gestures handle most); maybe show a “Tap to rename” or “Hold + drag to move.”

#### B. **Paint Mode** (`mode = 'paint'`)

* **Tap Node/Edge** → apply currently selected color/style.
* **Paint Propagation Toggle** in Utility Panel: choose to paint only tapped element or its neighbors/incoming/outgoing edges.
* **Swipe Across Nodes** (drag across) → paint multiple nodes sequentially.

Effects in UI:

* Edge‐handle and manual‐edit gestures disabled.
* Utility Panel displays color palette, style brushes, propagate toggles.

#### C. **Layout Mode** (`mode = 'layout'`)

* **Tap Layout Button** (Contextual Topbar) → open Utility Panel with layout controls.
* **Tap “Apply Layout”** → Cytoscape runs selected algorithm.
* **Tap Node** (in this mode) → may lock/unlock that node (toggle) to exclude it from layout.
* **Drag Node** (optional) → manually tweak after layout if desired (activity allowed in Layout mode but less emphasized).

Effects in UI:

* Utility Panel shows sliders and checkboxes for parameters (e.g., edge length, repulsion).
* Contextual Topbar highlights current layout.
* Manual‐edit gestures partially enabled (drags reposition, but user aware they are overriding layout).

#### D. **Data I/O Mode** (`mode = 'dataIO'`)

* **Tap “Load JSON”** → opens modal for pasting or uploading JSON.
* **Tap “Merge/Replace” Toggle** prior to parsing.
* **Tap “Validate”** → triggers validation pipeline.
* **Tap suggested fixes** (from fuzzy matches) in Utility Panel to correct mismatches.
* **Tap “Import”** → merges or replaces graph.
* **Tap “Export”** → choose format (PNG, SVG, CSV, JSON) and options.

Effects in UI:

* Utility Panel occupies majority of right/bottom space showing text area, validation feedback, option toggles.
* Graph interactions (drag, paint, layout) disabled to prevent conflicts.

#### E. **Analysis Mode** (`mode = 'analyze'`)

* **Tap “Compute Metric”** (e.g., connected components) → Utility Panel shows results table or chart.
* **Tap “Highlight Nodes”** → toggles highlights on canvas.
* **Tap filter/search field** → highlight or hide nodes.

Effects in UI:

* Utility Panel shows analysis controls and results.
* Canvas remains interactive for zoom/pan.

---

## 6. Data Loading & Validation Pipeline

### 6.1 **User Intention Selection BEFORE Parsing**

* In “Data I/O” mode, present **two toggles** at top:

  * **Mode: \[ Merge | Replace ]**
  * **File Input / Text Paste**

### 6.2 **Validation Steps**

1. **Parse JSON/CSV** into interim object:

   * `interim = { nodes: [...], edges: [...] }`

2. **Schema Check**: Ensure `nodes` and `edges` keys (for “Replace”), or at least one of them (for “Merge”).

3. **Unique ID Check**:

   * Nodes: no duplicate IDs.
   * Edges: no duplicate IDs (if IDs required).

4. **Referential Integrity**:

   * Each `edge.source` and `edge.target` must exist in `interim.nodes`.
   * If missing, flag errors and run fuzzy matching:

     * For each missing ID, compute edit distance against existing node IDs.
     * Display “Did you mean: \[n1], \[n3], \[nx]?” in Utility Panel.

5. **Conflict Resolution** (if merging):

   * If `interim.nodes` contains IDs already in current graph: ask

     * “Overwrite?” or “Keep both (auto‐rename loaded node to ‘nodeId\_copy’)?“
   * If `interim.edges` references nodes not in current graph after user correction: block or ask to skip.

6. **Final Merge/Replace**:

   * If “Replace”: clear existing `elements` and set to `interim`.
   * If “Merge”: add `interim.nodes` and `interim.edges` (post‐correction) to existing.
   * On both: update Cytoscape’s `cy.json({ elements: newElements })`.

### 6.3 **UI for Validation Feedback**

* Utility Panel displays a scrollable list of **error/warning messages**:

  * “Edge e5 references missing node ‘nX’; did you mean ‘n3’?”
  * “Node ID ‘n1’ already exists; choose ‘overwrite’ or ‘skip.’”
* Each message has an inline control (dropdown or link) to “Apply fix” (e.g., select correct node from suggestions).
* “Commit Changes” button only becomes active when all validation issues are resolved.

---

## 7. Graph Creation & Editing Mechanics

### 7.1 **Node Handles for Edge Creation**

* Use **`cytoscape-edgehandles`** plugin:

  ```ts
  import cytoscape from 'cytoscape';
  import edgehandles from 'cytoscape-edgehandles';
  cytoscape.use(edgehandles);

  const eh = cy.edgehandles({
    handleSize: 12,
    handleColor: '#6366f1',
    handleNodes: 'node',
    handlePosition: 'middle top', // position relative to node
    edgeType: () => 'flat',
    complete: (sourceNode, targetNode, addedEles) => {
      // Prompt user to set edge label/weight if desired
    },
  });

  // Enable in manual-edit mode only:
  if (currentMode === 'manualEdit') eh.enable();
  else eh.disable();
  ```
* **Visual Feedback**: Node “pops” slightly on tap to show handle; handle is a small circle.

### 7.2 **Drag‐and‐Drop Node Repositioning**

* Default Cytoscape node dragging:

  ```ts
  cy.nodes().ungrabify(); // ensure nodes are draggable
  ```
* **Long-press** on mobile to “grab” node (handled by Cytoscape’s touch events).
* On drag start, show a small scale animation:

  ```css
  .node-grabbed {
    transform: scale(1.1);
    transition: transform 0.1s ease;
  }
  ```
* On drag end, remove the animation class.

### 7.3 **Double Tap to Rename Node**

* Listen for Cytoscape’s `tap` events with time detection:

  ```ts
  let lastTapTime = 0;
  cy.on('tap', 'node', (e) => {
    const currentTime = new Date().getTime();
    if (currentTime - lastTapTime < 300) {
      openRenameInput(e.target); // inline rename form
    }
    lastTapTime = currentTime;
  });
  ```
* Show a small input overlay positioned at the node’s label, allowing text editing.

### 7.4 **Add Node by Dragging from Blank Space (Manual)**

* In Manual Edit mode, if user **long-presses** on empty canvas, show a “+” node creation button at that location:

  * On hold (500ms), show a translucent circle under finger → on release, open “Create New Node” form with position preset.
  * Form fields: ID (auto if blank), Label, Color, Shape.
  * On confirm, `cy.add({ data: { id, label, ... }, position: { x, y }})`.

### 7.5 **Delete Node/Edge**

* In Manual Edit mode:

  * **Double‐tap node**, show a small trash icon near it.
  * Or **tap node** to select, then Utility Panel shows “Delete Node” button.
* On desktop: right‐click → context menu → “Delete.”

---

## 8. Layout Management & Preservation

### 8.1 **Defining Layout Modes (User-Level Names)**

1. **Manual (Preset)**: “Arrange manually.”
2. **Auto-Arrange (Physics)**: “Run physics simulation.”
3. **Hierarchy (Concentric)**: “Radial hierarchy.”
4. **Flowchart (Dagre)**: “Top-down flow.”
5. **Grid (Matrix)**: “Matrix layout by category.”
6. **Restore Checkpoint**: “Return to saved snapshot.”

### 8.2 **Per-Layout Metadata Tracking**

* When switching away from a layout, **save**:

  ```ts
  layouts[currentLayout] = {
    nodePositions: cy.nodes().reduce((acc, node) => {
      acc[node.id()] = node.position();
      return acc;
    }, {} as Record<string, { x: number; y: number }>),
    lockedNodes: cy.nodes().filter(n => n.locked()).map(n => n.id()),
    edgeLengths: cy.edges().reduce((acc, edge) => {
      acc[edge.id()] = edge.data('length') ?? defaultLength;
      return acc;
    }, {} as Record<string, number>),
    modeParams: currentLayoutParams, // e.g. { edgeLengthBias: 200, spacing: 100 }
  };
  ```

### 8.3 **Switch Layout Algorithm**

```ts
function switchLayout(newLayout: LayoutMode) {
  const old = currentLayout;
  // 1) Save old layout’s data
  saveLayoutMeta(old);
  // 2) Set currentLayout = newLayout
  currentLayout = newLayout;
  // 3) Build Cytoscape layout options
  const meta = layouts[newLayout] || getDefaultLayoutMeta(newLayout);
  const layoutOptions = buildOptionsFor(newLayout, meta);
  // 4) Apply positions (if preset) or run layout
  if (newLayout === 'preset') {
    cy.batch(() => {
      cy.nodes().forEach(node => {
        const pos = meta.nodePositions?.[node.id()];
        if (pos) node.position(pos);
      });
    });
  } else {
    const layoutInstance = cy.layout(layoutOptions);
    layoutInstance.run();
  }
  // 5) Lock nodes if needed
  if (meta.lockedNodes) {
    meta.lockedNodes.forEach(id => cy.getElementById(id).lock());
  }
}
```

* **`buildOptionsFor()`** returns parameters like `idealEdgeLength`, `nodeSpacing`, `rootNode`, etc.

### 8.4 **Node Locking in Layouts**

* In Manual or Layout mode, tapping a locked node toggles `node.lock()` or `node.unlock()`.
* Locked nodes ignore layout repositioning.

---

## 9. Snapshot / Checkpoint System

1. **Saving a Snapshot**

   ```ts
   function saveSnapshot(name: string) {
     const data = {
       name,
       timestamp: Date.now(),
       elements: {
         nodes: cy.nodes().map(n => ({ 
           id: n.id(), label: n.data('label'), color: n.data('color'), shape: n.data('shape'), tags: n.data('tags') 
         })),
         edges: cy.edges().map(e => ({ 
           id: e.id(), source: e.data('source'), target: e.data('target'), length: e.data('length'), color: e.data('color')
         })),
       },
       layouts,
     };
     snapshots.push(data);
     saveToLocalStorage();
   }
   ```

2. **Restoring a Snapshot**

   * In “Layout” mode → secondary tab “Checkpoints” → list of snapshots.
   * On select and confirm:

     ```ts
     cy.json({ elements: snapshot.elements });
     layouts = snapshot.layouts;
     currentLayout = 'preset'; // or stored value 
     restoreLayoutMeta(currentLayout);
     ```
   * Overwrites current graph and layout metadata.

3. **Managing Snapshots**

   * Each snapshot entry shows name, date/time, optional thumbnail.
   * “Delete” icon to remove.
   * “Rename” via inline edit.

---

## 10. Analysis & Metrics

### 10.1 **Available Metrics**

* **Node/Edge Count**: Display summary (e.g., 12 nodes, 15 edges).
* **Connected Components**: Show number; allow highlight.
* **Degree Distribution**: Histogram in Utility Panel (bars: degree vs. count).
* **Centrality**: Compute betweenness/closeness, then highlight top‐N nodes.
* **Cycle Detection**: List cycles or highlight edges in cycles.

### 10.2 **UI Integration**

* **Sidebar → Analyze** → secondary tabs:

  * “Summary” (counts)
  * “Components”
  * “Degree”
  * “Centrality”
* Utility Panel shows charts (e.g., using Chart.js or D3).
* Clicking a metric’s “Highlight” button draws a temporary style on matching nodes/edges (e.g., thick red border).
* Allow filter by node attribute or tag.

---

## 11. Export & Persistence

### 11.1 **Export Options**

* **PNG / SVG**

  ```ts
  cy.png({ full: true, scale: 2 });   // for high‐res
  cy.svg({ scale: 1 });
  ```

  * Show a preview thumbnail in Utility Panel before download.
  * Options: “Include labels?” (boolean), “Background color” (white/transparent).

* **CSV Export**

  * **Nodes.csv**: `id,label,color,shape,tags...`
  * **Edges.csv**: `id,source,target,length,color...`
  * Construct by iterating `cy.nodes()` and `cy.edges()`.

* **JSON Export**

  * **Graph elements only**: `{ nodes: [...], edges: [...] }`
  * **Full state**: include `layouts` and `snapshots`.

* **Copy Link**

  * When backend is added, generate a shareable link containing a graph ID.

### 11.2 **Persistence via LocalStorage**

* On any **significant change** (mode switch, element add/remove, style change, layout parameter change, snapshot create/delete), debounce a save:

  ```ts
  localStorage.setItem('conceptMapAppState', JSON.stringify(appState));
  ```
* On app initialization:

  * Check `localStorage.getItem('conceptMapAppState')`.
  * If exists, prompt “Restore previous session?”
  * On confirm, load into `appState` (Zustand store), update Cytoscape accordingly.

---

## 12. UI/UX Polishing

### 12.1 **Glassmorphism Styling Tiers**

* **Sidebar & Primary Topbar (Level 1)**

  * CSS:

    ```css
    .level1 {
      @apply bg-white dark:bg-slate-800; /* opaque */
    }
    ```
* **Contextual Topbar (Level 2)**

  * CSS:

    ```css
    .level2 {
      @apply bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl;
    }
    ```
* **Utility Panel (Level 3)**

  * CSS:

    ```css
    .level3 {
      @apply bg-white/60 dark:bg-slate-800/60 backdrop-blur-md;
    }
    ```
* **Resize Handles**

  * Slightly darker or lighter line to indicate draggable edge.

### 12.2 **Collapsibility & Resizing**

* **Sidebar**: Collapsible → minimal icon strip.
* **Contextual Topbar**: Always visible but scrollable horizontally if many subtabs.
* **Utility Panel**:

  * Has a small “☰” handle or “⋮” icon to collapse to a thin bar.
  * Draggable edge (`cursor-col-resize` on desktop, `touch‐drag` on mobile) to adjust width (desktop) or height (mobile bottom drawer).

---

## 13. Responsive & Accessibility Considerations

### 13.1 **Responsive Layout**

* **Desktop**:

  * Sidebar visible by default.
  * Utility Panel on right.
  * Contextual Topbar below Primary Topbar.

* **Mobile**:

  * Sidebar hidden behind a hamburger menu in Primary Topbar.
  * Contextual Topbar below Primary Topbar, horizontally scrollable.
  * Utility Panel bottom‐docked, swipe‐up, collapsible.

Use Tailwind breakpoints (`sm:`, `md:`, `lg:`) to switch:

```jsx
<div className="hidden md:block"> {/* Sidebar on md+ */}</div>
<div className="block md:hidden"> {/* Hamburger on mobile */}</div>
```

### 13.2 **Accessibility (ARIA Roles)**

* **Sidebar**: `<nav role="navigation">`
* **Primary Tabs**: `<button role="tab">` with `aria-selected` states
* **Contextual Tabs**: `<div role="tablist"> <button role="tab"> …`
* **Utility Panel**: `<aside role="complementary">`
* **Graph Canvas**: `<div role="region" aria-label="Concept Map Canvas">`
* **Nodes/Edges**: Use `aria-label` or `aria-describedby` for screen readers, e.g., `<div role="button" aria-label="Node: Introduction">`.
* **Forms/Inputs**: Use `<label>` and `aria-labelledby` for rename forms, color pickers, and validation messages.
* **Keyboard Navigation** (Desktop):

  * Tab/Shift+Tab to move focus between toolbar buttons, contextual tabs, form fields.
  * Enter to activate focused button or field.
  * Arrow keys to move between nodes in a list (e.g., when filtering).

---

## 14. Sample User Flows: Step-by-Step

Below are representative user journeys that tie together everything:

### 14.1 **Flow A: Textual Import → Manual Refinement → Export**

1. **Landing**

   * Empty canvas, “Load or Create New” prompt.
2. **Select Data I/O**

   * Contextual Topbar: “Merge | Replace” (toggle).
   * Text area or file upload.
   * User chooses “Replace,” pastes JSON.
3. **Validation**

   * Utility Panel shows schema errors or “All good.”
   * If missing node IDs, show “Did you mean?” suggestions.
   * User corrects or confirms.
4. **Import Success**

   * Canvas displays imported nodes/edges in default “Preset” layout (random positions).
   * Sidebar “Edit,” “Layout,” “Analyze,” “Export,” “Settings” become active.
5. **Manual Edit**

   * User taps a node once → node “pops.”
   * User taps the small handle on top → drags to another node → edge creation; Utility Panel remains hidden.
   * User double‐taps a node → inline text input appears → user renames.
   * User long‐presses on blank space → new node creation prompt.
   * User drags a node to reposition; node locks on “touch‐hold,” pops visually.
6. **Paint Mode**

   * User toggles “Paint Mode” in Primary Topbar or pressing a floating paintbrush icon.
   * Utility Panel appears at bottom with color palette.
   * User selects blue → taps several nodes to color them and optionally check “Color connected edges.”
   * Edges and nodes update style instantly.
7. **Layout Mode**

   * User selects “Layout → Physics” in Contextual Topbar.
   * Utility Panel shows “Edge Length Bias” slider, “Lock Selected Node” toggle.
   * User drags off a node to move it, then locks it.
   * User adjusts “Edge Length Bias” to 300 → Simulation runs → nodes reposition.
   * User taps “Save Checkpoint” in Utility Panel, names “Physics View.”
8. **Export**

   * Click “Export → PNG” in Sidebar.
   * Utility Panel shows preview and “Include labels” toggle.
   * User clicks “Download” → obtains PNG.
9. **Session Persistence**

   * User refreshes or reopens page.
   * App detects saved state in localStorage → prompts “Restore previous session?”
   * User confirms → full graph and layout restored.

### 14.2 **Flow B: Snapshot Navigation & Layout Reversion**

1. **Starting State**

   * Graph is in “Concentric” layout; user is satisfied with radial arrangement.
   * Sidebar > Layout > “Save Snapshot → Radial Map.”
2. **Switch to Grid**

   * User clicks “Layout → Grid.”
   * Utility Panel: “Group by Tag” dropdown.
   * Graph converts to a neat matrix.
3. **Partial Tweak**

   * User drags one node out of grid to position for emphasis.
   * Utility Panel shows “Save Snapshot → Grid Tweak.”
4. **Return to Radial**

   * User clicks “Layout → Checkpoints → Radial Map.”
   * System loads “Radial Map” snapshot → graph returns exactly to that configuration.
5. **Continue Edits**

   * User toggles “Manual Edit” → adds a new node connected to an existing one.
   * System appends this new node into “Radial Map” state.
   * If user switches to “Physics,” the new node participates in simulation automatically.

---

## 15. Implementation Outline

Below is a stepwise plan to bring all components, logic, and UI together.

### 15.1 Project Bootstrapping

1. **Initialize Vite + React + TypeScript**

   ```bash
   npm init vite@latest concept-map-builder --template react-ts
   cd concept-map-builder
   npm install
   ```
2. **Install Dependencies**

   ```bash
   npm install cytoscape cytoscape-edgehandles cytoscape-dagre cytoscape-cola zustand tailwindcss postcss autoprefixer
   npm install @headlessui/react @heroicons/react  # or Radix/ShadCN as chosen
   npx tailwindcss init -p
   ```
3. **Tailwind Setup** (`tailwind.config.js`)

   * Configure color palette, breakpoints, dark mode.

### 15.2 Directory Structure

```
/src
  /components
    Sidebar.tsx
    Topbar.tsx
    ContextTabs.tsx
    UtilityPanel.tsx
    CanvasWrapper.tsx        // Cytoscape instantiation
    NodeHandleManager.tsx    // Edge handling
    ColorPicker.tsx
    LayoutControls.tsx
    DataIOLoader.tsx
    AnalyzePanel.tsx
    ExportPanel.tsx
  /stores
    appState.ts              // Zustand store with AppState schema
  /utils
    validation.ts            // JSON schema + fuzzy match logic
    layoutManager.ts         // save/restore layout meta & switchLayout()
    snapshotManager.ts       // save/restore snapshots
    cytoscapeInit.ts         // initial Cytoscape setup
  /styles
    globals.css              // Tailwind directives & glassmorphism classes
  App.tsx                   // Main app, routing between modes
  main.tsx                  // ReactDOM.render
```

### 15.3 Core Modules & Responsibilities

#### A. **`appState.ts` (Zustand Store)**

* Holds:

  * `elements: { nodes: NodeData[]; edges: EdgeData[] }`
  * `layouts: Record<LayoutMode, LayoutMeta>`
  * `currentLayout: LayoutMode`
  * `mode: InteractionMode`
  * `snapshots: Snapshot[]`
  * `settings: { theme: 'light'|'dark'; inputMode: 'auto'|'mobile'|'desktop' }`
* Provides actions:

  * `setMode()`, `setLayout()`, `saveLayoutMeta()`, `restoreLayoutMeta()`,
  * `addNode()`, `deleteNode()`, `addEdge()`, `deleteEdge()`, `setNodeLabel()`, `setNodeStyle()`, etc.
  * `saveSnapshot()`, `deleteSnapshot()`, `restoreSnapshot()`
  * `saveToLocalStorage()`, `loadFromLocalStorage()`

#### B. **`cytoscapeInit.ts`**

* Exports a function to instantiate Cytoscape:

  ```ts
  export function initCytoscape(container: HTMLElement, appState: AppState) {
    const cy = cytoscape({ container, elements: [], style: [...], layout: { name: 'preset' } });
    // Attach edgehandles
    const eh = cy.edgehandles({ /* config based on appState */ });
    return { cy, eh };
  }
  ```
* Configure base styles:

  ```js
  [
    { selector: 'node', style: { 'background-color': 'data(color)', 'label': 'data(label)', 'shape': 'data(shape)' } },
    { selector: 'edge', style: { 'line-color': 'data(color)', 'width': 2, 'label': 'data(length)' } },
  ]
  ```

#### C. **`layoutManager.ts`**

* Implements `saveLayoutMeta(layout: LayoutMode)` and `applyLayout(layout: LayoutMode)`.
* Exports `buildOptionsFor(layout, meta)`.

#### D. **`validation.ts`**

* Contains:

  * `validateSchema(input: unknown): ValidationResult`
  * `fuzzyMatchId(missingId: string, candidates: string[]): string[]`
  * `mergeElements(existing: AppState.elements, incoming: { nodes; edges }, mode: 'merge'|'replace')`
  * `resolveConflicts()`

#### E. **`snapshotManager.ts`**

* Implements:

  * `saveSnapshot(name: string)`
  * `getSnapshots(): Snapshot[]`
  * `deleteSnapshot(id: string)`
  * `restoreSnapshot(id: string)`

---

## 16. Final Thoughts & Next Steps

We have now:

* **Exhaustively mapped out** the project’s purpose, audience, and feature set.
* Designed a **comprehensive data model** for graph elements, layout metadata, and snapshots.
* Proposed a **state management** architecture (Zustand) to hold all application state.
* Specified a **UI/UX layout**:

  * **Primary Navigation** (Sidebar & Topbar, fully opaque).
  * **Secondary Navigation** (Contextual Topbar, semi‐transparent).
  * **Utility Panel** (Right/Bottom, highly transparent, collapsible, resizable).
  * **Canvas** (Cytoscape viewer in center).
* Defined **interaction modes** with precise gesture mappings (mobile & desktop).
* Laid out a **textual load/validate/merge pipeline** with fuzzy matching and merge/replace options.
* Specified methods for **manual graph editing** (node/edge creation, rename, drag, lock).
* Integrated **graph handles** via `cytoscape-edgehandles`.
* Detailed **layout modes** and **metadata preservation** across transitions, plus **snapshot system**.
* Enumerated **analysis, export, and persistence** features.
* Addressed **mobile responsiveness** and **accessibility**.

### Implementation Sequence

1. **Bootstrap project** (Vite + React + TypeScript + Tailwind).
2. **Set up Zustand store** with full `AppState` schema.
3. **Initialize Cytoscape** wrapper with edgehandles.
4. **Build Sidebar & Topbar components**, wired to store’s `mode` and `currentLayout`.
5. **Implement Utility Panel** with context‐sensitive content (color picker, layout sliders, data I/O forms).
6. **Create `validation.ts`** module to handle JSON load.
7. **Wire data I/O forms** to call `validateSchema()` and merge/replace.
8. **Implement manual editing** logic in `CanvasWrapper`, hooking into modes & Cytoscape events.
9. **Implement layoutManager** for saving/applying layout metadata.
10. **Build snapshotManager** for save/restore functionality.
11. **Hook up Analysis panel** with simple graph metric computations.
12. **Add Export functions** for PNG/SVG/CSV/JSON.
13. **Polish UI**: Tailwind classes, glassmorphism, responsive transitions, collapsible panels.
14. **Accessibility audit**: ARIA roles, keyboard nav, color contrast.

Once this skeleton is in place, iterative refinement can add features like undo/redo, mini‐map, and collaboration. This plan, if executed step by step, yields a robust, user‐friendly concept map builder capable of both text‐driven and manual editing, layout exploration, styling, persistence, and export—across mobile and desktop contexts.

This completes the **definitive, exhaustive, structured, and objective plan** for your concept map application.
