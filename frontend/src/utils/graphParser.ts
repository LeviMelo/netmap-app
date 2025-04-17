import { ElementDefinition } from 'cytoscape';

interface ParsedElements {
    nodes: ElementDefinition[];
    edges: ElementDefinition[];
}

const nodeRegex = /^\s*\[(.+?)\](?:\s*\((?:id=([^,\)]+))?(?:,\s*label=([^,\)]+))?\))?\s*$/;
const edgeRegex = /^\s*([^-\s>]+)\s*->\s*([^:\s]+)(?:\s*:\s*"(.+)")?\s*$/;

let nodeIdCounter = 0;
let edgeIdCounter = 0;
const generateNodeId = () => `n${nodeIdCounter++}`;
const generateEdgeId = () => `e${edgeIdCounter++}`;

export function parseGraphSyntax(text: string): ParsedElements | null {
    const lines = text.split('\n');
    const nodes: ElementDefinition[] = [];
    const edges: ElementDefinition[] = [];
    const nodeMap = new Map<string, string>();

    nodeIdCounter = 0;
    edgeIdCounter = 0;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;

        const nodeMatch = trimmedLine.match(nodeRegex);
        if (nodeMatch) {
            const label = nodeMatch[3] || nodeMatch[1];
            const explicitId = nodeMatch[2]?.trim();
            const mapKey = explicitId || label;

            if (!nodeMap.has(mapKey)) {
                const nodeId = explicitId || generateNodeId();
                if (!explicitId) nodeMap.set(label, nodeId);
                else {
                    nodeMap.set(explicitId, nodeId);
                    if (!nodeMap.has(label)) nodeMap.set(label, nodeId);
                }
                nodes.push({ data: { id: nodeId, label: label } });
                // console.log(`Parsed Node: ID=${nodeId}, Label=${label}, ExplicitID=${explicitId || 'N/A'}`);
            }
            continue;
        }

        const edgeMatch = trimmedLine.match(edgeRegex);
        if (edgeMatch) {
            const sourceRef = edgeMatch[1].trim();
            const targetRef = edgeMatch[2].trim();
            const edgeLabel = edgeMatch[3]?.trim() || undefined;
            const sourceId = nodeMap.get(sourceRef);
            const targetId = nodeMap.get(targetRef);

            if (!sourceId) {
                console.warn(`Parser Warning: Source node "${sourceRef}" not found or defined yet. Skipping edge.`);
                continue;
            }
            if (!targetId) {
                console.warn(`Parser Warning: Target node "${targetRef}" not found or defined yet. Skipping edge.`);
                 continue;
            }

            const edgeId = generateEdgeId();
            edges.push({ data: { id: edgeId, source: sourceId, target: targetId, label: edgeLabel } });
            // console.log(`Parsed Edge: ID=${edgeId}, Source=${sourceId}(${sourceRef}), Target=${targetId}(${targetRef}), Label=${edgeLabel || 'N/A'}`);
            continue;
        }
        console.warn(`Parser Warning: Invalid syntax on line: "${trimmedLine}". Skipping line.`);
    }
    // console.log("Final Node Map:", nodeMap);
    return { nodes, edges };
}