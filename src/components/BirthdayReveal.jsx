import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';
import { vibrate } from '../utils/haptics';
import { useBlowDetector } from '../hooks/useBlowDetector';
import BirthdayCake from './BirthdayCake';
import Confetti from './Confetti';
import ShootingStars from './ShootingStars';
import './BirthdayReveal.css';

const STUBBORN_FLAME_MS = 6000;

// intro -> stars -> cake -> wish -> reveal
const BirthdayReveal = ({ content, name, music, onNext }) => {
  const [phase, setPhase] = useState('intro');
  const [introStep, setIntroStep] = useState(1);
  const [candleOut, setCandleOut] = useState(false);
  const [isStubborn, setIsStubborn] = useState(false);
  const [imageError, setImageError] = useState(false);
  const flameRef = useRef(null);
  const timersRef = useRef([]);

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
    // The music stepped aside while the mic listened; bring it back for the reveal
    timersRef.current.push(setTimeout(() => music.unduck(), 6200));
  }, [music]);

  const handleLevel = useCallback((wind, progress) => {
    flameRef.current?.style.setProperty('--wind', wind.toFixed(2));
    flameRef.current?.style.setProperty('--blown', progress.toFixed(2));
  }, []);

  const mic = useBlowDetector({ onBlow: blowOut, onLevel: handleLevel });

  const startListening = () => {
    music.duck();
    mic.start();
    later(() => {
      if (!candleOutRef.current) setIsStubborn(true);
    }, STUBBORN_FLAME_MS);
  };

  const handleFlameTap = () => {
    mic.stop();
    blowOut();
  };

  const handleIntroTap = () => {
    if (introStep < content.preReveal.length) {
      setIntroStep((step) => step + 1);
    } else {
      setPhase('stars');
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

  if (phase === 'stars') {
    return <ShootingStars words={content.starWords} onComplete={() => setPhase('cake')} />;
  }

  if (phase === 'cake') {
    let micHint = null;
    if (mic.status === 'listening' && isStubborn) micHint = 'Blow a little closer to the phone, or tap the flame 🕯️';
    else if (mic.status === 'listening') micHint = 'Blow on your phone… 🌬️';
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
              <button className="btn-soft" onClick={startListening}>
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
