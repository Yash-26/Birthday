import React, { forwardRef } from 'react';

const SPRINKLES = [
  [40, 150, '#A78BFA', 20], [62, 172, '#60A5FA', -30], [85, 146, '#FDE68A', 45],
  [112, 168, '#A78BFA', 10], [138, 150, '#60A5FA', -15], [158, 174, '#FDE68A', 35],
  [70, 104, '#F9A8D4', -20], [96, 112, '#FFFFFF', 30], [122, 100, '#F9A8D4', 15], [136, 116, '#FFFFFF', -40],
];

// A little two-tier cake. The flame leans with the "wind" via the --wind CSS variable.
const BirthdayCake = forwardRef(({ isOut, onFlameTap }, flameRef) => (
  <svg className={`cake ${isOut ? 'out' : ''}`} viewBox="0 0 200 220" role="img" aria-label="Birthday cake with a candle">
    <defs>
      <radialGradient id="flame-gradient" cx="50%" cy="70%" r="60%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="45%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#F97316" />
      </radialGradient>
      <radialGradient id="flame-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(253, 230, 138, 0.55)" />
        <stop offset="100%" stopColor="rgba(253, 230, 138, 0)" />
      </radialGradient>
      <linearGradient id="tier-bottom" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#F9D5E5" />
        <stop offset="100%" stopColor="#E8A9C5" />
      </linearGradient>
      <linearGradient id="tier-top" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#DDD6FE" />
        <stop offset="100%" stopColor="#B4A2F5" />
      </linearGradient>
    </defs>

    <ellipse cx="100" cy="196" rx="92" ry="12" fill="rgba(255,255,255,0.12)" />
    <ellipse cx="100" cy="192" rx="80" ry="8" fill="rgba(255,255,255,0.2)" />

    {/* Bottom tier */}
    <rect x="25" y="128" width="150" height="64" rx="12" fill="url(#tier-bottom)" />
    <path d="M25 140 Q25 128 37 128 L163 128 Q175 128 175 140 L175 146 Q166 156 158 146 Q148 160 138 146 Q126 158 116 146 Q104 160 94 146 Q82 158 72 146 Q60 160 50 146 Q40 156 25 146 Z" fill="#FFFFFF" opacity="0.95" />

    {/* Top tier */}
    <rect x="52" y="84" width="96" height="48" rx="10" fill="url(#tier-top)" />
    <path d="M52 95 Q52 84 63 84 L137 84 Q148 84 148 95 L148 100 Q141 108 134 100 Q124 111 114 100 Q104 110 94 100 Q84 111 74 100 Q64 108 52 100 Z" fill="#FFFFFF" opacity="0.95" />

    {SPRINKLES.map(([x, y, color, angle], i) => (
      <rect key={i} x={x} y={y} width="7" height="2.6" rx="1.3" fill={color} transform={`rotate(${angle} ${x + 3.5} ${y + 1.3})`} />
    ))}

    {/* Candle */}
    <rect x="94" y="44" width="12" height="42" rx="3" fill="#FFF7ED" />
    <path d="M94 54 L106 48 M94 64 L106 58 M94 74 L106 68 M94 84 L106 78" stroke="#F9A8D4" strokeWidth="3" />
    <line x1="100" y1="44" x2="100" y2="37" stroke="#3f3f46" strokeWidth="1.6" strokeLinecap="round" />

    {/* Flame (tap it as a fallback to blowing) */}
    <g className="flame-group" ref={flameRef} onClick={onFlameTap}>
      <circle className="flame-glow" cx="100" cy="24" r="26" fill="url(#flame-glow)" />
      <path className="flame" d="M100 6 C108 18 111 26 107 33 C104 38 96 38 93 33 C89 26 92 18 100 6 Z" fill="url(#flame-gradient)" />
      <rect x="76" y="0" width="48" height="44" fill="transparent" />
    </g>

    {/* Smoke after the candle goes out */}
    <g className="smoke">
      <circle cx="100" cy="30" r="3" />
      <circle cx="98" cy="30" r="4" />
      <circle cx="102" cy="30" r="3.5" />
    </g>
  </svg>
));

BirthdayCake.displayName = 'BirthdayCake';

export default BirthdayCake;
