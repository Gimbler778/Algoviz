'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';


interface AlgorithmDetail {
  id: string;
  name: string;
  category: 'sorting' | 'graph';
  description: string;
  pseudocode: string;
  complexity: {
    time: string;
    space: string;
  };
  keyPoints: string[];
  advantages: string[];
  disadvantages: string[];
}

const algorithms: AlgorithmDetail[] = [
  {
    id: 'bubble',
    name: 'Bubble Sort',
    category: 'sorting',
    description:
      'Bubble sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
    pseudocode: `procedure bubbleSort(A : list of sortable items)
  n := length(A)
  for i := 0 to n - 1 do
    for j := 0 to n - i - 2 do
      if A[j] > A[j + 1] then
        swap(A[j], A[j + 1])
      end if
    end for
  end for
end procedure`,
    complexity: {
      time: 'O(n²) - Best: O(n), Average: O(n²), Worst: O(n²)',
      space: 'O(1) - Constant space',
    },
    keyPoints: [
      'Stable sorting algorithm',
      'In-place sorting (no extra space)',
      'Simple to understand and implement',
      'Very inefficient for large datasets',
    ],
    advantages: [
      'Simple and easy to understand',
      'No extra space required',
      'Stable sorting',
      'Useful for small datasets',
    ],
    disadvantages: [
      'Very slow for large datasets',
      'O(n²) time complexity',
      'Not suitable for most practical purposes',
      'Many unnecessary comparisons',
    ],
  },
  {
    id: 'insertion',
    name: 'Insertion Sort',
    category: 'sorting',
    description:
      'Insertion sort builds the sorted array one item at a time. It iterates through an input array, and for each element, it finds the place it should be inserted in the sorted part and inserts it there.',
    pseudocode: `procedure insertionSort(A : list of sortable items)
  for i := 1 to length(A) - 1 do
    key := A[i]
    j := i - 1
    while j >= 0 and A[j] > key do
      A[j + 1] := A[j]
      j := j - 1
    end while
    A[j + 1] := key
  end for
end procedure`,
    complexity: {
      time: 'O(n²) - Best: O(n), Average: O(n²), Worst: O(n²)',
      space: 'O(1) - Constant space',
    },
    keyPoints: [
      'Stable sorting algorithm',
      'In-place sorting',
      'Best for small arrays',
      'Adaptive - efficient for nearly sorted data',
    ],
    advantages: [
      'Efficient for small datasets',
      'Efficient for nearly sorted data',
      'Stable sorting',
      'In-place sorting',
      'Online - can sort as it receives data',
    ],
    disadvantages: [
      'O(n²) worst-case time complexity',
      'Not efficient for large datasets',
      'Many element movements',
    ],
  },
  {
    id: 'selection',
    name: 'Selection Sort',
    category: 'sorting',
    description:
      'Selection sort divides the input into sorted and unsorted regions. It repeatedly finds the minimum element from the unsorted region and moves it to the sorted region.',
    pseudocode: `procedure selectionSort(A : list of sortable items)
  for i := 0 to length(A) - 2 do
    minIndex := i
    for j := i + 1 to length(A) - 1 do
      if A[j] < A[minIndex] then
        minIndex := j
      end if
    end for
    swap(A[i], A[minIndex])
  end for
end procedure`,
    complexity: {
      time: 'O(n²) - Best: O(n²), Average: O(n²), Worst: O(n²)',
      space: 'O(1) - Constant space',
    },
    keyPoints: [
      'Not stable by default',
      'In-place sorting',
      'Minimum number of swaps (at most n-1)',
      'Consistent performance',
    ],
    advantages: [
      'Minimum number of swaps',
      'In-place sorting',
      'Consistent O(n²) performance',
      'Simple to understand',
    ],
    disadvantages: [
      'O(n²) time complexity',
      'Not stable',
      'Poor performance on large datasets',
      'Many comparisons needed',
    ],
  },
  {
    id: 'merge',
    name: 'Merge Sort',
    category: 'sorting',
    description:
      'Merge sort is a divide-and-conquer algorithm that divides the array into halves, recursively sorts them, and then merges the sorted halves back together.',
    pseudocode: `procedure mergeSort(A : list of sortable items)
  if length(A) <= 1 then
    return A
  end if
  mid := length(A) / 2
  left := mergeSort(A[0...mid-1])
  right := mergeSort(A[mid...length(A)-1])
  return merge(left, right)
end procedure`,
    complexity: {
      time: 'O(n log n) - Best: O(n log n), Average: O(n log n), Worst: O(n log n)',
      space: 'O(n) - Linear space for merging',
    },
    keyPoints: [
      'Stable sorting algorithm',
      'Not in-place (requires O(n) extra space)',
      'Divide-and-conquer approach',
      'Guaranteed O(n log n) performance',
    ],
    advantages: [
      'Guaranteed O(n log n) performance',
      'Stable sorting',
      'Predictable performance',
      'Good for linked lists',
      'Parallelizable',
    ],
    disadvantages: [
      'Requires O(n) extra space',
      'Slower for small arrays due to overhead',
      'Not adaptive to nearly sorted data',
    ],
  },
  {
    id: 'quick',
    name: 'Quick Sort',
    category: 'sorting',
    description:
      'Quick sort is a divide-and-conquer algorithm that works by selecting a pivot element and partitioning the array around it, then recursively sorting the sub-arrays.',
    pseudocode: `procedure quickSort(A : list of sortable items, low, high)
  if low < high then
    pi := partition(A, low, high)
    quickSort(A, low, pi - 1)
    quickSort(A, pi + 1, high)
  end if
end procedure`,
    complexity: {
      time: 'O(n log n) - Best: O(n log n), Average: O(n log n), Worst: O(n²)',
      space: 'O(log n) - Recursive stack space',
    },
    keyPoints: [
      'Not stable by default',
      'In-place sorting',
      'Divide-and-conquer approach',
      'Very efficient in practice',
    ],
    advantages: [
      'Very efficient average case',
      'In-place sorting',
      'Low space requirement',
      'Cache-friendly',
      'Good for large datasets',
    ],
    disadvantages: [
      'O(n²) worst-case complexity',
      'Not stable',
      'Performance depends on pivot selection',
      'Not adaptive to nearly sorted data',
    ],
  },
  {
    id: 'heap',
    name: 'Heap Sort',
    category: 'sorting',
    description:
      'Heap sort uses a heap data structure to sort elements. It builds a heap from the data, then repeatedly extracts the maximum element and places it at the end of the sorted array.',
    pseudocode: `procedure heapSort(A : list of sortable items)
  buildMaxHeap(A)
  for i := length(A) - 1 to 1 do
    swap(A[0], A[i])
    heapify(A, 0, i)
  end for
end procedure`,
    complexity: {
      time: 'O(n log n) - Best: O(n log n), Average: O(n log n), Worst: O(n log n)',
      space: 'O(1) - Constant space (in-place)',
    },
    keyPoints: [
      'Not stable by default',
      'In-place sorting',
      'Guaranteed O(n log n) performance',
      'Uses heap data structure',
    ],
    advantages: [
      'Guaranteed O(n log n) performance',
      'In-place sorting',
      'Low space requirement',
      'Predictable performance',
    ],
    disadvantages: [
      'Not stable',
      'Complex to implement',
      'Poor cache performance',
      'Slower than quick sort in practice',
    ],
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    category: 'graph',
    description:
      'BFS explores a graph in layers using a queue. It visits all neighbors of a node before moving deeper, which makes it ideal for shortest path in unweighted graphs.',
    pseudocode: `procedure BFS(G, source)
  create empty queue Q
  mark source as visited
  enqueue source into Q

  while Q is not empty do
    u := dequeue Q
    for each neighbor v of u do
      if v is not visited then
        mark v as visited
        enqueue v into Q
      end if
    end for
  end while
end procedure`,
    complexity: {
      time: 'O(V + E)',
      space: 'O(V)',
    },
    keyPoints: [
      'Uses a queue data structure',
      'Layer-by-layer traversal order',
      'Finds shortest path by edge count in unweighted graphs',
      'Common in web crawling and connectivity checks',
    ],
    advantages: [
      'Simple and deterministic traversal order',
      'Shortest path in unweighted graphs',
      'Works well for level-order exploration',
    ],
    disadvantages: [
      'High memory on wide graphs',
      'Not weighted-distance optimal',
      'Can explore many irrelevant nodes',
    ],
  },
  {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    category: 'graph',
    description:
      'DFS explores as deep as possible before backtracking, typically with recursion or an explicit stack. It is useful for cycle detection, topological reasoning, and component analysis.',
    pseudocode: `procedure DFS(G, source)
  mark source as visited
  for each neighbor v of source do
    if v is not visited then
      DFS(G, v)
    end if
  end for
end procedure`,
    complexity: {
      time: 'O(V + E)',
      space: 'O(V)',
    },
    keyPoints: [
      'Uses recursion or stack',
      'Goes deep before exploring siblings',
      'Useful for cycle detection and connected components',
      'Foundation for many graph decompositions',
    ],
    advantages: [
      'Low implementation complexity',
      'Great for structural graph analysis',
      'Good when deep paths matter',
    ],
    disadvantages: [
      'Does not guarantee shortest path',
      'Recursion depth can overflow on huge graphs',
      'Traversal order depends on adjacency ordering',
    ],
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'graph',
    description:
      'Dijkstra computes the shortest path from a source to all vertices in a graph with non-negative edge weights by repeatedly expanding the current minimum-distance frontier.',
    pseudocode: `procedure Dijkstra(G, source)
  dist[source] := 0
  for each vertex v != source do
    dist[v] := infinity
  end for

  use min-priority queue PQ with (distance, vertex)
  insert (0, source)

  while PQ not empty do
    (d, u) := extract-min PQ
    for each edge (u, v, w) do
      if d + w < dist[v] then
        dist[v] := d + w
        update/increase-priority for v in PQ
      end if
    end for
  end while
end procedure`,
    complexity: {
      time: 'O((V + E) log V) with binary heap',
      space: 'O(V)',
    },
    keyPoints: [
      'Requires non-negative weights',
      'Uses greedy frontier expansion',
      'Outputs shortest distances and predecessor tree',
      'Core algorithm for road/pathfinding systems',
    ],
    advantages: [
      'Optimal shortest paths with valid weights',
      'Well-understood and widely deployed',
      'Works for sparse and dense graphs',
    ],
    disadvantages: [
      'Fails with negative weight edges',
      'Can still explore many nodes on large maps',
      'Priority-queue maintenance overhead',
    ],
  },
  {
    id: 'astar',
    name: 'A* Search',
    category: 'graph',
    description:
      'A* is an informed shortest-path algorithm that combines cost-so-far g(n) with a heuristic h(n) to prioritize nodes likely to reach the goal quickly.',
    pseudocode: `procedure A*(G, source, goal)
  openSet := {source}
  g[source] := 0
  f[source] := h(source)

  while openSet not empty do
    u := node in openSet with minimum f
    if u = goal then return reconstructed path

    remove u from openSet
    for each edge (u, v, w) do
      tentative := g[u] + w
      if tentative < g[v] then
        parent[v] := u
        g[v] := tentative
        f[v] := g[v] + h(v)
        add v to openSet
      end if
    end for
  end while
end procedure`,
    complexity: {
      time: 'Best depends on heuristic, worst often O((V + E) log V)',
      space: 'O(V)',
    },
    keyPoints: [
      'Heuristic-guided search',
      'Optimal if heuristic is admissible and consistent',
      'Often explores fewer nodes than Dijkstra',
      'Standard in game and navigation AI',
    ],
    advantages: [
      'Typically faster than uninformed shortest-path search',
      'Retains optimality with valid heuristic',
      'Highly practical for target-focused routing',
    ],
    disadvantages: [
      'Quality depends on heuristic design',
      'Memory heavy for huge state spaces',
      'Can degrade toward Dijkstra behavior',
    ],
  },
  {
    id: 'prim',
    name: "Prim's Minimum Spanning Tree",
    category: 'graph',
    description:
      'Prim builds a minimum spanning tree by starting from one node and repeatedly adding the lowest-cost edge that connects a new vertex to the current tree.',
    pseudocode: `procedure Prim(G, start)
  mark start as in MST
  add all edges from start to min-priority queue PQ

  while PQ not empty do
    (w, u, v) := extract-min PQ
    if v not in MST then
      add edge (u, v) to MST
      mark v as in MST
      add all edges from v to PQ
    end if
  end while
end procedure`,
    complexity: {
      time: 'O((V + E) log V) with binary heap',
      space: 'O(V + E)',
    },
    keyPoints: [
      'Builds MST, not shortest paths',
      'Greedy incremental edge selection',
      'Works for connected weighted undirected graphs',
      'Useful in network design and clustering',
    ],
    advantages: [
      'Produces globally minimum spanning cost',
      'Efficient with priority queue',
      'Great for infrastructure/network planning',
    ],
    disadvantages: [
      'Not meaningful for directed graphs',
      'Needs connected graph for full spanning tree',
      'Does not answer shortest path queries',
    ],
  },
];

export default function LearnPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="min-h-[calc(100vh-120px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Algorithm Explanations</h1>
          <p className="text-lg text-slate-300">
            Detailed explanations and pseudocode for all implemented sorting and graph algorithms.
            Click on any algorithm to learn more about how it works.
          </p>
        </div>

        <div className="space-y-4">
          {algorithms.map((algo) => (
            <motion.div key={algo.id} className="card overflow-hidden">
              <button
                onClick={() =>
                  setExpandedId(expandedId === algo.id ? null : algo.id)
                }
                className="w-full p-6 flex items-center justify-between hover:bg-slate-800/50 transition"
              >
                <div className="text-left">
                  <div className="mb-2 inline-flex rounded-full border border-white/20 bg-slate-900/60 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-cyan-200">
                    {algo.category}
                  </div>
                  <h2 className="text-xl font-bold text-white">{algo.name}</h2>
                  <p className="text-slate-400 text-sm mt-1">{algo.description.substring(0, 100)}...</p>
                </div>
                <motion.div
                  animate={{ rotate: expandedId === algo.id ? 180 : 0 }}
                  className="flex-shrink-0"
                >
                  <ChevronDownIcon className="w-6 h-6 text-slate-400" />
                </motion.div>
              </button>

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: expandedId === algo.id ? 'auto' : 0,
                  opacity: expandedId === algo.id ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-4 border-t border-slate-700 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                    <p className="text-slate-300">{algo.description}</p>
                  </div>

                  {/* Complexity */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Complexity Analysis</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Time Complexity:</span>
                        <span className="text-blue-400 font-mono">{algo.complexity.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Space Complexity:</span>
                        <span className="text-blue-400 font-mono">{algo.complexity.space}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pseudocode */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Pseudocode</h3>
                    <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm text-slate-300">
                      <code>{algo.pseudocode}</code>
                    </pre>
                  </div>

                  {/* Key Points */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Key Points</h3>
                    <ul className="space-y-2">
                      {algo.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex gap-3 text-slate-300">
                          <span className="text-blue-400 flex-shrink-0">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Advantages and Disadvantages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-green-400 mb-3">Advantages</h3>
                      <ul className="space-y-2">
                        {algo.advantages.map((adv, idx) => (
                          <li key={idx} className="flex gap-3 text-slate-300 text-sm">
                            <span className="text-green-400 flex-shrink-0">✓</span>
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-400 mb-3">Disadvantages</h3>
                      <ul className="space-y-2">
                        {algo.disadvantages.map((dis, idx) => (
                          <li key={idx} className="flex gap-3 text-slate-300 text-sm">
                            <span className="text-red-400 flex-shrink-0">✗</span>
                            <span>{dis}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
