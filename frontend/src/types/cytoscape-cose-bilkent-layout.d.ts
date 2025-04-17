// Augment cytoscape's LayoutOptions to include the CoSE‑Bilkent-specific parameters
import 'cytoscape';

declare module 'cytoscape' {
  interface LayoutOptions {
    // Toggle grid‐based tiling (can cause invalid‐array errors if true)
    tile?: boolean;

    // Tiling padding, only used if tile=true
    tilingPaddingVertical?: number;
    tilingPaddingHorizontal?: number;

    // Force parameters: can be static number or callback returning number
    nodeRepulsion?: number | ((node: any) => number);
    idealEdgeLength?: number | ((edge: any) => number);
    edgeElasticity?: number | ((edge: any) => number);

    // Additional CoSE controls
    nestingFactor?: number;
    gravity?: number;
    gravityRange?: number;
    gravityCompound?: number;
    gravityRangeCompound?: number;
    numIter?: number;
    randomize?: boolean;
    nodeDimensionsIncludeLabels?: boolean;
    uniformNodeDimensions?: boolean;
    refresh?: number;
  }
}
