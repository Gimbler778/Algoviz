import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'lg';
  withText?: boolean;
}

export default function BrandLogo({ size = 'sm', withText = true }: BrandLogoProps) {
  const iconSize = size === 'lg' ? 54 : 28;
  const textSize = size === 'lg' ? 'text-5xl sm:text-6xl' : 'text-xl';

  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none" aria-hidden>
        <defs>
          <linearGradient id="brand-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <path d="M32 4 57 18v28L32 60 7 46V18L32 4Z" stroke="url(#brand-gradient)" strokeWidth="4" fill="rgba(17, 35, 58, 0.7)" />
        <circle cx="20" cy="24" r="4" fill="#22d3ee" />
        <circle cx="44" cy="24" r="4" fill="#22d3ee" />
        <circle cx="32" cy="42" r="4" fill="#fb923c" />
        <path d="M20 24h24M20 24l12 18M44 24 32 42" stroke="#c8f3ff" strokeWidth="2" />
      </svg>
      {withText && (
        <span className={`${textSize} font-bold tracking-tight bg-gradient-to-r from-cyan-200 via-sky-100 to-orange-200 bg-clip-text text-transparent`}>
          Algoviz
        </span>
      )}
    </Link>
  );
}
