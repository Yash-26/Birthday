import React, { useEffect, useRef, useState } from 'react';
import { vibrate } from '../utils/haptics';
import './FuturePlans.css';

const BRUSH_SIZE = 46;
const REVEAL_RATIO = 0.5;
const CHECK_EVERY_MOVES = 10;

function paintCover(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1e1b4b');
  gradient.addColorStop(0.55, '#312e81');
  gradient.addColorStop(1, '#4c1d95');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.random() * 0.6})`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.4 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintCoverText(ctx, width, height) {
  ctx.fillStyle = 'rgba(251, 207, 232, 0.95)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 30px Caveat, cursive';
  ctx.fillText('Scratch to see', width / 2, height / 2 - 18);
  ctx.fillText('our someday ✨', width / 2, height / 2 + 18);
}

const ScratchCard = ({ plan, onReveal }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const lastPointRef = useRef(null);
  const movesRef = useRef(0);
  const revealedRef = useRef(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const { width, height } = wrapRef.current.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;

    paintCover(ctx, width, height);
    let cancelled = false;
    document.fonts?.load('600 30px Caveat').finally(() => {
      if (!cancelled) paintCoverText(ctx, width, height);
    });
    return () => { cancelled = true; };
  }, []);

  const pointFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const scratchTo = (point) => {
    const ctx = ctxRef.current;
    const from = lastPointRef.current || point;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = BRUSH_SIZE;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(point.x + 0.01, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  };

  const checkCleared = () => {
    const canvas = canvasRef.current;
    const { data } = ctxRef.current.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 8) {
      total++;
      if (data[i] === 0) cleared++;
    }
    if (cleared / total > REVEAL_RATIO && !revealedRef.current) {
      revealedRef.current = true;
      setIsRevealed(true);
      vibrate([20, 40, 40]);
      onReveal();
    }
  };

  const handlePointerDown = (e) => {
    if (isRevealed) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setHasStarted(true);
    lastPointRef.current = null;
    scratchTo(pointFromEvent(e));
  };

  const handlePointerMove = (e) => {
    if (isRevealed || !lastPointRef.current) return;
    scratchTo(pointFromEvent(e));
    movesRef.current += 1;
    if (movesRef.current % CHECK_EVERY_MOVES === 0) checkCleared();
  };

  const handlePointerUp = () => {
    if (isRevealed || !lastPointRef.current) return;
    lastPointRef.current = null;
    checkCleared();
  };

  return (
    <div className="scratch-wrap">
      <div className={`scratch-card ${isRevealed ? 'revealed' : ''}`} ref={wrapRef}>
        <img
          src={plan.image}
          alt={plan.title}
          className="scratch-image"
          style={{ objectPosition: plan.objectPosition || 'center' }}
          draggable="false"
          decoding="async"
        />
        <canvas
          ref={canvasRef}
          className="scratch-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="Scratch to reveal"
        />
        {!hasStarted && <span className="scratch-finger" aria-hidden="true">👆</span>}
      </div>

      <div className={`scratch-text ${isRevealed ? 'shown' : ''}`}>
        <h3 className="future-title">{plan.title}</h3>
        <p className="future-description">{plan.description}</p>
      </div>
    </div>
  );
};

const FuturePlans = ({ plans, onNext }) => {
  const [index, setIndex] = useState(0);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [showClosing, setShowClosing] = useState(false);
  const isRevealed = revealedIndex === index;
  const isLast = index === plans.length - 1;

  const handleNext = () => {
    vibrate(10);
    if (isLast) {
      setShowClosing(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (showClosing) {
    return (
      <div className="future future-closing">
        <p className="future-closing-text">And so many more,</p>
        <p className="future-closing-text accent">with you…</p>
        <button className="btn-soft future-closing-btn" onClick={onNext}>Look up at the stars ✨</button>
      </div>
    );
  }

  return (
    <div className="future">
      <div className="future-header">
        <h2 className="scene-heading text-gradient">The Memories Still Waiting for Us</h2>
        <p className="future-counter">Someday {index + 1} of {plans.length}</p>
      </div>

      <ScratchCard key={plans[index].id} plan={plans[index]} onReveal={() => setRevealedIndex(index)} />

      <div className="future-footer">
        {isRevealed ? (
          <button className="btn-soft" onClick={handleNext}>
            {isLast ? 'Until that day…' : 'One more someday →'}
          </button>
        ) : (
          <p className="scene-hint">Rub the card with your finger</p>
        )}
      </div>
    </div>
  );
};

export default FuturePlans;
