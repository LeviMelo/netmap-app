// src/components/MetricsSidebar.tsx
/**
 * Renders a sidebar displaying graph metrics (node/edge counts) and potentially
 * visualizations based on metrics (like degree distribution histogram or overlays).
 * It fetches graph data to trigger updates and uses a direct Cytoscape instance reference
 * (`cyRef`) for complex calculations or visualizations like the halo overlay.
 */
import React, { useMemo, useEffect, useState, useCallback, MutableRefObject } from 'react';
import { Core, NodeSingular } from 'cytoscape';
import { rollup, max as d3Max } from 'd3-array';
import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from 'd3-scale';

// Import stores
import { useGraphDataStore } from '../stores/graphDataStore';
// Interaction store might be needed if overlays depend on selection
// import { useGraphInteractionStore } from '../stores/graphInteractionStore';

// Import hooks and utils
import { useTranslations } from '../hooks/useTranslations';
import { getCssVar } from '../utils/cytoscapeStyles'; // Use the shared CSS var getter
import { X } from 'lucide-react'; // Icon

// Interface for degree calculation result
interface DegreeBucket {
  deg: number;
  cnt: number;
}

// Type for the overlay canvas state
type OverlayType = 'none' | 'degree'; // Add more types later (e.g., 'centrality')

interface Props {
  open: boolean;
  onClose: () => void;
  cyRef: MutableRefObject<Core | null>; // Still needs direct cy instance
}

const MetricsSidebar: React.FC<Props> = ({ open, onClose, cyRef }) => {
  const { t } = useTranslations();

  // Get data counts directly from the store
  const nodeCount = useGraphDataStore((s) => s.nodes.length);
  const edgeCount = useGraphDataStore((s) => s.edges.length);
  // Subscribe to node/edge arrays themselves to trigger recalculations when they change identity
  const nodes = useGraphDataStore((s) => s.nodes);
  const edges = useGraphDataStore((s) => s.edges);


  // State for the selected overlay type
  const [overlayType, setOverlayType] = useState<OverlayType>('none');
  // State to store calculated degree data (maps node ID to degree)
  const [degreeData, setDegreeData] = useState<Map<string, number>>(new Map());

  // Ref for the overlay canvas element
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);


  /* Degree Calculation */
  const calculateDegrees = useCallback(() => {
    const cy = cyRef.current;
    // Calculate only if cy exists and there are nodes
    if (!cy || cy.nodes().length === 0) {
      setDegreeData(new Map()); // Clear data if no nodes
      return;
    }
    const map = new Map<string, number>();
    cy.nodes().forEach((n: NodeSingular) => {
      map.set(n.id(), n.degree(false)); // Use `false` for unweighted degree
    });
    setDegreeData(map);
  }, [cyRef]); // Dependency: cyRef instance

  // Re-calculate degrees when node/edge arrays change identity
  useEffect(calculateDegrees, [nodes, edges, calculateDegrees]);


  /* Histogram Data */
  const histogramData: DegreeBucket[] = useMemo(() => {
    if (degreeData.size === 0) return [];
    const degrees = Array.from(degreeData.values());
    // Group degrees and count occurrences
    const counts = rollup(degrees, (v) => v.length, (d) => d);
    // Convert map to array and sort by degree
    return Array.from(counts, ([deg, cnt]) => ({ deg, cnt })).sort((a, b) => a.deg - b.deg);
  }, [degreeData]);


  /* Halo Overlay Drawing Effect */
  useEffect(() => {
    const cy = cyRef.current;
    const canvas = overlayCanvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!cy || !canvas || !ctx || overlayType !== 'degree' || degreeData.size === 0) {
      // Clear canvas if overlay is off, no data, or cy/canvas not ready
      ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
      return; // Exit if not drawing degree halo
    }

    // --- Drawing Setup ---
    const pixelRatio = window.devicePixelRatio || 1;
    const canvasWidth = canvas.clientWidth * pixelRatio;
    const canvasHeight = canvas.clientHeight * pixelRatio;

    // Resize canvas accounting for device pixel ratio for sharp rendering
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }

    // Get Cytoscape viewport state
    const pan = cy.pan();
    const zoom = cy.zoom();

    // --- Color and Size Scales ---
    const maxDegree = d3Max(Array.from(degreeData.values())) ?? 1;
    // Define colors (using resolved CSS variables)
    const colorPrimary = getCssVar('--color-accent-primary'); // Low degree
    const colorSecondary = getCssVar('--color-accent-secondary'); // Mid degree
    const colorDanger = getCssVar('--color-danger'); // High degree

    // D3 scale to map degree to color (adjust domain/range as needed)
    const colorScale = scaleLinear<string>()
      .domain([0, maxDegree * 0.3, maxDegree]) // Example domain thresholds
      .range([colorPrimary, colorSecondary, colorDanger]) // Color progression
      .clamp(true); // Clamp values outside the domain

    // D3 scale to map degree to halo radius (adjust range for desired size)
    const radiusScale = scaleLinear<number>()
        .domain([0, maxDegree])
        .range([5 * pixelRatio, 30 * pixelRatio]) // Min/Max radius in pixels (scaled by DPR)
        .clamp(true);

    // --- Drawing Logic ---
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame
    ctx.save(); // Save default context state
    // Apply Cytoscape's pan and zoom to the overlay canvas
    ctx.translate(pan.x * pixelRatio, pan.y * pixelRatio);
    ctx.scale(zoom * pixelRatio, zoom * pixelRatio);

    // Optional: Set blending mode for heatmap effect
    // ctx.globalCompositeOperation = 'lighter'; // Additive blending
    // ctx.globalAlpha = 0.6; // Apply some transparency to halos

    // --- Draw Halos ---
    cy.nodes().forEach((node: NodeSingular) => {
      const degree = degreeData.get(node.id()) ?? 0;
      if (degree === 0 && overlayType === 'degree') return; // Optionally skip nodes with 0 degree

      const pos = node.renderedPosition(); // Get position in Cytoscape's coordinate system
      const radius = radiusScale(degree);
      const color = colorScale(degree);

      // Create radial gradient (center transparent, edge colored)
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
      gradient.addColorStop(0, `${color}33`); // Inner color (e.g., 20% opacity)
      gradient.addColorStop(0.7, `${color}80`); // Mid color (e.g., 50% opacity)
      gradient.addColorStop(1, `${color}00`); // Outer color (fully transparent)

      // Draw the halo arc
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    ctx.restore(); // Restore default context state (removes transform)

    // --- Cytoscape Viewport Listener ---
    // Redraw overlay when viewport changes (zoom/pan)
    const redrawOverlay = () => {
        // Request animation frame for smoother redraws during interaction
        requestAnimationFrame(() => {
            // Simplified redraw - assumes scales/data haven't changed, just viewport
            const currentPan = cy.pan();
            const currentZoom = cy.zoom();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(currentPan.x * pixelRatio, currentPan.y * pixelRatio);
            ctx.scale(currentZoom * pixelRatio, currentZoom * pixelRatio);
            // Re-draw all halos based on stored data/scales
            cy.nodes().forEach((node: NodeSingular) => {
                const degree = degreeData.get(node.id()) ?? 0;
                 if (degree === 0 && overlayType === 'degree') return;
                 const pos = node.renderedPosition();
                 const radius = radiusScale(degree);
                 const color = colorScale(degree);
                 const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
                 gradient.addColorStop(0, `${color}33`);
                 gradient.addColorStop(0.7, `${color}80`);
                 gradient.addColorStop(1, `${color}00`);
                 ctx.beginPath();
                 ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
                 ctx.fillStyle = gradient;
                 ctx.fill();
            });
            ctx.restore();
        });
    };

    cy.on('zoom pan', redrawOverlay);

    // Cleanup function for the effect
    return () => {
      cy.off('zoom pan', redrawOverlay); // Remove viewport listener
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas on cleanup/disable
    };

  }, [overlayType, degreeData, cyRef]); // Re-run effect when overlay type or data changes


  return (
    // Use fixed positioning and transform for smooth slide-in/out
    <aside
      className={`fixed right-0 top-0 h-full w-80 bg-bg-secondary bg-opacity-80 dark:bg-opacity-70 backdrop-filter backdrop-blur-lg border-l border-border rounded-l-lg shadow-xl transform transition-transform z-30 ${
        open ? 'translate-x-0' : 'translate-x-full' // Slide in/out
      }`}
      aria-labelledby="metrics-title" role="region"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 id="metrics-title" className="text-lg font-semibold">{t('graphMetrics')}</h2>
        <Button variant="ghost" size="sm" icon={X} onClick={onClose} title={t('close')} className="p-1"/>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)] no-scrollbar">
        {/* Basic Counts */}
        <p><strong>{t('nodes')}:</strong> {nodeCount}</p>
        <p><strong>{t('edges')}:</strong> {edgeCount}</p>

        {/* Metric Overlay Selector */}
        <div>
          <label htmlFor="metric-overlay-select" className="label-text mb-1">{t('overlayMetric')}</label>
          <select
             id="metric-overlay-select"
             className="input-base" // Use shared input style
             value={overlayType}
             onChange={(e) => setOverlayType(e.target.value as OverlayType)}
          >
            <option value="none">{t('overlayNone')}</option>
            <option value="degree">{t('overlayDegree')}</option>
            {/* Add options for other metrics later */}
          </select>
        </div>

        {/* Degree Histogram */}
        <div>
          <h4 className="label-text mb-2">{t('degreeDistribution')}</h4>
          {histogramData.length > 0 ? (
            <svg className="w-full h-32" aria-label={t('degreeDistribution')} role="img">
              <g transform="translate(24, 4)"> {/* Margins for labels */}
                {(() => {
                  // Recalculate scales within the render - could be memoized if complex
                  const svgWidth = 256 - 24 - 4; // Adjust for parent width and margins
                  const svgHeight = 120 - 4 - 16; // Adjust for parent height and margins
                  const xDomain = histogramData.map((b) => b.deg);
                  const yDomain: [number, number] = [0, d3Max(histogramData, (b) => b.cnt) ?? 1];

                  // Ensure correct types for scales
                  const xScale: ScaleBand<number> = scaleBand<number>()
                      .domain(xDomain)
                      .range([0, svgWidth])
                      .padding(0.2);
                  const yScale: ScaleLinear<number, number> = scaleLinear()
                      .domain(yDomain)
                      .range([svgHeight, 0]); // Y range is inverted for SVG coords

                  const barColor = getCssVar('--color-accent-primary'); // Use theme color

                  return histogramData.map((b) => (
                    <rect
                      key={b.deg}
                      x={xScale(b.deg) ?? 0} // Use nullish coalescing for safety
                      y={yScale(b.cnt)}
                      width={xScale.bandwidth()}
                      height={svgHeight - yScale(b.cnt)}
                      fill={barColor}
                      rx="1" // Rounded corners
                    >
                      <title>{`Degree ${b.deg}: ${b.cnt} nodes`}</title> {/* Tooltip */}
                    </rect>
                  ));
                })()}
                 {/* Basic Y-axis label (Max Count) - Consider adding more axis details */}
                 <text x={-4} y={0} dy="0.3em" textAnchor="end" fontSize="10" fill="currentColor">{yDomain[1]}</text>
                 <text x={-4} y={svgHeight} dy="-0.3em" textAnchor="end" fontSize="10" fill="currentColor">0</text>
              </g>
            </svg>
          ) : (
            <p className="text-text-muted text-sm">{nodeCount > 0 ? 'Calculating…' : 'No data'}</p>
          )}
        </div>
         {/* Add other metrics displays here */}
      </div>
       {/* --- Overlay Canvas --- */}
       {/* Positioned absolutely behind the sidebar content but above GraphCanvas */}
       <canvas
           ref={overlayCanvasRef}
           className="absolute inset-0 w-full h-full pointer-events-none z-[-1]" // Make it fill the parent, ignore clicks, position behind content
           // Initial size set here, will be adjusted by effect based on clientWidth/Height
           width={320}
           height={500}
       />
    </aside>
  );
};

export default MetricsSidebar;