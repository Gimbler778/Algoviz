'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import SpotlightCard from '@/components/ui/SpotlightCard';
import ShimmerButton from '@/components/ui/ShimmerButton';
import BrandLogo from '@/components/common/BrandLogo';
import ScrambleText from '@/components/common/ScrambleText';
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
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center sm:mb-16"
        >
          <div className="mb-6 flex justify-center">
            <BrandLogo size="lg" withText={false} />
          </div>
          <h1 className="mb-5 pt-1 bg-gradient-to-r from-cyan-200 via-sky-100 to-orange-200 bg-clip-text text-4xl font-bold leading-[1.3] tracking-tight text-transparent drop-shadow-[0_0_24px_rgba(34,211,238,0.25)] sm:mb-6 sm:text-6xl">
            <ScrambleText text="Algoviz" durationMs={600} />
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-200/90 sm:text-xl">
            Interactive visualizations for sorting, graph traversal, routing, and complexity.
            Learn algorithms by exploring them step by step.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/algorithms/sorting">
              <ShimmerButton className="w-full justify-center sm:w-auto">Start Visualizing</ShimmerButton>
            </Link>
            <Link href="/algorithms/graphs">
              <button className="btn btn-ghost w-full rounded-full px-5 sm:w-auto">Explore Graphs</button>
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
          <div className="md:col-span-2 mb-1 text-center text-2xl font-bold text-cyan-100">
            Algorithm Modules
          </div>
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
          className="mb-16 grid grid-cols-1 gap-4 text-center sm:grid-cols-3 sm:gap-8"
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
