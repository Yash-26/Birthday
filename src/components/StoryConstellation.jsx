import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { vibrate } from '../utils/haptics';
import './StoryConstellation.css';

// Five stars that, connected in order, outline a heart
const POSITIONS = [
  { x: 50, y: 86 }, // bottom tip
  { x: 16, y: 46 }, // mid left
  { x: 33, y: 18 }, // top left
  { x: 67, y: 18 }, // top right
  { x: 84, y: 46 }, // mid right
];

const SWIPE_THRESHOLD = 50;

const StoryConstellation = ({ ourStory, onNext }) => {
  const memories = ourStory.slice(0, POSITIONS.length);
  const [unlocked, setUnlocked] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const [wrongIndex, setWrongIndex] = useState(null);
  const swipeStartRef = useRef(null);
  const isComplete = unlocked >= memories.length;

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]);

  const handleStarTap = (index) => {
    if (index < unlocked) {
      vibrate(8);
      setActiveIndex(index);
    } else if (index === unlocked) {
      vibrate([12, 30, 12]);
      setUnlocked(index + 1);
      setActiveIndex(index);
    } else {
      vibrate([30, 40, 30]);
      setWrongIndex(index);
      setTimeout(() => setWrongIndex(null), 600);
    }
  };

  const showMemory = (direction) => {
    setActiveIndex((current) => {
      const next = current + direction;
      return next >= 0 && next < unlocked ? next : current;
    });
  };

  const handleSwipeStart = (e) => {
    swipeStartRef.current = e.clientX;
  };

  const handleSwipeEnd = (e) => {
    if (swipeStartRef.current === null) return;
    const dx = e.clientX - swipeStartRef.current;
    swipeStartRef.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) showMemory(dx < 0 ? 1 : -1);
  };

  const linePoints = POSITIONS.slice(0, Math.max(unlocked, 0));
  const activeMemory = activeIndex !== null ? memories[activeIndex] : null;

  let hint = 'Tap the brightest star to begin';
  if (wrongIndex !== null) hint = 'Not that one yet… follow the glow ✨';
  else if (isComplete) hint = 'Every star led me to you';
  else if (unlocked > 0) hint = 'Now find the next glowing star';

  return (
    <div className="story">
      <div className="story-header">
        <h2 className="scene-heading text-gradient">Our Story</h2>
        <p className="scene-subheading">A constellation of us.</p>
      </div>

      <div className={`story-map ${isComplete ? 'complete' : ''}`}>
        <svg className="story-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {linePoints.slice(1).map((point, i) => (
            <line
              key={`line-${i}`}
              className="story-line"
              x1={linePoints[i].x}
              y1={linePoints[i].y}
              x2={point.x}
              y2={point.y}
              pathLength="1"
            />
          ))}
          {isComplete && (
            <line
              className="story-line"
              x1={POSITIONS[POSITIONS.length - 1].x}
              y1={POSITIONS[POSITIONS.length - 1].y}
              x2={POSITIONS[0].x}
              y2={POSITIONS[0].y}
              pathLength="1"
            />
          )}
        </svg>

        {isComplete && (
          <svg className="story-heart-glow" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.2 1.7-2 3.2-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
          </svg>
        )}

        {memories.map((memory, index) => {
          const state = index < unlocked ? 'visited' : index === unlocked ? 'next' : 'locked';
          return (
            <div
              key={memory.id}
              className={`story-star-wrapper star-${index} ${state} ${wrongIndex === index ? 'wrong' : ''}`}
              style={{ left: `${POSITIONS[index].x}%`, top: `${POSITIONS[index].y}%` }}
            >
              <button
                className="story-star"
                onClick={() => handleStarTap(index)}
                aria-label={state === 'visited' ? `Open memory: ${memory.title}` : `Star ${index + 1}`}
              >
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <path d="M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z" />
                </svg>
              </button>
              {state === 'visited' && <span className="story-star-label">{memory.title}</span>}
            </div>
          );
        })}
      </div>

      <div className="story-footer">
        <p className="scene-hint story-hint" key={hint}>{hint}</p>
        {isComplete && activeIndex === null && (
          <button className="btn-soft" onClick={onNext}>You, in my favourite memories</button>
        )}
      </div>

      {activeMemory && (
        <div className="memory-overlay" onClick={() => setActiveIndex(null)} role="dialog" aria-modal="true" aria-labelledby="memory-title">
          <div
            className="memory-card glass-panel"
            key={activeMemory.id}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={handleSwipeStart}
            onPointerUp={handleSwipeEnd}
            onPointerCancel={() => { swipeStartRef.current = null; }}
          >
            <button className="memory-close" onClick={() => setActiveIndex(null)} aria-label="Close memory">
              <X size={22} />
            </button>
            <div className="memory-image">
              <img src={activeMemory.image} alt="" className="memory-image-blur" aria-hidden="true" />
              <img src={activeMemory.image} alt={activeMemory.title} className="memory-image-main" decoding="async" />
            </div>
            <div className="memory-body">
              <h3 id="memory-title" className="memory-title">{activeMemory.title}</h3>
              <p className="memory-description">{activeMemory.description}</p>
            </div>
            {unlocked > 1 && (
              <div className="memory-nav">
                <button onClick={() => showMemory(-1)} disabled={activeIndex === 0} aria-label="Previous memory">
                  <ChevronLeft size={20} />
                </button>
                <span>{activeIndex + 1} / {unlocked}</span>
                <button onClick={() => showMemory(1)} disabled={activeIndex >= unlocked - 1} aria-label="Next memory">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryConstellation;
