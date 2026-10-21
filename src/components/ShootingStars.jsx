import React, { useCallback, useEffect, useRef, useState } from 'react';
import { vibrate } from '../utils/haptics';
import './ShootingStars.css';

// Flight paths across the sky, in % of the sky area: [startX, startY, endX, endY].
// They start and end off-screen so each star streaks all the way across.
const PATHS = [
  [108, 6, -12, 52],
  [104, 36, -12, 88],
  [72, -10, -12, 42],
  [108, 50, 6, 106],
  [92, -10, -12, 70],
];
const FIRST_FLIGHT_MS = 5200;
const FLIGHT_MS = 4300;
const NEXT_STAR_DELAY_MS = 700;
const RETRY_DELAY_MS = 350;

// She catches slow shooting stars one at a time; each one reveals the next word.
// A missed star just flies off and another comes, so she can never get stuck.
const ShootingStars = ({ words, onComplete }) => {
  const skyRef = useRef(null);
  const flightCountRef = useRef(0);
  const timersRef = useRef([]);
  const [caught, setCaught] = useState(0);
  const [flight, setFlight] = useState(null);
  const [bursts, setBursts] = useState([]);
  const isComplete = caught >= words.length;

  const later = (fn, ms) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  const launch = useCallback(() => {
    const sky = skyRef.current;
    if (!sky) return;
    const { width, height } = sky.getBoundingClientRect();
    const id = flightCountRef.current++;
    const [sx, sy, ex, ey] = PATHS[id % PATHS.length];
    const x1 = (sx / 100) * width;
    const y1 = (sy / 100) * height;
    const x2 = (ex / 100) * width;
    const y2 = (ey / 100) * height;
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

    setFlight({
      id,
      style: {
        '--x1': `${x1}px`,
        '--y1': `${y1}px`,
        '--x2': `${x2}px`,
        '--y2': `${y2}px`,
        '--xm': `${(x1 + x2) / 2}px`,
        '--ym': `${(y1 + y2) / 2}px`,
        '--angle': `${angle}deg`,
        '--duration': `${id === 0 ? FIRST_FLIGHT_MS : FLIGHT_MS}ms`,
      },
    });
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    timers.push(setTimeout(launch, 900));
    return () => timers.forEach(clearTimeout);
  }, [launch]);

  const handleMiss = (e) => {
    if (e.target !== e.currentTarget) return;
    setFlight(null);
    later(launch, RETRY_DELAY_MS);
  };

  const handleCatch = (e) => {
    if (!flight) return;
    const sky = skyRef.current.getBoundingClientRect();
    const star = e.currentTarget.getBoundingClientRect();
    setBursts((current) => [
      ...current,
      {
        id: flight.id,
        x: star.left + star.width / 2 - sky.left,
        y: star.top + star.height / 2 - sky.top,
      },
    ]);
    setFlight(null);
    vibrate(20);

    const next = caught + 1;
    setCaught(next);
    if (next >= words.length) {
      vibrate([30, 50, 30, 50, 80]);
      later(onComplete, 2800);
    } else {
      later(launch, NEXT_STAR_DELAY_MS);
    }
  };

  let hint = 'Tap a shooting star to catch it ✨';
  if (isComplete) hint = '';
  else if (caught > 0) hint = `${caught} of ${words.length} caught`;

  return (
    <div className="stars-game">
      <div>
        <h2 className="scene-heading text-gradient">Catch the shooting stars</h2>
        <p className="scene-subheading">Each one carries a little something for you</p>
      </div>

      <p className={`wish-sentence ${isComplete ? 'complete' : ''}`} aria-live="polite">
        {/* A word ending in a comma ends its line, so the sentence breaks where it pauses */}
        {words.slice(0, caught).map((word, i) => (
          <React.Fragment key={word + i}>
            <span className="wish-word">{word}</span>
            {word.endsWith(',') && <span className="wish-break" />}
          </React.Fragment>
        ))}
        {isComplete && <span className="wish-heart">❤️</span>}
      </p>

      <div className="sky-field" ref={skyRef}>
        {flight && (
          <button
            key={flight.id}
            className="shooting-star"
            style={flight.style}
            onPointerDown={handleCatch}
            onAnimationEnd={handleMiss}
            aria-label="Catch the shooting star"
          >
            <span className="shooting-star-tail" aria-hidden="true" />
            <span className="shooting-star-head" aria-hidden="true" />
          </button>
        )}

        {bursts.map((burst) => (
          <span key={burst.id} className="catch-burst" style={{ left: burst.x, top: burst.y }} aria-hidden="true">
            <span className="catch-flash" />
            {Array.from({ length: 10 }, (_, k) => (
              <i key={k} style={{ '--angle': `${k * 36}deg` }} />
            ))}
          </span>
        ))}
      </div>

      <p className="scene-hint stars-hint">{hint}</p>
    </div>
  );
};

export default ShootingStars;
