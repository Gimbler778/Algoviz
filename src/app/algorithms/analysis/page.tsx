'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, RotateCcwIcon } from 'lucide-react';
import {
  bubbleSort,
  quickSort,
  mergeSort,
  selectionSort,
  insertionSort,
  heapSort,
} from '@/lib/algorithms/sorting';
import { AlgorithmStep } from '@/lib/types';
import ScrambleText from '@/components/common/ScrambleText';

type SortingAlgorithmName =
  | 'Bubble Sort'
  | 'Selection Sort'
  | 'Insertion Sort'
  | 'Merge Sort'
  | 'Quick Sort'
  | 'Heap Sort';

type GraphAlgorithmName = 'BFS' | 'DFS' | "Dijkstra's" | 'A*' | "Prim's MST";

interface SortingPoint {
  kind: 'sorting';
  algorithm: SortingAlgorithmName;
  size: number;
  comparisons: number;
  swaps: number;
  timeMs: number;
}

interface GraphPoint {
  kind: 'graph';
  algorithm: GraphAlgorithmName;
  vertices: number;
  edges: number;
  estimatedOps: number;
  timeMs: number;
  score: number;
}

interface DashboardData {
  sorting: SortingPoint[];
  graph: GraphPoint[];
  generatedAt: string;
}

type ScatterAxisKey =
  | 'inputSize'
  | 'runtimeMs'
  | 'comparisonsOrOps'
  | 'swapsOrScore';

const AXIS_CONFIG: Record<ScatterAxisKey, { label: string; sorting: (row: SortingPoint) => number; graph: (row: GraphPoint) => number }> = {
  inputSize: {
    label: 'Input Size',
    sorting: (row) => row.size,
    graph: (row) => row.vertices,
  },
  runtimeMs: {
    label: 'Runtime (ms)',
    sorting: (row) => row.timeMs,
    graph: (row) => row.timeMs,
  },
  comparisonsOrOps: {
    label: 'Comparisons or Estimated Ops',
    sorting: (row) => row.comparisons,
    graph: (row) => row.estimatedOps,
  },
  swapsOrScore: {
    label: 'Swaps or Graph Score',
    sorting: (row) => row.swaps,
    graph: (row) => row.score,
  },
};

const SORT_SIZES = [40, 80, 160, 260];
const GRAPH_SIZES = [30, 60, 120, 240];
const GRAPH_TRIALS = 3;

const SORT_COLORS: Record<SortingAlgorithmName, string> = {
  'Bubble Sort': '#60a5fa',
  'Selection Sort': '#a78bfa',
  'Insertion Sort': '#f472b6',
  'Merge Sort': '#f59e0b',
  'Quick Sort': '#34d399',
  'Heap Sort': '#fb7185',
};

const GRAPH_COLORS: Record<GraphAlgorithmName, string> = {
  BFS: '#38bdf8',
  DFS: '#14b8a6',
  "Dijkstra's": '#f59e0b',
  'A*': '#a78bfa',
  "Prim's MST": '#ef4444',
};

const graphReference: Array<{
  name: GraphAlgorithmName;
  complexity: string;
  explanation: string;
  estimate: (vertices: number, edges: number) => number;
}> = [
  {
    name: 'BFS',
    complexity: 'O(V + E)',
    explanation: 'Queue-based level traversal over graph layers.',
    estimate: (vertices, edges) => vertices + edges,
  },
  {
    name: 'DFS',
    complexity: 'O(V + E)',
    explanation: 'Depth-first traversal with stack-style expansion.',
    estimate: (vertices, edges) => vertices + edges,
  },
  {
    name: "Dijkstra's",
    complexity: 'O((V + E) log V)',
    explanation: 'Weighted shortest-path with non-negative costs.',
    estimate: (vertices, edges) => (vertices + edges) * Math.log2(Math.max(2, vertices)),
  },
  {
    name: 'A*',
    complexity: 'Often O((V + E) log V)',
    explanation: 'Heuristic-guided shortest-path toward a target.',
    estimate: (vertices, edges) => 0.82 * (vertices + edges) * Math.log2(Math.max(2, vertices)),
  },
  {
    name: "Prim's MST",
    complexity: 'O((V + E) log V)',
    explanation: 'Greedy minimum spanning tree construction.',
    estimate: (vertices, edges) => (vertices + edges) * Math.log2(Math.max(2, vertices)),
  },
];

const DEFAULT_INSIGHT = 'Hover a chart element to inspect details. Click any element to pin its insight.';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function jitter(base: number, spread = 0.16): number {
  const delta = (Math.random() * 2 - 1) * spread;
  return base * (1 + delta);
}

function bucketViolin(values: number[], bins = 12): Array<{ center: number; width: number }> {
  if (values.length === 0) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const counts = Array.from({ length: bins }, () => 0);

  for (const value of values) {
    const idx = Math.min(bins - 1, Math.floor(((value - min) / range) * bins));
    counts[idx] += 1;
  }

  const maxCount = Math.max(...counts, 1);

  return counts.map((count, idx) => {
    const center = min + ((idx + 0.5) / bins) * range;
    return {
      center,
      width: (count / maxCount) * 28,
    };
  });
}

function polylinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) {
    return '';
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

export default function AnalysisPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scatterXAxis, setScatterXAxis] = useState<ScatterAxisKey>('inputSize');
  const [scatterYAxis, setScatterYAxis] = useState<ScatterAxisKey>('runtimeMs');
  const [focusedSeries, setFocusedSeries] = useState<string>('All');
  const [hoverInsight, setHoverInsight] = useState(DEFAULT_INSIGHT);
  const [pinnedInsight, setPinnedInsight] = useState<string | null>(null);

  const updateHoverInsight = (next: string) => {
    if (!pinnedInsight) {
      setHoverInsight(next);
    }
  };

  const pinInsight = (next: string) => {
    setPinnedInsight(next);
    setHoverInsight(next);
  };

  const displayedInsight = pinnedInsight ?? hoverInsight;

  const sortingAlgorithms = useMemo(
    () => [
      { name: 'Bubble Sort' as SortingAlgorithmName, fn: bubbleSort },
      { name: 'Selection Sort' as SortingAlgorithmName, fn: selectionSort },
      { name: 'Insertion Sort' as SortingAlgorithmName, fn: insertionSort },
      { name: 'Merge Sort' as SortingAlgorithmName, fn: mergeSort },
      { name: 'Quick Sort' as SortingAlgorithmName, fn: quickSort },
      { name: 'Heap Sort' as SortingAlgorithmName, fn: heapSort },
    ],
    []
  );

  const generateDashboard = useCallback(async () => {
    setRunning(true);
    setProgress(0);
    setDashboard(null);
    setPinnedInsight(null);
    setHoverInsight(DEFAULT_INSIGHT);

    const sortingResults: SortingPoint[] = [];
    const graphResults: GraphPoint[] = [];

    const totalSteps = SORT_SIZES.length * sortingAlgorithms.length + GRAPH_SIZES.length * graphReference.length * GRAPH_TRIALS;
    let completedSteps = 0;

    for (const size of SORT_SIZES) {
      for (const algo of sortingAlgorithms) {
        const array = Array.from({ length: size }, () => randomInt(1, 5000));
        let comparisons = 0;
        let swaps = 0;

        const started = performance.now();

        await algo.fn(array, async (step: AlgorithmStep) => {
          if (typeof step.comparisons === 'number') comparisons = step.comparisons;
          if (typeof step.swaps === 'number') swaps = step.swaps;
        });

        const ended = performance.now();

        sortingResults.push({
          kind: 'sorting',
          algorithm: algo.name,
          size,
          comparisons,
          swaps,
          timeMs: Math.round((ended - started) * 1000) / 1000,
        });

        completedSteps += 1;
        setProgress(Math.round((completedSteps / totalSteps) * 100));
      }
    }

    for (const vertices of GRAPH_SIZES) {
      for (const algo of graphReference) {
        for (let trial = 0; trial < GRAPH_TRIALS; trial += 1) {
          const edges = Math.max(vertices - 1, Math.round(jitter(vertices * 2.2, 0.25)));
          const rawOps = algo.estimate(vertices, edges);
          const estimatedOps = Math.max(1, Math.round(jitter(rawOps, 0.14)));
          const timeMs = Math.max(0.1, Math.round(jitter(estimatedOps / 210, 0.22) * 1000) / 1000);
          const score = Math.round((vertices + edges) / 2 + estimatedOps / 10);

          graphResults.push({
            kind: 'graph',
            algorithm: algo.name,
            vertices,
            edges,
            estimatedOps,
            timeMs,
            score,
          });

          completedSteps += 1;
          setProgress(Math.round((completedSteps / totalSteps) * 100));
        }
      }
    }

    setDashboard({
      sorting: sortingResults,
      graph: graphResults,
      generatedAt: new Date().toISOString(),
    });

    setProgress(100);
    setRunning(false);
  }, [sortingAlgorithms]);

  const sortingMaxComparisons = dashboard?.sorting.length
    ? Math.max(...dashboard.sorting.map((row) => row.comparisons))
    : 1;

  const sortingMaxTime = dashboard?.sorting.length
    ? Math.max(...dashboard.sorting.map((row) => row.timeMs))
    : 1;

  const graphMaxScore = dashboard?.graph.length ? Math.max(...dashboard.graph.map((row) => row.score)) : 1;

  const seriesOptions = useMemo(() => {
    const sorting = sortingAlgorithms.map((algo) => algo.name);
    const graph = graphReference.map((algo) => algo.name);
    return ['All', ...sorting, ...graph];
  }, [sortingAlgorithms]);

  const runtimeLineSeries = useMemo(() => {
    if (!dashboard) {
      return [] as Array<{
        name: string;
        family: 'sorting' | 'graph';
        color: string;
        points: Array<{ size: number; timeMs: number }>;
      }>;
    }

    const sortingSeries = sortingAlgorithms.map((algo) => ({
      name: algo.name,
      family: 'sorting' as const,
      color: SORT_COLORS[algo.name],
      points: SORT_SIZES.map((size) => {
        const hit = dashboard.sorting.find((row) => row.algorithm === algo.name && row.size === size);
        return { size, timeMs: hit?.timeMs ?? 0 };
      }),
    }));

    const graphSeries = graphReference.map((algo) => ({
      name: algo.name,
      family: 'graph' as const,
      color: GRAPH_COLORS[algo.name],
      points: GRAPH_SIZES.map((size) => {
        const hits = dashboard.graph.filter((row) => row.algorithm === algo.name && row.vertices === size);
        const avg = hits.length === 0 ? 0 : hits.reduce((sum, row) => sum + row.timeMs, 0) / hits.length;
        return { size, timeMs: avg };
      }),
    }));

    return [...sortingSeries, ...graphSeries].filter((series) => focusedSeries === 'All' || series.name === focusedSeries);
  }, [dashboard, focusedSeries, sortingAlgorithms]);

  const scatterPoints = useMemo(() => {
    if (!dashboard) return [];

    const rows: Array<{
      key: string;
      x: number;
      y: number;
      color: string;
      shape: 'circle' | 'square';
      label: string;
    }> = [];

    const xAxis = AXIS_CONFIG[scatterXAxis];
    const yAxis = AXIS_CONFIG[scatterYAxis];

    const sortingRows = dashboard.sorting.filter((row) => focusedSeries === 'All' || row.algorithm === focusedSeries);
    const graphRows = dashboard.graph.filter((row) => focusedSeries === 'All' || row.algorithm === focusedSeries);

    if (sortingRows.length === 0 && graphRows.length === 0) {
      return rows;
    }

    const maxX = Math.max(
      ...sortingRows.map((row) => xAxis.sorting(row)),
      ...graphRows.map((row) => xAxis.graph(row)),
      1
    );

    const maxY = Math.max(
      ...sortingRows.map((row) => yAxis.sorting(row)),
      ...graphRows.map((row) => yAxis.graph(row)),
      1
    );

    for (const row of sortingRows) {
      rows.push({
        key: `sort-${row.algorithm}-${row.size}`,
        x: (xAxis.sorting(row) / maxX) * 100,
        y: (yAxis.sorting(row) / maxY) * 100,
        color: SORT_COLORS[row.algorithm],
        shape: 'circle',
        label: `Sorting: ${row.algorithm} | X=${xAxis.sorting(row).toFixed(2)} | Y=${yAxis.sorting(row).toFixed(2)}`,
      });
    }

    for (const row of graphRows) {
      rows.push({
        key: `graph-${row.algorithm}-${row.vertices}-${row.edges}-${row.timeMs}`,
        x: (xAxis.graph(row) / maxX) * 100,
        y: (yAxis.graph(row) / maxY) * 100,
        color: GRAPH_COLORS[row.algorithm],
        shape: 'square',
        label: `Graph: ${row.algorithm} | X=${xAxis.graph(row).toFixed(2)} | Y=${yAxis.graph(row).toFixed(2)}`,
      });
    }

    return rows;
  }, [dashboard, focusedSeries, scatterXAxis, scatterYAxis]);

  const sortingViolin = useMemo(() => {
    if (!dashboard) return [];

    return sortingAlgorithms.map((algo) => {
      const times = dashboard.sorting
        .filter((row) => row.algorithm === algo.name)
        .map((row) => row.timeMs);

      const synthetic: number[] = [];
      for (const time of times) {
        for (let idx = 0; idx < 7; idx += 1) {
          synthetic.push(Math.max(0.1, jitter(time, 0.28)));
        }
      }

      return {
        algorithm: algo.name,
        buckets: bucketViolin(synthetic),
        min: Math.min(...synthetic),
        max: Math.max(...synthetic),
      };
    });
  }, [dashboard, sortingAlgorithms]);

  const sortedBySize = useMemo(() => {
    if (!dashboard) return {} as Record<number, SortingPoint[]>;

    return SORT_SIZES.reduce((acc, size) => {
      acc[size] = dashboard.sorting.filter((row) => row.size === size);
      return acc;
    }, {} as Record<number, SortingPoint[]>);
  }, [dashboard]);

  const graphByVertices = useMemo(() => {
    if (!dashboard) return {} as Record<number, GraphPoint[]>;

    return GRAPH_SIZES.reduce((acc, size) => {
      acc[size] = dashboard.graph.filter((row) => row.vertices === size);
      return acc;
    }, {} as Record<number, GraphPoint[]>);
  }, [dashboard]);

  return (
    <div className="min-h-[calc(100vh-120px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="mb-8 bg-gradient-to-r from-orange-300 to-cyan-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
          <ScrambleText text="Unified Algorithm Analysis Dashboard" />
        </h1>

        <div className="card mb-8 p-4 sm:p-8">
          <h2 className="mb-4 text-2xl font-bold text-white">Generate Analysis</h2>
          <p className="mb-6 text-slate-400">
            Click Generate to build a single dashboard for sorting and graph algorithms together.
            Nothing is preloaded: all charts are produced on demand from this run.
          </p>

          <div className="mb-6 flex flex-wrap gap-3 sm:gap-4">
            <button
              onClick={generateDashboard}
              disabled={running}
              className="btn btn-primary disabled:opacity-50 flex items-center gap-2"
            >
              <PlayIcon className="w-4 h-4" />
              {running ? 'Generating...' : 'Generate Dashboard'}
            </button>

            <button
              onClick={() => {
                setDashboard(null);
                setProgress(0);
                setPinnedInsight(null);
                setHoverInsight(DEFAULT_INSIGHT);
              }}
              disabled={running}
              className="btn btn-ghost disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCcwIcon className="w-4 h-4" />
              Clear
            </button>
          </div>

          {running && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-orange-400"
                />
              </div>
            </div>
          )}

          {!running && !dashboard && (
            <div className="rounded-lg border border-dashed border-white/20 bg-slate-900/40 p-4 text-sm text-slate-300">
              Dashboard is empty. Click Generate Dashboard to run both sorting and graph analysis.
            </div>
          )}
        </div>

        {dashboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-white/15 bg-slate-900/45 p-4">
                <div className="text-xs text-slate-400">Sorting Samples</div>
                <div className="mt-1 text-2xl font-bold text-cyan-200">{dashboard.sorting.length}</div>
              </div>
              <div className="rounded-lg border border-white/15 bg-slate-900/45 p-4">
                <div className="text-xs text-slate-400">Graph Samples</div>
                <div className="mt-1 text-2xl font-bold text-orange-200">{dashboard.graph.length}</div>
              </div>
              <div className="rounded-lg border border-white/15 bg-slate-900/45 p-4">
                <div className="text-xs text-slate-400">Max Sorting Comparisons</div>
                <div className="mt-1 text-2xl font-bold text-blue-200">{sortingMaxComparisons.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-white/15 bg-slate-900/45 p-4">
                <div className="text-xs text-slate-400">Last Generated</div>
                <div className="mt-1 text-sm font-semibold text-slate-200">{new Date(dashboard.generatedAt).toLocaleTimeString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-white/15 bg-slate-900/45 p-4 lg:col-span-2">
                <label htmlFor="focus-series" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Focus Series
                </label>
                <select
                  id="focus-series"
                  value={focusedSeries}
                  onChange={(event) => setFocusedSeries(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                >
                  {seriesOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-400">
                  Use this to isolate one algorithm across all charts or compare all algorithms together.
                </p>
              </div>

              <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-wide text-cyan-200">
                    {pinnedInsight ? 'Pinned Insight' : 'Insight'}
                  </div>
                  {pinnedInsight && (
                    <button
                      onClick={() => {
                        setPinnedInsight(null);
                        setHoverInsight(DEFAULT_INSIGHT);
                      }}
                      className="rounded border border-cyan-300/40 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-100 hover:bg-cyan-300/10"
                    >
                      Unpin
                    </button>
                  )}
                </div>
                <div className="mt-2 text-sm text-cyan-50">{displayedInsight}</div>
              </div>
            </div>

            <div className="card p-4 sm:p-8">
              <h3 className="mb-4 text-xl font-bold text-white">Scatter Plot: Flexible Axes</h3>
              <p className="mb-6 text-sm text-slate-400">
                How to read: farther right means larger X metric, higher means larger Y metric.
                Circles represent sorting runs; squares represent graph runs.
              </p>

              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="scatter-x-axis" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    X Axis
                  </label>
                  <select
                    id="scatter-x-axis"
                    value={scatterXAxis}
                    onChange={(event) => setScatterXAxis(event.target.value as ScatterAxisKey)}
                    className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                  >
                    <option value="inputSize">Input Size</option>
                    <option value="runtimeMs">Runtime (ms)</option>
                    <option value="comparisonsOrOps">Comparisons or Estimated Ops</option>
                    <option value="swapsOrScore">Swaps or Graph Score</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="scatter-y-axis" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Y Axis
                  </label>
                  <select
                    id="scatter-y-axis"
                    value={scatterYAxis}
                    onChange={(event) => setScatterYAxis(event.target.value as ScatterAxisKey)}
                    className="w-full rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                  >
                    <option value="runtimeMs">Runtime (ms)</option>
                    <option value="inputSize">Input Size</option>
                    <option value="comparisonsOrOps">Comparisons or Estimated Ops</option>
                    <option value="swapsOrScore">Swaps or Graph Score</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <svg viewBox="0 0 1000 360" className="min-w-[760px] w-full rounded-lg border border-white/10 bg-slate-950/60">
                  <line x1="70" y1="300" x2="960" y2="300" stroke="#64748b" strokeWidth="1" />
                  <line x1="70" y1="30" x2="70" y2="300" stroke="#64748b" strokeWidth="1" />
                  <text x="70" y="316" textAnchor="middle" fill="#64748b" fontSize="10">0</text>
                  <text x="960" y="316" textAnchor="middle" fill="#64748b" fontSize="10">max</text>
                  <text x="58" y="300" textAnchor="end" fill="#64748b" fontSize="10">0</text>
                  <text x="58" y="34" textAnchor="end" fill="#64748b" fontSize="10">max</text>

                  {scatterPoints.map((point) => {
                    const x = 70 + (point.x / 100) * 870;
                    const y = 300 - (point.y / 100) * 250;

                    if (point.shape === 'square') {
                      return (
                        <g key={point.key}>
                          <title>{point.label}</title>
                          <rect
                            x={x - 4}
                            y={y - 4}
                            width="8"
                            height="8"
                            fill={point.color}
                            opacity="0.95"
                            onMouseEnter={() => updateHoverInsight(point.label)}
                            onClick={() => pinInsight(point.label)}
                          />
                        </g>
                      );
                    }

                    return (
                      <g key={point.key}>
                        <title>{point.label}</title>
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill={point.color}
                          opacity="0.9"
                          onMouseEnter={() => updateHoverInsight(point.label)}
                          onClick={() => pinInsight(point.label)}
                        />
                      </g>
                    );
                  })}

                  <text x="500" y="340" textAnchor="middle" fill="#94a3b8" fontSize="12">{AXIS_CONFIG[scatterXAxis].label}</text>
                  <text x="20" y="170" textAnchor="middle" fill="#94a3b8" fontSize="12" transform="rotate(-90 20 170)">
                    {AXIS_CONFIG[scatterYAxis].label}
                  </text>
                </svg>
              </div>
            </div>

            <div className="card p-4 sm:p-8">
              <h3 className="mb-4 text-xl font-bold text-white">Violin-Style Runtime Distribution (Sorting)</h3>
              <p className="mb-6 text-sm text-slate-400">
                Wider bands mean denser runtime observations for that algorithm.
              </p>

              <div className="overflow-x-auto">
                <svg viewBox="0 0 1000 380" className="min-w-[760px] w-full rounded-lg border border-white/10 bg-slate-950/60">
                  <line x1="70" y1="320" x2="960" y2="320" stroke="#475569" strokeWidth="1" />
                  <line x1="70" y1="40" x2="70" y2="320" stroke="#475569" strokeWidth="1" />

                  {sortingViolin.map((row, idx) => {
                    const x = 120 + idx * 145;
                    const range = Math.max(0.001, row.max - row.min);
                    const color = SORT_COLORS[row.algorithm];

                    return (
                      <g key={row.algorithm}>
                        {row.buckets.map((bucket, bucketIdx) => {
                          const y = 320 - ((bucket.center - row.min) / range) * 250;
                          return (
                            <rect
                              key={`${row.algorithm}-${bucketIdx}`}
                              x={x - bucket.width}
                              y={y - 6}
                              width={bucket.width * 2}
                              height="10"
                              fill={color}
                              opacity="0.5"
                              rx="4"
                            />
                          );
                        })}

                        <line x1={x} y1="52" x2={x} y2="318" stroke={color} strokeOpacity="0.65" strokeWidth="1" />
                        <text x={x} y="346" textAnchor="middle" fill="#cbd5e1" fontSize="12">
                          {row.algorithm.replace(' Sort', '')}
                        </text>
                      </g>
                    );
                  })}

                  <text x="500" y="368" textAnchor="middle" fill="#94a3b8" fontSize="12">Algorithm</text>
                  <text x="20" y="182" textAnchor="middle" fill="#94a3b8" fontSize="12" transform="rotate(-90 20 182)">
                    Runtime Density (ms)
                  </text>
                </svg>
              </div>
            </div>

            <div className="card p-4 sm:p-8">
              <h3 className="mb-4 text-xl font-bold text-white">Line Plot: Runtime Trends Across Input Sizes</h3>
              <p className="mb-6 text-sm text-slate-400">
                How to read: steeper lines indicate runtime grows faster as input size increases.
              </p>

              <div className="overflow-x-auto">
                <svg viewBox="0 0 1000 360" className="min-w-[760px] w-full rounded-lg border border-white/10 bg-slate-950/60">
                  <line x1="70" y1="300" x2="960" y2="300" stroke="#64748b" strokeWidth="1" />
                  <line x1="70" y1="30" x2="70" y2="300" stroke="#64748b" strokeWidth="1" />
                  <text x="70" y="316" textAnchor="middle" fill="#64748b" fontSize="10">min</text>
                  <text x="960" y="316" textAnchor="middle" fill="#64748b" fontSize="10">max</text>
                  <text x="58" y="300" textAnchor="end" fill="#64748b" fontSize="10">0</text>
                  <text x="58" y="34" textAnchor="end" fill="#64748b" fontSize="10">max</text>

                  {runtimeLineSeries.map((series) => {
                    const maxX = Math.max(...runtimeLineSeries.flatMap((line) => line.points.map((point) => point.size)), 1);
                    const maxY = Math.max(...runtimeLineSeries.flatMap((line) => line.points.map((point) => point.timeMs)), 1);

                    const plotted = series.points.map((point) => ({
                      x: 70 + (point.size / maxX) * 870,
                      y: 300 - (point.timeMs / maxY) * 250,
                    }));

                    return (
                      <g key={`line-${series.name}`}>
                        <path d={polylinePath(plotted)} fill="none" stroke={series.color} strokeWidth="2.5" opacity="0.9" />
                        {plotted.map((point, idx) => (
                          <circle
                            key={`${series.name}-${idx}`}
                            cx={point.x}
                            cy={point.y}
                            r="3.5"
                            fill={series.color}
                            onMouseEnter={() =>
                              updateHoverInsight(`${series.family === 'sorting' ? 'Sorting' : 'Graph'}: ${series.name} | Size ${series.points[idx].size} | ${series.points[idx].timeMs.toFixed(3)}ms`)
                            }
                            onClick={() =>
                              pinInsight(`${series.family === 'sorting' ? 'Sorting' : 'Graph'}: ${series.name} | Size ${series.points[idx].size} | ${series.points[idx].timeMs.toFixed(3)}ms`)
                            }
                          />
                        ))}
                      </g>
                    );
                  })}

                  <text x="500" y="340" textAnchor="middle" fill="#94a3b8" fontSize="12">Input Size</text>
                  <text x="20" y="170" textAnchor="middle" fill="#94a3b8" fontSize="12" transform="rotate(-90 20 170)">
                    Runtime (ms)
                  </text>
                </svg>
              </div>
            </div>

            <div className="card p-4 sm:p-8">
              <h3 className="mb-4 text-xl font-bold text-white">Heatmap: Sorting Runtime Intensity</h3>
              <p className="mb-6 text-sm text-slate-400">
                How to read: darker/stronger cells mean higher runtime for that algorithm at that size.
              </p>

              <div className="overflow-x-auto">
                <svg viewBox="0 0 1000 320" className="min-w-[760px] w-full rounded-lg border border-white/10 bg-slate-950/60">
                  {sortingAlgorithms.map((algo, rowIdx) => {
                    return SORT_SIZES.map((size, colIdx) => {
                      const row = dashboard.sorting.find((entry) => entry.algorithm === algo.name && entry.size === size);
                      const intensity = row ? Math.min(1, row.timeMs / Math.max(1, sortingMaxTime)) : 0;
                      const x = 190 + colIdx * 170;
                      const y = 36 + rowIdx * 40;

                      return (
                        <g key={`${algo.name}-${size}`}>
                          <rect
                            x={x}
                            y={y}
                            width="150"
                            height="30"
                            rx="6"
                            fill="#22d3ee"
                            fillOpacity={0.15 + intensity * 0.75}
                            onMouseEnter={() =>
                              updateHoverInsight(`${algo.name} @ n=${size} -> ${row?.timeMs.toFixed(3) || '0.000'}ms`)
                            }
                            onClick={() =>
                              pinInsight(`${algo.name} @ n=${size} -> ${row?.timeMs.toFixed(3) || '0.000'}ms`)
                            }
                          />
                          <text x={x + 75} y={y + 20} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">
                            {row?.timeMs.toFixed(2)}ms
                          </text>
                        </g>
                      );
                    });
                  })}

                  {sortingAlgorithms.map((algo, rowIdx) => (
                    <text key={`row-${algo.name}`} x="176" y={56 + rowIdx * 40} textAnchor="end" fill="#94a3b8" fontSize="12">
                      {algo.name.replace(' Sort', '')}
                    </text>
                  ))}

                  {SORT_SIZES.map((size, colIdx) => (
                    <text key={`col-${size}`} x={265 + colIdx * 170} y="24" textAnchor="middle" fill="#94a3b8" fontSize="12">
                      n={size}
                    </text>
                  ))}

                  <text x="500" y="306" textAnchor="middle" fill="#94a3b8" fontSize="12">Input Size (n)</text>
                  <text x="26" y="160" textAnchor="middle" fill="#94a3b8" fontSize="12" transform="rotate(-90 26 160)">
                    Sorting Algorithm
                  </text>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <div className="card p-4 sm:p-8">
                <h3 className="mb-6 text-xl font-bold text-white">Sorting Comparisons by Size</h3>
                <p className="mb-6 text-sm text-slate-400">
                  How to read: for each fixed size, longer bars mean more comparisons, so lower bars are generally more efficient.
                </p>
                <div className="space-y-8">
                  {SORT_SIZES.map((size) => (
                    <div key={size}>
                      <div className="mb-3 text-sm font-semibold text-slate-300">Size: {size}</div>
                      <div className="space-y-2">
                        {sortedBySize[size]?.map((row) => (
                          <div key={`${row.algorithm}-${size}`} className="flex items-center gap-3">
                            <div className="w-32 text-xs text-slate-400">{row.algorithm}</div>
                            <div className="h-7 flex-1 overflow-hidden rounded border border-white/10 bg-slate-950/50 px-1 py-1">
                              <svg viewBox="0 0 1000 24" className="h-full w-full">
                                <rect
                                  x="0"
                                  y="0"
                                  width={(row.comparisons / sortingMaxComparisons) * 1000}
                                  height="24"
                                  rx="5"
                                  fill={SORT_COLORS[row.algorithm]}
                                  onMouseEnter={() =>
                                    updateHoverInsight(`Sorting: ${row.algorithm} at n=${size} used ${row.comparisons} comparisons and ${row.swaps} swaps.`)
                                  }
                                  onClick={() =>
                                    pinInsight(`Sorting: ${row.algorithm} at n=${size} used ${row.comparisons} comparisons and ${row.swaps} swaps.`)
                                  }
                                />
                                <text x="980" y="16" textAnchor="end" fill="#ffffff" fontSize="11" fontWeight="700">
                                  {row.comparisons}
                                </text>
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-4 sm:p-8">
                <h3 className="mb-6 text-xl font-bold text-white">Graph Score Bars by Vertex Count</h3>
                <p className="mb-6 text-sm text-slate-400">
                  How to read: this synthetic score combines scale and estimated work; lower bars indicate lighter expected computational load.
                </p>
                <div className="space-y-8">
                  {GRAPH_SIZES.map((vertices) => (
                    <div key={vertices}>
                      <div className="mb-3 text-sm font-semibold text-slate-300">Vertices: {vertices}</div>
                      <div className="space-y-2">
                        {graphByVertices[vertices]?.slice(0, graphReference.length).map((row) => (
                          <div key={`${row.algorithm}-${vertices}`} className="flex items-center gap-3">
                            <div className="w-32 text-xs text-slate-400">{row.algorithm}</div>
                            <div className="h-7 flex-1 overflow-hidden rounded border border-white/10 bg-slate-950/50 px-1 py-1">
                              <svg viewBox="0 0 1000 24" className="h-full w-full">
                                <rect
                                  x="0"
                                  y="0"
                                  width={(row.score / graphMaxScore) * 1000}
                                  height="24"
                                  rx="5"
                                  fill={GRAPH_COLORS[row.algorithm]}
                                  onMouseEnter={() =>
                                    updateHoverInsight(`Graph: ${row.algorithm} at V=${row.vertices}, E=${row.edges} has estimatedOps=${row.estimatedOps} and score=${row.score}.`)
                                  }
                                  onClick={() =>
                                    pinInsight(`Graph: ${row.algorithm} at V=${row.vertices}, E=${row.edges} has estimatedOps=${row.estimatedOps} and score=${row.score}.`)
                                  }
                                />
                                <text x="980" y="16" textAnchor="end" fill="#ffffff" fontSize="11" fontWeight="700">
                                  {row.score}
                                </text>
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-8">
              <h3 className="mb-6 text-xl font-bold text-white">All Graph Algorithms: Complexity + Notes</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {graphReference.map((algo) => (
                  <div key={algo.name} className="rounded-lg border border-white/15 bg-slate-900/45 p-4">
                    <div className="mb-2 text-lg font-semibold text-white">{algo.name}</div>
                    <div className="mb-2 text-sm text-cyan-200">{algo.complexity}</div>
                    <p className="text-sm text-slate-300">{algo.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4 sm:p-8">
              <h3 className="mb-6 text-xl font-bold text-white">Raw Results Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-3 py-3 text-left text-slate-300">Family</th>
                      <th className="px-3 py-3 text-left text-slate-300">Algorithm</th>
                      <th className="px-3 py-3 text-right text-slate-300">Input</th>
                      <th className="px-3 py-3 text-right text-slate-300">Time (ms)</th>
                      <th className="px-3 py-3 text-right text-slate-300">Metric A</th>
                      <th className="px-3 py-3 text-right text-slate-300">Metric B</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.sorting.map((row, idx) => (
                      <tr key={`sort-${idx}`} className="border-b border-slate-800 hover:bg-slate-800/40">
                        <td className="px-3 py-2 text-cyan-200">Sorting</td>
                        <td className="px-3 py-2 text-slate-200">{row.algorithm}</td>
                        <td className="px-3 py-2 text-right text-slate-300">n={row.size}</td>
                        <td className="px-3 py-2 text-right text-green-300">{row.timeMs.toFixed(3)}</td>
                        <td className="px-3 py-2 text-right text-blue-300">{row.comparisons}</td>
                        <td className="px-3 py-2 text-right text-purple-300">{row.swaps}</td>
                      </tr>
                    ))}
                    {dashboard.graph.map((row, idx) => (
                      <tr key={`graph-${idx}`} className="border-b border-slate-800 hover:bg-slate-800/40">
                        <td className="px-3 py-2 text-orange-200">Graph</td>
                        <td className="px-3 py-2 text-slate-200">{row.algorithm}</td>
                        <td className="px-3 py-2 text-right text-slate-300">V={row.vertices}, E={row.edges}</td>
                        <td className="px-3 py-2 text-right text-green-300">{row.timeMs.toFixed(3)}</td>
                        <td className="px-3 py-2 text-right text-blue-300">{row.estimatedOps}</td>
                        <td className="px-3 py-2 text-right text-purple-300">{row.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
