// frontend/src/utils/graphParser.ts
import { ElementDefinition } from 'cytoscape';

// Define interfaces matching Cytoscape structure
interface ParsedElements {
    nodes: ElementDefinition[];
    edges: ElementDefinition[];
}

// Regex patterns for parsing
const nodeRegex = /^\s*\[(.+?)\](?:\s*\((?:id=([^,\)]+))?(?:,\s*label=([^,\)]+))?\))?\s*$/; // Matches [Label], [Label](id=id), [Label](label=alt_label), [Label](id=id,label=alt_label)
const edgeRegex = /^\s*([^-\s>]+)\s*->\s*([^:\s]+)(?:\s*:\s*"(.+)")?\s*$/; // Matches [Source] -> [Target] : "Label" or SourceId -> TargetId

// Simple unique ID generator (replace with robust UUID later if needed)
let nodeIdCounter = 0;
let edgeIdCounter = 0;
const generateNodeId = () => `n${nodeIdCounter++}`;
const generateEdgeId = () => `e${edgeIdCounter++}`;

export function parseGraphSyntax(text: string): ParsedElements | null {
    const lines = text.split('\n');
    const nodes: ElementDefinition[] = [];
    const edges: ElementDefinition[] = [];
    const nodeMap = new Map<string, string>(); // Map label/explicit ID to generated ID

    // Reset counters for each parse
    nodeIdCounter = 0;
    edgeIdCounter = 0;

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('#')) {
            continue;
        }

        // Try matching node
        const nodeMatch = trimmedLine.match(nodeRegex);
        if (nodeMatch) {
            const label = nodeMatch[3] || nodeMatch[1]; // Use explicit label if provided, else use the bracket content
            const explicitId = nodeMatch[2]?.trim();
            const mapKey = explicitId || label; // Use explicit ID if present, otherwise label

            if (!nodeMap.has(mapKey)) {
                const nodeId = explicitId || generateNodeId();
                if (!explicitId) {
                    // Only map generated IDs if no explicit ID was given for the label
                     nodeMap.set(label, nodeId);
                } else {
                     // Map explicit ID to itself (or the generated one if conflict, though explicit should be unique)
                    nodeMap.set(explicitId, nodeId);
                     // Also map the label to this ID if the label isn't already mapped
                     if (!nodeMap.has(label)) {
                         nodeMap.set(label, nodeId);
                     }
                }

                nodes.push({
                    data: {
                        id: nodeId,
                        label: label,
                    },
                    // Position can be added later if needed from syntax
                });
                 console.log(`Parsed Node: ID=${nodeId}, Label=${label}, ExplicitID=${explicitId || 'N/A'}`);
            }
            continue; // Move to next line after node match
        }

        // Try matching edge
        const edgeMatch = trimmedLine.match(edgeRegex);
        if (edgeMatch) {
            const sourceRef = edgeMatch[1].trim();
            const targetRef = edgeMatch[2].trim();
            const edgeLabel = edgeMatch[3]?.trim() || undefined; // Use undefined if no label

            const sourceId = nodeMap.get(sourceRef);
            const targetId = nodeMap.get(targetRef);

            if (!sourceId) {
                console.error(`Parser Error: Source node "${sourceRef}" not defined before edge.`);
                // Optionally: Create the node on the fly? For now, error out.
                // return null;
                continue; // Skip edge if source not found
            }
            if (!targetId) {
                console.error(`Parser Error: Target node "${targetRef}" not defined before edge.`);
                // Optionally: Create the node on the fly? For now, error out.
                // return null;
                 continue; // Skip edge if target not found
            }

            const edgeId = generateEdgeId();
            edges.push({
                data: {
                    id: edgeId,
                    source: sourceId,
                    target: targetId,
                    label: edgeLabel,
                },
            });
            console.log(`Parsed Edge: ID=${edgeId}, Source=${sourceId}(${sourceRef}), Target=${targetId}(${targetRef}), Label=${edgeLabel || 'N/A'}`);
            continue; // Move to next line
        }

        // If neither matches, it's a syntax error
        console.error(`Parser Error: Invalid syntax on line: "${trimmedLine}"`);
        // return null; // Option: Halt parsing on first error
         // Option: Skip the line and continue parsing
    }

     console.log("Final Node Map:", nodeMap);
    return { nodes, edges };
}