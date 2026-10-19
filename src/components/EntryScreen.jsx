import React, { useEffect, useRef, useState } from 'react';
import { vibrate } from '../utils/haptics';
import './EntryScreen.css';

const HOLD_MS = 1300;
const RING_RADIUS = 54;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const EntryScreen = ({ content, name, onStart }) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isCharged, setIsCharged] = useState(false);
  const rafRef = useRef(null);
  const startTimeRef = useRef(0);
  const chargedRef = useRef(false);
  const startedRef = useRef(false);

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
      startedRef.current = true;
      onStart();
      return;
    }
    if (!startedRef.current) setProgress(0);
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !startedRef.current) {
      e.preventDefault();
      startedRef.current = true;
      onStart();
    }
  };

  return (
    <div className="entry-screen">
      <div className="entry-text">
        <h1 className="entry-title text-gradient">Hi {name}.</h1>
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
          <path d="M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z" />
        </svg>
        <span className="hold-star-glow" aria-hidden="true"></span>
      </button>

      <p className="scene-hint entry-hint">
        {isCharged ? 'Now let go ✨' : content.hint}
      </p>
    </div>
  );
};

export default EntryScreen;
