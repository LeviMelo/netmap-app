// src/hooks/useGraphMetrics.ts
/**
 * Custom React hook to calculate various graph metrics based on the
 * current state of the Cytoscape instance.
 * It encapsulates the logic for calculating metrics like node degrees.
 * It depends on the cyRef and triggers recalculations when graph data changes.
 */
import { useState, useEffect, useCallback, MutableRefObject } from 'react';
import { Core, NodeSingular } from 'cytoscape';
import { useGraphDataStore } from '../stores/graphDataStore'; // To react to data changes

// Define the structure for the returned metrics object
export interface GraphMetrics {
    degreeData: Map<string, number>;
    // Add other metrics here later, e.g., centralityData: Map<string, number>;
}

export const useGraphMetrics = (cyRef: MutableRefObject<Core | null>): GraphMetrics => {
    // State within the hook to store calculated metrics
    const [degreeData, setDegreeData] = useState<Map<string, number>>(new Map());
    // Add state for other metrics as needed

    // Get node/edge arrays from the store purely to trigger the effect when data changes
    // The actual calculation uses the cyRef for the most up-to-date graph state.
    const nodes = useGraphDataStore((s) => s.nodes);
    const edges = useGraphDataStore((s) => s.edges);

    /* Degree Calculation */
    const calculateDegrees = useCallback(() => {
        const cy = cyRef.current;
        if (!cy || cy.nodes().length === 0) {
            setDegreeData(new Map()); // Clear data if cy not ready or no nodes
            return;
        }
        console.log("Recalculating degrees..."); // For debugging
        const map = new Map<string, number>();
        cy.nodes().forEach((n: NodeSingular) => {
            map.set(n.id(), n.degree(false)); // false = unweighted degree
        });
        setDegreeData(map);
    }, [cyRef]); // Dependency: recalculate only if cyRef instance changes (shouldn't often)

    // Effect to run calculations when graph data changes or cyRef becomes available
    useEffect(() => {
        // Calculate metrics when nodes or edges change
        // The cyRef might not be available on the very first render, so check inside effect
        if(cyRef.current) {
            calculateDegrees();
            // Call other metric calculation functions here
        }
    }, [nodes, edges, cyRef, calculateDegrees]); // Depend on data arrays and the calculation function


    // Return the calculated metrics
    return {
        degreeData,
        // Return other metrics here
    };
};