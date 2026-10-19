import React, { useRef, useState } from 'react';
import { vibrate } from '../utils/haptics';
import './MemoryGallery.css';

const SWIPE_DISTANCE = 90;
const SWIPE_VELOCITY = 0.5; // px per ms, for a quick flick
const FLY_OUT_MS = 380;
const TILTS = [-4, 3, -2, 5, -3];

// A stack of polaroids she flicks away with her thumb, one by one.
const MemoryGallery = ({ moments, onNext }) => {
  const [order, setOrder] = useState(() => moments.map((_, i) => i));
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [flyDirection, setFlyDirection] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const startRef = useRef(null);
  const hasSeenAll = swipeCount >= moments.length;

  const handlePointerDown = (e) => {
    if (flyDirection) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    setDrag({ x: 0, y: 0, active: true });
  };

  const handlePointerMove = (e) => {
    if (!startRef.current) return;
    setDrag({
      x: e.clientX - startRef.current.x,
      y: e.clientY - startRef.current.y,
      active: true,
    });
  };

  const handlePointerUp = (e) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const elapsed = performance.now() - startRef.current.time;
    startRef.current = null;

    const isFlick = Math.abs(dx) / Math.max(elapsed, 1) > SWIPE_VELOCITY && Math.abs(dx) > 30;
    if (Math.abs(dx) > SWIPE_DISTANCE || isFlick) {
      vibrate(12);
      setFlyDirection(dx > 0 ? 1 : -1);
      setTimeout(() => {
        setOrder((current) => [...current.slice(1), current[0]]);
        setFlyDirection(0);
        setDrag({ x: 0, y: 0, active: false });
        setSwipeCount((count) => count + 1);
      }, FLY_OUT_MS);
    } else {
      setDrag({ x: 0, y: 0, active: false });
    }
  };

  const cardStyle = (depth, momentIndex) => {
    const tilt = TILTS[momentIndex % TILTS.length];
    if (depth === 0) {
      if (flyDirection) {
        return {
          transform: `translate(${flyDirection * 130}vw, ${drag.y * 0.4}px) rotate(${flyDirection * 28}deg)`,
          transition: `transform ${FLY_OUT_MS}ms ease-in`,
        };
      }
      return {
        transform: `translate(${drag.x}px, ${drag.y * 0.25}px) rotate(${tilt + drag.x / 14}deg)`,
        transition: drag.active ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      };
    }
    return {
      transform: `translateY(${depth * 12}px) scale(${1 - depth * 0.05}) rotate(${tilt}deg)`,
      opacity: depth > 2 ? 0 : 1,
      transition: depth > 2 ? 'none' : 'transform 0.4s ease, opacity 0.4s ease',
    };
  };

  return (
    <div className="moments">
      <div className="moments-header">
        <h2 className="scene-heading text-gradient">Moments</h2>
        <p className="scene-subheading">Little pieces of us I keep close.</p>
      </div>

      <div className="polaroid-stack">
        {order.map((momentIndex, depth) => {
          const moment = moments[momentIndex];
          const isTop = depth === 0;
          return (
            <div
              key={moment.id}
              className={`polaroid ${isTop ? 'top' : ''}`}
              style={{ ...cardStyle(depth, momentIndex), zIndex: moments.length - depth }}
              onPointerDown={isTop ? handlePointerDown : undefined}
              onPointerMove={isTop ? handlePointerMove : undefined}
              onPointerUp={isTop ? handlePointerUp : undefined}
              onPointerCancel={isTop ? handlePointerUp : undefined}
              aria-hidden={!isTop}
            >
              <div className="polaroid-photo">
                <img src={moment.image} alt={moment.title} draggable="false" decoding="async" />
              </div>
              <p className="polaroid-caption">{moment.title}</p>
            </div>
          );
        })}
      </div>

      <div className="moments-footer">
        <p className="moments-count">
          {Math.min(swipeCount + 1, moments.length)} / {moments.length}
        </p>
        {hasSeenAll ? (
          <button className="btn-soft" onClick={onNext}>Today is all about you</button>
        ) : (
          <p className="scene-hint">Swipe the photo away</p>
        )}
      </div>
    </div>
  );
};

export default MemoryGallery;
