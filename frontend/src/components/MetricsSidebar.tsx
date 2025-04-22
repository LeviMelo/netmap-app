// src/components/MetricsSidebar.tsx
/**
 * Renders a sidebar displaying graph metrics (node/edge counts) and potentially
 * visualizations based on metrics (like degree distribution histogram or overlays).
 * It fetches graph data to trigger updates and uses a direct Cytoscape instance reference
 * (`cyRef`) for complex calculations or visualizations like the halo overlay.
 * It now includes an overlay canvas to draw metric-based visualizations (e.g., halos).
 *
 * ---
 * ✅ Halo Overlay Implementation Notes:
 *  - Uses an HTML5 <canvas> positioned absolutely behind the sidebar content.
 *  - `useEffect` hook triggers drawing logic based on `overlayType`, `degreeData`, `cyRef`.
 *  - Handles canvas resizing based on `devicePixelRatio` for sharp rendering.
 *  - Applies Cytoscape's current `pan` and `zoom` to the overlay canvas context.
 *  - Uses D3 scales (`colorScale`, `radiusScale`) to map metric values (degree) to visual properties.
 *  - Draws radial gradients on the overlay canvas for the halo effect.
 *  - Includes listeners for Cytoscape 'zoom' and 'pan' events to redraw the overlay dynamically.
 *  - Cleans up listeners and clears the canvas on unmount or when the overlay is disabled.
 * ---
 */
import React, { useMemo, useEffect, useState, useCallback, MutableRefObject, useRef } from 'react';
import { Core, NodeSingular } from 'cytoscape';
import { rollup, max as d3Max } from 'd3-array';
import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from 'd3-scale';

// Import stores
import { useGraphDataStore } from '../stores/graphDataStore';

// Import hooks and utils
import { useTranslations } from '../hooks/useTranslations';
import { getCssVar } from '../utils/cytoscapeStyles';
import Button from './ui/Button';
import { X } from 'lucide-react';

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
    if (!cy || cy.nodes().length === 0) {
      setDegreeData(new Map());
      return;
    }
    const map = new Map<string, number>();
    cy.nodes().forEach((n: NodeSingular) => {
      map.set(n.id(), n.degree(false));
    });
    setDegreeData(map);
  }, [cyRef]);

  useEffect(calculateDegrees, [nodes, edges, calculateDegrees]);


  /* Histogram Data */
  const histogramData: DegreeBucket[] = useMemo(() => {
    if (degreeData.size === 0) return [];
    const degrees = Array.from(degreeData.values());
    const counts = rollup(degrees, (v) => v.length, (d) => d);
    return Array.from(counts, ([deg, cnt]) => ({ deg, cnt })).sort((a, b) => a.deg - b.deg);
  }, [degreeData]);


  /* Halo Overlay Drawing Effect */
  useEffect(() => {
    const cy = cyRef.current;
    const canvas = overlayCanvasRef.current;
    const ctx = canvas?.getContext('2d');

    // Define the drawing function early, so it's available for the redraw callback
    const drawHalos = () => {
        // Ensure cy, canvas, ctx are still valid inside the async callback/redraw
        const currentCy = cyRef.current; // Re-check ref
        const currentCanvas = overlayCanvasRef.current;
        const currentCtx = currentCanvas?.getContext('2d');
        if (!currentCy || !currentCanvas || !currentCtx || degreeData.size === 0) return; // Added degreeData check here too

        const pixelRatio = window.devicePixelRatio || 1;
        const canvasWidth = currentCanvas.clientWidth * pixelRatio;
        const canvasHeight = currentCanvas.clientHeight * pixelRatio;

        if (currentCanvas.width !== canvasWidth || currentCanvas.height !== canvasHeight) {
            currentCanvas.width = canvasWidth;
            currentCanvas.height = canvasHeight;
        }

        const pan = currentCy.pan();
        const zoom = currentCy.zoom();

         // --- Scales (Recalculate or ensure they are accessible if defined outside) ---
         // NOTE: Defining scales *inside* drawHalos ensures they use the *latest* degreeData
         // if data updates frequently. If data updates only trigger the *effect* itself,
         // defining them outside drawHalos but inside useEffect is fine. Let's keep them outside for now.
        const maxDegree = d3Max(Array.from(degreeData.values())) ?? 1;
        const colorPrimary = getCssVar('--color-accent-primary');
        const colorSecondary = getCssVar('--color-accent-secondary');
        const colorDanger = getCssVar('--color-danger');
        const colorScale = scaleLinear<string>().domain([0, maxDegree * 0.3, maxDegree]).range([colorPrimary, colorSecondary, colorDanger]).clamp(true);
        const radiusScale = scaleLinear<number>().domain([0, maxDegree]).range([8, 40]).clamp(true);
         // --- End Scales ---

        currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
        currentCtx.save();
        currentCtx.translate(pan.x * pixelRatio, pan.y * pixelRatio);
        currentCtx.scale(zoom * pixelRatio, zoom * pixelRatio);

        currentCy.nodes().forEach((node: NodeSingular) => {
            const degree = degreeData.get(node.id()) ?? 0;
            if (degree === 0 && overlayType === 'degree') return; // Keep optional skip

            const pos = node.renderedPosition();
            const radius = radiusScale(degree);
            const color = colorScale(degree);
            const gradient = currentCtx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
            gradient.addColorStop(0, `${color}40`);
            gradient.addColorStop(0.6, `${color}66`);
            gradient.addColorStop(1, `${color}00`);

            currentCtx.beginPath();
            currentCtx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
            currentCtx.fillStyle = gradient;
            currentCtx.fill();
        });

        currentCtx.restore();
    };

    // --- Define the event handler function BEFORE attaching or returning cleanup ---
    // FIX: Declare redrawOverlay *before* the return statement.
    const redrawOverlay = () => {
        requestAnimationFrame(drawHalos); // Use rAF for smooth updates
    };

    // --- Exit conditions (check *after* redrawOverlay is defined) ---
    if (!cy || !canvas || !ctx || overlayType !== 'degree') {
      // Clear if overlay is turned off AFTER defining redrawOverlay,
      // so cleanup function can still potentially remove the old listener.
      ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
      // Return a cleanup function that only removes listener if cy exists
      return () => { cy?.off('zoom pan resize', redrawOverlay); };
    }

    // If we passed the exit conditions, proceed with initial draw and listeners

    // --- Initial Draw & Listener Setup ---
    drawHalos(); // Initial draw when effect runs
    cy.on('zoom pan resize', redrawOverlay); // Attach the listener

    // --- Cleanup ---
    // This cleanup function is defined *after* redrawOverlay is declared in this scope.
    // When React runs this for the PREVIOUS effect, it refers to the redrawOverlay
    // from *that* previous scope, which was also declared before its return.
    return () => {
      cy.off('zoom pan resize', redrawOverlay); // Remove listener using the correct function reference
      // Clear canvas in cleanup too, ensuring it's blank if effect is removed/re-run
      const cleanupCtx = overlayCanvasRef.current?.getContext('2d');
      cleanupCtx?.clearRect(0, 0, overlayCanvasRef.current?.width || 0, overlayCanvasRef.current?.height || 0);
    };

  }, [overlayType, degreeData, cyRef]); // Dependencies remain the same

  return (
    // Sidebar container
    <aside
      className={`fixed right-0 top-0 h-full w-80 bg-bg-secondary bg-opacity-80 dark:bg-opacity-70 backdrop-filter backdrop-blur-lg border-l border-border rounded-l-lg shadow-xl transform transition-transform z-30 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-labelledby="metrics-title" role="region"
    >
      {/* --- Overlay Canvas --- */}
      {/* Positioned absolutely to fill the sidebar, behind the content */}
      {/* pointer-events-none prevents it from interfering with clicks on controls */}
      <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-[-1]"
          // Initial size is less important as effect resizes based on client dimensions
          width={320}
          height={500}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between p-4 border-b border-border z-10"> {/* Ensure header is above canvas */}
        <h2 id="metrics-title" className="text-lg font-semibold">{t('graphMetrics')}</h2>
        <Button variant="ghost" size="sm" icon={X} onClick={onClose} title={t('close')} className="p-1"/>
      </div>

      {/* Body */}
      <div className="relative p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)] no-scrollbar z-10"> {/* Ensure body content is above canvas */}
        {/* Basic Counts */}
        <p><strong>{t('nodes')}:</strong> {nodeCount}</p>
        <p><strong>{t('edges')}:</strong> {edgeCount}</p>

        {/* Metric Overlay Selector */}
        <div>
          <label htmlFor="metric-overlay-select" className="label-text mb-1">{t('overlayMetric')}</label>
          <select
             id="metric-overlay-select"
             className="input-base"
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
              {/* SVG content remains the same as previous fix */}
              <g transform="translate(24, 4)">
                {(() => {
                  const svgWidth = 256 - 24 - 4;
                  const svgHeight = 120 - 4 - 16;
                  const xDomain = histogramData.map((b) => b.deg);
                  const yDomain: [number, number] = [0, d3Max(histogramData, (b) => b.cnt) ?? 1];
                  const xScale: ScaleBand<number> = scaleBand<number>()
                      .domain(xDomain)
                      .range([0, svgWidth])
                      .padding(0.2);
                  const yScale: ScaleLinear<number, number> = scaleLinear()
                      .domain(yDomain)
                      .range([svgHeight, 0]);
                  const barColor = getCssVar('--color-accent-primary');
                  const bars = histogramData.map((b) => (
                    <rect
                      key={b.deg}
                      x={xScale(b.deg) ?? 0}
                      y={yScale(b.cnt)}
                      width={xScale.bandwidth()}
                      height={svgHeight - yScale(b.cnt)}
                      fill={barColor}
                      rx="1"
                    >
                      <title>{`Degree ${b.deg}: ${b.cnt} nodes`}</title>
                    </rect>
                  ));
                  return (
                    <>
                      {bars}
                      <text x={-4} y={0} dy="0.3em" textAnchor="end" fontSize="10" fill="currentColor">{yDomain[1]}</text>
                      <text x={-4} y={svgHeight} dy="-0.3em" textAnchor="end" fontSize="10" fill="currentColor">0</text>
                    </>
                  );
                })()}
              </g>
            </svg>
          ) : (
            <p className="text-text-muted text-sm">{nodeCount > 0 ? 'Calculating…' : 'No data'}</p>
          )}
        </div>
         {/* Add other metrics displays here */}
      </div>
    </aside>
  );
};

export default MetricsSidebar;