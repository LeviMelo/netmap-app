// src/components/metrics/HaloOverlayCanvas.tsx
/**
 * Renders a Canvas element positioned to overlay the main graph view.
 * It's responsible for drawing metric-based visualizations, currently the 'halo'
 * effect based on node degrees. It uses the Cytoscape instance ref (`cyRef`)
 * to synchronize its drawing with the graph's pan and zoom. It also applies
 * the fix for the color string parsing error.
 */
import React, { useEffect, useRef, MutableRefObject } from 'react';
import { Core, NodeSingular } from 'cytoscape';
import { max as d3Max } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { getCssVar } from '../../utils/cytoscapeStyles'; // Shared util
import { toRgbaString } from '../../utils/colorUtils'; // Import the color parsing util
import { useGraphMetrics } from '../../hooks/useGraphMetrics'; // Import the hook

interface Props {
    cyRef: MutableRefObject<Core | null>;
    degreeData: Map<string, number>;
    isActive: boolean; // Controls whether the overlay should be drawn
}

const HaloOverlayCanvas: React.FC<Props> = ({ cyRef, degreeData, isActive }) => {
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const cy = cyRef.current;
        const canvas = overlayCanvasRef.current;
        const ctx = canvas?.getContext('2d');

        // Define draw function early
        const drawHalos = () => {
            const currentCy = cyRef.current;
            const currentCanvas = overlayCanvasRef.current;
            const currentCtx = currentCanvas?.getContext('2d');
            if (!currentCy || !currentCanvas || !currentCtx || degreeData.size === 0) return;

            const pixelRatio = window.devicePixelRatio || 1;
            const canvasWidth = currentCanvas.clientWidth * pixelRatio;
            const canvasHeight = currentCanvas.clientHeight * pixelRatio;
            if (currentCanvas.width !== canvasWidth || currentCanvas.height !== canvasHeight) {
                currentCanvas.width = canvasWidth;
                currentCanvas.height = canvasHeight;
            }
            const pan = currentCy.pan();
            const zoom = currentCy.zoom();

            // Scales
            const maxDegree = d3Max(Array.from(degreeData.values())) ?? 1;
            const colorPrimary = getCssVar('--color-accent-primary');
            const colorSecondary = getCssVar('--color-accent-secondary');
            const colorDanger = getCssVar('--color-danger');
            const colorScale = scaleLinear<string>().domain([0, maxDegree * 0.3, maxDegree]).range([colorPrimary, colorSecondary, colorDanger]).clamp(true);
            const radiusScale = scaleLinear<number>().domain([0, maxDegree]).range([8, 40]).clamp(true);

            currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
            currentCtx.save();
            currentCtx.translate(pan.x * pixelRatio, pan.y * pixelRatio);
            currentCtx.scale(zoom * pixelRatio, zoom * pixelRatio);

            currentCy.nodes().forEach((node: NodeSingular) => {
                const degree = degreeData.get(node.id()) ?? 0;
                if (degree === 0) return;

                const pos = node.renderedPosition();
                const radius = radiusScale(degree);
                const baseColor = colorScale(degree);
                const gradient = currentCtx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);

                // FIX: Use toRgbaString helper here
                gradient.addColorStop(0, toRgbaString(baseColor, 0.25));
                gradient.addColorStop(0.6, toRgbaString(baseColor, 0.40));
                gradient.addColorStop(1, toRgbaString(baseColor, 0.0));

                currentCtx.beginPath();
                currentCtx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
                currentCtx.fillStyle = gradient;
                currentCtx.fill();
            });
            currentCtx.restore();
        };

        // Define redraw callback BEFORE checking isActive or returning cleanup
        const redrawOverlay = () => {
            requestAnimationFrame(drawHalos);
        };

        // Check exit conditions AFTER defining redrawOverlay
        if (!cy || !canvas || !ctx || !isActive || degreeData.size === 0) {
            ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
            // Cleanup listener if cy exists, even if not active currently
            return () => { cy?.off('zoom pan resize', redrawOverlay); };
        }

        // If active, draw initially and attach listener
        drawHalos();
        cy.on('zoom pan resize', redrawOverlay);

        // Cleanup function
        return () => {
            cy.off('zoom pan resize', redrawOverlay);
            const cleanupCtx = overlayCanvasRef.current?.getContext('2d');
            cleanupCtx?.clearRect(0, 0, overlayCanvasRef.current?.width || 0, overlayCanvasRef.current?.height || 0);
        };

    }, [cyRef, degreeData, isActive]); // Depend on isActive to turn overlay on/off

    return (
        // Canvas fills its container (which should be positioned over the graph)
        // pointer-events-none ensures it doesn't block graph interactions
        <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10" // Ensure it's above graph, below UI controls
            style={{ mixBlendMode: 'screen' }} // Example blend mode for heatmap feel
        />
    );
};

export default HaloOverlayCanvas;