'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import SpotlightCard from '@/components/ui/SpotlightCard';
import ShimmerButton from '@/components/ui/ShimmerButton';
import { 
  ShuffleIcon, 
  GitGraphIcon, 
  BarChart3Icon, 
  BookOpenIcon,
  ArrowRightIcon 
} from 'lucide-react';

const features = [
  {
    title: 'Sorting Visualizer',
    description: 'Visualize popular sorting algorithms with step-by-step execution',
    icon: ShuffleIcon,
    href: '/algorithms/sorting',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Graph Visualizer',
    description: 'Explore pathfinding and traversal algorithms on interactive graphs',
    icon: GitGraphIcon,
    href: '/algorithms/graphs',
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Algorithm Analysis',
    description: 'Compare complexity, performance, and visualize algorithm behavior',
    icon: BarChart3Icon,
    href: '/algorithms/analysis',
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Learn',
    description: 'Understand algorithms with detailed explanations and pseudocode',
    icon: BookOpenIcon,
    href: '/algorithms/learn',
    color: 'from-orange-500 to-orange-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-120px)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-300 via-sky-200 to-orange-300 bg-clip-text text-transparent">
            Algoviz
          </h1>
          <p className="text-xl text-slate-200/90 max-w-2xl mx-auto">
            Interactive visualizations for sorting, graph traversal, routing, and complexity.
            Learn algorithms by exploring them step by step.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/algorithms/sorting">
              <ShimmerButton>Start Visualizing</ShimmerButton>
            </Link>
            <Link href="/algorithms/graphs">
              <button className="btn btn-ghost rounded-full px-5">Explore Graphs</button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 flex flex-wrap justify-center gap-3"
        >
          {['Bubble', 'Quick', 'Merge', 'Heap', 'Dijkstra', 'A*', 'Prim', 'OSRM'].map((item) => (
            <span
              key={item}
              className="rounded-full border border-cyan-300/35 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-100"
            >
              {item}
            </span>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <Link href={feature.href}>
                  <SpotlightCard className="group h-full cursor-pointer">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 mb-4">{feature.description}</p>
                    <div className="flex items-center gap-2 text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </div>
                  </SpotlightCard>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-3 gap-8 text-center mb-16"
        >
          <div className="card p-6">
            <div className="text-4xl font-bold text-cyan-300 mb-2">10+</div>
            <div className="text-slate-400">Sorting Algorithms</div>
          </div>
          <div className="card p-6">
            <div className="text-4xl font-bold text-orange-300 mb-2">8+</div>
            <div className="text-slate-400">Graph Algorithms</div>
          </div>
          <div className="card p-6">
            <div className="text-4xl font-bold text-sky-200 mb-2">Real-time</div>
            <div className="text-slate-400">Analysis & Charts</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
