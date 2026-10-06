import React, { useState } from 'react';
import { X } from 'lucide-react';
import './StoryConstellation.css';

const StoryConstellation = ({ memories }) => {
  const [activeMemory, setActiveMemory] = useState(null);

  // Positions for the constellation nodes to make it look organic
  const positions = [
    { top: '85%', left: '50%' }, // Bottom
    { top: '50%', left: '22%' }, // Mid Left
    { top: '25%', left: '35%' }, // Top Left
    { top: '25%', left: '65%' }, // Top Right
    { top: '50%', left: '78%' }  // Mid Right
  ];

  const handleNodeClick = (memory) => {
    setActiveMemory(memory);
  };

  const closeMenu = () => {
    setActiveMemory(null);
  };

  return (
    <div className="constellation-container">
      <div className="section-header reveal">
        <h2 className="text-gradient">Our Story</h2>
        <p>A constellation of us.</p>
      </div>

      <div className="constellation-map reveal reveal-delay-2">
        {/* Draw lines between nodes using SVG */}
        <svg className="constellation-lines" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
           <path 
             d="M 50 85 C 50 85, 15 55, 15 35 C 15 15, 45 15, 50 35 C 55 15, 85 15, 85 35 C 85 55, 50 85, 50 85" 
             stroke="rgba(255,255,255,0.15)" 
             strokeWidth="0.5" 
             strokeDasharray="2,2" 
             fill="none" 
           />
        </svg>

        {memories.slice(0, 5).map((memory, index) => (
          <div 
            key={memory.id}
            className="constellation-node-wrapper"
            style={{ 
              top: positions[index]?.top || '50%', 
              left: positions[index]?.left || '50%' 
            }}
          >
            <button 
              className="constellation-node"
              onClick={() => handleNodeClick(memory)}
              aria-label={`Open memory: ${memory.title}`}
            >
              <div className="node-glow"></div>
            </button>
            <span className="node-label">{memory.date}</span>
          </div>
        ))}
      </div>

      {/* Memory Modal */}
      {activeMemory && (
        <div className="memory-modal-overlay" onClick={closeMenu}>
          <div className="memory-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeMenu} aria-label="Close memory">
              <X size={24} />
            </button>
            <div className="modal-image-container">
              {/* Fallback box if image fails or placeholder */}
              <div className="image-placeholder">
                 <img src={activeMemory.image} alt={activeMemory.title} className="modal-image" loading="lazy" decoding="async" onError={(e) => e.target.style.display='none'} />
                 <span className="placeholder-text">Photo Placeholder</span>
              </div>
            </div>
            <div className="modal-content">
              <span className="modal-date">{activeMemory.date}</span>
              <h3 className="modal-title">{activeMemory.title}</h3>
              <p className="modal-description">{activeMemory.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryConstellation;
