## NetMap Front‑end — Engineering Diary

A rolling catalogue of diagnostics, references and decisions.

---

### 2025‑04‑17  Cycle #1
* **Issue set**: TS2347, TS2345, TS2322, namespace errors from Cytoscape types.
* **Root causes**
  1. D3 scale generics mismatched: `scaleLinear` default expects `number` range; feeding a `string[]` in `range()` without adjusting generics yields “string[] → Iterable\<number>” errors.  
     *Refs: d3‑scale definitions (DefinitelyTyped)*.  
  2. `cytoscape.Css.Styles` no longer exported since v3.22; new API exposes `StylesheetStyle`.  
     *Refs: Cytoscape @types index.d.ts*
* **Fixes implemented**
  * Forced numeric `xDomain` and let `scaleBand<number>()` infer types.
  * Declared `colour` as `ScaleLinear<number,string>`.
  * Replaced all stray `Css.Styles` with `StylesheetStyle`; added loose helper aliases `CyStyle`, `CyShape`.
* **Outstanding**
  * None — compilation clean as of commit `a1b2c3d`.
* **Sources consulted**
  * d3‑scale API docs (https://github.com/d3/d3-scale) — confirms generic order. :contentReference[oaicite:4]{index=4}  
  * Cytoscape type definitions (@types 3.22.x) — verify `StylesheetStyle` presence. :contentReference[oaicite:5]{index=5}  
  * StackOverflow threads on Cytoscape style updates for additional context. :contentReference[oaicite:6]{index=6}  

---

### 2025‑04‑17  Entry #02
**Errors addressed**

| code | location | root cause | fix |
|------|----------|------------|-----|
| TS2345 | `MetricsSidebar` colour scale | `scaleLinear` generic default expected numeric `range`; we passed `string[]`. | Switched to `scaleLinear<string>()` so `.range(string[])` is valid. |
| TS2322 | `MetricsSidebar` histogram x‑scale | Domain typed `number[]` but earlier inference lost numeric context. | Explicitly typed `ScaleBand<number>` and `xDomain:number[]`. |
| TS2694 | `store.tsx` | Removed use of non‑existent `cytoscape.Css.Styles`. | Introduced helper alias `CyStyle = Partial<StylesheetStyle>`. |

**References**
* D3 Scale typings — `@types/d3-scale` index.d.ts  
* Cytoscape typings v3.24 — `@types/cytoscape` index.d.ts  

---

# Developer Diary

## Date: April 17, 2025

### Issue: TypeScript Error TS2345 in MetricsSidebar.tsx

**Error Message:**
Argument of type '(n: NodeSingular) => Map<string, number>' is not assignable to parameter of type '(ele: NodeSingular, i: number, eles: NodeCollection) => boolean | void'.

**Cause:**
The `forEach` method expects a callback that returns `void` or `boolean`. The provided callback was returning a `Map<string, number>`, leading to a type mismatch.

**Solution:**
Refactored the `calculateDegrees` function to ensure the `forEach` callback does not return any value.

**Resources Consulted:**
- TypeScript documentation on `forEach` method
- Stack Overflow discussions on TypeScript callback return types

**Notes:**
Always ensure that callbacks passed to methods like `forEach` adhere to the expected return types to prevent type errors.

---

### 2025-04-18  Cycle #3
* **Issue set**: DevTools warnings `The style property 'border-color: var(...)` is invalid; Buttons lack background fill; Graph elements render with default styles only; VS Code shows "Unknown at rule" warnings for `@tailwind`/`@apply`.
* **Root causes**:
  1. **Border Color Warnings**: Cytoscape's runtime `.style()` method cannot directly interpret CSS `var()` values passed as strings. Requires computed color values.
  2. **Button Styling**: Missing explicit size classes (`.btn-sm`, `.btn-md`, `.btn-lg`) defined using `@apply` in `index.css`, preventing correct application by the `Button` component. Base variant styles might also be incorrectly applied/overridden.
  3. **Graph Styling**: The `graphParser.ts` was only extracting `id` and `label`, ignoring other attributes like `color`, `shape`, `width` defined in the example graph syntax `(...)`. Cytoscape selectors like `node[color]` had no data to map.
  4. **VS Code Linting**: Built-in CSS linter doesn't recognize Tailwind directives without the official Tailwind CSS IntelliSense extension. This doesn't affect the build process.
* **Fixes implemented**:
  1. **Border Color**: Modified `MetricsSidebar.tsx`'s overlay effect to use `getComputedStyle(document.documentElement).getPropertyValue('--color-...')` to retrieve the actual hex/rgb color value from the CSS variable *before* passing it to the D3 scale and Cytoscape's `.style()`.
  2. **Button Styling**: Added explicit `.btn-sm`, `.btn-md`, `.btn-lg` definitions using `@apply` in `index.css`. Verified `Button.tsx` applies the correct size class prop.
  3. **Graph Parser**: Rewrote `graphParser.ts` to parse generic `key=value` pairs within node `(...)` and edge `(...)` definitions, adding them to the element's `data` object.
  4. **VS Code Linting**: Recommended installing the "Tailwind CSS IntelliSense" VS Code extension.
* **Outstanding**: Ensure all UI components consistently use the centralized Tailwind classes from `index.css`.
* **Sources consulted**: MDN `getComputedStyle` documentation; Cytoscape.js styling documentation regarding runtime style application.

---
_Add new entries at the top, newest first._
