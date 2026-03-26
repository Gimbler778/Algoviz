import { Graph, GraphEdge, GraphNode } from '../types';

type ManualBuildArgs = {
  verticesInput: string;
  edgesInput: string;
  requirePositiveWeights: boolean;
};

type ManualBuildResult = {
  valid: boolean;
  graph: Graph | null;
  errors: string[];
};

type RandomGraphArgs = {
  vertexCount: number;
  edgeCount: number;
  weighted: boolean;
};

const BASE_WIDTH = 980;
const BASE_HEIGHT = 520;
const BASE_MARGIN = 56;

function uniqueLabels(labels: string[]): string[] {
  return Array.from(new Set(labels));
}

function normalizeToken(token: string): string {
  return token.trim();
}

function labelFromIndex(index: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (index < alphabet.length) {
    return alphabet[index];
  }

  const prefix = alphabet[index % alphabet.length];
  const suffix = Math.floor(index / alphabet.length);
  return `${prefix}${suffix}`;
}

function parseVertices(verticesInput: string): string[] {
  return uniqueLabels(
    verticesInput
      .split(/[\s,]+/)
      .map(normalizeToken)
      .filter(Boolean)
  );
}

function parseEdgeLine(line: string): { from: string; to: string; weight?: number } | null {
  const cleaned = line.trim();
  if (!cleaned) return null;

  const commaParts = cleaned.split(',').map(normalizeToken).filter(Boolean);
  if (commaParts.length >= 2) {
    const [from, to, weightPart] = commaParts;
    const weight = weightPart !== undefined ? Number(weightPart) : undefined;
    return {
      from,
      to,
      weight: Number.isFinite(weight) ? weight : undefined,
    };
  }

  return null;
}

function circleLayout(labels: string[]): GraphNode[] {
  const centerX = BASE_WIDTH / 2;
  const centerY = BASE_HEIGHT / 2;
  const radius = Math.max(120, Math.min(220, 70 + labels.length * 10));

  return labels.map((label, index) => {
    const angle = (Math.PI * 2 * index) / labels.length;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    return {
      id: label,
      label,
      x: Math.max(BASE_MARGIN, Math.min(BASE_WIDTH - BASE_MARGIN, x)),
      y: Math.max(BASE_MARGIN, Math.min(BASE_HEIGHT - BASE_MARGIN, y)),
    };
  });
}

function addUndirectedEdgePair(edges: GraphEdge[], from: string, to: string, weight?: number): void {
  edges.push({ from, to, weight });
  edges.push({ from: to, to: from, weight });
}

export function edgeCountBounds(vertexCount: number): { min: number; max: number } {
  const safeVertices = Math.max(2, Math.floor(vertexCount));
  return {
    min: safeVertices - 1,
    max: (safeVertices * (safeVertices - 1)) / 2,
  };
}

export function sanitizeGraphForRun(graph: Graph): Graph {
  return {
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      x: node.x,
      y: node.y,
    })),
    edges: graph.edges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      weight: edge.weight,
    })),
  };
}

export function buildGraphFromManualInput(args: ManualBuildArgs): ManualBuildResult {
  const { verticesInput, edgesInput, requirePositiveWeights } = args;
  const errors: string[] = [];

  const labels = parseVertices(verticesInput);
  if (labels.length < 2) {
    errors.push('Provide at least two unique vertices.');
  }

  const labelSet = new Set(labels);
  const seenUndirected = new Set<string>();
  const parsedEdgeRows = edgesInput
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (parsedEdgeRows.length === 0) {
    errors.push('Provide at least one edge.');
  }

  const edges: GraphEdge[] = [];

  for (const line of parsedEdgeRows) {
    const parsed = parseEdgeLine(line);
    if (!parsed) {
      errors.push(`Invalid edge format: "${line}". Use from,to or from,to,weight.`);
      continue;
    }

    const from = parsed.from;
    const to = parsed.to;

    if (!labelSet.has(from) || !labelSet.has(to)) {
      errors.push(`Edge "${line}" references a vertex not in the vertex list.`);
      continue;
    }

    if (from === to) {
      errors.push(`Self-loop found in edge "${line}". Use distinct vertices.`);
      continue;
    }

    const edgeKey = [from, to].sort().join('::');
    if (seenUndirected.has(edgeKey)) {
      errors.push(`Duplicate edge found between ${from} and ${to}.`);
      continue;
    }
    seenUndirected.add(edgeKey);

    if (requirePositiveWeights) {
      if (typeof parsed.weight !== 'number' || parsed.weight <= 0) {
        errors.push(`Edge "${line}" needs a positive weight for this algorithm.`);
        continue;
      }
    }

    const safeWeight = typeof parsed.weight === 'number' && parsed.weight > 0 ? parsed.weight : undefined;
    addUndirectedEdgePair(edges, from, to, safeWeight);
  }

  if (edges.length === 0) {
    errors.push('No valid edges were created.');
  }

  if (errors.length > 0) {
    return { valid: false, graph: null, errors };
  }

  return {
    valid: true,
    graph: {
      nodes: circleLayout(labels),
      edges,
    },
    errors: [],
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWeight(): number {
  return randomInt(1, 20);
}

export function generateRandomGraph(args: RandomGraphArgs): Graph {
  const vertexCount = Math.max(2, Math.min(26, Math.floor(args.vertexCount)));
  const bounds = edgeCountBounds(vertexCount);
  const edgeCount = Math.max(bounds.min, Math.min(bounds.max, Math.floor(args.edgeCount)));
  const labels = Array.from({ length: vertexCount }, (_, index) => labelFromIndex(index));

  const nodes = circleLayout(labels);
  const edges: GraphEdge[] = [];
  const seenUndirected = new Set<string>();

  // Start with a random spanning chain to keep graph connected.
  for (let index = 1; index < labels.length; index += 1) {
    const from = labels[randomInt(0, index - 1)];
    const to = labels[index];
    const key = [from, to].sort().join('::');
    if (seenUndirected.has(key)) continue;
    seenUndirected.add(key);
    addUndirectedEdgePair(edges, from, to, args.weighted ? randomWeight() : undefined);
  }

  const allPairs: Array<[string, string]> = [];
  for (let i = 0; i < labels.length; i += 1) {
    for (let j = i + 1; j < labels.length; j += 1) {
      allPairs.push([labels[i], labels[j]]);
    }
  }

  while (seenUndirected.size < edgeCount && allPairs.length > 0) {
    const index = randomInt(0, allPairs.length - 1);
    const [from, to] = allPairs[index];
    allPairs.splice(index, 1);

    const key = [from, to].sort().join('::');
    if (seenUndirected.has(key)) continue;
    seenUndirected.add(key);
    addUndirectedEdgePair(edges, from, to, args.weighted ? randomWeight() : undefined);
  }

  return { nodes, edges };
}
