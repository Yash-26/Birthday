import React, { useMemo } from 'react';

const StarField = () => {
  // Generate a small, fixed number of stars
  const stars = useMemo(() => {
    const starArray = [];
    const numStars = 50; // Keep it lightweight
    
    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() < 0.8 ? 'small' : Math.random() < 0.9 ? 'medium' : 'large';
      const isTwinkling = Math.random() < 0.15; // Only 15% twinkle
      const opacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
      
      starArray.push({
        id: i,
        x,
        y,
        size,
        isTwinkling,
        opacity,
      });
    }
    return starArray;
  }, []);

  return (
    <div className="fixed-star-field" aria-hidden="true">
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star ${star.size} ${star.isTwinkling ? 'twinkle' : ''}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            opacity: star.opacity,
            animationDelay: star.isTwinkling ? `${Math.random() * 5}s` : '0s'
          }}
        />
      ))}
    </div>
  );
};

export default StarField;
