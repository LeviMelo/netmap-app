import { ElementDefinition } from 'cytoscape';
import { TranslationKey } from '../hooks/useTranslations';

type TFunction = (key: TranslationKey, params?: Record<string, string>) => string;

interface ParsedElements {
    nodes: ElementDefinition[];
    edges: ElementDefinition[];
}

// Regex to capture: [Label](attributes) or [NodeRef]
const nodeRegex = /^\s*\[(.+?)\](?:\s*\((.+)\))?\s*$/;
// Regex to capture: source -> target : "Label" (attributes)
const edgeRegex = /^\s*([^-\s>]+)\s*->\s*([^:\s]+)(?:\s*:\s*"(.+?)")?(?:\s*\((.+)\))?\s*$/;
// Regex to parse key=value pairs within attributes
const attributeRegex = /(\w+)=([^,\)]+)/g;

let nodeIdCounter = 0;
let edgeIdCounter = 0;
const generateNodeId = () => `n${nodeIdCounter++}`;
const generateEdgeId = () => `e${edgeIdCounter++}`;

// Helper to parse attributes string
const parseAttributes = (attrString: string | undefined): Record<string, any> => {
    const attributes: Record<string, any> = {};
    if (!attrString) return attributes;

    let match;
    while ((match = attributeRegex.exec(attrString)) !== null) {
        const key = match[1].trim();
        let value: any = match[2].trim();
        // Attempt to parse numbers, otherwise keep as string
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value === numValue.toString()) {
            value = numValue;
        } else if (value.toLowerCase() === 'true') {
            value = true;
        } else if (value.toLowerCase() === 'false') {
            value = false;
        }
        attributes[key] = value;
    }
    return attributes;
};


export function parseGraphSyntax(text: string, t: TFunction): ParsedElements | null {
    const lines = text.split('\n');
    const nodes: ElementDefinition[] = [];
    const edges: ElementDefinition[] = [];
    const nodeMap = new Map<string, string>(); // Maps ref (label or explicit ID) to generated/explicit ID

    nodeIdCounter = 0; // Reset counters for each parse
    edgeIdCounter = 0;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;

        // --- Try Node ---
        const nodeMatch = trimmedLine.match(nodeRegex);
        if (nodeMatch) {
            const labelOrRef = nodeMatch[1].trim(); // This is the primary label unless overridden
            const attributesString = nodeMatch[2]; // All key=value pairs
            const attributes = parseAttributes(attributesString);

            const explicitId = attributes['id'] as string | undefined;
            const label = (attributes['label'] as string | undefined) || labelOrRef; // Use explicit label if present
            const mapKey = explicitId || label; // Use ID first for mapping, then label

            if (!nodeMap.has(mapKey)) {
                const nodeId = explicitId || generateNodeId();
                 // Ensure mapKey maps to the definitive nodeId
                nodeMap.set(mapKey, nodeId);
                // If explicitId was used, also map the label to it if label isn't already mapped
                if (explicitId && label !== explicitId && !nodeMap.has(label)) {
                     nodeMap.set(label, nodeId);
                }

                // Add all parsed attributes (except potentially id/label if handled separately)
                const nodeData = { ...attributes, id: nodeId, label: label };
                nodes.push({ data: nodeData });

            } else {
                 // If node already exists (e.g., defined by ID first, then by label),
                 // potentially merge attributes here if needed, or just ignore re-definition.
                 // Current logic: first definition wins.
            }
            continue; // Move to next line
        }

        // --- Try Edge ---
        const edgeMatch = trimmedLine.match(edgeRegex);
        if (edgeMatch) {
            const sourceRef = edgeMatch[1].trim();
            const targetRef = edgeMatch[2].trim();
            const edgeLabel = edgeMatch[3]?.trim() || undefined;
            const attributesString = edgeMatch[4];
            const attributes = parseAttributes(attributesString);

            const sourceId = nodeMap.get(sourceRef);
            const targetId = nodeMap.get(targetRef);

            if (!sourceId) {
                console.warn(t('parserWarningSourceNotFound', { node: sourceRef }));
                continue;
            }
            if (!targetId) {
                console.warn(t('parserWarningTargetNotFound', { node: targetRef }));
                continue;
            }

            const edgeId = (attributes['id'] as string | undefined) || generateEdgeId();
            const edgeData = {
                ...attributes, // Add parsed attributes (e.g., color, width)
                id: edgeId,
                source: sourceId,
                target: targetId,
                label: edgeLabel, // Explicit label from "" always takes precedence
            };
            // If attributes contain 'label', prefer the one from "" syntax
            if (edgeLabel && attributes.label) {
                 delete attributes.label; // Avoid duplicate label property if using "" syntax
            } else if (!edgeLabel && attributes.label) {
                edgeData.label = attributes.label as string; // Use label from attributes if not in ""
            }


            edges.push({ data: edgeData });
            continue; // Move to next line
        }

        // --- Invalid Line ---
        console.warn(t('parserWarningInvalidSyntax', { line: trimmedLine }));
    }

    console.log("Parsed Nodes:", nodes);
    console.log("Parsed Edges:", edges);
    return { nodes, edges };
}