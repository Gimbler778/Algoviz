'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PauseIcon, RotateCcwIcon } from 'lucide-react';
import {
  bubbleSort,
  quickSort,
  mergeSort,
  selectionSort,
  insertionSort,
  heapSort,
  shellSort,
  cocktailSort,
  countingSort,
  radixSort,
} from '@/lib/algorithms/sorting';
import { AlgorithmStep } from '@/lib/types';

interface SortingVisualizerProps {
  algorithm:
    | 'bubble'
    | 'quick'
    | 'merge'
    | 'selection'
    | 'insertion'
    | 'heap'
    | 'shell'
    | 'cocktail'
    | 'counting'
    | 'radix';
  algorithmName: string;
  complexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
}

export default function SortingVisualizer({
  algorithm,
  algorithmName,
  complexity,
}: SortingVisualizerProps) {
  const pausedRef = useRef(false);
  const runningRef = useRef(false);
  const stopRef = useRef(false);

  const [array, setArray] = useState<number[]>([]);
  const [sorting, setSorting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [arraySize, setArraySize] = useState(30);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, time: 0 });
  const [highlightedIndices, setHighlightedIndices] = useState({
    comparing: [] as number[],
    sorted: [] as number[],
    active: [] as number[],
  });
  const [description, setDescription] = useState('Ready to sort');

  const generateArray = useCallback(
    (size: number = arraySize) => {
      const newArray = Array.from({ length: size }, () =>
        Math.floor(Math.random() * 100) + 1
      );
      setArray(newArray);
      setHighlightedIndices({ comparing: [], sorted: [], active: [] });
      setDescription('Array generated. Click "Start" to begin sorting.');
      setStats({ comparisons: 0, swaps: 0, time: 0 });
    },
    [arraySize]
  );

  useEffect(() => {
    generateArray();
  }, [generateArray]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const sortFunc = useMemo(() => {
    switch (algorithm) {
      case 'bubble':
        return bubbleSort;
      case 'quick':
        return quickSort;
      case 'merge':
        return mergeSort;
      case 'selection':
        return selectionSort;
      case 'insertion':
        return insertionSort;
      case 'heap':
        return heapSort;
      case 'shell':
        return shellSort;
      case 'cocktail':
        return cocktailSort;
      case 'counting':
        return countingSort;
      case 'radix':
        return radixSort;
      default:
        return bubbleSort;
    }
  }, [algorithm]);

  const startSorting = useCallback(async () => {
    if (runningRef.current) return;

    runningRef.current = true;
    stopRef.current = false;
    pausedRef.current = false;
    setSorting(true);
    setPaused(false);
    setStats({ comparisons: 0, swaps: 0, time: 0 });

    const startTime = performance.now();
    const initialArray = [...array];

    let currentStats = { comparisons: 0, swaps: 0 };

    try {
      await sortFunc(initialArray, async (step: AlgorithmStep) => {
        if (stopRef.current) {
          throw new Error('SORT_ABORTED');
        }

        while (pausedRef.current && !stopRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 70));
        }

        if (stopRef.current) {
          throw new Error('SORT_ABORTED');
        }

        setArray(step.array || initialArray);
        setHighlightedIndices({
          comparing: step.indices?.comparing ?? [],
          sorted: step.indices?.sorted ?? [],
          active: step.indices?.active ?? [],
        });
        setDescription(step.description);

        if (step.comparisons !== undefined) currentStats.comparisons = step.comparisons;
        if (step.swaps !== undefined) currentStats.swaps = step.swaps;

        setStats({
          ...currentStats,
          time: Math.round(performance.now() - startTime),
        });

        await new Promise((resolve) => setTimeout(resolve, 101 - speed));
      });

      if (!stopRef.current) {
        setDescription('Sorting complete!');
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'SORT_ABORTED') {
        setDescription('Sort interrupted. Try resetting and running again.');
      }
    } finally {
      runningRef.current = false;
      setSorting(false);
      setHighlightedIndices({ comparing: [], sorted: [], active: [] });
    }
  }, [array, speed, sortFunc]);

  const togglePause = () => {
    const nextPaused = !pausedRef.current;
    pausedRef.current = nextPaused;
    setPaused(nextPaused);
  };

  const handleReset = () => {
    stopRef.current = true;
    pausedRef.current = false;
    runningRef.current = false;
    setPaused(false);
    setSorting(false);
    generateArray();
  };

  const handleArraySizeChange = (newSize: number) => {
    setArraySize(newSize);
    const newArray = Array.from({ length: newSize }, () =>
      Math.floor(Math.random() * 100) + 1
    );
    setArray(newArray);
    setHighlightedIndices({ comparing: [], sorted: [], active: [] });
    setDescription('Array resized. Click "Start" to begin sorting.');
  };

  const maxValue = Math.max(...array, 100);

  return (
    <div className="w-full">
      {/* Visualizer */}
      <div className="card p-8 mb-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{algorithmName}</h2>
          <p className="text-slate-400">{description}</p>
        </div>

        {/* Array Visualization */}
        <div className="flex items-end justify-center gap-1 h-80 bg-slate-800/50 rounded-lg p-4 mb-8">
          {array.map((value, idx) => {
            let color = 'bg-blue-500';
            if (highlightedIndices.sorted.includes(idx)) color = 'bg-green-500';
            else if (highlightedIndices.comparing.includes(idx)) color = 'bg-red-500';
            else if (highlightedIndices.active.includes(idx)) color = 'bg-yellow-500';

            return (
              <motion.div
                key={idx}
                layout
                animate={{
                  height: `${(value / maxValue) * 100}%`,
                }}
                transition={{ duration: 0.2 }}
                className={`flex-1 rounded-t ${color} hover:opacity-75 transition relative group`}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition">
                  {value}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.comparisons}</div>
            <div className="text-sm text-slate-400">Comparisons</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.swaps}</div>
            <div className="text-sm text-slate-400">Swaps</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-pink-400">{stats.time}ms</div>
            <div className="text-sm text-slate-400">Time</div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={startSorting}
              disabled={sorting}
              className="btn btn-primary disabled:opacity-50 flex items-center gap-2"
            >
              <PlayIcon className="w-4 h-4" />
              Start
            </button>
            <button
              onClick={togglePause}
              disabled={!sorting}
              className="btn btn-secondary disabled:opacity-50 flex items-center gap-2"
            >
              {paused ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleReset}
              className="btn btn-ghost disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCcwIcon className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="sorting-speed" className="text-slate-300 font-medium">Speed</label>
              <span className="text-slate-400 text-sm">{speed}%</span>
            </div>
            <input
              id="sorting-speed"
              title="Sorting speed"
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              disabled={sorting}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Array Size Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="sorting-array-size" className="text-slate-300 font-medium">Array Size</label>
              <span className="text-slate-400 text-sm">{arraySize} elements</span>
            </div>
            <input
              id="sorting-array-size"
              title="Sorting array size"
              type="range"
              min="10"
              max="100"
              value={arraySize}
              onChange={(e) => handleArraySizeChange(Number(e.target.value))}
              disabled={sorting}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Complexity Analysis */}
      <div className="card p-8">
        <h3 className="text-xl font-bold text-white mb-6">Complexity Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-slate-400 mb-2">Best Case</div>
            <div className="text-lg font-mono text-green-400">{complexity.best}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-2">Average Case</div>
            <div className="text-lg font-mono text-blue-400">{complexity.average}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-2">Worst Case</div>
            <div className="text-lg font-mono text-red-400">{complexity.worst}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-2">Space</div>
            <div className="text-lg font-mono text-purple-400">{complexity.space}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
