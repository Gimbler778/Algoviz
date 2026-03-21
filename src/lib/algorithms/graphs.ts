import { Graph, GraphNode, GraphEdge, AlgorithmStep } from '../types';

export interface GraphStep {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visitedOrder: (string | number)[];
  description: string;
}

// BFS - Breadth First Search
export async function bfs(
  graph: Graph,
  startId: string | number,
  onStep: (step: GraphStep) => Promise<void>
): Promise<{ visitedOrder: (string | number)[] }> {
  const visited = new Set<string | number>();
  const queue: (string | number)[] = [startId];
  const visitedOrder: (string | number)[] = [];
  const nodeStates = new Map<string | number, boolean>();

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

      await onStep({
        nodes: updatedNodes,
        edges: graph.edges,
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
  onStep: (step: GraphStep) => Promise<void>
): Promise<{ visitedOrder: (string | number)[] }> {
  const visited = new Set<string | number>();
  const visitedOrder: (string | number)[] = [];
  const nodeStates = new Map<string | number, boolean>();

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
      edges: graph.edges,
      visitedOrder,
      description: `Visiting node ${nodeId}. Call stack: [${visitedOrder.join(', ')}]`,
    });

    const neighbors = graph.edges
      .filter((edge) => edge.from === nodeId && !visited.has(edge.to))
      .map((edge) => edge.to);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
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
  onStep: (step: GraphStep) => Promise<void>
): Promise<{ distances: Map<string | number, number>; visitedOrder: (string | number)[] }> {
  const distances = new Map<string | number, number>();
  const visited = new Set<string | number>();
  const visitedOrder: (string | number)[] = [];
  const nodeStates = new Map<string | number, number>();

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
      }
    }

    const updatedNodes = graph.nodes.map((node) => ({
      ...node,
      visited: visited.has(node.id),
      distance: distances.get(node.id),
    }));

    await onStep({
      nodes: updatedNodes,
      edges: graph.edges,
      visitedOrder,
      description: `Processing node ${currentId} with distance ${minDistance}`,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return { distances, visitedOrder };
}
