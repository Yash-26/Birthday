import React from 'react';
import './FuturePlans.css';

const FuturePlans = ({ plans }) => {
  return (
    <div className="future-container">
      <div className="section-header reveal">
        <h2 className="text-gradient">Things We Haven't Done Yet</h2>
      </div>

      <div className="future-grid reveal reveal-delay-2">
        {plans.map((plan, index) => (
          <div key={plan.id} className={`future-card glass-panel card-${index % 2 === 0 ? 'even' : 'odd'}`}>
            <div className="future-image-wrapper">
               <div className="image-placeholder">
                  <img src={plan.image} alt={plan.title} className="future-image" onError={(e) => e.target.style.display='none'} />
                  <span className="placeholder-text">Future Image</span>
               </div>
            </div>
            <div className="future-content">
              <h3 className="future-title">{plan.title}</h3>
              <p className="future-description">{plan.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FuturePlans;
