'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(11,18,28,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="inline-block h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
          <span className="text-xl font-semibold tracking-tight text-white">Algoviz Atlas</span>
        </Link>

        <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
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
