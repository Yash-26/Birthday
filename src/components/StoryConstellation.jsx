import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './StoryConstellation.css';

const StoryConstellation = ({ ourStory }) => {
  const [activeMemory, setActiveMemory] = useState(null);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

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

  useEffect(() => {
    if (!activeMemory) return;

    // Record the exact scroll position when opening the modal
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

    // Save previous inline styles
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevTouchAction = document.body.style.touchAction;

    // Lock scrolling on the underlying page
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // Support closing via Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveMemory(null);
      }
    };

    // Prevent touch scrolling gestures from leaking to the background
    const overlay = overlayRef.current;

    const handleTouchMove = (e) => {
      const modal = modalRef.current;
      if (modal && modal.contains(e.target)) {
        // If the modal content is larger than viewport and scrollable, allow it inside
        if (modal.scrollHeight > modal.clientHeight) {
          e.stopPropagation();
          return;
        }
      }
      // Prevent background scrolling
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleWheel = (e) => {
      const modal = modalRef.current;
      if (modal && modal.contains(e.target)) {
        if (modal.scrollHeight > modal.clientHeight) {
          const isAtTop = modal.scrollTop === 0 && e.deltaY < 0;
          const isAtBottom = modal.scrollTop + modal.clientHeight >= modal.scrollHeight - 1 && e.deltaY > 0;
          if (!isAtTop && !isAtBottom) {
            e.stopPropagation();
            return;
          }
        }
      }
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    if (overlay) {
      overlay.addEventListener('touchmove', handleTouchMove, { passive: false });
      overlay.addEventListener('wheel', handleWheel, { passive: false });
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.touchAction = prevTouchAction;

      if (overlay) {
        overlay.removeEventListener('touchmove', handleTouchMove);
        overlay.removeEventListener('wheel', handleWheel);
      }
      window.removeEventListener('keydown', handleKeyDown);

      // Re-anchor to the exact scroll position
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, [activeMemory]);

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

        {ourStory.slice(0, 5).map((memory, index) => (
          <div 
            key={memory.id}
            className={`constellation-node-wrapper node-${index}`}
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
            <span className="node-label">{memory.title}</span>
          </div>
        ))}
      </div>

      {/* Memory Modal */}
      {activeMemory && (
        <div 
          ref={overlayRef}
          className="memory-modal-overlay" 
          onClick={closeMenu}
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-modal-title"
        >
          <div 
            ref={modalRef}
            className="memory-modal glass-panel" 
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeMenu} aria-label="Close memory">
              <X size={24} />
            </button>
            <div className="modal-image-container">
               <img src={activeMemory.image} alt="" className="modal-image-blur" aria-hidden="true" />
               <img src={activeMemory.image} alt={activeMemory.title} className="modal-image" loading="lazy" decoding="async" onError={(e) => e.target.style.display='none'} />
            </div>
            <div className="modal-content">
              <h3 id="story-modal-title" className="modal-title">{activeMemory.title}</h3>
              <p className="modal-description">{activeMemory.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryConstellation;
