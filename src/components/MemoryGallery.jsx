import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './MemoryGallery.css';

const MemoryGallery = ({ memories }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth / 1.5 : current.offsetWidth / 1.5;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header reveal">
        <h2 className="text-gradient">Moments</h2>
      </div>

      <div className="gallery-controls reveal">
        <button className="gallery-btn glass-panel" onClick={() => scroll('left')} aria-label="Scroll left">
          <ChevronLeft size={24} />
        </button>
        <button className="gallery-btn glass-panel" onClick={() => scroll('right')} aria-label="Scroll right">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="gallery-track reveal reveal-delay-2" ref={scrollRef}>
        {memories.map((memory) => (
          <div key={memory.id} className="gallery-item glass-panel">
            <div className="gallery-image-wrapper">
              <div className="image-placeholder">
                <img src={memory.image} alt={memory.title} className="gallery-image" loading="lazy" decoding="async" onError={(e) => e.target.style.display='none'} />
                <span className="placeholder-text">Photo</span>
              </div>
            </div>
            <div className="gallery-caption">
              <span className="gallery-date">{memory.date}</span>
              <h4 className="gallery-title">{memory.title}</h4>
            </div>
          </div>
        ))}
        {/* Add more empty placeholders to show scrolling capability */}
        {[1, 2, 3].map((_, i) => (
           <div key={`empty-${i}`} className="gallery-item glass-panel empty-item">
             <div className="gallery-image-wrapper">
               <div className="image-placeholder">
                 <span className="placeholder-text">Add Photo</span>
               </div>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryGallery;
