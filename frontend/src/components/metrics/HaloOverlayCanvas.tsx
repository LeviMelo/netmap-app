// src/components/metrics/HaloOverlayCanvas.tsx
/**
 * Renders a Canvas element intended to be positioned directly over the main graph view.
 * Responsible for drawing the 'halo' effect based on node degrees.
 * Uses the useGraphMetrics hook to fetch data and cyRef to sync with the graph viewport.
 * Relies on its parent container in App.tsx for correct positioning.
 * Applies the fix for the color string parsing error.
 * Attempts fix for positioning/scaling issues by applying devicePixelRatio scale
 * to the canvas context before applying Cytoscape pan/zoom.
 * Restored original halo gradient drawing.
 * ---
 * ✅ Debugging Notes:
 *  - Keeping console logs for tracing.
 *  - Restored halo gradient drawing.
 *  - Adjusted context scaling order to potentially fix positioning.
 *  - Increased base radius in radiusScale.
 * ---
 */
import React, { useEffect, useRef, MutableRefObject } from 'react';
import { Core, NodeSingular } from 'cytoscape';
import { max as d3Max } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { getCssVar } from '../../utils/cytoscapeStyles'; // Shared util - Will be used again
import { toRgbaString } from '../../utils/colorUtils'; // Import the color parsing util - Will be used again
import { useGraphMetrics } from '../../hooks/useGraphMetrics'; // Import the hook

interface Props {
    cyRef: MutableRefObject<Core | null>;
    isActive: boolean; // Controls whether the overlay should be drawn
}

const HaloOverlayCanvas: React.FC<Props> = ({ cyRef, isActive }) => {
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const { degreeData } = useGraphMetrics(cyRef); // Fetch data internally

    // --- DEBUG: Log prop changes ---
    useEffect(() => {
        console.log(`[HaloOverlayCanvas] Props changed - isActive: ${isActive}`);
    }, [isActive]);
    // --- END DEBUG ---


    useEffect(() => {
        // --- DEBUG: Log effect start and initial values ---
        console.log(`[HaloOverlayCanvas] Effect running. isActive: ${isActive}, degreeData: ${degreeData ? `Map(${degreeData.size})` : 'undefined'}`);
        // --- END DEBUG ---
        const cy = cyRef.current;
        const canvas = overlayCanvasRef.current;
        const ctx = canvas?.getContext('2d');


        // Define draw function early
        const drawHalos = () => {
            // --- DEBUG: Log draw call ---
            console.log("[HaloOverlayCanvas] drawHalos called.");
            // --- END DEBUG ---
            const currentCy = cyRef.current;
            const currentCanvas = overlayCanvasRef.current;
            const currentCtx = currentCanvas?.getContext('2d');

            // --- DEBUG: Log prerequisites inside drawHalos ---
            console.log(`[HaloOverlayCanvas drawHalos] Prerequisites - cy: ${!!currentCy}, canvas: ${!!currentCanvas}, ctx: ${!!currentCtx}, degreeData: ${degreeData ? `Map(${degreeData.size})` : 'undefined'}`);
            // --- END DEBUG ---

            if (!currentCy || !currentCanvas || !currentCtx || !degreeData) {
                 console.warn("[HaloOverlayCanvas drawHalos] Exiting early - prerequisites not met.");
                 currentCtx?.clearRect(0, 0, currentCanvas?.width || 0, currentCanvas?.height || 0);
                 return;
            }


            const pixelRatio = window.devicePixelRatio || 1;
            const canvasWidth = currentCanvas.clientWidth * pixelRatio;
            const canvasHeight = currentCanvas.clientHeight * pixelRatio;
            if (currentCanvas.width !== canvasWidth || currentCanvas.height !== canvasHeight) {
                console.log(`[HaloOverlayCanvas] Resizing canvas bitmap to ${canvasWidth}x${canvasHeight}`);
                currentCanvas.width = canvasWidth;
                currentCanvas.height = canvasHeight;
            }

            // Get pan/zoom in CSS pixels
            const pan = currentCy.pan();
            const zoom = currentCy.zoom();

            // Scales (recalculated based on current degreeData)
            const degrees = degreeData.size > 0 ? Array.from(degreeData.values()) : [0];
            const maxDegree = d3Max(degrees) ?? 1;
            // --- DEBUG: Log scale parameters ---
            console.log(`[HaloOverlayCanvas drawHalos] maxDegree: ${maxDegree}`);
            // --- END DEBUG ---
            const colorPrimary = getCssVar('--color-accent-primary');
            const colorSecondary = getCssVar('--color-accent-secondary');
            const colorDanger = getCssVar('--color-danger');
            const colorScale = scaleLinear<string>().domain([0, maxDegree * 0.3, maxDegree]).range([colorPrimary, colorSecondary, colorDanger]).clamp(true);
            // FIX: Increased base radius slightly, ensure range is appropriate
            const radiusScale = scaleLinear<number>().domain([0, maxDegree]).range([12, 50]).clamp(true); // Min radius 12, max 50

            console.log(`[HaloOverlayCanvas drawHalos] Clearing canvas ${currentCanvas.width}x${currentCanvas.height}`);
            currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);

            // Only draw if the overlay is active
            if (!isActive) {
                console.log("[HaloOverlayCanvas drawHalos] Exiting because isActive is false.");
                return;
            }

            currentCtx.save();

            // --- FIX: Apply transforms in potentially correct order ---
            // 1. Scale context by pixelRatio first
            currentCtx.scale(pixelRatio, pixelRatio);
            // 2. Then apply pan (in CSS pixels, now matches scaled context)
            currentCtx.translate(pan.x, pan.y);
            // 3. Then apply zoom (relative to CSS pixels)
            currentCtx.scale(zoom, zoom);
            // --- End Fix ---

            // --- DEBUG: Log Transform ---
            console.log(`[HaloOverlayCanvas drawHalos] Context Transform Applied: pixelRatio=${pixelRatio}, pan=(${pan.x.toFixed(1)}, ${pan.y.toFixed(1)}), zoom=${zoom.toFixed(2)}`);
            // --- END DEBUG ---


            // --- DEBUG: Check node count before looping ---
            const nodesToDraw = currentCy.nodes();
            console.log(`[HaloOverlayCanvas drawHalos] Attempting to draw halos for ${nodesToDraw.length} nodes.`);
            // --- END DEBUG ---

            nodesToDraw.forEach((node: NodeSingular) => {
                const degree = degreeData.get(node.id()) ?? 0;
                // Get position in Cytoscape's coordinate system (CSS pixels)
                const pos = node.renderedPosition();
                // Get radius/color based on degree
                const radius = radiusScale(degree); // Radius is in CSS pixel units relative to zoom/pan
                const baseColor = colorScale(degree);

                 // --- DEBUG: Log drawing parameters for each node ---
                 console.log(`[HaloOverlayCanvas drawHalos] Node ${node.id()}: degree=${degree}, pos=(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}), radius=${radius.toFixed(1)}`);
                 // --- END DEBUG ---


                 // --- Restore original Halo Drawing Code ---
                 const gradient = currentCtx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
                 // Use toRgbaString which is now imported again
                 gradient.addColorStop(0, toRgbaString(baseColor, 0.25));
                 gradient.addColorStop(0.6, toRgbaString(baseColor, 0.40));
                 gradient.addColorStop(1, toRgbaString(baseColor, 0.0));
                 currentCtx.beginPath();
                 // Arc coordinates (pos.x, pos.y) and radius are relative to the transformed context
                 currentCtx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
                 currentCtx.fillStyle = gradient;
                 currentCtx.fill();
                 // --- End original drawing ---

            });
            currentCtx.restore(); // Restore context state (removes all transforms)
            // --- DEBUG: Log end of drawing loop ---
            console.log("[HaloOverlayCanvas] drawHalos finished drawing loop.");
            // --- END DEBUG ---
        }; // --- End of drawHalos ---

        // Define redraw callback BEFORE checking isActive or returning cleanup
        const redrawOverlay = () => { requestAnimationFrame(drawHalos); };

        // Check exit conditions (only need cy, canvas, ctx)
        // --- DEBUG: Log exit condition check ---
        console.log(`[HaloOverlayCanvas Effect] Checking prerequisites - cy: ${!!cy}, canvas: ${!!canvas}, ctx: ${!!ctx}`);
        // --- END DEBUG ---
        if (!cy || !canvas || !ctx) {
             console.warn("[HaloOverlayCanvas Effect] Exiting - Core prerequisites missing.");
            return;
        }


        // If prerequisites met, draw initially and attach listener
        console.log(`[HaloOverlayCanvas Effect] Prerequisites met. isActive: ${isActive}. Attaching listeners and performing initial draw.`);
        drawHalos(); // Draw initial state (will clear or draw based on isActive inside)
        cy.on('zoom pan resize', redrawOverlay); // Attach listener

        // Cleanup function
        return () => {
            console.log("[HaloOverlayCanvas Effect] Cleanup function running."); // Log cleanup
            if (cy && typeof cy.removeListener === 'function') {
                cy.removeListener('zoom pan resize', redrawOverlay);
            }
            const cleanupCtx = overlayCanvasRef.current?.getContext('2d');
            console.log("[HaloOverlayCanvas Effect] Clearing canvas in cleanup.");
            cleanupCtx?.clearRect(0, 0, overlayCanvasRef.current?.width || 0, overlayCanvasRef.current?.height || 0);
        };
    // Depend on degreeData from hook AND isActive prop
    }, [cyRef, degreeData, isActive]); // Keep dependencies

    return (
        <canvas
            ref={overlayCanvasRef}
            // Keep absolute positioning; parent in App.tsx handles placement
            className="absolute inset-0 w-full h-full pointer-events-none z-10 block" // Added 'block'
            style={{ mixBlendMode: 'screen' }} // Restore blend mode
        />
    );
};

export default HaloOverlayCanvas;