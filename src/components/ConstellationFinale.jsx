import React, { useEffect, useState, useRef } from 'react';
import './ConstellationFinale.css';

const ConstellationFinale = ({ config }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // S shape coordinates
  const sPoints = [
    { x: 75, y: 25 },
    { x: 50, y: 10 },
    { x: 25, y: 25 },
    { x: 50, y: 50 },
    { x: 75, y: 75 },
    { x: 50, y: 90 },
    { x: 25, y: 75 },
  ];

  return (
    <div className="finale-container" ref={containerRef}>
      <div className={`finale-constellation ${isVisible ? 'animate-in' : ''}`}>
        <svg viewBox="0 0 100 100" className="finale-svg">
          {/* Draw connecting lines for the S */}
          <path 
            d="M 75 25 C 75 5, 25 5, 25 25 C 25 50, 75 50, 75 75 C 75 95, 25 95, 25 75" 
            className="finale-path"
            fill="none"
          />
          
          {/* Draw stars at the points */}
          {sPoints.map((point, index) => (
            <circle 
              key={index}
              cx={point.x} 
              cy={point.y} 
              r="1.5" 
              className="finale-star" 
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default ConstellationFinale;
