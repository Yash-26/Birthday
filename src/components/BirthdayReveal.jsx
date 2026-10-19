import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';
import { vibrate } from '../utils/haptics';
import { useBlowDetector } from '../hooks/useBlowDetector';
import BirthdayCake from './BirthdayCake';
import Confetti from './Confetti';
import './BirthdayReveal.css';

const ORB_POSITIONS = [
  { x: 22, y: 26 },
  { x: 74, y: 18 },
  { x: 48, y: 50 },
  { x: 20, y: 76 },
  { x: 78, y: 70 },
];

// intro -> pop -> cake -> wish -> reveal
const BirthdayReveal = ({ content, name, onNext }) => {
  const [phase, setPhase] = useState('intro');
  const [introStep, setIntroStep] = useState(1);
  const [popped, setPopped] = useState([]);
  const [candleOut, setCandleOut] = useState(false);
  const [imageError, setImageError] = useState(false);
  const flameRef = useRef(null);
  const timersRef = useRef([]);
  const words = content.popWords;

  const later = (fn, ms) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const candleOutRef = useRef(false);
  const blowOut = useCallback(() => {
    if (candleOutRef.current) return;
    candleOutRef.current = true;
    setCandleOut(true);
    vibrate([40, 30, 80]);
    timersRef.current.push(setTimeout(() => setPhase('wish'), 1800));
    timersRef.current.push(setTimeout(() => setPhase('reveal'), 6200));
  }, []);

  const handleLevel = useCallback((level) => {
    flameRef.current?.style.setProperty('--wind', level.toFixed(2));
  }, []);

  const mic = useBlowDetector({ onBlow: blowOut, onLevel: handleLevel });

  const handleFlameTap = () => {
    mic.stop();
    blowOut();
  };

  const handleIntroTap = () => {
    if (introStep < content.preReveal.length) {
      setIntroStep((step) => step + 1);
    } else {
      setPhase('pop');
    }
  };

  const popOrb = (index) => {
    if (popped.includes(index)) return;
    vibrate(18);
    const next = [...popped, index];
    setPopped(next);
    if (next.length === words.length) {
      vibrate([30, 50, 30, 50, 60]);
      later(() => setPhase('cake'), 2600);
    }
  };

  if (phase === 'intro') {
    return (
      <div className="bday bday-intro" onClick={handleIntroTap} role="button" tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleIntroTap()}
      >
        <div className="bday-intro-lines">
          {content.preReveal.slice(0, introStep).map((line, i) => (
            <p key={i} className="bday-intro-line">{line}</p>
          ))}
        </div>
        <p className="scene-hint">Tap anywhere</p>
      </div>
    );
  }

  if (phase === 'pop') {
    const allPopped = popped.length === words.length;
    return (
      <div className="bday bday-pop">
        <h2 className="scene-heading text-gradient">Pop all {words.length} stars</h2>

        <p className={`pop-sentence ${allPopped ? 'complete' : ''}`}>
          {words.map((word, i) => (
            <span key={word + i} className={`pop-word ${i < popped.length ? 'shown' : ''}`}>{word}</span>
          ))}
          {allPopped && <span className="pop-heart">❤️</span>}
        </p>

        <div className="pop-field">
          {ORB_POSITIONS.slice(0, words.length).map((pos, i) => {
            const isPopped = popped.includes(i);
            return (
              <button
                key={i}
                className={`pop-orb ${isPopped ? 'popped' : ''}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, animationDelay: `${i * -0.7}s` }}
                onPointerDown={() => popOrb(i)}
                disabled={isPopped}
                aria-label="Pop this star"
              >
                <span className="pop-orb-core">
                  <svg viewBox="0 0 100 100" aria-hidden="true">
                    <path d="M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z" />
                  </svg>
                </span>
                <span className="pop-burst" aria-hidden="true">
                  {Array.from({ length: 8 }, (_, k) => <i key={k} style={{ '--angle': `${k * 45}deg` }} />)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'cake') {
    let micHint = null;
    if (mic.status === 'listening') micHint = 'Blow gently on your phone… 🌬️';
    else if (mic.status === 'asking') micHint = 'Allow the microphone to blow it out';
    else if (mic.status === 'denied' || mic.status === 'unavailable') micHint = 'Tap the flame to blow it out';

    return (
      <div className="bday bday-cake">
        <div>
          <h2 className="scene-heading text-gradient">Make a wish</h2>
          <p className="scene-subheading">…then blow out the candle</p>
        </div>

        <BirthdayCake ref={flameRef} isOut={candleOut} onFlameTap={handleFlameTap} />

        {!candleOut && (
          <div className="cake-actions">
            {mic.status === 'idle' && (
              <button className="btn-soft" onClick={mic.start}>
                <Mic size={18} /> Blow out the candle
              </button>
            )}
            {micHint && <p className="scene-hint cake-hint">{micHint}</p>}
            {mic.status === 'idle' && <p className="cake-or">or tap the flame</p>}
          </div>
        )}
        {candleOut && <p className="cake-done">Your wish is on its way ✨</p>}
      </div>
    );
  }

  if (phase === 'wish') {
    return (
      <div className="bday bday-wish">
        <p className="wish-text">Close your eyes</p>
        <p className="wish-text second">&amp; make a wish…</p>
      </div>
    );
  }

  return (
    <div className="bday bday-reveal">
      <Confetti count={90} hearts />
      <h1 className="birthday-greeting">
        <span className="greeting-line text-accent">Happy Birthday,</span>
        <span className="greeting-name">
          <span className="text-accent">My dear {name}</span>{' '}
          <span className="greeting-heart" role="img" aria-label="heart">❤️</span>
        </span>
      </h1>

      <div className="birthday-photo">
        {content.image && !imageError ? (
          <img src={content.image} alt={`${name} smiling`} decoding="async" onError={() => setImageError(true)} />
        ) : (
          <div className="birthday-photo-fallback">❤</div>
        )}
      </div>

      <p className="birthday-message">{content.message}</p>

      <button className="btn-soft bday-next" onClick={onNext}>Let me tell you what I dream of</button>
    </div>
  );
};

export default BirthdayReveal;
