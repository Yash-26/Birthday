import React, { useState } from 'react';
import './BirthdayReveal.css';

const BirthdayReveal = ({ content, name }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="reveal-container">
      <div className="pre-reveal reveal">
        <p>Every little piece of this universe led to you.</p>
      </div>

      <div className="main-reveal reveal reveal-delay-2">
        <h1 className="birthday-greeting text-accent">
          Happy Birthday, <br />
          <span className="recipient-name">{name}</span> <span className="heart">❤️</span>
        </h1>

        <div className="birthday-photo-moment">
          <div className="photo-wrapper glass-panel">
            <div className="birthday-image-container">
              {content.image && !imageError ? (
                <img
                  src={content.image}
                  alt="Birthday moment"
                  className="birthday-image"
                  loading="lazy"
                  decoding="async"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="placeholder-fallback">
                  <span className="placeholder-text">Her Best Photo</span>
                </div>
              )}
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
