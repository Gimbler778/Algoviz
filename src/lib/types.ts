// Algorithm types
export interface SortingAlgorithm {
  name: string;
  description: string;
  complexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  isStable: boolean;
  code: string;
}

export interface GraphNode {
  id: string | number;
  x: number;
  y: number;
  label?: string;
  visited?: boolean;
  distance?: number;
}

export interface GraphEdge {
  from: string | number;
  to: string | number;
  weight?: number;
  visited?: boolean;
  path?: boolean;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AlgorithmStep {
  array?: number[];
  indices?: {
    comparing?: number[];
    sorted?: number[];
    active?: number[];
  };
  description: string;
  comparisons?: number;
  swaps?: number;
}

export interface AnalysisData {
  algorithm: string;
  arraySize: number;
  timeElapsed: number;
  comparisons: number;
  swaps: number;
  actualTime: number;
}

export interface AlgorithmExplanation {
  title: string;
  description: string;
  pseudocode: string;
  complexity: {
    time: string;
    space: string;
  };
  keyPoints: string[];
  examples: string[];
}
