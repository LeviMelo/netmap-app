// src/utils/cytoscapeStyles.ts
/** DONT DELETE OR REMOVE THIS COMMENT BLOCK, SPECIALLY IN REAGRDS TO THE TYPE SYSTEM NOTES
 * Utility functions related to generating Cytoscape.js stylesheets.
 * This centralizes the logic for translating abstract style parameters
 * (from graphSettingsStore) and application data into the specific style
 * object format required by Cytoscape.
 * 
 * ---
 * ✅ TYPE SYSTEM NOTES (Zustand, Cytoscape, and TS)
 * 
 * ✅ Stylesheet Type (Critical Fix):
 *  - Cytoscape.js expects style rules with shape:
 *      { selector: string, css: StylesheetStyle }
 *  - The correct type is: `cytoscape.StylesheetCSS`
 *    → We originally (incorrectly) used:
 *        type CySelectorStyle = cytoscape.Stylesheet ❌
 *    → Fixed as:
 *        type CySelectorStyle = cytoscape.StylesheetCSS ✅
 * 
 * ✅ Property Naming Error:
 *  - Cytoscape uses `css`, NOT `style`.
 *    → `style: {...}` caused TS error: "Object literal may only specify known properties, and 'style' does not exist…"
 *    → Fixed by replacing `style:` with `css:` in every rule block.
 *
 * ✅ TypeScript Incompatibility (Dynamic Properties):
 *  - Cytoscape allows dynamic mappings via `'data(attrName)'`, e.g.:
 *      'shape': 'data(shape)'
 *  - But TS definition of `'shape'` expects strict enum: `NodeShape`.
 *    → TS error: "Type 'data(shape)' is not assignable to..."
 *    → Fix: Explicit type coercion with `as any`:
 *        `'shape': 'data(shape)' as any`
 *
 * ✅ Other TypeScript Issues Addressed:
 *  - Unused alias: `type CyStyle = cytoscape.StylesheetStyle` → removed
 *  - Clarified difference:
 *      - `StylesheetStyle`: type of CSS block only
 *      - `StylesheetCSS`: full object including `selector` and `css`
 * 
 * ✅ General Best Practices:
 *  - Always use `css:` not `style:` (Cytoscape 3.x+)
 *  - Use explicit typing for style array: `StylesheetCSS[]`
 *  - Prefer type-safe parameters where possible, fallback to `as any` for dynamic `data(...)` mappings
 *
 * ⚠️ Beware of Cytoscape type mismatches: the JS runtime accepts more flexibility than the TS definitions allow.
 *    When necessary, **use `as any` cautiously** on selector rules to bypass TypeScript's stricter expectations.
 *
 * ---
 */

import cytoscape from 'cytoscape';
import { StyleParams } from '../stores/graphSettingsStore';

// Define the expected Cytoscape style object type for clarity
// Use StylesheetCSS as it represents the { selector: '...', style: {...} } structure
type CySelectorStyle = cytoscape.StylesheetCSS; // ✅ correct interface // Object with selector + style

/**
 * Helper function to get the computed value of a CSS variable.
 * Crucial for translating theme variables (e.g., var(--color-primary))
 * into concrete values (e.g., #ff0000) that Cytoscape's JS API can understand.
 * @param varName The name of the CSS variable (e.g., '--color-bg-primary').
 * @returns The computed color string (e.g., '#ffffff') or a fallback.
 */
export const getCssVar = (varName: string): string => {
    if (typeof window === 'undefined') return '#888888'; // Fallback for SSR/testing
    try {
        const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        // Basic validation: Check if it looks like a color (hex, rgb, etc.)
        // This is a simple check, more robust validation could be added.
        if (value && (value.startsWith('#') || value.startsWith('rgb') || /^[a-zA-Z]+$/.test(value))) {
             return value;
        }
        // console.warn(`CSS variable ${varName} resolved to invalid value: ${value}`);
        return '#888888'; // Fallback if value is empty or doesn't look like a color
    } catch (error) {
        console.error(`Error getting CSS variable ${varName}:`, error);
        return '#888888'; // Fallback on error
    }
};


/**
 * Generates the complete Cytoscape stylesheet array based on current style parameters.
 * It defines the base look for nodes and edges and includes rules for applying
 * data-driven styles (like color or shape based on element data).
 * @param sp - The style parameters from the graphSettingsStore.
 * @returns An array of Cytoscape stylesheet rules.
 */
export const buildCytoscapeStyles = (sp: StyleParams): CySelectorStyle[] => {
    // Resolve theme colors using getCssVar *before* creating style rules
    const nodeBgColor = getCssVar('--color-accent-tertiary');
    const nodeTextColor = getCssVar('--color-text-inverted'); // e.g., white text on colored nodes
    const nodeOutlineColor = getCssVar('--color-bg-secondary'); // Outline matches secondary background
    const edgeLineColor = getCssVar('--color-text-muted');
    const edgeTextColor = getCssVar('--color-text-muted');
    const edgeTextBgColor = getCssVar('--color-bg-secondary');

    // Log resolved colors for debugging (optional)
    // console.log({ nodeBgColor, nodeTextColor, nodeOutlineColor, edgeLineColor, edgeTextColor, edgeTextBgColor });

    return [
        // --- Base Node Style ---
        {
            selector: 'node',
            css: {
                'background-color': nodeBgColor,
                'color': nodeTextColor, // Text color inside the node
                'label': 'data(label)', // Display the 'label' data property
                'font-size': `${sp.nodeFont}px`,
                'text-valign': 'center',
                'text-halign': 'center',
                // Outline effect for better readability on various backgrounds
                'text-outline-width': 2,
                'text-outline-color': nodeOutlineColor,
                // Default shape
                'shape': 'ellipse',
                // Size the node to fit its label (function-based width, height auto)
                // FIX: Replace deprecated 'label' value for width/height
                'width': (ele: cytoscape.NodeSingular) => { // FIX: Add type annotation
                    const label = ele.data('label') || '';
                    // Estimate width: Adjust multiplier based on font size / testing
                    const estimatedWidth = label.length * (sp.nodeFont * 0.6) + (sp.nodePadding * 2); // Use dynamic padding // Factor in font size, add padding
                    return Math.max(40, estimatedWidth) + 'px'; // Ensure minimum width, add 'px'
                },
                // Height often works better with fixed padding or auto if width is set
                // Let's try a fixed padding approach first, adjust if needed
                 'height': (_ele: cytoscape.NodeSingular) => { // FIX: Mark ele as unused with _
                     // Example: Fixed height based on font size + padding
                     return (sp.nodeFont + (sp.nodePadding * 2)) + 'px'; // Use dynamic padding // Font size + vertical padding
                 },
                'padding': '10px', // Ensure padding is explicitly set
            },
        },
        // --- Node Style Overrides from Data ---
        {
            // Apply specific background color if node has a 'color' data property
            selector: 'node[color]',
            css: {
                'background-color': 'data(color)',
            },
        },
        {
            // Apply specific shape if node has a 'shape' data property
            selector: 'node[shape]',
            css: {
                'shape': 'data(shape)' as any,
            },
        },
        // --- Base Edge Style ---
        {
            selector: 'edge',
            css: {
                'width': `${sp.edgeWidth}px`,
                'line-color': edgeLineColor,
                'target-arrow-shape': 'triangle',
                'target-arrow-color': edgeLineColor,
                'curve-style': 'bezier', // Or 'straight', 'haystack', etc.
                'label': 'data(label)', // Display the 'label' data property
                'color': edgeTextColor, // Label text color
                'font-size': '10px', // Smaller font size for edge labels
                'text-background-color': edgeTextBgColor,
                'text-background-opacity': 0.85,
                'text-background-padding': '2px',
                'text-margin-y': -4, // Adjust label position slightly
            },
        },
        // --- Edge Style Overrides from Data ---
        {
            // Apply specific line/arrow color if edge has 'edgeColor' data property
            // This 'edgeColor' is now set automatically in graphDataStore.addEdge
            selector: 'edge[edgeColor]',
            css: {
                'line-color': 'data(edgeColor)',
                'target-arrow-color': 'data(edgeColor)',
            },
        },
        {
           // Apply specific outline color for edge labels if edge has 'outlineColor'
           selector: 'edge[outlineColor]',
            css: {
                'text-outline-color': 'data(outlineColor)',
                'text-outline-width': 2,
            }
        },
        // --- Selection Style ---
        {
            selector: ':selected',
            css: {
                'border-width': 3,
                'border-color': getCssVar('--color-accent-secondary'), // Use accent color for selection outline
            },
        },
        // --- Edgehandles Ghost Preview --- (If using preview: true)
        // {
        //     selector: '.eh-ghost-edge',
        //     style: {
        //         'line-color': getCssVar('--color-accent-primary'),
        //         'target-arrow-color': getCssVar('--color-accent-primary'),
        //         'line-style': 'dashed'
        //     }
        // },
        // --- Add more styles as needed ---
    ];
};