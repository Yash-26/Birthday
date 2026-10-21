import React, { useEffect, useMemo, useRef, useState } from 'react';
import { vibrate } from '../utils/haptics';
import './EntryScreen.css';

const HOLD_MS = 1300;
const RING_RADIUS = 54;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const GATHER_STAR_COUNT = 34;

const STAR_PATH = 'M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z';

// Stars scattered around the screen (offsets from the hold star, in vw/vh)
// that drift in and brighten while she holds
function makeGatherStars() {
  const stars = [];
  while (stars.length < GATHER_STAR_COUNT) {
    const x = Math.random() * 96 - 48;
    const y = Math.random() * 90 - 45;
    if (Math.abs(x) < 14 && Math.abs(y) < 9) continue; // keep clear of the star itself
    stars.push({
      id: stars.length,
      style: {
        '--x': `${x.toFixed(1)}vw`,
        '--y': `${y.toFixed(1)}vh`,
        '--o': (0.15 + Math.random() * 0.35).toFixed(2),
        '--size': `${(1.5 + Math.random() * 2.5).toFixed(1)}px`,
      },
    });
  }
  return stars;
}

// Her name writes itself in like the start of a letter. Holding the star
// gathers the sky around it; letting go blooms into light and opens the site.
const EntryScreen = ({ content, onStart }) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isCharged, setIsCharged] = useState(false);
  const [isBlooming, setIsBlooming] = useState(false);
  const rafRef = useRef(null);
  const startTimeRef = useRef(0);
  const chargedRef = useRef(false);
  const startedRef = useRef(false);
  const gatherStars = useMemo(makeGatherStars, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const tick = (now) => {
    const p = Math.min(1, (now - startTimeRef.current) / HOLD_MS);
    setProgress(p);
    if (p >= 1) {
      chargedRef.current = true;
      setIsCharged(true);
      vibrate([20, 40, 60]);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const begin = () => {
    startedRef.current = true;
    setIsBlooming(true);
    vibrate([30, 40, 90]);
    onStart();
  };

  const handlePointerDown = (e) => {
    if (startedRef.current) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    chargedRef.current = false;
    setIsHolding(true);
    vibrate(8);
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  };

  // Sound can only start on the finger lifting (Android counts that as the tap),
  // so the hold "charges" the star and the release opens the universe.
  const handlePointerUp = () => {
    cancelAnimationFrame(rafRef.current);
    setIsHolding(false);
    if (chargedRef.current && !startedRef.current) {
      begin();
      return;
    }
    if (!startedRef.current) setProgress(0);
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !startedRef.current) {
      e.preventDefault();
      setProgress(1);
      begin();
    }
  };

  return (
    <div
      className={`entry-screen ${isHolding ? 'holding' : ''} ${isBlooming ? 'blooming' : ''}`}
      style={{ '--p': progress.toFixed(3) }}
    >
      <div className="entry-text">
        <h1 className="entry-greeting" aria-label={content.greeting}>
          <span className="entry-greeting-ink" aria-hidden="true">{content.greeting}</span>
          <span className="entry-pen" aria-hidden="true" />
        </h1>
        <p className="entry-subtitle">{content.subtitle}</p>
      </div>

      <button
        className={`hold-star ${isHolding ? 'holding' : ''} ${isCharged ? 'charged' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Press and hold to begin"
      >
        <span className="gather" aria-hidden="true">
          {gatherStars.map((star) => (
            <span key={star.id} className="gather-star" style={star.style} />
          ))}
        </span>

        <svg className="hold-ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle className="hold-ring-track" cx="60" cy="60" r={RING_RADIUS} />
          <circle
            className="hold-ring-fill"
            cx="60"
            cy="60"
            r={RING_RADIUS}
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - progress)}
          />
        </svg>
        <svg className="hold-star-shape" viewBox="0 0 100 100" aria-hidden="true">
          <path d={STAR_PATH} />
        </svg>
        <span className="hold-star-glow" aria-hidden="true"></span>

        {isBlooming && <span className="entry-bloom" aria-hidden="true" />}
      </button>

      <p className="scene-hint entry-hint">
        {isCharged ? 'Now let go ✨' : content.hint}
      </p>
    </div>
  );
};

export default EntryScreen;
