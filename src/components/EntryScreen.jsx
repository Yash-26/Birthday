import React, { useEffect, useMemo, useRef, useState } from 'react';
import { vibrate } from '../utils/haptics';
import './EntryScreen.css';

const HOLD_MS = 1300;
const RING_RADIUS = 54;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const HALO_STAR_COUNT = 16;
const HALO_RADIUS = 92;

const STAR_PATH = 'M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z';

// Stars scattered across the sky (offsets from the hold star, in px).
// While she holds, they drift in and settle into a small, even halo around her star.
function makeHaloStars() {
  const halfW = window.innerWidth / 2;
  const halfH = window.innerHeight / 2;
  const angleOf = (p) => Math.atan2(p.y, p.x);

  const starts = [];
  while (starts.length < HALO_STAR_COUNT) {
    const x = (Math.random() * 2 - 1) * halfW * 0.96;
    const y = (Math.random() * 2 - 1) * halfH * 0.9;
    if (Math.abs(x) < 60 && Math.abs(y) < 60) continue; // keep clear of the star itself
    starts.push({ x, y });
  }

  // Evenly spaced spots on a circle, matched to stars by direction so paths don't cross
  const targets = Array.from({ length: HALO_STAR_COUNT }, (_, k) => {
    const angle = (k / HALO_STAR_COUNT) * Math.PI * 2 - Math.PI / 2;
    return { x: Math.cos(angle) * HALO_RADIUS, y: Math.sin(angle) * HALO_RADIUS };
  });
  starts.sort((a, b) => angleOf(a) - angleOf(b));
  targets.sort((a, b) => angleOf(a) - angleOf(b));

  return targets.map((target, i) => ({
    id: i,
    style: {
      '--x': `${starts[i].x.toFixed(1)}px`,
      '--y': `${starts[i].y.toFixed(1)}px`,
      '--tx': `${target.x.toFixed(1)}px`,
      '--ty': `${target.y.toFixed(1)}px`,
      '--o': (0.25 + Math.random() * 0.3).toFixed(2),
    },
  }));
}

// Smooth start and finish, so the gathering feels gentle
const easeInOut = (t) => t * t * (3 - 2 * t);

// Her name writes itself in like the start of a letter. Holding the star
// gathers the sky into a soft halo around it; letting go blooms into light.
const EntryScreen = ({ content, onStart }) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isCharged, setIsCharged] = useState(false);
  const [isBlooming, setIsBlooming] = useState(false);
  const rafRef = useRef(null);
  const startTimeRef = useRef(0);
  const chargedRef = useRef(false);
  const startedRef = useRef(false);
  const haloStars = useMemo(makeHaloStars, []);

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
      style={{ '--p': progress.toFixed(3), '--g': easeInOut(progress).toFixed(3) }}
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
          <span className="gather-halo">
            {haloStars.map((star) => (
              <span key={star.id} className="gather-star" style={star.style}>
                <svg viewBox="0 0 100 100">
                  <path d={STAR_PATH} />
                </svg>
              </span>
            ))}
          </span>
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
