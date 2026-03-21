import { Graph, GraphNode, GraphEdge } from '../types';

export interface GraphStep {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visitedOrder: (string | number)[];
  description: string;
}

function edgeKey(edge: Pick<GraphEdge, 'from' | 'to'>): string {
  return `${edge.from}->${edge.to}`;
}

function buildPathEdges(
  prev: Map<string | number, string | number>,
  target: string | number
): Set<string> {
  const path = new Set<string>();
  let current: string | number | undefined = target;

  while (current !== undefined && prev.has(current)) {
    const parent = prev.get(current);
    if (parent === undefined) break;
    path.add(`${parent}->${current}`);
    current = parent;
  }

  return path;
}

// BFS - Breadth First Search
export async function bfs(
  graph: Graph,
  startId: string | number,
  _targetId: string | number | undefined,
  onStep: (step: GraphStep) => Promise<void>
): Promise<{ visitedOrder: (string | number)[] }> {
  const visited = new Set<string | number>();
  const queue: (string | number)[] = [startId];
  const visitedOrder: (string | number)[] = [];
  const nodeStates = new Map<string | number, boolean>();
  const traversedEdges = new Set<string>();

  // Initialize node states
  graph.nodes.forEach((node) => {
    nodeStates.set(node.id, false);
  });

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (!visited.has(currentId)) {
      visited.add(currentId);
      visitedOrder.push(currentId);
      nodeStates.set(currentId, true);

      const updatedNodes = graph.nodes.map((node) => ({
        ...node,
        visited: nodeStates.get(node.id),
      }));

      const updatedEdges = graph.edges.map((edge) => ({
        ...edge,
        visited: traversedEdges.has(edgeKey(edge)),
        path: false,
      }));

      await onStep({
        nodes: updatedNodes,
        edges: updatedEdges,
        visitedOrder,
        description: `Visiting node ${currentId}. Queue: [${queue.join(', ')}]`,
      });

      // Get neighbors
      const neighbors = graph.edges
        .filter((edge) => edge.from === currentId && !visited.has(edge.to))
        .map((edge) => edge.to);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
          traversedEdges.add(`${currentId}->${neighbor}`);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return { visitedOrder };
}

// DFS - Depth First Search
export async function dfs(
  graph: Graph,
  startId: string | number,
  _targetId: string | number | undefined,
  onStep: (step: GraphStep) => Promise<void>
): Promise<{ visitedOrder: (string | number)[] }> {
  const visited = new Set<string | number>();
  const visitedOrder: (string | number)[] = [];
  const nodeStates = new Map<string | number, boolean>();
  const traversedEdges = new Set<string>();

  // Initialize node states
  graph.nodes.forEach((node) => {
    nodeStates.set(node.id, false);
  });

  async function dfsHelper(nodeId: string | number) {
    visited.add(nodeId);
    visitedOrder.push(nodeId);
    nodeStates.set(nodeId, true);

    const updatedNodes = graph.nodes.map((node) => ({
      ...node,
      visited: nodeStates.get(node.id),
    }));

    await onStep({
      nodes: updatedNodes,
      edges: graph.edges.map((edge) => ({
        ...edge,
        visited: traversedEdges.has(edgeKey(edge)),
        path: false,
      })),
      visitedOrder,
      description: `Visiting node ${nodeId}. Call stack: [${visitedOrder.join(', ')}]`,
    });

    const neighbors = graph.edges
      .filter((edge) => edge.from === nodeId && !visited.has(edge.to))
      .map((edge) => edge.to);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        traversedEdges.add(`${nodeId}->${neighbor}`);
        await dfsHelper(neighbor);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  await dfsHelper(startId);
  return { visitedOrder };
}

// Dijkstra's Algorithm
export async function dijkstra(
  graph: Graph,
  startId: string | number,
  targetId: string | number | undefined,
  onStep: (step: GraphStep) => Promise<void>
): Promise<{ distances: Map<string | number, number>; visitedOrder: (string | number)[] }> {
  const distances = new Map<string | number, number>();
  const visited = new Set<string | number>();
  const visitedOrder: (string | number)[] = [];
  const nodeStates = new Map<string | number, number>();
  const prev = new Map<string | number, string | number>();
  const traversedEdges = new Set<string>();

  // Initialize distances
  graph.nodes.forEach((node) => {
    distances.set(node.id, node.id === startId ? 0 : Infinity);
    nodeStates.set(node.id, node.id === startId ? 0 : Infinity);
  });

  while (visited.size < graph.nodes.length) {
    // Find unvisited node with minimum distance
    let currentId: string | number | null = null;
    let minDistance = Infinity;

    for (const [id, distance] of distances.entries()) {
      if (!visited.has(id) && (distance as number) < minDistance) {
        currentId = id;
        minDistance = distance as number;
      }
    }

    if (currentId === null || minDistance === Infinity) break;

    visited.add(currentId);
    visitedOrder.push(currentId);

    // Update distances to neighbors
    const neighbors = graph.edges.filter((edge) => edge.from === currentId);

    for (const edge of neighbors) {
      const newDistance = (distances.get(currentId) as number) + (edge.weight || 1);
      if (newDistance < (distances.get(edge.to) as number)) {
        distances.set(edge.to, newDistance);
        nodeStates.set(edge.to, newDistance);
        prev.set(edge.to, currentId);
        traversedEdges.add(`${currentId}->${edge.to}`);
      }
    }

    const updatedNodes = graph.nodes.map((node) => ({
      ...node,
      visited: visited.has(node.id),
      distance: distances.get(node.id),
    }));

    await onStep({
      nodes: updatedNodes,
      edges: graph.edges.map((edge) => ({
        ...edge,
        visited: traversedEdges.has(edgeKey(edge)),
        path: false,
      })),
      visitedOrder,
      description: `Processing node ${currentId} with distance ${minDistance}`,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const finalTarget = targetId ?? graph.nodes[graph.nodes.length - 1]?.id;
  if (finalTarget !== undefined && distances.get(finalTarget) !== undefined) {
    const shortestPathEdges = buildPathEdges(prev, finalTarget);

    await onStep({
      nodes: graph.nodes.map((node) => ({
        ...node,
        visited: visited.has(node.id),
        distance: distances.get(node.id),
      })),
      edges: graph.edges.map((edge) => ({
        ...edge,
        visited: traversedEdges.has(edgeKey(edge)),
        path: shortestPathEdges.has(edgeKey(edge)),
      })),
      visitedOrder,
      description: `Shortest path highlighted to ${finalTarget}.`,
    });
  }

  return { distances, visitedOrder };
}

// A* Search
export async function aStar(
  graph: Graph,
  startId: string | number,
  targetId: string | number | undefined,
  onStep: (step: GraphStep) => Promise<void>
): Promise<{ distances: Map<string | number, number>; visitedOrder: (string | number)[] }> {
  const distances = new Map<string | number, number>();
  const gScore = new Map<string | number, number>();
  const fScore = new Map<string | number, number>();
  const visitedOrder: (string | number)[] = [];
  const openSet = new Set<string | number>([startId]);
  const closedSet = new Set<string | number>();
  const finalTarget = targetId ?? graph.nodes[graph.nodes.length - 1]?.id;
  const prev = new Map<string | number, string | number>();
  const traversedEdges = new Set<string>();

  const nodeById = new Map<string | number, GraphNode>(graph.nodes.map((node) => [node.id, node]));

  const heuristic = (id: string | number) => {
    const current = nodeById.get(id);
    const target = finalTarget !== undefined ? nodeById.get(finalTarget) : undefined;
    if (!current || !target) return 0;
    return Math.hypot(current.x - target.x, current.y - target.y);
  };

  graph.nodes.forEach((node) => {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
    distances.set(node.id, Infinity);
  });

  gScore.set(startId, 0);
  fScore.set(startId, heuristic(startId));
  distances.set(startId, 0);

  while (openSet.size > 0) {
    const currentId = [...openSet].reduce((best, candidate) =>
      (fScore.get(candidate) || Infinity) < (fScore.get(best) || Infinity) ? candidate : best
    );

    openSet.delete(currentId);
    closedSet.add(currentId);
    visitedOrder.push(currentId);

    const neighbors = graph.edges.filter((edge) => edge.from === currentId);

    for (const edge of neighbors) {
      if (closedSet.has(edge.to)) continue;

      const tentativeScore = (gScore.get(currentId) || Infinity) + (edge.weight || 1);
      if (tentativeScore < (gScore.get(edge.to) || Infinity)) {
        gScore.set(edge.to, tentativeScore);
        distances.set(edge.to, tentativeScore);
        fScore.set(edge.to, tentativeScore + heuristic(edge.to));
        prev.set(edge.to, currentId);
        traversedEdges.add(`${currentId}->${edge.to}`);
        openSet.add(edge.to);
      }
    }

    const updatedNodes = graph.nodes.map((node) => ({
      ...node,
      visited: closedSet.has(node.id),
      distance: distances.get(node.id),
    }));

    await onStep({
      nodes: updatedNodes,
      edges: graph.edges.map((edge) => ({
        ...edge,
        visited: traversedEdges.has(edgeKey(edge)),
        path: false,
      })),
      visitedOrder,
      description: `A*: exploring node ${currentId}. Open set size: ${openSet.size}`,
    });

    await new Promise((resolve) => setTimeout(resolve, 450));
  }

  if (finalTarget !== undefined && distances.get(finalTarget) !== undefined) {
    const shortestPathEdges = buildPathEdges(prev, finalTarget);

    await onStep({
      nodes: graph.nodes.map((node) => ({
        ...node,
        visited: closedSet.has(node.id),
        distance: distances.get(node.id),
      })),
      edges: graph.edges.map((edge) => ({
        ...edge,
        visited: traversedEdges.has(edgeKey(edge)),
        path: shortestPathEdges.has(edgeKey(edge)),
      })),
      visitedOrder,
      description: `A*: shortest path highlighted to ${finalTarget}.`,
    });
  }

  return { distances, visitedOrder };
}

// Prim's Minimum Spanning Tree
export async function prim(
  graph: Graph,
  startId: string | number,
  _targetId: string | number | undefined,
  onStep: (step: GraphStep) => Promise<void>
): Promise<{ visitedOrder: (string | number)[] }> {
  const visited = new Set<string | number>([startId]);
  const visitedOrder: (string | number)[] = [startId];
  const mstEdges = new Set<string>();

  const edgeKey = (edge: GraphEdge) => `${edge.from}->${edge.to}`;

  while (visited.size < graph.nodes.length) {
    const candidateEdges = graph.edges.filter(
      (edge) => visited.has(edge.from) && !visited.has(edge.to)
    );

    if (candidateEdges.length === 0) break;

    const minEdge = candidateEdges.reduce((best, current) =>
      (current.weight || 1) < (best.weight || 1) ? current : best
    );

    visited.add(minEdge.to);
    visitedOrder.push(minEdge.to);
    mstEdges.add(edgeKey(minEdge));

    const updatedEdges = graph.edges.map((edge) => ({
      ...edge,
      visited: mstEdges.has(edgeKey(edge)),
    }));

    const updatedNodes = graph.nodes.map((node) => ({
      ...node,
      visited: visited.has(node.id),
    }));

    await onStep({
      nodes: updatedNodes,
      edges: updatedEdges,
      visitedOrder,
      description: `Prim: added edge ${minEdge.from} -> ${minEdge.to} (w=${minEdge.weight || 1})`,
    });

    await new Promise((resolve) => setTimeout(resolve, 450));
  }

  return { visitedOrder };
}
