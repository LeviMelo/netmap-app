// src/hooks/useGraphMetrics.ts
/**
 * Custom React hook to calculate various graph metrics based on the
 * current state of the Cytoscape instance.
 * It encapsulates the logic for calculating metrics like node degrees.
 * It now uses Cytoscape event listeners ('add', 'remove', 'move') to trigger
 * recalculations efficiently only when the graph topology or element data changes,
 * preventing potential infinite loops caused by dependency issues in useEffect.
 *
 * ---
 * ✅ Refactoring & Bug Fixes:
 *
 * - Infinite Loop Diagnosis (Previous Versions):
 *   → Problem: The hook's `useEffect` previously depended on `nodes`, `edges`
 *     array references from the Zustand store and potentially unstable function
 *     references (`calculateDegrees` via `useCallback` with changing deps).
 *   → Cause: React StrictMode double-invocation and/or frequent re-renders
 *     passing new array references (even with same content) could cause the effect
 *     to run repeatedly, calling `setDegreeData`, triggering re-renders and
 *     re-running the effect, leading to "Recalculating degrees..." spam.
 *
 * - Solution (Event-Based Calculation):
 *   → Replaced the dependency on `nodes`/`edges` arrays with direct Cytoscape
 *     event listeners (`cy.on('add remove move', ...)`).
 *   → The `useEffect` now primarily depends on `cyRef.current` availability.
 *   → `calculateAndSetDegrees` is memoized with `useCallback` having stable
 *     dependencies.
 *   → Calculation now triggers *only* on initial mount (when `cy` is ready)
 *     and when Cytoscape emits relevant events, decoupling it from React's
 *     render cycle and StrictMode behavior.
 *   → This ensures metrics are calculated efficiently when needed, resolving
 *     the infinite loop/excessive calculation issue.
 *
 * - Unused Variable Fix (TS6133):
 *   → Problem: The `event` parameter in `recalculateMetrics` was declared but
 *     not used after commenting out a debug log.
 *   → Fix: Marked the `event` parameter with an underscore (`_event`) to
 *     signal it's intentionally unused.
 * ---
 */
// Added EventObject, useCallback
import { useState, useEffect, MutableRefObject, useCallback } from 'react';
import { Core, NodeSingular, EventObject } from 'cytoscape';

// No need to import useGraphDataStore anymore

export interface GraphMetrics {
    degreeData: Map<string, number>;
    // Add other metrics here later
}

export const useGraphMetrics = (cyRef: MutableRefObject<Core | null>): GraphMetrics => {
    const [degreeData, setDegreeData] = useState<Map<string, number>>(new Map());

    // Use useCallback to memoize the calculation function.
    // It now depends only on the setDegreeData function reference (stable).
    const calculateAndSetDegrees = useCallback((cyInstance: Core | null) => {
        if (!cyInstance) {
            setDegreeData(currentMap => currentMap.size === 0 ? currentMap : new Map());
            return;
        }

        console.log("Calculating degrees (event triggered or initial)..."); // Keep log for verification

        const map = new Map<string, number>();
        cyInstance.nodes().forEach((n: NodeSingular) => {
            map.set(n.id(), n.degree(false));
        });

        setDegreeData(map);
    }, [/* setDegreeData has stable ref */]);

    // Effect to setup Cytoscape listeners and perform initial calculation
    useEffect(() => {
        const cy = cyRef.current;

        if (!cy) {
             setDegreeData(currentMap => currentMap.size === 0 ? currentMap : new Map());
            return;
        }

        // Define the handler function to be used for listeners
        // FIX: Mark 'event' as unused with underscore
        const recalculateMetrics = (_event?: EventObject) => {
            // Optional: log the event that triggered the recalc
            // if(_event) console.log(`Recalculating metrics due to cy event: ${_event.type}`);
            calculateAndSetDegrees(cy);
        };

        // Attach listeners to Cytoscape events that affect degrees
        const events = 'add remove move';
        cy.on(events, recalculateMetrics);

        // Perform initial calculation when the instance is ready
        recalculateMetrics();

        // Cleanup function: Remove listeners
        return () => {
            console.log("Cleaning up graph metrics listeners...");
             // Check cy again in case it became null before cleanup
             // Check removeListener exists before calling (robustness)
            if (cy && typeof cy.removeListener === 'function') {
                cy.removeListener(events, recalculateMetrics);
            }
        };
    // Depend ONLY on cyRef.current and the stable calculation function.
    }, [cyRef, calculateAndSetDegrees]);


    return {
        degreeData,
    };
};