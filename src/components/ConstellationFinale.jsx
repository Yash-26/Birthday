import React, { useEffect, useState, useRef, useMemo } from 'react';
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

  // A truly romantic, elegant, flowing cursive 'S' 
  // with a beautifully grounded bottom loop and a sweeping spine
  const sPoints = [
    { id: 1, finalX: 70, finalY: 20 },
    { id: 2, finalX: 50, finalY: 10 },
    { id: 3, finalX: 27, finalY: 26 },
    { id: 4, finalX: 36, finalY: 40 },
    { id: 5, finalX: 50, finalY: 48 },
    { id: 6, finalX: 64, finalY: 58 },
    { id: 7, finalX: 73, finalY: 74 },
    { id: 8, finalX: 50, finalY: 90 },
    { id: 9, finalX: 30, finalY: 80 },
  ];

  // The hidden pink star representing "me", placed perfectly beside the spine
  const hiddenStar = { id: 10, finalX: 85, finalY: 48 };

  // Use useMemo to prevent coordinates from changing on every re-render
  const allStars = useMemo(() => {
    return [...sPoints, hiddenStar].map(star => ({
      ...star,
      startX: Math.random() * 90 + 5, // keep slightly away from edges
      startY: Math.random() * 90 + 5,
      isSpecial: star.id === 10
    }));
  }, []);

  const mainStars = allStars.slice(0, 9);
  const meStar = allStars[9];



  // Straight line path for a classic, starry, angular constellation look
  const pathD = mainStars.reduce((acc, point, index) => {
    return acc + (index === 0 ? `M ${point.finalX} ${point.finalY}` : ` L ${point.finalX} ${point.finalY}`);
  }, "");

  const renderStar = (star) => {
    const currentX = phase >= 2 ? star.finalX : star.startX;
    const currentY = phase >= 2 ? star.finalY : star.startY;
    
    // We reuse the styling classes from StarField (svg-star, bright, medium, special, large)
    let className = `finale-star svg-star ${star.isSpecial ? 'special-node' : 's-node'}`;
    
    if (star.isSpecial) {
      if (phase >= 4) className += ' appear-special';
    } else {
      if (phase >= 1) className += ' appear';
      if (phase >= 3) className += ' glow';
    }

    return (
      <svg 
        key={star.id} 
        className={className} 
        viewBox="0 0 100 100"
        style={{
          left: `${currentX}%`,
          top: `${currentY}%`,
          position: 'absolute',
          transform: 'translate(-50%, -50%)', // Center over the coordinate
        }}
      >
        <path d="M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z" />
      </svg>
    );
  };

  return (
    <div className="finale-container" ref={containerRef}>
      
      {phase >= 1 && (
        <div className={`finale-intro-text ${phase >= 2 ? 'fade-out' : ''}`}>
          <p>Some things are easier to say when you look at the stars...</p>
        </div>
      )}

      <div className={`finale-constellation-wrapper ${phase >= 1 ? 'visible' : ''}`}>
        
        {/* Draw the connecting lines using SVG */}
        <svg viewBox="0 0 100 100" className="finale-svg" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <path 
            d={pathD} 
            className={`finale-path ${phase >= 3 ? 'draw-in' : ''}`}
            fill="none"
            pathLength="100"
          />
        </svg>

        {/* Draw the stars as absolutely positioned elements over the lines */}
        {allStars.map(renderStar)}

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
