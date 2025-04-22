// src/components/metrics/DegreeHistogram.tsx
/**
 * Renders an SVG bar chart visualizing the degree distribution of the graph.
 * Receives processed histogram data as a prop and handles the D3 scaling
 * and SVG element rendering specific to the histogram.
 */
import React, { useMemo } from 'react';
import { max as d3Max } from 'd3-array';
import { scaleBand, scaleLinear, ScaleBand, ScaleLinear } from 'd3-scale';
import { getCssVar } from '../../utils/cytoscapeStyles'; // Use shared util
import { useTranslations } from '../../hooks/useTranslations';

// Type for the data expected by this component
export interface DegreeBucket {
    deg: number;
    cnt: number;
}

interface Props {
    histogramData: DegreeBucket[]; // Expects sorted data
    width?: number; // Optional width override
    height?: number; // Optional height override
}

const DegreeHistogram: React.FC<Props> = ({
    histogramData,
    width = 256, // Default width (consider sidebar width)
    height = 120 // Default height
}) => {
    const { t } = useTranslations();

    // Memoize SVG dimensions and scales based on props and data
    const { svgHeight, xScale, yScale, yDomain, barColor } = useMemo(() => {
        const marginTop = 4;
        const marginRight = 4;
        const marginBottom = 16; // Space for potential x-axis labels later
        const marginLeft = 24; // Space for y-axis labels

        const w = width - marginLeft - marginRight;
        const h = height - marginTop - marginBottom;

        const xDomain = histogramData.map((b) => b.deg);
        const yDom: [number, number] = [0, d3Max(histogramData, (b) => b.cnt) ?? 1];

        const xS: ScaleBand<number> = scaleBand<number>()
            .domain(xDomain)
            .range([0, w])
            .padding(0.2);
        const yS: ScaleLinear<number, number> = scaleLinear()
            .domain(yDom)
            .range([h, 0]); // Y range is inverted for SVG coords

        const color = getCssVar('--color-accent-primary');

        return { svgWidth: w, svgHeight: h, xScale: xS, yScale: yS, yDomain: yDom, barColor: color };
    }, [histogramData, width, height]);

    if (!histogramData || histogramData.length === 0) {
        return <p className="text-text-muted text-sm">{t('noData', { context: 'histogram' })}</p>; // Provide context for translation if needed
    }

    return (
        <svg className="w-full h-auto" // Let container control width, auto height
            viewBox={`0 0 ${width} ${height}`} // Use viewBox for scaling
            aria-label={t('degreeDistribution')} role="img"
            preserveAspectRatio="xMidYMid meet" // Maintain aspect ratio
        >
            <g transform={`translate(24, 4)`}> {/* Apply margins */}
                {/* Render Bars */}
                {histogramData.map((b) => (
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
                ))}
                {/* Basic Y-axis Labels */}
                <text x={-4} y={0} dy="0.3em" textAnchor="end" fontSize="10" fill="currentColor">{yDomain[1]}</text>
                <text x={-4} y={svgHeight} dy="-0.3em" textAnchor="end" fontSize="10" fill="currentColor">0</text>
                 {/* TODO: Add X-axis labels if needed */}
            </g>
        </svg>
    );
};

export default DegreeHistogram;