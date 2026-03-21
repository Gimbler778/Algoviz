import { ReactNode } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

export default function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/15 bg-[rgba(10,25,42,0.8)] p-6 transition-all duration-300 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.2),transparent_40%)] after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_85%_80%,rgba(251,146,60,0.16),transparent_40%)] hover:-translate-y-1 hover:border-cyan-300/50 hover:shadow-[0_22px_40px_rgba(2,12,26,0.4)] ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
