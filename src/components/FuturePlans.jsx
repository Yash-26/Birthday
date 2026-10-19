import React, { useState } from 'react';
import './FuturePlans.css';

const FuturePlanCard = ({ plan, index }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`future-card glass-panel card-${index % 2 === 0 ? 'even' : 'odd'}`}>
      <div className="future-image-wrapper">
        {plan.image && !imageError ? (
          <img
            src={plan.image}
            alt={plan.title}
            className="future-image"
            style={{ objectPosition: plan.objectPosition || 'center 15%' }}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="future-placeholder">
            <span className="placeholder-text">Future Image</span>
          </div>
        )}
      </div>
      <div className="future-content">
        <h3 className="future-title">{plan.title}</h3>
        <p className="future-description">{plan.description}</p>
      </div>
    </div>
  );
};

const FuturePlans = ({ plans }) => {
  return (
    <div className="future-container">
      <div className="section-header reveal">
        <h2 className="text-gradient">The Memories Still Waiting for Us</h2>
      </div>

      <div className="future-grid reveal reveal-delay-2">
        {plans.map((plan, index) => (
          <FuturePlanCard key={plan.id} plan={plan} index={index} />
        ))}
      </div>

      <div className="future-highlight-container reveal reveal-delay-3">
        <p className="future-highlight-text">
          <em>And so many more, with you…</em>
        </p>
      </div>
    </div>
  );
};

export default FuturePlans;
