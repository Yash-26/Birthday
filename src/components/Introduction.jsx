import React, { useEffect, useRef, useState } from 'react';
import { vibrate } from '../utils/haptics';
import './Introduction.css';

const TAP_COOLDOWN_MS = 450;

// One line at a time, like reading a story: each tap brings in the next line.
const Introduction = ({ lines, onNext }) => {
  const [shown, setShown] = useState(1);
  const lastTapRef = useRef(0);
  const endRef = useRef(null);
  const isComplete = shown >= lines.length;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [shown]);

  const handleTap = () => {
    const now = performance.now();
    if (now - lastTapRef.current < TAP_COOLDOWN_MS) return;
    lastTapRef.current = now;

    if (isComplete) {
      vibrate(15);
      onNext();
      return;
    }
    vibrate(6);
    setShown((count) => count + 1);
  };

  return (
    <div className="introduction" onClick={handleTap} role="button" tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTap()}
      aria-label={isComplete ? 'Continue' : 'Show next line'}
    >
      <div className="intro-lines">
        {lines.slice(0, shown).map((line, index) => (
          <p
            key={index}
            className={`intro-line ${index === shown - 1 ? 'latest' : ''} ${index === lines.length - 1 ? 'final' : ''}`}
          >
            {line}
          </p>
        ))}
        <div ref={endRef} />
      </div>

      <p className="scene-hint intro-hint">
        {isComplete ? 'Tap to step inside ✨' : 'Tap anywhere'}
      </p>
    </div>
  );
};

export default Introduction;
