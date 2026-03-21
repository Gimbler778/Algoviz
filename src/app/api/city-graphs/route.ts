import { NextResponse } from 'next/server';

type CityNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  region: string;
};

type CityEdge = {
  from: string;
  to: string;
  weight: number;
};

const cityGraphs: Record<string, { nodes: CityNode[]; edges: CityEdge[] }> = {
  world: {
    nodes: [
      { id: 'nyc', label: 'New York', x: 176, y: 172, region: 'North America' },
      { id: 'london', label: 'London', x: 356, y: 132, region: 'Europe' },
      { id: 'paris', label: 'Paris', x: 371, y: 140, region: 'Europe' },
      { id: 'cairo', label: 'Cairo', x: 422, y: 188, region: 'Africa' },
      { id: 'dubai', label: 'Dubai', x: 468, y: 196, region: 'Middle East' },
      { id: 'mumbai', label: 'Mumbai', x: 522, y: 226, region: 'South Asia' },
      { id: 'singapore', label: 'Singapore', x: 572, y: 266, region: 'Southeast Asia' },
      { id: 'tokyo', label: 'Tokyo', x: 670, y: 184, region: 'East Asia' },
      { id: 'sydney', label: 'Sydney', x: 666, y: 360, region: 'Oceania' },
      { id: 'sao-paulo', label: 'Sao Paulo', x: 260, y: 334, region: 'South America' },
    ],
    edges: [
      { from: 'nyc', to: 'london', weight: 5570 },
      { from: 'london', to: 'paris', weight: 343 },
      { from: 'paris', to: 'cairo', weight: 3210 },
      { from: 'cairo', to: 'dubai', weight: 2420 },
      { from: 'dubai', to: 'mumbai', weight: 1920 },
      { from: 'mumbai', to: 'singapore', weight: 3910 },
      { from: 'singapore', to: 'tokyo', weight: 5310 },
      { from: 'tokyo', to: 'sydney', weight: 7830 },
      { from: 'nyc', to: 'sao-paulo', weight: 7680 },
      { from: 'sao-paulo', to: 'cairo', weight: 9860 },
      { from: 'london', to: 'dubai', weight: 5500 },
      { from: 'paris', to: 'mumbai', weight: 7000 },
      { from: 'singapore', to: 'sydney', weight: 6300 },
    ],
  },
  europe: {
    nodes: [
      { id: 'lisbon', label: 'Lisbon', x: 304, y: 178, region: 'Europe' },
      { id: 'madrid', label: 'Madrid', x: 330, y: 176, region: 'Europe' },
      { id: 'paris', label: 'Paris', x: 361, y: 156, region: 'Europe' },
      { id: 'berlin', label: 'Berlin', x: 395, y: 149, region: 'Europe' },
      { id: 'rome', label: 'Rome', x: 390, y: 181, region: 'Europe' },
      { id: 'vienna', label: 'Vienna', x: 417, y: 164, region: 'Europe' },
      { id: 'warsaw', label: 'Warsaw', x: 430, y: 143, region: 'Europe' },
      { id: 'athens', label: 'Athens', x: 443, y: 201, region: 'Europe' },
    ],
    edges: [
      { from: 'lisbon', to: 'madrid', weight: 625 },
      { from: 'madrid', to: 'paris', weight: 1050 },
      { from: 'paris', to: 'berlin', weight: 878 },
      { from: 'paris', to: 'rome', weight: 1105 },
      { from: 'berlin', to: 'warsaw', weight: 573 },
      { from: 'berlin', to: 'vienna', weight: 681 },
      { from: 'vienna', to: 'athens', weight: 1280 },
      { from: 'rome', to: 'athens', weight: 1052 },
      { from: 'rome', to: 'vienna', weight: 765 },
      { from: 'madrid', to: 'rome', weight: 1365 },
    ],
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const network = searchParams.get('network') || 'world';

  const graph = cityGraphs[network] || cityGraphs.world;

  // Return bidirectional edges so traversal/path algorithms work naturally.
  const bidirectionalEdges = graph.edges.flatMap((edge) => [
    edge,
    { from: edge.to, to: edge.from, weight: edge.weight },
  ]);

  return NextResponse.json({
    network,
    generatedAt: new Date().toISOString(),
    graph: {
      nodes: graph.nodes,
      edges: bidirectionalEdges,
    },
  });
}
