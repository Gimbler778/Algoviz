'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

interface ScrambleTextProps {
  text: string;
  className?: string;
  durationMs?: number;
  staggerMs?: number;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export default function ScrambleText({
  text,
  className = '',
  durationMs = 900,
  staggerMs = 24,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const chars = useMemo(() => text.split(''), [text]);

  useEffect(() => {
    const state = { progress: 0 };

    setDisplay(text);

    tweenRef.current?.kill();

    tweenRef.current = gsap.to(state, {
      progress: 1,
      duration: durationMs / 1000,
      ease: 'power2.out',
      onUpdate: () => {
        const staggerStep = Math.max(staggerMs / durationMs, 0);

        const scrambled = chars
          .map((char, index) => {
            if (char === ' ') return ' ';

            const threshold = index * staggerStep;
            const revealProgress =
              threshold >= 1
                ? 0
                : Math.min(Math.max((state.progress - threshold) / (1 - threshold), 0), 1);

            if (revealProgress >= 1) return chars[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');

        setDisplay(scrambled);
      },
      onComplete: () => {
        setDisplay(text);
      },
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [text, durationMs, staggerMs, chars]);

  return <span className={className}>{display}</span>;
}
