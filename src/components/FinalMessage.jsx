import React from 'react';
import { RotateCcw } from 'lucide-react';
import './FinalMessage.css';

const FinalMessage = ({ content, name }) => {
  
  const handleReplay = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      window.location.reload(); // Optional: or just rely on scroll up to replay animations if state is reset
    }, 1000);
  };

  return (
    <div className="final-container">
      <div className="final-content reveal">
        <p className="final-pre">One last thing.</p>
        
        <div className="final-message-body reveal reveal-delay-2">
          {content.message.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        
        <p className="final-closing reveal reveal-delay-3">{content.closing}</p>
        
        <h2 className="final-signature text-accent reveal reveal-delay-3">
          {content.signature.replace('[HER NAME]', name)}
        </h2>
      </div>

      <button className="replay-btn reveal reveal-delay-3" onClick={handleReplay} aria-label="Start again">
        <RotateCcw size={16} />
        <span>Start again</span>
      </button>
    </div>
  );
};

export default FinalMessage;
