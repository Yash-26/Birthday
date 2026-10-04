import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { birthdayContent } from './data/birthdayContent';
import { useScrollReveal } from './hooks/useScrollReveal';

import EntryScreen from './components/EntryScreen';
import Introduction from './components/Introduction';
import StoryConstellation from './components/StoryConstellation';
import MemoryGallery from './components/MemoryGallery';
import MessageCards from './components/MessageCards';
import BirthdayReveal from './components/BirthdayReveal';
import VideoSection from './components/VideoSection';
import FuturePlans from './components/FuturePlans';
import ConstellationFinale from './components/ConstellationFinale';
import FinalMessage from './components/FinalMessage';
import './App.css';

function App() {
  useScrollReveal();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
    }
  }, []);

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleStart = () => {
    setHasStarted(true);
    // Optionally start music if not already playing and user interaction happened
    if (!isPlaying && audioRef.current) {
       audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log("Audio play failed:", e));
    }
    
    setTimeout(() => {
      document.getElementById('introduction')?.scrollIntoView({ behavior: 'smooth' });
    }, 1000);
  };

  return (
    <div className="app-container">
      {/* Background elements */}
      <div className="stars-background"></div>
      <div className="ambient-glow"></div>

      {/* Audio Element */}
      <audio ref={audioRef} src={birthdayContent.music.src} loop />

      {/* Global Audio Control */}
      {hasStarted && (
        <button 
          className="audio-toggle glass-panel"
          onClick={toggleMusic}
          aria-label={isPlaying ? "Mute music" : "Play music"}
        >
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      )}

      {/* Main Content Flow */}
      <main>
        <section id="entry">
          <EntryScreen content={birthdayContent.opening} onStart={handleStart} hasStarted={hasStarted} />
        </section>

        <section id="introduction">
          <Introduction content={birthdayContent.introduction} />
        </section>

        <section id="story">
          <StoryConstellation memories={birthdayContent.memories} />
        </section>

        <section id="gallery">
          <MemoryGallery memories={birthdayContent.memories} />
        </section>

        <section id="messages">
          <MessageCards messages={birthdayContent.messages} />
        </section>

        <section id="birthday-reveal">
          <BirthdayReveal content={birthdayContent.birthday} name={birthdayContent.recipientName} />
        </section>

        <section id="video">
          <VideoSection content={birthdayContent.video} />
        </section>

        <section id="future">
          <FuturePlans plans={birthdayContent.future} />
        </section>

        <section id="finale">
          <ConstellationFinale config={birthdayContent.constellation} />
        </section>

        <section id="ending">
          <FinalMessage content={birthdayContent.final} name={birthdayContent.recipientName} />
        </section>
      </main>
      
      {hasStarted && (
        <div className="progress-indicator">
          {/* Simple scroll progress could be added here */}
        </div>
      )}
    </div>
  );
}

export default App;
