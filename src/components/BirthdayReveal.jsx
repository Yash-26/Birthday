import React from 'react';
import './BirthdayReveal.css';

const BirthdayReveal = ({ content, name }) => {
  return (
    <div className="reveal-container">
      <div className="pre-reveal reveal">
        <p>There's one more thing.</p>
      </div>

      <div className="main-reveal reveal reveal-delay-2">
        <h1 className="birthday-greeting text-accent">
          Happy Birthday, <br/>
          <span className="recipient-name">{name}</span> <span className="heart">❤️</span>
        </h1>
        
        <div className="birthday-photo-moment">
          <div className="photo-wrapper glass-panel">
            <div className="image-placeholder">
               <img src={content.image} alt="Birthday moment" className="birthday-image" onError={(e) => e.target.style.display='none'} />
               <span className="placeholder-text">Her Best Photo</span>
            </div>
          </div>
          <div className="birthday-message">
             <p>{content.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthdayReveal;
