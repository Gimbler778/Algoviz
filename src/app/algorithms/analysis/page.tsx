'use client';

import { useState, useCallback, useMemo } from 'react';
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

interface AlgorithmStats {
  name: string;
  size: number;
  comparisons: number;
  swaps: number;
  time: number;
}

export default function AnalysisPage() {
  const [analysisData, setAnalysisData] = useState<AlgorithmStats[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const algorithms = useMemo(
    () => [
      { name: 'Bubble Sort', fn: bubbleSort },
      { name: 'Selection Sort', fn: selectionSort },
      { name: 'Insertion Sort', fn: insertionSort },
      { name: 'Merge Sort', fn: mergeSort },
      { name: 'Quick Sort', fn: quickSort },
      { name: 'Heap Sort', fn: heapSort },
    ],
    []
  );

  const runAnalysis = useCallback(async () => {
    setRunning(true);











    setAnalysisData([]);
    setProgress(0);

    const sizes = [50, 100, 200, 300];
    const results: AlgorithmStats[] = [];

    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      setProgress(Math.round((i / sizes.length) * 100));

      for (const algo of algorithms) {
        const array = Array.from({ length: size }, () =>
          Math.floor(Math.random() * 1000)
        );

        let stats = { comparisons: 0, swaps: 0 };
        const startTime = performance.now();

        await algo.fn(array, async (step: AlgorithmStep) => {
          if (step.comparisons !== undefined) stats.comparisons = step.comparisons;
          if (step.swaps !== undefined) stats.swaps = step.swaps;
        });

        const endTime = performance.now();

        results.push({
          name: algo.name,
          size,
          comparisons: stats.comparisons,
          swaps: stats.swaps,
          time: Math.round(endTime - startTime),
        });

        setAnalysisData([...results]);
      }
    }

    setProgress(100);
    setRunning(false);
  }, [algorithms]);

  // Get max values for scaling
  const maxComparisons = analysisData.length > 0 ? Math.max(...analysisData.map(d => d.comparisons)) : 100;
  const maxTime = analysisData.length > 0 ? Math.max(...analysisData.map(d => d.time)) : 100;

  // Group data by size
  const dataBySize = [50, 100, 200, 300].reduce((acc, size) => {
    acc[size] = analysisData.filter(d => d.size === size);
    return acc;
  }, {} as Record<number, AlgorithmStats[]>);
  return (
    <div className="min-h-[calc(100vh-120px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="mb-8 bg-gradient-to-r from-orange-300 to-cyan-300 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
          <ScrambleText text="Algorithm Analysis" />
        </h1>
        {/* Controls */}
        <div className="card mb-8 p-4 sm:p-8">
          <h2 className="mb-6 text-2xl font-bold text-white">Performance Comparison</h2>
          <p className="mb-6 text-slate-400">
            This tool compares the performance of different sorting algorithms across various array sizes.
            It measures comparisons, swaps, and execution time.
          </p>

          <div className="mb-6 flex flex-wrap gap-3 sm:gap-4">
            <button
              onClick={runAnalysis}
              disabled={running}
              className="btn btn-primary disabled:opacity-50 flex items-center gap-2"
            >
              <PlayIcon className="w-4 h-4" />
              {running ? 'Running...' : 'Run Analysis'}
            </button>
            <button
              onClick={() => {
                setAnalysisData([]);
                setProgress(0);
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
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Comparison Charts using custom bars */}
        {analysisData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Comparisons by Size */}
            <div className="card p-4 sm:p-8">
              <h3 className="mb-6 text-xl font-bold text-white">Comparisons by Array Size</h3>
              <div className="space-y-8">
                {[50, 100, 200, 300].map((size) => (
                  <div key={size}>
                    <div className="text-sm font-semibold text-slate-300 mb-3">Size: {size} elements</div>
                    <div className="space-y-2">
                      {dataBySize[size].map((data, idx) => (
                        <div key={data.name} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          <div className="text-sm text-slate-400 sm:w-32">{data.name}</div>
                          <div className="flex-1">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(data.comparisons / maxComparisons) * 100}%` }}
                              transition={{ duration: 0.5 }}
                              className={`h-8 rounded flex items-center justify-end pr-3 text-xs font-semibold text-white`}
                              style={{
                                backgroundColor: [
                                  '#3b82f6',
                                  '#8b5cf6', 
                                  '#ec4899',
                                  '#f59e0b',
                                  '#10b981',
                                  '#f87171'
                                ][idx]
                              }}
                            >
                              {data.comparisons}
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Time by Size */}
            <div className="card p-4 sm:p-8">
              <h3 className="mb-6 text-xl font-bold text-white">Execution Time by Array Size (ms)</h3>
              <div className="space-y-8">
                {[50, 100, 200, 300].map((size) => (
                  <div key={size}>
                    <div className="text-sm font-semibold text-slate-300 mb-3">Size: {size} elements</div>
                    <div className="space-y-2">
                      {dataBySize[size].map((data, idx) => (
                        <div key={data.name} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          <div className="text-sm text-slate-400 sm:w-32">{data.name}</div>
                          <div className="flex-1">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(data.time / maxTime) * 100}%` }}
                              transition={{ duration: 0.5 }}
                              className={`h-8 rounded flex items-center justify-end pr-3 text-xs font-semibold text-white`}
                              style={{
                                backgroundColor: [
                                  '#10b981',
                                  '#06b6d4',
                                  '#f59e0b',
                                  '#ef4444',
                                  '#6366f1',
                                  '#d946ef'
                                ][idx]
                              }}
                            >
                              {data.time}ms
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Table */}
            <div className="card p-4 sm:p-8">
              <h3 className="mb-6 text-xl font-bold text-white">Detailed Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-300">Algorithm</th>
                      <th className="text-right py-3 px-4 text-slate-300">Size</th>
                      <th className="text-right py-3 px-4 text-slate-300">Comparisons</th>
                      <th className="text-right py-3 px-4 text-slate-300">Swaps</th>
                      <th className="text-right py-3 px-4 text-slate-300">Time (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisData.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-slate-300">{row.name}</td>
                        <td className="text-right py-3 px-4 text-slate-300">{row.size}</td>
                        <td className="text-right py-3 px-4 text-blue-400">{row.comparisons}</td>
                        <td className="text-right py-3 px-4 text-purple-400">{row.swaps}</td>
                        <td className="text-right py-3 px-4 text-green-400">{row.time}</td>
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
