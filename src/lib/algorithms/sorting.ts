import { AlgorithmStep } from '../types';

// Bubble Sort
export async function bubbleSort(
  array: number[],
  onStep: (step: AlgorithmStep) => Promise<void>
): Promise<{ array: number[]; stats: { comparisons: number; swaps: number } }> {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      comparisons++;

      await onStep({
        array: arr,
        indices: {
          comparing: [j, j + 1],
          sorted: Array.from({ length: arr.length - i }, (_, k) => arr.length - 1 - k),
        },
        description: `Comparing ${arr[j]} and ${arr[j + 1]}`,
        comparisons,
        swaps,
      });

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;

        await onStep({
          array: arr,
          indices: {
            comparing: [j, j + 1],
            sorted: Array.from({ length: arr.length - i }, (_, k) => arr.length - 1 - k),
          },
          description: `Swapped ${arr[j + 1]} and ${arr[j]}`,
          comparisons,
          swaps,
        });
      }
    }
  }

  return { array: arr, stats: { comparisons, swaps } };
}

// Quick Sort
export async function quickSort(
  array: number[],
  onStep: (step: AlgorithmStep) => Promise<void>
): Promise<{ array: number[]; stats: { comparisons: number; swaps: number } }> {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  async function partition(low: number, high: number): Promise<number> {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;

      await onStep({
        array: arr,
        indices: { comparing: [j, high], active: [i + 1] },
        description: `Comparing ${arr[j]} with pivot ${pivot}`,
        comparisons,
        swaps,
      });

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        swaps++;
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    swaps++;
    return i + 1;
  }

  async function quickSortHelper(low: number, high: number) {
    if (low < high) {
      const pi = await partition(low, high);
      await quickSortHelper(low, pi - 1);
      await quickSortHelper(pi + 1, high);
    }
  }

  await quickSortHelper(0, arr.length - 1);
  return { array: arr, stats: { comparisons, swaps } };
}

// Merge Sort
export async function mergeSort(
  array: number[],
  onStep: (step: AlgorithmStep) => Promise<void>
): Promise<{ array: number[]; stats: { comparisons: number; swaps: number } }> {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  async function merge(left: number, mid: number, right: number) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0,
      j = 0,
      k = left;

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;

      await onStep({
        array: arr,
        indices: { comparing: [left + i, mid + 1 + j] },
        description: `Merging: comparing ${leftArr[i]} and ${rightArr[j]}`,
        comparisons,
        swaps,
      });

      if (leftArr[i] <= rightArr[j]) {
        arr[k++] = leftArr[i++];
      } else {
        arr[k++] = rightArr[j++];
      }
      swaps++;
    }

    while (i < leftArr.length) arr[k++] = leftArr[i++];
    while (j < rightArr.length) arr[k++] = rightArr[j++];
  }

  async function mergeSortHelper(left: number, right: number) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      await mergeSortHelper(left, mid);
      await mergeSortHelper(mid + 1, right);
      await merge(left, mid, right);
    }
  }

  await mergeSortHelper(0, arr.length - 1);
  return { array: arr, stats: { comparisons, swaps } };
}

// Selection Sort
export async function selectionSort(
  array: number[],
  onStep: (step: AlgorithmStep) => Promise<void>
): Promise<{ array: number[]; stats: { comparisons: number; swaps: number } }> {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < arr.length; j++) {
      comparisons++;

      await onStep({
        array: arr,
        indices: {
          comparing: [j, minIdx],
          sorted: Array.from({ length: i }, (_, k) => k),
        },
        description: `Finding minimum. Current min: ${arr[minIdx]} at index ${minIdx}`,
        comparisons,
        swaps,
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swaps++;

      await onStep({
        array: arr,
        indices: {
          comparing: [i, minIdx],
          sorted: Array.from({ length: i + 1 }, (_, k) => k),
        },
        description: `Swapped ${arr[minIdx]} to position ${i}`,
        comparisons,
        swaps,
      });
    }
  }

  return { array: arr, stats: { comparisons, swaps } };
}

// Insertion Sort
export async function insertionSort(
  array: number[],
  onStep: (step: AlgorithmStep) => Promise<void>
): Promise<{ array: number[]; stats: { comparisons: number; swaps: number } }> {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;

    while (j >= 0) {
      comparisons++;

      await onStep({
        array: arr,
        indices: {
          comparing: [j, i],
          sorted: Array.from({ length: i }, (_, k) => k),
        },
        description: `Comparing ${arr[j]} with ${key}`,
        comparisons,
        swaps,
      });

      if (arr[j] > key) {
        arr[j + 1] = arr[j];
        swaps++;
        j--;
      } else {
        break;
      }
    }

    arr[j + 1] = key;
  }

  return { array: arr, stats: { comparisons, swaps } };
}

// Heap Sort
export async function heapSort(
  array: number[],
  onStep: (step: AlgorithmStep) => Promise<void>
): Promise<{ array: number[]; stats: { comparisons: number; swaps: number } }> {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  async function heapify(n: number, i: number) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      comparisons++;
      if (arr[left] > arr[largest]) largest = left;
    }

    if (right < n) {
      comparisons++;
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      swaps++;

      await onStep({
        array: arr,
        indices: { comparing: [i, largest] },
        description: `Heapifying: swapped positions ${i} and ${largest}`,
        comparisons,
        swaps,
      });

      await heapify(n, largest);
    }
  }

  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    await heapify(arr.length, i);
  }

  for (let i = arr.length - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    swaps++;

    await onStep({
      array: arr,
      indices: { comparing: [0, i], sorted: Array.from({ length: arr.length - i }, (_, k) => arr.length - 1 - k) },
      description: `Moving largest element to end`,
      comparisons,
      swaps,
    });

    await heapify(i, 0);
  }

  return { array: arr, stats: { comparisons, swaps } };
}

// Shell Sort
export async function shellSort(
  array: number[],
  onStep: (step: AlgorithmStep) => Promise<void>
): Promise<{ array: number[]; stats: { comparisons: number; swaps: number } }> {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  for (let gap = Math.floor(arr.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < arr.length; i++) {
      const temp = arr[i];
      let j = i;

      while (j >= gap && arr[j - gap] > temp) {
        comparisons++;
        arr[j] = arr[j - gap];
        swaps++;
        j -= gap;

        await onStep({
          array: arr,
          indices: { comparing: [j, j + gap], active: [i] },
          description: `Gap ${gap}: shifting ${arr[j + gap]} to position ${j + gap}`,
          comparisons,
          swaps,
        });
      }

      arr[j] = temp;
      await onStep({
        array: arr,
        indices: { active: [j] },
        description: `Placed ${temp} at index ${j} with gap ${gap}`,
        comparisons,
        swaps,
      });
    }
  }

  return { array: arr, stats: { comparisons, swaps } };
}

// Cocktail Sort
export async function cocktailSort(
  array: number[],
  onStep: (step: AlgorithmStep) => Promise<void>
): Promise<{ array: number[]; stats: { comparisons: number; swaps: number } }> {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;
  let start = 0;
  let end = arr.length - 1;
  let swapped = true;

  while (swapped) {
    swapped = false;

    for (let i = start; i < end; i++) {
      comparisons++;

      await onStep({
        array: arr,
        indices: { comparing: [i, i + 1] },
        description: `Forward pass: comparing ${arr[i]} and ${arr[i + 1]}`,
        comparisons,
        swaps,
      });

      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swaps++;
        swapped = true;
      }
    }

    if (!swapped) break;
    swapped = false;
    end--;

    for (let i = end - 1; i >= start; i--) {
      comparisons++;

      await onStep({
        array: arr,
        indices: { comparing: [i, i + 1] },
        description: `Backward pass: comparing ${arr[i]} and ${arr[i + 1]}`,
        comparisons,
        swaps,
      });

      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swaps++;
        swapped = true;
      }
    }

    start++;
  }

  return { array: arr, stats: { comparisons, swaps } };
}

// Counting Sort
export async function countingSort(
  array: number[],
  onStep: (step: AlgorithmStep) => Promise<void>
): Promise<{ array: number[]; stats: { comparisons: number; swaps: number } }> {
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;

  const maxVal = Math.max(...arr);
  const minVal = Math.min(...arr);
  const range = maxVal - minVal + 1;
  const count = new Array(range).fill(0);

  for (let i = 0; i < arr.length; i++) {
    count[arr[i] - minVal]++;
    comparisons++;

    await onStep({
      array: arr,
      indices: { active: [i] },
      description: `Counting value ${arr[i]}`,
      comparisons,
      swaps,
    });
  }

  let idx = 0;
  for (let i = 0; i < range; i++) {
    while (count[i] > 0) {
      arr[idx] = i + minVal;
      count[i]--;
      swaps++;

      await onStep({
        array: arr,
        indices: { sorted: Array.from({ length: idx + 1 }, (_, k) => k) },
        description: `Placing ${arr[idx]} at index ${idx}`,
        comparisons,
        swaps,
      });

      idx++;
    }
  }

  return { array: arr, stats: { comparisons, swaps } };
}

// Radix Sort (base 10)
export async function radixSort(
  array: number[],
  onStep: (step: AlgorithmStep) => Promise<void>
): Promise<{ array: number[]; stats: { comparisons: number; swaps: number } }> {
  let arr = [...array];
  let comparisons = 0;
  let swaps = 0;
  const maxVal = Math.max(...arr);

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);

    for (let i = 0; i < arr.length; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      buckets[digit].push(arr[i]);
      comparisons++;
    }

    arr = buckets.flat();
    swaps += arr.length;

    await onStep({
      array: arr,
      description: `Processed digit place ${exp}`,
      comparisons,
      swaps,
    });
  }

  return { array: arr, stats: { comparisons, swaps } };
}
