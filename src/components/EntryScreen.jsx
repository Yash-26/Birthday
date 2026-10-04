import React from 'react';
import './EntryScreen.css';

const EntryScreen = ({ content, onStart, hasStarted }) => {
  return (
    <div className={`entry-screen ${hasStarted ? 'fade-out' : ''}`}>
      <div className="entry-content">
        <h1 className="entry-title text-gradient">{content.title}</h1>
        <p className="entry-subtitle">{content.subtitle}</p>
        
        <button className="btn-begin" onClick={onStart}>
          <span className="btn-text">Begin</span>
          <div className="btn-glow"></div>
        </button>
      </div>
      
      {/* Decorative elements */}
      <div className="moon-glow"></div>
    </div>
  );
};

export default EntryScreen;
