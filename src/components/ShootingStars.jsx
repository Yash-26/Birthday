import React, { useCallback, useEffect, useRef, useState } from 'react';
import { vibrate } from '../utils/haptics';
import './ShootingStars.css';

// Flight paths across the whole screen, in % of the screen: [startX, startY, endX, endY].
// They start and end off-screen, so each star seems to come from anywhere in the sky.
const PATHS = [
  [110, 18, -15, 62],
  [72, -6, -15, 52],
  [108, 50, -15, 92],
  [108, 30, 18, 106],
  [45, -6, -15, 38],
  [110, 64, 30, 108],
];
const SPEED_PX_PER_MS = 0.09;
const MIN_FLIGHT_MS = 3800;
const MAX_FLIGHT_MS = 6000;
const FIRST_FLIGHT_SLOWER = 1.2;
const NEXT_STAR_DELAY_MS = 500;
const RETRY_DELAY_MS = 350;
const STARDUST = [
  [-14, 8], [10, 4], [-4, 14], [16, 12], [-18, 2], [4, 6],
];

// She catches slow shooting stars one at a time. Each caught star blooms softly,
// then its light glides up into the sentence and becomes the next word.
// A missed star just flies off and another comes, so she can never get stuck.
const ShootingStars = ({ words, onComplete }) => {
  const layerRef = useRef(null);
  const wordRefs = useRef([]);
  const flightCountRef = useRef(0);
  const timersRef = useRef([]);
  const [caught, setCaught] = useState(0);
  const [lit, setLit] = useState(0);
  const [flight, setFlight] = useState(null);
  const [blooms, setBlooms] = useState([]);
  const [light, setLight] = useState(null);
  const isComplete = lit >= words.length;

  const later = (fn, ms) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  const launch = useCallback(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const { width, height } = layer.getBoundingClientRect();
    const id = flightCountRef.current++;
    const [sx, sy, ex, ey] = PATHS[id % PATHS.length];
    const x1 = (sx / 100) * width;
    const y1 = (sy / 100) * height;
    const x2 = (ex / 100) * width;
    const y2 = (ey / 100) * height;
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    // Same gentle speed whatever the path length
    let duration = Math.hypot(x2 - x1, y2 - y1) / SPEED_PX_PER_MS;
    duration = Math.min(MAX_FLIGHT_MS, Math.max(MIN_FLIGHT_MS, duration));
    if (id === 0) duration *= FIRST_FLIGHT_SLOWER;

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
        '--duration': `${Math.round(duration)}ms`,
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
    if (!flight || light) return;
    const layer = layerRef.current.getBoundingClientRect();
    const star = e.currentTarget.getBoundingClientRect();
    const x = star.left + star.width / 2 - layer.left;
    const y = star.top + star.height / 2 - layer.top;

    // Every word is already laid out (just unlit), so its spot is known
    const word = wordRefs.current[caught].getBoundingClientRect();
    const tx = word.left + word.width / 2 - layer.left;
    const ty = word.top + word.height / 2 - layer.top;

    vibrate(12);
    setFlight(null);
    setBlooms((current) => [...current, { id: flight.id, x, y }]);
    setLight({ id: flight.id, x, y, dx: tx - x, dy: ty - y });
    setCaught((count) => count + 1);
  };

  // The light has reached its word: the word lights up
  const handleLightArrived = (e) => {
    if (e.target !== e.currentTarget) return;
    const next = lit + 1;
    setLight(null);
    setLit(next);

    if (next >= words.length) {
      vibrate([20, 60, 20, 60, 90]);
      later(onComplete, 2800);
    } else {
      vibrate(8);
      later(launch, NEXT_STAR_DELAY_MS);
    }
  };

  let hint = 'Tap a shooting star to catch it ✨';
  if (isComplete) hint = '';
  else if (caught > 0) hint = `${caught} of ${words.length} caught`;

  return (
    <div className="stars-game">
      {/* The whole screen is the sky; stars fly behind the text */}
      <div className="sky-layer" ref={layerRef}>
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

        {blooms.map((bloom) => (
          <span key={bloom.id} className="catch-bloom" style={{ left: bloom.x, top: bloom.y }} aria-hidden="true">
            <span className="catch-halo" />
            {STARDUST.map(([dx, dy], k) => (
              <i key={k} style={{ '--dx': `${dx}px`, '--dy': `${dy}px`, animationDelay: `${k * 0.08}s` }} />
            ))}
          </span>
        ))}

        {light && (
          <span
            key={light.id}
            className="star-light"
            style={{ left: light.x, top: light.y, '--dx': `${light.dx}px`, '--dy': `${light.dy}px` }}
            onAnimationEnd={handleLightArrived}
            aria-hidden="true"
          >
            <span className="star-light-glow" />
          </span>
        )}
      </div>

      <div className="stars-text">
        <h2 className="scene-heading text-gradient">Catch the shooting stars</h2>
        <p className="scene-subheading">Each one carries a little something for you</p>
      </div>

      <p className={`wish-sentence ${isComplete ? 'complete' : ''}`} aria-live="polite">
        {/* A word ending in a comma ends its line, so the sentence breaks where it pauses */}
        {words.map((word, i) => (
          <React.Fragment key={word + i}>
            <span
              ref={(el) => { wordRefs.current[i] = el; }}
              className={`wish-word ${i < lit ? 'lit' : ''}`}
            >
              {word}
            </span>
            {word.endsWith(',') && <span className="wish-break" />}
          </React.Fragment>
        ))}
        <span className={`wish-heart ${isComplete ? 'lit' : ''}`}>❤️</span>
      </p>

      <div className="sky-space" aria-hidden="true" />

      <p className="scene-hint stars-hint">{hint}</p>
    </div>
  );
};

export default ShootingStars;
