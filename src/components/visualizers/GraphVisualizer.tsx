'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, RotateCcwIcon } from 'lucide-react';
import { Graph } from '@/lib/types';
import { bfs, dfs, dijkstra, aStar, prim, GraphStep } from '@/lib/algorithms/graphs';
import {
  buildGraphFromManualInput,
  edgeCountBounds,
  generateRandomGraph,
  sanitizeGraphForRun,
} from '@/lib/algorithms/graphBuilder.ts';

interface GraphVisualizerProps {
  algorithm: 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'prim';
  algorithmName: string;
}

export default function GraphVisualizer({
  algorithm,
  algorithmName,
}: GraphVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const runningRef = useRef(false);
  const stopRef = useRef(false);

  const [baseGraph, setBaseGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visitedOrder, setVisitedOrder] = useState<(string | number)[]>([]);
  const [description, setDescription] = useState('Create a graph manually or generate one randomly.');
  const [startNodeId, setStartNodeId] = useState<string | number>('');
  const [targetNodeId, setTargetNodeId] = useState<string | number>('');

  const [manualVerticesInput, setManualVerticesInput] = useState('A,B,C,D,E');
  const [manualEdgesInput, setManualEdgesInput] = useState('A,B,4\nA,C,2\nB,D,1\nC,D,5\nD,E,3');
  const [builderError, setBuilderError] = useState<string | null>(null);

  const [randomVertexCount, setRandomVertexCount] = useState(6);
  const [randomEdgeCount, setRandomEdgeCount] = useState(8);
  const [randomWeighted, setRandomWeighted] = useState(true);

  const needsWeights = algorithm === 'dijkstra' || algorithm === 'astar' || algorithm === 'prim';

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
        ctx.strokeStyle = edge.path ? '#facc15' : edge.visited ? '#34d399' : 'rgba(96, 165, 250, 0.38)';
        ctx.lineWidth = edge.path ? 4.6 : edge.visited ? 3.2 : 1.8;
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
      ctx.strokeStyle = node.id === startNodeId ? '#fb923c' : node.id === targetNodeId ? '#facc15' : '#f8fafc';
      ctx.lineWidth = node.id === targetNodeId ? 3 : 2;
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Segoe UI';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(String(node.label || node.id), node.x + 15, node.y - 12);
    });
  }, [visitedOrder, startNodeId, targetNodeId]);

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

  const nodeOptions = graph.nodes;

  const setGraphState = useCallback((nextGraph: Graph, message: string) => {
    const sanitized = sanitizeGraphForRun(nextGraph);
    setBaseGraph(sanitized);
    setGraph(sanitized);
    setVisitedOrder([]);
    setBuilderError(null);
    setDescription(message);
    const firstNode = sanitized.nodes[0]?.id ?? '';
    const lastNode = sanitized.nodes[sanitized.nodes.length - 1]?.id ?? '';
    setStartNodeId(firstNode);
    setTargetNodeId(lastNode);
    setRunning(false);
    setPaused(false);
    pausedRef.current = false;
    runningRef.current = false;
    stopRef.current = false;
  }, []);

  const handleGenerateRandomGraph = useCallback(() => {
    const bounds = edgeCountBounds(randomVertexCount);
    const safeEdgeCount = Math.max(bounds.min, Math.min(bounds.max, randomEdgeCount));

    const nextGraph = generateRandomGraph({
      vertexCount: randomVertexCount,
      edgeCount: safeEdgeCount,
      weighted: needsWeights || randomWeighted,
    });

    setGraphState(nextGraph, 'Random graph ready. Click Start to run the algorithm.');
  }, [needsWeights, randomEdgeCount, randomVertexCount, randomWeighted, setGraphState]);

  const handleBuildManualGraph = useCallback(() => {
    const result = buildGraphFromManualInput({
      verticesInput: manualVerticesInput,
      edgesInput: manualEdgesInput,
      requirePositiveWeights: needsWeights,
    });

    if (!result.valid || !result.graph) {
      setBuilderError(result.errors.join(' '));
      return;
    }

    setGraphState(result.graph, 'Manual graph is valid. Click Start to run the algorithm.');
  }, [manualEdgesInput, manualVerticesInput, needsWeights, setGraphState]);

  useEffect(() => {
    if (baseGraph.nodes.length === 0) {
      handleGenerateRandomGraph();
    }
  }, [baseGraph.nodes.length, handleGenerateRandomGraph]);

  const startAlgorithm = useCallback(async () => {
    if (runningRef.current) return;

    if (baseGraph.nodes.length === 0) {
      setDescription('No graph available yet. Build or generate a graph first.');
      return;
    }

    if (needsWeights) {
      const hasInvalidWeight = baseGraph.edges.some((edge) => typeof edge.weight !== 'number' || edge.weight <= 0);
      if (hasInvalidWeight) {
        setDescription('This algorithm requires positive edge weights.');
        return;
      }
    }

    const runnableGraph = sanitizeGraphForRun(baseGraph);
    setGraph(runnableGraph);

    runningRef.current = true;
    stopRef.current = false;
    pausedRef.current = false;
    setRunning(true);
    setPaused(false);
    setVisitedOrder([]);

    try {
      await algorithmFunc(runnableGraph, startNodeId, targetNodeId, async (step: GraphStep) => {
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
  }, [algorithmFunc, baseGraph, needsWeights, startNodeId, targetNodeId]);

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
    setGraph(sanitizeGraphForRun(baseGraph));
    setVisitedOrder([]);
    setDescription('Ready to start. Click "Start" to begin.');
    setStartNodeId(baseGraph.nodes[0]?.id ?? '');
    setTargetNodeId(baseGraph.nodes[baseGraph.nodes.length - 1]?.id ?? '');
  };

  return (
    <div className="w-full">
      <div className="card mb-8 p-4 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{algorithmName}</h2>
          <p className="text-slate-400 min-h-6">{description}</p>
        </div>

        <div className="mb-6 rounded-lg border border-white/15 bg-slate-900/35 p-4">
          <h3 className="mb-4 text-lg font-semibold text-white">Build Graph</h3>

          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="manual-vertices" className="text-sm font-medium text-slate-300">Vertices (comma-separated)</label>
              <input
                id="manual-vertices"
                type="text"
                value={manualVerticesInput}
                onChange={(event) => setManualVerticesInput(event.target.value)}
                placeholder="A,B,C,D"
                disabled={running}
                className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 disabled:opacity-50"
              />
              <p className="text-xs text-slate-400">Vertex names must be unique.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="manual-edges" className="text-sm font-medium text-slate-300">Edges (one per line)</label>
              <textarea
                id="manual-edges"
                value={manualEdgesInput}
                onChange={(event) => setManualEdgesInput(event.target.value)}
                placeholder={needsWeights ? 'A,B,5' : 'A,B'}
                rows={5}
                disabled={running}
                className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 disabled:opacity-50"
              />
              <p className="text-xs text-slate-400">
                Use <span className="font-semibold">from,to</span>
                {needsWeights ? ' or from,to,weight' : ' format. Weights are optional unless the selected algorithm requires them.'}
              </p>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-3">
            <button
              onClick={handleBuildManualGraph}
              disabled={running}
              className="btn btn-secondary disabled:opacity-50"
            >
              Use Manual Graph
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="random-vertex-count" className="text-sm font-medium text-slate-300">Random Vertices</label>
              <input
                id="random-vertex-count"
                type="number"
                min={2}
                max={26}
                value={randomVertexCount}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  const safeCount = Number.isFinite(parsed) ? Math.max(2, Math.min(26, Math.floor(parsed))) : 2;
                  const bounds = edgeCountBounds(safeCount);
                  setRandomVertexCount(safeCount);
                  setRandomEdgeCount((prev) => Math.max(bounds.min, Math.min(bounds.max, prev)));
                }}
                disabled={running}
                className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="random-edge-count" className="text-sm font-medium text-slate-300">Random Edges</label>
              <input
                id="random-edge-count"
                type="number"
                min={edgeCountBounds(randomVertexCount).min}
                max={edgeCountBounds(randomVertexCount).max}
                value={randomEdgeCount}
                onChange={(event) => {
                  const parsed = Number(event.target.value);
                  const bounds = edgeCountBounds(randomVertexCount);
                  const safeCount = Number.isFinite(parsed)
                    ? Math.max(bounds.min, Math.min(bounds.max, Math.floor(parsed)))
                    : bounds.min;
                  setRandomEdgeCount(safeCount);
                }}
                disabled={running}
                className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="random-weighted" className="text-sm font-medium text-slate-300">Weighted</label>
              <select
                id="random-weighted"
                value={needsWeights || randomWeighted ? 'yes' : 'no'}
                onChange={(event) => setRandomWeighted(event.target.value === 'yes')}
                disabled={running || needsWeights}
                className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 disabled:opacity-50"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateRandomGraph}
                disabled={running}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                Generate / Regenerate
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Random graph uses uppercase labels (A, B, C, ...) and stays connected by default.
          </p>

          {builderError && (
            <div className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
              {builderError}
            </div>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="graph-source-node" className="text-sm font-medium text-slate-300">Source Node</label>
            <select
              id="graph-source-node"
              title="Source node"
              value={String(startNodeId)}
              onChange={(e) => {
                const selected = graph.nodes.find((node) => String(node.id) === e.target.value);
                if (selected) setStartNodeId(selected.id);
              }}
              disabled={running || nodeOptions.length === 0}
              className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 disabled:opacity-50"
            >
              {nodeOptions.map((node) => (
                <option key={`source-${String(node.id)}`} value={String(node.id)}>
                  {String(node.label || node.id)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="graph-target-node" className="text-sm font-medium text-slate-300">Target Node</label>
            <select
              id="graph-target-node"
              title="Target node"
              value={String(targetNodeId)}
              onChange={(e) => {
                const selected = graph.nodes.find((node) => String(node.id) === e.target.value);
                if (selected) setTargetNodeId(selected.id);
              }}
              disabled={running || nodeOptions.length === 0}
              className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-400 disabled:opacity-50"
            >
              {nodeOptions.map((node) => (
                <option key={`target-${String(node.id)}`} value={String(node.id)}>
                  {String(node.label || node.id)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Canvas */}
        <div className="mb-8 overflow-hidden rounded-lg bg-slate-800/50">
          <canvas
            ref={canvasRef}
            width={980}
            height={520}
            className="h-[300px] w-full border border-slate-700 sm:h-[420px] lg:h-[520px]"
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
        <div className="flex flex-wrap gap-3 sm:gap-4">
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
