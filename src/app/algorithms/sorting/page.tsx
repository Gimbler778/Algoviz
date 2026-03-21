'use client';

import { useState } from 'react';
import SortingVisualizer from '@/components/visualizers/SortingVisualizer';
import { motion } from 'framer-motion';

type Algorithm =
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

interface AlgorithmInfo {
  id: Algorithm;
  name: string;
  description: string;
  complexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
}

const algorithms: AlgorithmInfo[] = [
  {
    id: 'bubble',
    name: 'Bubble Sort',
    description: 'Simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  },
  {
    id: 'selection',
    name: 'Selection Sort',
    description: 'Divides the input into sorted and unsorted regions, repeatedly finding the minimum element from unsorted and moving it to sorted.',
    complexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  },
  {
    id: 'insertion',
    name: 'Insertion Sort',
    description: 'Builds the sorted array one item at a time by inserting elements into their correct position in the sorted portion.',
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  },
  {
    id: 'merge',
    name: 'Merge Sort',
    description: 'Divide-and-conquer algorithm that divides the array into halves, recursively sorts them, and merges the sorted halves.',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
  },
  {
    id: 'quick',
    name: 'Quick Sort',
    description: 'Divide-and-conquer algorithm that picks a pivot and partitions the array around it, then recursively sorts the partitions.',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
  },
  {
    id: 'heap',
    name: 'Heap Sort',
    description: 'Uses a heap data structure to sort elements by repeatedly extracting the maximum element and placing it at the end.',
    complexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)' },
  },
  {
    id: 'shell',
    name: 'Shell Sort',
    description: 'Generalized insertion sort using decreasing gaps to move elements quickly toward their final positions.',
    complexity: { best: 'O(n log n)', average: 'O(n^1.5)', worst: 'O(n²)', space: 'O(1)' },
  },
  {
    id: 'cocktail',
    name: 'Cocktail Sort',
    description: 'Bidirectional bubble sort that traverses both left-to-right and right-to-left in each iteration.',
    complexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
  },
  {
    id: 'counting',
    name: 'Counting Sort',
    description: 'Non-comparison sort that counts occurrences of each value, then reconstructs a sorted array.',
    complexity: { best: 'O(n + k)', average: 'O(n + k)', worst: 'O(n + k)', space: 'O(k)' },
  },
  {
    id: 'radix',
    name: 'Radix Sort',
    description: 'Sorts numbers digit by digit from least significant to most significant using stable buckets.',
    complexity: { best: 'O(d(n + b))', average: 'O(d(n + b))', worst: 'O(d(n + b))', space: 'O(n + b)' },
  },
];

export default function SortingPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('bubble');
  const currentAlgorithm = algorithms.find((a) => a.id === selectedAlgorithm)!;

  return (
    <div className="min-h-[calc(100vh-120px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="mb-8 text-4xl font-bold bg-gradient-to-r from-cyan-300 to-sky-200 bg-clip-text text-transparent">
          Sorting Algorithms
        </h1>

        <div className="mb-8 overflow-x-auto pb-2">
          <div className="inline-flex gap-2 rounded-full border border-white/15 bg-slate-900/50 p-1">
            {algorithms.map((algo) => (
              <button
                key={`bar-${algo.id}`}
                onClick={() => setSelectedAlgorithm(algo.id)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${
                  selectedAlgorithm === algo.id
                    ? 'bg-cyan-500/25 text-cyan-100'
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
          <h2 className="text-2xl font-bold text-white mb-6">Choose Algorithm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {algorithms.map((algo) => (
              <motion.button
                key={algo.id}
                onClick={() => setSelectedAlgorithm(algo.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAlgorithm === algo.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-600 bg-slate-800/50 hover:border-blue-400'
                }`}
              >
                <h3 className="font-bold text-white mb-2">{algo.name}</h3>
                <p className="text-sm text-slate-400">{algo.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Visualizer */}
        <motion.div
          key={selectedAlgorithm}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SortingVisualizer
            algorithm={selectedAlgorithm}
            algorithmName={currentAlgorithm.name}
            complexity={currentAlgorithm.complexity}
          />
        </motion.div>
      </div>
    </div>
  );
}
