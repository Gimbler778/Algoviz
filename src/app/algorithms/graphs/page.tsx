'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import GraphVisualizer from '@/components/visualizers/GraphVisualizer';
import { motion } from 'framer-motion';
import ScrambleText from '@/components/common/ScrambleText';

const RoadRoutingMap = dynamic(() => import('@/components/visualizers/RoadRoutingMap'), {
  ssr: false,
});

type Algorithm = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'prim';

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
  const [mode, setMode] = useState<Mode>('city-graph');

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

        {mode === 'road-routing' && (
          <RoadRoutingMap />
        )}

        {mode === 'city-graph' && (
          <motion.div
            key={selectedAlgorithm}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GraphVisualizer
              algorithm={selectedAlgorithm}
              algorithmName={algorithms.find((a) => a.id === selectedAlgorithm)?.name || ''}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
