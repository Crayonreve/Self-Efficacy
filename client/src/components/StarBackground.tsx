import { useMemo } from 'react';

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  distance: number;
  color: string;
  shape: 'star5' | 'star4' | 'spark';
}

const STAR_COLORS = [
  '#6d16e6',
  '#7a32e0',
  '#5244c2',
  '#4120b9',
  '#8b5cf6',
  '#6d16e6',
  '#7a32e0',
  '#ffffff',
  '#c4b5f9',
  '#6d16e6',
  '#a78bfa',
  '#6d16e6',
];

const STAR_5 = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
const STAR_4 = 'polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%)';

function weightedTop(): number {
  // Density gradient: sparse at top, dense at bottom
  // Use rejection sampling with weight curve
  for (let attempt = 0; attempt < 30; attempt++) {
    const t = Math.random() * 100;
    let weight: number;
    if (t < 20) weight = 0.06;
    else if (t < 40) weight = 0.18;
    else if (t < 60) weight = 0.30;
    else if (t < 80) weight = 0.40;
    else weight = 0.50;
    if (Math.random() < weight) return t;
  }
  // fallback: bottom-heavy
  return 40 + Math.random() * 60;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => {
    const top = weightedTop();
    // Adjust left slightly away from extreme edges for bottom stars
    const left = Math.random() * 94 + 3;
    const size = 6 + Math.random() * 22;
    const opacity = 0.3 + Math.random() * 0.5;
    const duration = 3 + Math.random() * 5;
    const delay = Math.random() * 6;
    const distance = 5 + Math.random() * 10;
    const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    const shapeRand = Math.random();
    const shape = shapeRand < 0.55 ? 'star5' as const
      : shapeRand < 0.85 ? 'star4' as const
      : 'spark' as const;
    return { id: i, top, left, size, opacity, duration, delay, distance, color, shape };
  });
}

export default function StarBackground() {
  const stars = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return generateStars(isMobile ? 25 : 50);
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {stars.map((s) => {
        const clipPath = s.shape === 'star5' ? STAR_5 : s.shape === 'star4' ? STAR_4 : undefined;
        const isSpark = s.shape === 'spark';
        return (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              background: isSpark
                ? '#ffffff'
                : s.color,
              clipPath,
              borderRadius: isSpark ? '50%' : undefined,
              boxShadow: isSpark
                ? `0 0 ${s.size * 1.5}px ${s.size * 0.5}px rgba(255,255,255,0.7)`
                : `0 0 ${s.size * 0.8}px rgba(109,22,230,0.3)`,
              animation: `${['starFloat','starFloat2','starFloat3','starFloat4','starFloat5'][s.id % 5]} ${s.duration}s ${s.delay}s ease-in-out infinite`,
              '--float-distance': `${s.distance}px`,
              '--float-scale': `${0.95 + Math.random() * 0.08}`,
              '--star-opacity': `${s.opacity}`,
              willChange: 'transform, opacity',
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}
