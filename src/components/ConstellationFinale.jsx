import React, { useEffect, useState, useRef } from 'react';
import './ConstellationFinale.css';

const ConstellationFinale = ({ config }) => {
  const [phase, setPhase] = useState(0); 
  // 0: hidden
  // 1: scattered stars visible
  // 2: moving to positions
  // 3: lines form, S revealed
  // 4: hidden star appears
  // 5: final text
  
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && phase === 0) {
          // Start the sequence
          setTimeout(() => setPhase(1), 1000); // Wait 1s, show scattered
          setTimeout(() => setPhase(2), 4000); // After 3s, start moving
          setTimeout(() => setPhase(3), 8000); // 4s to move, then show lines
          setTimeout(() => setPhase(4), 10000); // 2s later, show hidden star
          setTimeout(() => setPhase(5), 13000); // 3s later, show final text
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [phase]);

  // Constellation S points
  const sPoints = [
    { id: 1, finalX: 75, finalY: 20 },
    { id: 2, finalX: 50, finalY: 10 },
    { id: 3, finalX: 25, finalY: 25 },
    { id: 4, finalX: 30, finalY: 45 },
    { id: 5, finalX: 50, finalY: 55 },
    { id: 6, finalX: 70, finalY: 65 },
    { id: 7, finalX: 75, finalY: 85 },
    { id: 8, finalX: 50, finalY: 95 },
    { id: 9, finalX: 25, finalY: 80 },
  ];

  // The hidden star representing "me"
  const hiddenStar = { id: 10, finalX: 90, finalY: 55 };

  // Generate random starting positions for the scattered phase
  const allStars = [...sPoints, hiddenStar].map(star => ({
    ...star,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    size: Math.random() * 1.5 + 1
  }));

  const mainStars = allStars.slice(0, 9);
  const meStar = allStars[9];

  // Path string for the S
  const pathD = mainStars.reduce((acc, point, index) => {
    return acc + (index === 0 ? `M ${point.finalX} ${point.finalY}` : ` L ${point.finalX} ${point.finalY}`);
  }, "");

  return (
    <div className="finale-container" ref={containerRef}>
      
      {phase >= 1 && (
        <div className={`finale-intro-text ${phase >= 2 ? 'fade-out' : ''}`}>
          <p>Some things are easier to say when you look at the stars...</p>
        </div>
      )}

      <div className={`finale-constellation-wrapper ${phase >= 1 ? 'visible' : ''}`}>
        <svg viewBox="0 0 100 100" className="finale-svg" preserveAspectRatio="xMidYMid meet">
          
          {/* Connecting lines - visible in phase 3+ */}
          <path 
            d={pathD} 
            className={`finale-path ${phase >= 3 ? 'draw-in' : ''}`}
            fill="none"
          />

          {/* S Stars */}
          {mainStars.map((star) => (
            <circle 
              key={star.id}
              cx={phase >= 2 ? star.finalX : star.startX} 
              cy={phase >= 2 ? star.finalY : star.startY} 
              r={star.size} 
              className={`finale-star ${phase >= 1 ? 'appear' : ''} ${phase >= 3 ? 'glow' : ''}`} 
              style={{ transitionDuration: '4s', transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          ))}

          {/* Hidden Star (Me) - appears in phase 4+ */}
          <circle 
            key={meStar.id}
            cx={meStar.finalX} 
            cy={meStar.finalY} 
            r={meStar.size * 1.5} 
            className={`hidden-star ${phase >= 4 ? 'appear-special' : ''}`} 
          />
          
        </svg>
      </div>

      {phase >= 5 && (
        <div className="finale-reveal-text">
          <h2 className="text-accent">I made this little universe for you.</h2>
          <p className="hidden-star-text reveal-delay-2">One star always stays beside you.</p>
        </div>
      )}
    </div>
  );
};

export default ConstellationFinale;
