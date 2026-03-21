import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function ShimmerButton({ children, className = '', ...props }: ShimmerButtonProps) {
  return (
    <button
      {...props}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-cyan-300/40 bg-cyan-400/15 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/25 ${className}`}
    >
      <span className="pointer-events-none absolute -left-14 top-0 h-full w-10 rotate-12 bg-white/40 blur-sm transition-all duration-700 group-hover:left-[120%]" />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
