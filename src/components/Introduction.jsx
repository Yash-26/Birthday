import React from 'react';
import './Introduction.css';

const Introduction = ({ content }) => {
  return (
    <div className="introduction-container">
      <div className="intro-content">
        {content.map((paragraph, index) => (
          <p 
            key={index} 
            className={`intro-paragraph reveal reveal-delay-${(index % 3) + 1}`}
          >
            {paragraph}
          </p>
        ))}
      </div>
      
      <button 
        className="scroll-indicator reveal reveal-delay-3" 
        onClick={() => {
          document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
        }}
        aria-label="Keep going"
      >
        <span>Keep going</span>
        <div className="indicator-line"></div>
      </button>
    </div>
  );
};

export default Introduction;
