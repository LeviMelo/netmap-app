/*  =====================  src/utils/graphParser.ts  =====================  */

import { ElementDefinition } from 'cytoscape';
import { TranslationKey } from '../hooks/useTranslations';

type TFunction = (key: TranslationKey, params?: Record<string, string>) => string;

interface ParsedElements {
  nodes: ElementDefinition[];
  edges: ElementDefinition[];
}

/* -----------------------------------------------------------------------
 *  Regular expressions
 * -------------------------------------------------------------------- */
const nodeRegex = /^\s*\[(.+?)\](?:\s*\((.+)\))?\s*$/;
//               [Label]           (   key=value,…   )
const edgeRegex =
  /^\s*([^-\s>]+)\s*->\s*([^:\s]+)(?:\s*:\s*"(.+?)")?(?:\s*\((.+)\))?\s*$/;
//          src          ->  tgt          :"label"            (attrs)
const attributeRegex = /(\w+)=([^,\)]+)/g;

/* -----------------------------------------------------------------------
 *  Utility helpers
 * -------------------------------------------------------------------- */
let nodeIdCounter = 0;
let edgeIdCounter = 0;
const genNodeId = () => `n${nodeIdCounter++}`;
const genEdgeId = () => `e${edgeIdCounter++}`;

/** Remove everything from the first ‘#’ that is *not* inside double quotes */
const stripInlineComment = (raw: string): string => {
  let inQuotes = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === '#' && !inQuotes) return raw.slice(0, i).trimEnd();
  }
  return raw;
};

/** Parse `(key=value, …)` into a plain object, preserving numbers & booleans */
const parseAttributes = (attrString: string | undefined): Record<string, any> => {
  const attrs: Record<string, any> = {};
  if (!attrString) return attrs;

  let m: RegExpExecArray | null;
  while ((m = attributeRegex.exec(attrString)) !== null) {
    const key = m[1].trim();
    let val: any = m[2].trim();

    // Primitive‑type coercion
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    else if (!Number.isNaN(+val) && val === (+val).toString()) val = +val;

    attrs[key] = val;
  }
  return attrs;
};

/* -----------------------------------------------------------------------
 *  Main parser
 * -------------------------------------------------------------------- */
export function parseGraphSyntax(text: string, t: TFunction): ParsedElements | null {
  const nodes: ElementDefinition[] = [];
  const edges: ElementDefinition[] = [];
  const map = new Map<string, string>(); // ref → canonical id

  nodeIdCounter = 0;
  edgeIdCounter = 0;

  for (const rawLine of text.split('\n')) {
    // 1 • Remove leading/trailing whitespace
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;            // whole‑line comment or blank

    // 2 • Remove trailing inline comment
    line = stripInlineComment(line).trim();
    if (!line) continue;                                   // nothing left after stripping

    /* --------------------  NODE -------------------------------------- */
    const nMatch = line.match(nodeRegex);
    if (nMatch) {
      const labelOrRef = nMatch[1].trim();
      const attrs      = parseAttributes(nMatch[2]);

      const explicitId = attrs['id'] as string | undefined;
      const label      = (attrs['label'] as string | undefined) || labelOrRef;
      const lookupKey  = explicitId || label;

      if (!map.has(lookupKey)) {
        const nodeId = explicitId || genNodeId();
        map.set(lookupKey, nodeId);
        if (explicitId && label !== explicitId && !map.has(label)) map.set(label, nodeId);

        nodes.push({ data: { ...attrs, id: nodeId, label } });
      }
      continue;
    }

    /* --------------------  EDGE -------------------------------------- */
    const eMatch = line.match(edgeRegex);
    if (eMatch) {
      const [ , srcRef, tgtRef, lbl, attrStr ] = eMatch;
      const srcId = map.get(srcRef.trim());
      const tgtId = map.get(tgtRef.trim());

      if (!srcId) { console.warn(t('parserWarningSourceNotFound',{node:srcRef.trim()})); continue; }
      if (!tgtId) { console.warn(t('parserWarningTargetNotFound',{node:tgtRef.trim()})); continue; }

      const attrs  = parseAttributes(attrStr);
      const edgeId = (attrs['id'] as string | undefined) || genEdgeId();

      edges.push({
        data: {
          ...attrs,
          id: edgeId,
          source: srcId,
          target: tgtId,
          label: lbl ?? attrs.label,
        },
      });
      continue;
    }

    /* --------------------  INVALID LINE ------------------------------ */
    console.warn(t('parserWarningInvalidSyntax', { line }));
  }

  return { nodes, edges };
}
