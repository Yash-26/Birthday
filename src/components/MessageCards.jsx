import React, { useState } from 'react';
import { Mail, MailOpen } from 'lucide-react';
import './MessageCards.css';

const MessageCards = ({ messages }) => {
  const [openCards, setOpenCards] = useState({});

  const toggleCard = (id) => {
    setOpenCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="messages-container">
      <div className="section-header reveal">
        <h2 className="text-gradient">Things I Never Say Enough</h2>
      </div>

      <div className="cards-grid reveal reveal-delay-1">
        {messages.map((msg, index) => {
          const isOpen = openCards[msg.id];
          return (
            <div 
              key={msg.id} 
              className={`message-card glass-panel ${isOpen ? 'open' : ''}`}
              onClick={() => toggleCard(msg.id)}
            >
              <div className="card-inner">
                <div className="card-front">
                  <div className="envelope-icon">
                    <Mail size={32} />
                  </div>
                  <h4 className="card-title">{msg.title}</h4>
                  <span className="open-prompt">Click to open</span>
                </div>
                
                <div className="card-back">
                  <div className="envelope-icon open-icon">
                    <MailOpen size={24} />
                  </div>
                  <p className="card-message">{msg.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageCards;
