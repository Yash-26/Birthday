import React, { useMemo } from 'react';
import './StarField.css';

const StarField = () => {
  const stars = useMemo(() => {
    const starArray = [];
    const numStars = 60; // Lightweight number of stars
    
    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      let type = 'speck';
      let sizeClass = 'tiny';
      
      const rand = Math.random();
      if (rand > 0.90) {
        type = 'bright'; // ~10% bright stars
        sizeClass = 'medium';
      } else if (rand > 0.6) {
        type = 'star4'; // ~30% 4-point stars
        sizeClass = 'small';
      } else if (rand > 0.4) {
        type = 'star5'; // ~20% 5-point stars
        sizeClass = 'small';
      }
      // Remaining 40% are tiny specks
      
      const isTwinkling = Math.random() < 0.2; // 20% twinkle
      const opacity = type === 'speck' ? (Math.random() * 0.4 + 0.1) : (Math.random() * 0.5 + 0.5);
      
      starArray.push({
        id: i,
        x,
        y,
        type,
        sizeClass,
        isTwinkling,
        opacity,
      });
    }
    return starArray;
  }, []);

  const renderStar = (star) => {
    const commonProps = {
      className: `svg-star ${star.type} ${star.sizeClass} ${star.isTwinkling ? 'twinkle' : ''}`,
      style: {
        left: `${star.x}%`,
        top: `${star.y}%`,
        opacity: star.opacity,
        animationDelay: star.isTwinkling ? `${Math.random() * 5}s` : '0s'
      }
    };

    if (star.type === 'speck') {
      return (
        <svg key={star.id} {...commonProps} viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="3" fill="#fff" />
        </svg>
      );
    } else if (star.type === 'star4' || star.type === 'bright' || star.type === 'special') {
      // Elegant 4-point star for 4-point, bright, and special types
      return (
        <svg key={star.id} {...commonProps} viewBox="0 0 100 100">
          <path d="M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z" fill="#fff" />
        </svg>
      );
    } else if (star.type === 'star5') {
      // 5-point star
      return (
        <svg key={star.id} {...commonProps} viewBox="0 0 100 100">
          <polygon points="50,5 61,39 98,39 68,60 79,95 50,75 21,95 32,60 2,39 39,39" fill="#fff" />
        </svg>
      );
    }
  };

  return (
    <div className="fixed-star-field" aria-hidden="true">
      {stars.map(renderStar)}
    </div>
  );
};

export default StarField;
