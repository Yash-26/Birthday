import React, { useEffect, useMemo, useState } from 'react';
import { vibrate } from '../utils/haptics';
import './ConstellationFinale.css';

// A flowing cursive 'S', drawn star by star
const S_POINTS = [
  { id: 1, finalX: 70, finalY: 20 },
  { id: 2, finalX: 50, finalY: 10 },
  { id: 3, finalX: 27, finalY: 26 },
  { id: 4, finalX: 36, finalY: 40 },
  { id: 5, finalX: 50, finalY: 48 },
  { id: 6, finalX: 64, finalY: 58 },
  { id: 7, finalX: 73, finalY: 74 },
  { id: 8, finalX: 50, finalY: 90 },
  { id: 9, finalX: 30, finalY: 80 },
];

// The hidden pink star representing "me", right beside the 'S'
const ME_STAR = { id: 10, finalX: 85, finalY: 48 };

const STAR_PATH = 'M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z';

// Phases: 0 hidden, 1 scattered, 2 moving, 3 lines drawn,
// 4 pink star waiting for her tap, 5 revealed, 6 "one last thing"
const ConstellationFinale = ({ onNext }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 3800),
      setTimeout(() => setPhase(3), 7800),
      setTimeout(() => setPhase(4), 10000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== 5) return;
    const timer = setTimeout(() => setPhase(6), 5000);
    return () => clearTimeout(timer);
  }, [phase]);

  const stars = useMemo(() => S_POINTS.map((star) => ({
    ...star,
    startX: Math.random() * 90 + 5,
    startY: Math.random() * 90 + 5,
  })), []);

  const pathD = S_POINTS.reduce((acc, point, index) => (
    acc + (index === 0 ? `M ${point.finalX} ${point.finalY}` : ` L ${point.finalX} ${point.finalY}`)
  ), '');

  const handleMeStarTap = () => {
    if (phase !== 4) return;
    vibrate([30, 60, 30, 60, 120]);
    setPhase(5);
  };

  return (
    <div className="finale">
      <div className="finale-top-text">
        {phase >= 1 && phase < 2 && (
          <p className="finale-intro-text">Some things are easier to say when you look at the stars…</p>
        )}
        {phase === 4 && (
          <p className="finale-intro-text waiting">Do you see the little star beside yours? Tap it ✨</p>
        )}
      </div>

      <div className={`finale-sky ${phase >= 1 ? 'visible' : ''} ${phase >= 5 ? 'complete' : ''}`}>
        <svg viewBox="0 0 100 100" className="finale-svg" aria-hidden="true">
          <path
            d={pathD}
            className={`finale-path ${phase >= 3 ? 'draw-in' : ''}`}
            fill="none"
            pathLength="100"
          />
        </svg>

        {stars.map((star) => (
          <svg
            key={star.id}
            className={`finale-star ${phase >= 1 ? 'appear' : ''} ${phase >= 3 ? 'glow' : ''}`}
            viewBox="0 0 100 100"
            style={{
              left: `${phase >= 2 ? star.finalX : star.startX}%`,
              top: `${phase >= 2 ? star.finalY : star.startY}%`,
            }}
            aria-hidden="true"
          >
            <path d={STAR_PATH} />
          </svg>
        ))}

        <button
          className={`me-star ${phase >= 4 ? 'appear' : ''} ${phase >= 5 ? 'found' : ''}`}
          style={{ left: `${ME_STAR.finalX}%`, top: `${ME_STAR.finalY}%` }}
          onClick={handleMeStarTap}
          disabled={phase !== 4}
          aria-label="Tap the hidden star"
        >
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <path d={STAR_PATH} />
          </svg>
        </button>
      </div>

      <div className="finale-bottom-text">
        {phase >= 5 && (
          <>
            <h2 className="finale-heading text-accent">Your name, written in my sky</h2>
            <p className="finale-sub">And wherever you shine, I'll be right there beside you.</p>
          </>
        )}
        {phase >= 6 && (
          <button className="btn-soft finale-next" onClick={onNext}>I have something for you…</button>
        )}
      </div>
    </div>
  );
};

export default ConstellationFinale;
