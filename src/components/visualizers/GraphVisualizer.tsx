'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, RotateCcwIcon } from 'lucide-react';
import { Graph } from '@/lib/types';
import { bfs, dfs, dijkstra, aStar, prim, GraphStep } from '@/lib/algorithms/graphs';

interface GraphVisualizerProps {
  initialGraph: Graph;
  algorithm: 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'prim';
  algorithmName: string;
}

export default function GraphVisualizer({
  initialGraph,
  algorithm,
  algorithmName,
}: GraphVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const runningRef = useRef(false);
  const stopRef = useRef(false);

  const [graph, setGraph] = useState<Graph>(initialGraph);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visitedOrder, setVisitedOrder] = useState<(string | number)[]>([]);
  const [cityQuery, setCityQuery] = useState('');
  const [description, setDescription] = useState('Ready to start. Click "Start" to begin.');
  const [startNodeId, setStartNodeId] = useState<string | number>(initialGraph.nodes[0]?.id || 0);

  useEffect(() => {
    setGraph(initialGraph);
    setVisitedOrder([]);
    setCityQuery('');
    setDescription('Ready to start. Click "Start" to begin.');
    setStartNodeId(initialGraph.nodes[0]?.id || 0);
    setRunning(false);
    setPaused(false);
    pausedRef.current = false;
    runningRef.current = false;
    stopRef.current = false;
  }, [initialGraph]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const drawGraph = useCallback((graphData: Graph) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Map-like background
    ctx.fillStyle = '#0b1d2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.14)';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const nodeRadius = 12;

    // Draw edges
    graphData.edges.forEach((edge) => {
      const fromNode = graphData.nodes.find((n) => n.id === edge.from);
      const toNode = graphData.nodes.find((n) => n.id === edge.to);

      if (fromNode && toNode) {
        ctx.strokeStyle = edge.visited ? '#34d399' : 'rgba(96, 165, 250, 0.62)';
        ctx.lineWidth = edge.visited ? 3.2 : 2.2;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();

        // Draw route weight in KM.
        if (edge.weight) {
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          ctx.fillStyle = '#dbeafe';
          ctx.font = '11px Segoe UI';
          ctx.textAlign = 'center';
          ctx.fillText(`${String(edge.weight)} km`, midX, midY - 6);
        }
      }
    });

    // Draw nodes
    graphData.nodes.forEach((node) => {
      const isVisited = visitedOrder.includes(node.id);

      // Node marker
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = isVisited ? '#34d399' : '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = node.id === startNodeId ? '#fb923c' : '#f8fafc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Segoe UI';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(String(node.label || node.id), node.x + 15, node.y - 12);
    });
  }, [visitedOrder, startNodeId]);

  useEffect(() => {
    drawGraph(graph);
  }, [graph, drawGraph]);

  const algorithmFunc = useMemo(() => {
    switch (algorithm) {
      case 'bfs':
        return bfs;
      case 'dfs':
        return dfs;
      case 'dijkstra':
        return dijkstra;
      case 'astar':
        return aStar;
      case 'prim':
        return prim;
      default:
        return bfs;
    }
  }, [algorithm]);

  const filteredCities = useMemo(() => {
    const query = cityQuery.trim().toLowerCase();
    if (!query) return graph.nodes;

    return graph.nodes.filter((node) =>
      String(node.label || node.id).toLowerCase().includes(query)
    );
  }, [graph.nodes, cityQuery]);

  const cityOptions = filteredCities.length > 0 ? filteredCities : graph.nodes;

  const startAlgorithm = useCallback(async () => {
    if (runningRef.current) return;

    runningRef.current = true;
    stopRef.current = false;
    pausedRef.current = false;
    setRunning(true);
    setPaused(false);
    setVisitedOrder([]);

    try {
      await algorithmFunc(graph, startNodeId, async (step: GraphStep) => {
        if (stopRef.current) {
          throw new Error('GRAPH_ABORTED');
        }

        while (pausedRef.current && !stopRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 80));
        }

        if (stopRef.current) {
          throw new Error('GRAPH_ABORTED');
        }

        setGraph((prev) => ({ ...prev, nodes: step.nodes, edges: step.edges }));
        setVisitedOrder(step.visitedOrder);
        setDescription(step.description);

        await new Promise((resolve) => setTimeout(resolve, 520));
      });

      if (!stopRef.current) {
        setDescription('Algorithm complete!');
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'GRAPH_ABORTED') {
        setDescription('Unable to finish this run. Try Reset and Start again.');
      }
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  }, [graph, startNodeId, algorithmFunc]);

  const togglePause = () => {
    const nextPaused = !pausedRef.current;
    pausedRef.current = nextPaused;
    setPaused(nextPaused);
  };

  const resetGraph = () => {
    stopRef.current = true;
    pausedRef.current = false;
    runningRef.current = false;
    setPaused(false);
    setRunning(false);
    setGraph(initialGraph);
    setVisitedOrder([]);
    setDescription('Ready to start. Click "Start" to begin.');
    setStartNodeId(initialGraph.nodes[0]?.id || 0);
  };

  return (
    <div className="w-full">
      <div className="card p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{algorithmName}</h2>
          <p className="text-slate-400 min-h-6">{description}</p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="graph-city-search" className="text-sm font-medium text-slate-300">Search City</label>
            <input
              id="graph-city-search"
              title="Search city"
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="Type city name..."
              className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="graph-start-city" className="text-sm font-medium text-slate-300">Start City</label>
            <select
              id="graph-start-city"
              title="Start city"
              value={String(startNodeId)}
              onChange={(e) => {
                const selected = graph.nodes.find((node) => String(node.id) === e.target.value);
                if (selected) {
                  setStartNodeId(selected.id);
                }
              }}
              disabled={running}
              className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 disabled:opacity-50"
            >
              {cityOptions.map((node) => (
                <option key={String(node.id)} value={String(node.id)}>
                  {String(node.label || node.id)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Canvas */}
        <div className="mb-8 bg-slate-800/50 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={980}
            height={520}
            className="w-full border border-slate-700"
          />
        </div>

        {/* Visited Order */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-3">Visited Order</h3>
          <div className="flex flex-wrap gap-2">
            {visitedOrder.map((nodeId, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-green-400 text-sm"
              >
                {nodeId}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={startAlgorithm}
            disabled={running}
            className="btn btn-primary disabled:opacity-50 flex items-center gap-2"
          >
            <PlayIcon className="w-4 h-4" />
            Start
          </button>
          <button
            onClick={togglePause}
            disabled={!running}
            className="btn btn-secondary disabled:opacity-50 flex items-center gap-2"
          >
            {paused ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={resetGraph}
            className="btn btn-ghost disabled:opacity-50 flex items-center gap-2"
          >
            <RotateCcwIcon className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
