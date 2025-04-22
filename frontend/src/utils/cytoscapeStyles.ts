// src/utils/cytoscapeStyles.ts
/**
 * Utility functions related to generating Cytoscape.js stylesheets.
 * This centralizes the logic for translating abstract style parameters
 * (from graphSettingsStore) and application data into the specific style
 * object format required by Cytoscape.
 */
import cytoscape from 'cytoscape';
import { StyleParams } from '../stores/graphSettingsStore';

// Define the expected Cytoscape style object type for clarity
type CyStyle = cytoscape.StylesheetStyle; // Base style properties
type CySelectorStyle = cytoscape.Stylesheet; // Object with selector + style

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
            style: {
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
                // Size the node to fit its label
                'width': 'label',
                'height': 'label',
                'padding': '10px', // Padding around the label text
            },
        },
        // --- Node Style Overrides from Data ---
        {
            // Apply specific background color if node has a 'color' data property
            selector: 'node[color]',
            style: {
                'background-color': 'data(color)',
            },
        },
        {
            // Apply specific shape if node has a 'shape' data property
            selector: 'node[shape]',
            style: {
                'shape': 'data(shape)',
            },
        },
        // --- Base Edge Style ---
        {
            selector: 'edge',
            style: {
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
            style: {
                'line-color': 'data(edgeColor)',
                'target-arrow-color': 'data(edgeColor)',
            },
        },
        {
           // Apply specific outline color for edge labels if edge has 'outlineColor'
           selector: 'edge[outlineColor]',
            style: {
                'text-outline-color': 'data(outlineColor)',
                'text-outline-width': 2,
            }
        },
        // --- Selection Style ---
        {
            selector: ':selected',
            style: {
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