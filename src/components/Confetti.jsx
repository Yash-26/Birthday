import React, { useMemo } from 'react';
import './Confetti.css';

const COLORS = ['#FBCFE8', '#A78BFA', '#60A5FA', '#FDE68A', '#F9A8D4', '#FFFFFF'];

const Confetti = ({ count = 70, hearts = false }) => {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => {
    let shape = i % 2 ? 'rect' : 'circle';
    if (hearts && i % 3 === 0) shape = 'heart';
    return {
      id: i,
      shape,
      style: {
        '--left': `${Math.random() * 100}%`,
        '--delay': `${Math.random() * 0.8}s`,
        '--duration': `${2.8 + Math.random() * 2.2}s`,
        '--drift': `${(Math.random() - 0.5) * 140}px`,
        '--spin': `${Math.random() * 720 - 360}deg`,
        '--size': `${6 + Math.random() * 7}px`,
        '--color': COLORS[i % COLORS.length],
      },
    };
  }), [count, hearts]);

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span key={piece.id} className={`confetti-piece ${piece.shape}`} style={piece.style}>
          {piece.shape === 'heart' ? '❤' : null}
        </span>
      ))}
    </div>
  );
};

export default Confetti;
