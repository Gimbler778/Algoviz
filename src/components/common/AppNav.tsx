'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from '@/components/common/BrandLogo';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/algorithms/sorting', label: 'Sorting' },
  { href: '/algorithms/graphs', label: 'Graphs' },
  { href: '/algorithms/analysis', label: 'Analysis' },
  { href: '/algorithms/learn', label: 'Learn' },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-200/10 bg-[linear-gradient(90deg,rgba(4,22,39,0.95),rgba(8,28,47,0.88),rgba(27,22,28,0.8))] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:px-8">
        <BrandLogo size="sm" withText />

        <nav className="flex w-full items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1 lg:w-auto [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? 'bg-cyan-400/20 text-cyan-200'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
