'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import GraphVisualizer from '@/components/visualizers/GraphVisualizer';
import { Graph } from '@/lib/types';
import { motion } from 'framer-motion';
import ScrambleText from '@/components/common/ScrambleText';

const RoadRoutingMap = dynamic(() => import('@/components/visualizers/RoadRoutingMap'), {
  ssr: false,
});

type Algorithm = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'prim';

type Network = 'world' | 'europe';
type Mode = 'city-graph' | 'road-routing';

const algorithms = [
  {
    id: 'bfs' as Algorithm,
    name: 'BFS (Breadth-First Search)',
    description: 'Explores nodes level by level, visiting all neighbors before moving to the next level.',
  },
  {
    id: 'dfs' as Algorithm,
    name: 'DFS (Depth-First Search)',
    description: 'Explores as far as possible along each branch before backtracking.',
  },
  {
    id: 'dijkstra' as Algorithm,
    name: "Dijkstra's Algorithm",
    description: 'Finds the shortest path from the starting node to all other nodes in a weighted graph.',
  },
  {
    id: 'astar' as Algorithm,
    name: 'A* Search',
    description: 'Heuristic shortest-path search that usually converges faster toward target regions.',
  },
  {
    id: 'prim' as Algorithm,
    name: "Prim's MST",
    description: 'Builds a minimum spanning tree by greedily adding the smallest edge to a new node.',
  },
];

export default function GraphsPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('bfs');
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('world');
  const [mode, setMode] = useState<Mode>('city-graph');
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchGraph = async () => {
      setLoadingGraph(true);
      setLoadingError(null);

      try {
        const response = await fetch(`/api/city-graphs?network=${selectedNetwork}`);

        if (!response.ok) {
          throw new Error('Failed to load city graph data');
        }

        const payload = await response.json();

        if (!active) return;
        setGraph(payload.graph);
      } catch (error) {
        if (!active) return;
        setLoadingError(error instanceof Error ? error.message : 'Unknown graph API error');
      } finally {
        if (active) {
          setLoadingGraph(false);
        }
      }
    };

    fetchGraph();

    return () => {
      active = false;
    };
  }, [selectedNetwork]);

  return (
    <div className="min-h-[calc(100vh-120px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="mb-8 text-4xl font-bold bg-gradient-to-r from-cyan-300 to-orange-300 bg-clip-text text-transparent">
          <ScrambleText text="City Graph Algorithms" />
        </h1>

        <div className="mb-8 inline-flex rounded-full border border-white/15 bg-slate-900/50 p-1">
          <button
            onClick={() => setMode('city-graph')}
            className={`rounded-full px-4 py-2 text-sm transition ${
              mode === 'city-graph' ? 'bg-cyan-500/25 text-cyan-100' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            City Graph Visualizer
          </button>
          <button
            onClick={() => setMode('road-routing')}
            className={`rounded-full px-4 py-2 text-sm transition ${
              mode === 'road-routing' ? 'bg-orange-500/25 text-orange-100' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            Real Road Routing (Leaflet)
          </button>
        </div>

        {mode === 'city-graph' && (
          <>
            <div className="mb-8 overflow-x-auto pb-2">
              <div className="inline-flex gap-2 rounded-full border border-white/15 bg-slate-900/50 p-1">
                {algorithms.map((algo) => (
                  <button
                    key={`bar-${algo.id}`}
                    onClick={() => setSelectedAlgorithm(algo.id)}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${
                      selectedAlgorithm === algo.id
                        ? 'bg-purple-500/25 text-purple-100'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {algo.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Algorithm Selector */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6"><ScrambleText text="Choose Algorithm" durationMs={700} /></h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {algorithms.map((algo) => (
                  <motion.button
                    key={algo.id}
                    onClick={() => setSelectedAlgorithm(algo.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAlgorithm === algo.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-600 bg-slate-800/50 hover:border-purple-400'
                    }`}
                  >
                    <h3 className="font-bold text-white mb-2">{algo.name}</h3>
                    <p className="text-sm text-slate-400">{algo.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === 'city-graph' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6"><ScrambleText text="Choose City Network" durationMs={700} /></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                onClick={() => setSelectedNetwork('world')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedNetwork === 'world'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-600 bg-slate-800/50 hover:border-purple-400'
                }`}
              >
                <h3 className="font-bold text-white mb-2">World Routes</h3>
                <p className="text-sm text-slate-400">Major intercontinental city connections</p>
              </motion.button>
              <motion.button
                onClick={() => setSelectedNetwork('europe')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedNetwork === 'europe'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-600 bg-slate-800/50 hover:border-purple-400'
                }`}
              >
                <h3 className="font-bold text-white mb-2">Europe Routes</h3>
                <p className="text-sm text-slate-400">Dense regional network for traversal and shortest paths</p>
              </motion.button>
            </div>
          </div>
        )}

        {mode === 'road-routing' && (
          <RoadRoutingMap />
        )}

        {mode === 'city-graph' && loadingGraph && (
          <div className="card p-8 text-slate-300">Loading city map graph data...</div>
        )}

        {mode === 'city-graph' && loadingError && (
          <div className="card p-8 text-red-300">Unable to load graph data: {loadingError}</div>
        )}

        {mode === 'city-graph' && !loadingGraph && !loadingError && graph.nodes.length > 0 && (
          <motion.div
            key={`${selectedAlgorithm}-${selectedNetwork}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GraphVisualizer
              initialGraph={graph}
              algorithm={selectedAlgorithm}
              algorithmName={algorithms.find((a) => a.id === selectedAlgorithm)?.name || ''}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
