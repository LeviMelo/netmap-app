**Project Roadmap: Cytoscape‐Powered Concept Map Builder**

This roadmap breaks the project into ten sequential phases. Each phase contains explicit, actionable tasks that guide you from initial planning through final deployment and maintenance. Wherever relevant, we incorporate the requirement that **outgoing edges inherit their source node’s color by default**, with special handling when the source is a “connector node.”

---

## Phase 1: Project Scoping & Requirements Consolidation

1. **Reconfirm Core Objectives**

   * Define primary user goals: text‐to‐graph import, manual editing, layout exploration, styling, analysis, export, persistence.
   * Reiterate mobile‐first and desktop support.

2. **Finalize Feature List**

   * Data I/O: Merge/Replace toggle, validation with fuzzy prompts.
   * Manual edit: Node/edge create, delete, rename, reposition.
   * Painting: Color palette, default color inheritance for outgoing edges, connector‐node exceptions.
   * Layout modes: Preset, Physics, Concentric, Dagre, Grid.
   * Snapshot/Checkpoint system.
   * Analytics: Connected components, degree distribution, centrality, cycle detection, filtering.
   * Export: PNG, SVG, CSV, JSON.
   * Persistence: LocalStorage for demo; future backend.
   * Accessibility: ARIA roles, keyboard support, color‐contrast compliance.

3. **Define Data Model & State Structure (Conceptually)**

   * Outline node and edge attribute schemas (ID, label, color, shape, tags, locked flag, length).
   * Describe per‐layout metadata (positions, locked nodes, custom edge lengths, layout parameters).
   * Describe snapshot structure (name, timestamp, entire graph + layout metadata).

4. **Confirm “Connector Node” Mode**

   * Clarify that in “connector‐node” maps, edges have no label text; instead, each connector word/phrase is a distinct node.
   * Determine that when a node is designated as a connector node, its outgoing edges should **not** inherit connector node’s color automatically—instead, they adopt default edge styling or remain colorless until explicitly restyled.

5. **Create High‐Level UI Wireframes (Sketch Only)**

   * Sidebar with primary tabs.
   * Contextual topbar with secondary tabs.
   * Canvas placeholder.
   * Utility panel placement and collapsible/resizable behavior.
   * Mark where glassmorphism opacity tiers apply (opaque sidebar/topbar, semi‐transparent context bar, highly transparent utility panel).

6. **Define Interaction Gestures**

   * Single tap/select, double‐tap/rename, long‐press + drag/node reposition, node‐anchor drag → edge creation.
   * Two‐finger pan, pinch zoom.
   * Edge creation handle behavior (visible only in manual‐edit mode).

7. **Establish Accessibility Guidelines**

   * Enumerate required ARIA roles for each region (sidebar, tabs, canvas, utility panel).
   * Determine keyboard navigation flow (tabbing order, Enter/Space activation, arrow‐key navigation in lists).

**Phase 1 Deliverables:**

* Written requirements document.
* High‐level UI wireframes.
* Interaction gesture list.
* Data model schema outline.
* Accessibility checklist.

---

## Phase 2: Environment & Architectural Setup

1. **Initialize Project Repository**

   * Create a new repository on GitHub named “concept‐map‐builder.”
   * Set up `README.md` with project overview and basic instructions.
   * Configure `.gitignore` for Node modules, build artifacts.

2. **Tooling & Dependencies Planning (No Code Yet)**

   * Decide on React + TypeScript + Vite for front end.
   * Confirm use of Tailwind CSS for styling.
   * Plan Cytoscape.js plus `cytoscape‐edgehandles`, `cytoscape‐dagre`, `cytoscape‐cola`.
   * Plan for state management with Zustand.
   * Outline configuration files needed: `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`.

3. **Folder Structure Blueprint (Conceptual)**

   * `/src/`

     * `/components/`
     * `/stores/`
     * `/utils/`
     * `/styles/`
   * `/public/` (static assets)
   * `/README.md`, `/LICENSE`, `/package.json`, etc.

4. **Project Timeline & Milestones Document**

   * Draft a high‐level timeline (e.g., four to six weeks) with milestones for each major phase.
   * Assign rough time estimates to each phase’s tasks.

5. **Final Approval & Kickoff**

   * Review Phase 1 deliverables with stakeholders (or self).
   * Finalize sign‐off on architecture and data model.
   * Create “Project Kickoff” checklist (issues or task board ready).

---

## Phase 3: Core State Management & Data Structures

1. **Design Zustand Store Schema (Conceptual)**

   * Define state slices:

     * **Graph Elements**: `nodes: NodeData[]`, `edges: EdgeData[]`.
     * **Layout Metadata**: `layouts: Record<LayoutMode, LayoutMeta>`.
     * **Interaction Mode**: `'view'|'manualEdit'|'paint'|'layout'|'dataIO'`.
     * **Current Layout**: `LayoutMode`.
     * **Snapshots**: `Snapshot[]`.
     * **Settings**: Theme, Input Mode.

2. **List All Store Actions (Pseudo)**

   * `setMode()`, `addNode()`, `deleteNode()`, `addEdge()`, `deleteEdge()`, `updateNodeColor()`, `updateEdgeColor()`, `lockNode()`, `unlockNode()`, `saveLayoutMeta()`, `applyLayout()`, `saveSnapshot()`, `restoreSnapshot()`, `saveToLocalStorage()`, `loadFromLocalStorage()`, etc.

3. **Define Data Validation Utilities (Conceptual)**

   * Specify functions (without code) that:

     * Check duplicate IDs.
     * Check missing node references.
     * Provide fuzzy matching suggestions.
     * Merge vs. replace logic.

4. **Plan Snapshot Manager (Conceptual)**

   * Describe:

     * How to capture a snapshot (“freeze” elements + layouts).
     * How to list, rename, delete snapshots.
     * How to restore a snapshot (overwriting current state).

5. **Review and Finalize Data Model Documents**

   * Ensure NodeData, EdgeData, LayoutMeta, and Snapshot structures are fully specified.

**Phase 3 Deliverables:**

* Zustand store schema specification (written).
* List of store actions and state slices.
* Validation utility specification.
* Snapshot manager design.

---

## Phase 4: UI Skeleton & Layout Implementation Plan

1. **Define Primary & Contextual Navigation Components (Paper Design)**

   * **Sidebar**: vertical list of primary tabs (Home/Data I/O, Edit, Layout, Analyze, Export, Settings).
   * **Primary Topbar**: shows selected primary tab’s label and optional global controls (theme toggle).
   * **Contextual Topbar**: below Primary Topbar, shows sub‐tabs for active primary tab.

     * Example: Under “Edit” → “Nodes” | “Edges” | “Tags”.
     * Under “Layout” → “Manual” | “Physics” | “Hierarchy” | “Flow” | “Grid” | “Snapshots”.
   * Indicate in wireframe how these bars will use **glassmorphism**:

     * Level 1: opaque background.
     * Level 2: 80% opacity + backdrop blur.

2. **Design Utility Sidebar / Bottom Panel (Wireframe)**

   * Sketch two variants:

     * **Desktop**: vertical panel on the right (collapsible, resizable).
     * **Mobile**: bottom drawer (collapsible, resizable height).
   * Outline where **style controls**, **layout parameters**, **validation messages**, and **analysis charts** will appear, depending on mode.

3. **Sketch Canvas Area Behavior**

   * Central area where Cytoscape renders the graph.
   * Container must resize responsively when navigation bars show/hide.
   * Indicate minimum margins so that nodes/labels near edges remain fully visible.

4. **Finalize Gesture Map Overlay on Wireframe**

   * Annotate that in **Manual Edit mode**, tapping a node shows a small handle; dragging from that handle initiates edge creation.
   * Tapping/holding on a node “pops” it to indicate it can be moved.
   * Pinch to zoom, two‐finger pan indicted with arrow icons for mobile.
   * Double‐tap to rename node.
   * In **Paint mode**, tapping a node applies selected color immediately (no handles visible).

5. **Glassmorphism & Opacity Design Specification**

   * Sidebar & Primary Topbar: `opacity: 1.0`   (dark mode: `bg-slate-800/100`)
   * Contextual Topbar: `opacity: 0.8` + `backdrop-blur-xl`
   * Utility Panel: `opacity: 0.6` + `backdrop-blur-md`
   * Document color tokens and transparency percentages for light/dark modes.

6. **Accessibility Annotations on UI Sketches**

   * Mark ARIA roles:

     * `<nav role="navigation">` around Sidebar and Contextual Topbar.
     * `<aside role="complementary">` for Utility Panel.
     * `<main role="region" aria-label="Graph Canvas">` for canvas area.
   * Indicate focus outlines on interactive buttons, tabs, form fields.

7. **Finalize Responsive Breakpoints**

   * **Mobile**: `< 768px` → Sidebar collapses into a hamburger; Contextual Topbar stacks; Utility Panel bottom-docked.
   * **Tablet/Desktop**: `>= 768px` → Sidebar always visible (collapsible), Contextual Topbar horizontal, Utility Panel right‐docked.

**Phase 4 Deliverables:**

* High‐fidelity wireframes or detailed sketches of each UI region (desktop + mobile).
* Interaction gesture annotations on UI.
* Accessibility role placements.
* Glassmorphism transparency guidelines.

---

## Phase 5: Core Interaction Modes & Gesture Specification

1. **Define InteractionMode Enumerations**

   * `view`
   * `manualEdit`
   * `paint`
   * `layout`
   * `dataIO`
   * `analyze`
   * `export` (optional separate mode)

2. **Map Out Each Mode’s Gesture Set (Mobile & Desktop)**

   * **View Mode (Always Active)**

     * Desktop: click to select, scroll/ctrl‐scroll to zoom, click‐drag background to pan.
     * Mobile: tap to select, pinch to zoom, two‐finger drag to pan.

   * **Manual Edit Mode**

     * Desktop:

       * Click + drag node → reposition.
       * Shift + drag from node → edge creation.
       * Double‐click on node label → rename.
       * Right‐click → context menu (delete, lock).
     * Mobile:

       * Tap node → “pop” animation → show small handle.
       * Drag handle → edge creation to another node.
       * Tap‐hold + drag node → reposition; node “pops” to indicate movable.
       * Double‐tap node → inline rename form.
       * Tap‐hold blank canvas → “add new node” at release point.

   * **Paint Mode**

     * Desktop:

       * Click node/edge → apply selected color.
       * Ctrl+click multiple → multi‐select + paint all.
       * Ctrl+drag over nodes → paint sweep.
     * Mobile:

       * Tap node/edge → apply color.
       * Drag finger over multiple nodes → paint each in sequence.

   * **Layout Mode**

     * Desktop:

       * Click layout subtab → Utility Panel shows parameters.
       * Click “Apply” → run layout algorithm.
       * Click node → lock/unlock.
       * Drag node (optional manual tweak).
     * Mobile:

       * Tap layout subtab → parameters appear in bottom drawer.
       * Tap “Apply” → layout runs.
       * Tap node → toggle lock (icon appears/disappears).
       * Tap‐hold + drag node → reposition (if desired).

   * **Data I/O Mode**

     * Desktop & Mobile:

       * Utility Panel shows “Merge | Replace” toggle and text input or file upload.
       * Tap/Click “Validate” → errors appear in panel → tap suggestion to fix.
       * Upon resolution, tap “Import.”

   * **Analyze Mode**

     * Desktop: click metric button → results chart appears; tap “Highlight” to apply.
     * Mobile: tap metric tab → bottom drawer shows results; tap “Highlight” to apply.

   * **Export Mode** (if considered separate)

     * Desktop: click export subtab → Utility Panel shows format options + preview.
     * Mobile: same in bottom drawer.

3. **Resolve Gesture Conflicts via “Lock Canvas” Feature**

   * In **any mode** except “view” and “analyze,” default to **lock canvas** behavior:

     * Zoom and pan disabled until user toggles “Unlock Canvas” temporarily.
   * Provide a small toggle button in Primary Topbar (e.g., a “🔒” icon) that the user can tap to unlock for pan/zoom.
   * On desktop, contextual instructions appear: “Hold spacebar + drag to pan” if canvas is locked in manual/edit modes.

4. **Connector-Node Color Inheritance Rule**

   * Whenever a **new edge** is created from a regular node in **Manual Edit** or **Paint** mode, it **inherits the source node’s color** by default.
   * If the source node has a flag `isConnectorNode = true`, then **new edges never inherit**; they use the default uncolored style until explicitly colored by the user.
   * Similarly, in “Merge” operations, if an imported edge lacks a color, assign it from its source node unless source is a connector node.

5. **Integrate Color Inheritance into Mode Descriptions**

   * **Manual Edit Mode**:

     * “Create Edge” action: assign color logic.
   * **Paint Mode**:

     * “Paint Node” action: automatically apply color to existing outgoing edges if source is not a connector.
   * **Data I/O Mode**:

     * During merge/replace, imported edges with no color receive source node’s color if source is not connector.

**Phase 5 Deliverables:**

* Detailed gesture‐to‐action map for each interaction mode.
* “Lock Canvas” toggle design and rules.
* Color inheritance specification (including connector‐node exception).

---

## Phase 6: Data I/O & Validation Workflow

1. **Design Data I/O UI in Utility Panel**

   * Display **Merge | Replace** toggle at top.
   * Below, show a text area for JSON paste and a “Choose File” button for file upload.
   * Below that, show “Validate” button.

2. **Define Validation Steps (Without Code)**

   * **Schema Conformance**: Must have `nodes` and/or `edges` arrays.
   * **Unique ID Enforcement**:

     * If Replace mode: require node IDs present, unique.
     * If Merge mode: check for duplicates, present options to overwrite, skip, or auto‐rename.
   * **Referential Integrity**: Every `edge.source` and `edge.target` must resolve.
   * **Fuzzy Suggestions**: For each missing reference, compute similarity to existing node IDs. Present top suggestions in a dropdown so user can pick correct ID.

3. **UI‐Driven Conflict Resolution**

   * Show a list of validation issues in Utility Panel:

     * “Edge e5 references missing node ‘nX’ → did you mean ‘n3’ or ‘nx’?” (select from list via dropdown).
     * “Node ID ‘n2’ already exists → overwrite or skip?” (radio buttons).
   * Include “Apply All as Overwrite” checkbox if user prefers mass resolution.

4. **Merge vs. Replace Logic**

   * **Replace**: Only allow import if the entire graph (nodes, edges) is valid. If partially invalid, block “Import” button until resolved.
   * **Merge**: Allow edges‐only or nodes‐only imports by default; for node imports, require ID uniqueness resolution; for edge imports, require source/target existence or fuzzy resolution.

5. **Final “Import” Action**

   * On clicking “Import” after validation:

     * If Replace: clear existing `elements`, then load new.
     * If Merge: add new nodes and edges to existing state.
   * For each imported edge lacking explicit color, assign `edge.color = sourceNode.color` unless `sourceNode.isConnectorNode === true`.
   * For each imported node, if `tags` or `color` unspecified, assign defaults (e.g., `color = #cccccc`).

6. **Utility Panel Feedback**

   * Show a summary of import result: “5 nodes added, 3 nodes overwritten, 4 edges added.”
   * If any warnings remain (e.g., unused nodes), show them.

**Phase 6 Deliverables:**

* Fully defined Data I/O user interface flows.
* Validation checklist with UI resolution steps.
* Merge/Replace logic documented, including default edge color inheritance.

---

## Phase 7: Manual Edit & Painting Implementation Plan

1. **Manual Edit Mode Integration**

   * **Graph Handle Activation**: Describe that when `mode === 'manualEdit'`, the Cytoscape EdgeHandles plugin is enabled; else disabled.
   * **Reposition Feedback**:

     * When user long‐presses a node on mobile or clicks/holds on desktop, node “pops” (slightly scales up visually) to signal drag readiness.
   * **Double‐Tap Rename**:

     * When user double‐taps or double‐clicks a node (depending on device), show an inline text input overlay on the node label.
   * **Add Node Gesture**:

     * When user long‐presses blank canvas, show a transient “+” icon; on release, open a small form (ID, Label, Color, Shape).
   * **Delete Node/Edge**:

     * Node: long‐press on existing node (manual‐edit mode) shows “Delete” option in a small contextual popover.
     * Edge: tap edge to select, then Utility Panel shows “Delete Edge” button.
   * **Lock/Unlock Node**:

     * Tapping a small lock icon on node overlay toggles its locked state (persisted across layouts).

2. **Painting Mode Integration**

   * **Toggle into Paint Mode** from Primary Topbar or by tapping a paintbrush icon.
   * **Color Palette UI** in Utility Panel:

     * Show a selection of predefined swatches + a color picker.
     * Show a “Propagate to Outgoing Edges” checkbox.
   * **Tap Node/Edge** to apply style:

     * If user taps a node, assign `node.color = selectedColor`.
     * If “Propagate to Outgoing Edges” is checked and `node.isConnectorNode === false`, assign each outgoing edge `edge.color = selectedColor`.
     * If `node.isConnectorNode === true`, skip edge inheritance.
   * **Drag to Paint Multiple**:

     * If user drags finger across multiple nodes (mobile) or shift + click‐drag (desktop), apply color to each in sequence.

3. **UI/UX Details**

   * In Paint Mode, hide edge‐creation handles and manual‐edit controls to avoid conflicts.
   * Show a small floating indicator near the finger cursor or mouse pointer that displays the currently selected color.
   * In Utility Panel, include a “Reset to Default Colors” button that reverts all edges to default (overrides any inheritance).

**Phase 7 Deliverables:**

* Detailed manual‐edit mode behavior specification (gestures, visual feedback).
* Detailed painting mode specification (UI controls, color inheritance rules, connector exceptions).
* Screenshots or wireframes of inline rename and color palette.

---

## Phase 8: Layout Engine Integration & Preservation

1. **Define Layout Modes Conceptually**

   * **Preset (Manual)**: User‐controlled positions, no automatic reposition unless user drags.
   * **Physics (Auto‐Arrange)**: Force‐directed simulation (cola/cose).
   * **Hierarchy (Concentric)**: Radial layout around selected root node.
   * **Flow (Dagre)**: Directed acyclic flowchart oriented top‐down or left‐right.
   * **Grid (Matrix)**: Tabular arrangement, grouping by selected tag or property.

2. **Layout Metadata Specification**

   * For each mode, store:

     * `nodePositions: Record<nodeId, {x, y}>`
     * `lockedNodes: nodeId[]`
     * `edgeLengths: Record<edgeId, number>` (for Physics)
     * `modeParams: { key: value }` (e.g., edge length bias, spacing, orientation, root node ID)

3. **User Flow for Layout Switching**

   * In **Sidebar → Layout**, user clicks a layout name → Contextual Topbar shows that layout’s secondary controls → Utility Panel displays sliders/toggles.
   * Upon clicking “Apply”:

     * **Save** current layout’s metadata
     * **Apply** Cytoscape layout algorithm with loaded metadata or defaults
     * **Lock** nodes flagged in `lockedNodes`
   * When user drags a locked node in layout mode, toggle unlock state or prompt “Unlock to move.”

4. **Snapshot and Restore Mechanism**

   * Within Layout mode secondary tabs, include a “Snapshots” subtab.
   * Utility Panel lists saved snapshots with “Restore” and “Delete” buttons.
   * On “Restore,” clear existing canvas, load elements + layout data from snapshot, apply to Cytoscape.

5. **Connector‐Node Color Handling During Layout**

   * Whenever a layout runs, nodes and edges may be repositioned but their colors remain unchanged.
   * Layout transitions should **not** override any node or edge color; they remain static until user repaints.
   * If the user adds a new edge post‐layout, color inheritance rules apply as described in Phase 7.

6. **UI/UX Details for Layout Controls**

   * **Physics**: “Edge Length Bias” slider (range 0–500), “Node Repulsion” slider (e.g., 0–1000), “Start/Pause Simulation” toggle, “Lock Selected Node” button.
   * **Hierarchy**: “Select Root Node” dropdown, “Level Spacing” slider, “Direction” toggle (inward vs. outward).
   * **Flow**: “Orientation” radio (TB vs. LR), “Rank Separation” slider, “Orthogonal Edges” checkbox.
   * **Grid**: “Group by Tag” dropdown, “Columns” number input, “Row Padding” & “Column Padding” sliders.

**Phase 8 Deliverables:**

* Written layout metadata specs for each mode.
* Detailed user flow for switching layouts and saving/restoring snapshots.
* UI mockups for each layout’s parameter controls.
* Explanation of color‐preservation during layout and new edge color inheritance.

---

## Phase 9: Analysis Tools, Export & Persistence

1. **Design Analysis UI**

   * **Sidebar → Analyze** → secondary tabs: “Summary,” “Components,” “Degree,” “Centrality,” “Cycles.”
   * Utility Panel displays:

     * Summary: Node count, edge count.
     * Components: Number of connected components; “Highlight Components” button.
     * Degree: Bar chart of degree distribution with “Highlight High-Degree Nodes (threshold)” input.
     * Centrality: List of nodes sorted by centrality, “Highlight Top N.”
     * Cycles: List of cycles or “No cycles found.”

2. **Export UI & Options**

   * **Sidebar → Export** → secondary tabs: “PNG,” “SVG,” “CSV,” “JSON.”
   * Utility Panel for each tab:

     * **PNG/SVG**: “Include Labels” toggle, “Background Color” (white/transparent), “Scale (1×, 2×, 3×).”
     * **CSV**: “Download Nodes CSV,” “Download Edges CSV.”
     * **JSON**: “Graph Only” vs. “Full App State (elements + layouts + snapshots).”

3. **Persistence Strategy**

   * On any meaningful change, **debounce** (e.g., 500ms) a save to LocalStorage:

     * Serialize full `AppState` (elements, layouts, mode, snapshots, settings).
   * On app startup, check for existing LocalStorage key:

     * If present, prompt “Restore previous session?”
     * If user confirms, load state into store and rehydrate Cytoscape.

4. **Edge Color Inheritance on Import & Merge**

   * When merging edges in Data I/O mode:

     * For each imported edge, if no explicit color provided, assign `edge.color = sourceNode.color` unless `sourceNode.isConnectorNode === true`.
     * Document this behavior in “Import Data” UI as a note (“Edges inherit source color by default unless source is a connector.”).

5. **Final Accessibility Checks**

   * Verify all interactive controls have ARIA attributes (e.g., `aria‐selected`, `aria‐label`).
   * Ensure color palettes have high‐contrast alternatives.
   * Test keyboard navigation for each mode on desktop.
   * Ensure screen‐reader labels for nodes, edges, form errors.

**Phase 9 Deliverables:**

* UI designs for analysis panels, export panels, and persistence prompts.
* Written runtime behavior for edge color inheritance on import.
* Accessibility audit checklist and remediation plan.

---

## Phase 10: Testing, Polishing, & Deployment

1. **Develop Comprehensive Test Plan**

   * **Unit tests** for validation utilities (ID checks, fuzzy matching, merge logic).
   * **Integration tests** for store actions (adding/deleting nodes, switching layouts, snapshot restore).
   * **End‐to‐End (E2E) tests** simulating user flows:

     * Import → Validate → Merge → Edit → Paint → Layout → Export.
     * Mobile simulation: pinch-to-zoom, drag-to-create-edge, double-tap-rename.

2. **Bug Triaging & UX Refinements**

   * Gather all discovered issues; categorize as “Critical,” “Major,” “Minor.”
   * Refine visual feedback: ensure node “pop” animation is smooth and not distracting.
   * Tweak glassmorphism backgrounds for legibility (adjust opacity based on contrast testing).
   * Optimize performance for large graphs:

     * Test with 100+ nodes; ensure Cytoscape remains responsive.
     * Lazy‐load or virtualize lists in Utility Panel (snapshots, validation messages).

3. **Final UI/UX Polishing**

   * Ensure the **“Lock Canvas”** toggle logic is explained in a brief tooltip or help section.
   * Confirm that **connector node** workflows are clear to users:

     * Provide a toggle in Settings: “Use connector nodes instead of edge labels.”
     * If enabled, any edge the user attempts to label has an option to create a connector node instead.
   * Verify that default color inheritance does not occur if source node is a connector.
   * Validate that Utility Panel hides/shows at correct times, and that its collapse/resize handle works smoothly.

4. **Prepare Deployment**

   * **Build for Production** using Vite: optimize assets, minify, tree‐shake.
   * **Configure GitHub Pages**:

     * Push `dist/` output to `gh-pages` branch.
     * Ensure correct `base` path in Vite config.
   * **Write Deployment Guide** in `README.md` for contributors.

5. **Post‐Launch Monitoring & Maintenance**

   * Set up a simple issue template for bug reports or feature requests.
   * Plan periodic refresh of dependencies (e.g., Cytoscape, React).
   * Consider adding analytics to measure user flow (if backend added later).

---

## Summary of Roadmap Milestones

| Phase  | Main Focus                                 | Key Deliverable                                                                                                                                                                              |
| ------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | Project Scoping & Requirements             | Requirements doc, feature list, data model schema, wireframes, gesture map, accessibility guidelines.                                                                                        |
| **2**  | Environment & Architecture Setup           | Repo initialized, tooling plan, folder structure blueprint, timeline/milestones doc, kickoff checklist.                                                                                      |
| **3**  | State Management & Data Structures         | Zustand store schema, list of store actions, validation utility spec, snapshot manager design.                                                                                               |
| **4**  | UI Skeleton & Layout Implementation Plan   | High‐fidelity wireframes (desktop/mobile), interaction annotations, accessibility roles, glassmorphism opacity guidelines, responsive breakpoints.                                           |
| **5**  | Interaction Modes & Gesture Specification  | Complete mapping of gestures to actions for each `InteractionMode`, “Lock Canvas” behavior, color inheritance rules, connector‐node exception documented.                                    |
| **6**  | Data I/O & Validation Workflow             | Data I/O UI design, validation steps & conflict resolution UI spec, Merge/Replace logic doc, color inheritance on import rules.                                                              |
| **7**  | Manual Edit & Painting Implementation Plan | Manual Edit mode details (gestures, visual cues, handle behavior), Painting mode details (color palette, inheritance, exceptions), UI renditions of inline rename and color palette.         |
| **8**  | Layout Engine Integration & Preservation   | Detailed specs for each layout mode, metadata schema, layout switch flow, snapshot system, UI designs for layout parameters, color preservation rules during layout.                         |
| **9**  | Analysis Tools, Export & Persistence       | Analysis UI flows and charts spec, Export UI flows (PNG/SVG/CSV/JSON), LocalStorage persistence strategy, final accessibility checks, color inheritance documentation for imported edges.    |
| **10** | Testing, Polishing, & Deployment           | Test plan (unit, integration, E2E), bug triage and UX refinements, UI polishing (glassmorphism, toggle behaviors), production build config, GitHub Pages deployment guide, maintenance plan. |

Upon completion of these ten phases, you will have a **fully realized**, **mobile‐friendly**, **feature-rich** concept map builder that:

* Empowers users to **load**, **edit**, **style**, **layout**, **analyze**, **snapshot**, **export**, and **persist** complex graphs.
* Ensures **outgoing edges** inherit their source node’s color by default—except when the source is a designated **connector node**, in which case edges remain uncolored until explicitly styled.
* Provides a **seamless** yet **mode-driven** experience, preventing gesture conflicts while maximizing intuitive touch/mouse interactions.
* Maintains **accessibility**, **performance**, and **maintainability** across both desktop and mobile devices.
* Uses **glassmorphism** consistently to denote UI hierarchy: opaque primary navigation, semi-transparent context tabs, and highly transparent utility panels.

This roadmap can now serve as a comprehensive guide for development, ensuring no requirement is overlooked and every interaction is thoughtfully designed. Good luck!
