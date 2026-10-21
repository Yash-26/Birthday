import React, { useCallback, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { birthdayContent } from './data/birthdayContent';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';

import StarField from './components/StarField';
import EntryScreen from './components/EntryScreen';
import Introduction from './components/Introduction';
import StoryConstellation from './components/StoryConstellation';
import MemoryGallery from './components/MemoryGallery';
import BirthdayReveal from './components/BirthdayReveal';
import FuturePlans from './components/FuturePlans';
import ConstellationFinale from './components/ConstellationFinale';
import GiftScene from './components/GiftScene';
import './App.css';

const SCENE_COUNT = 8;
const SCENE_EXIT_MS = 700;

// While developing, jump straight to a scene with ?scene=4 (ignored in the real build)
function getInitialScene() {
  if (!import.meta.env.DEV) return 0;
  const scene = Number(new URLSearchParams(window.location.search).get('scene'));
  return Number.isInteger(scene) && scene > 0 && scene < SCENE_COUNT ? scene : 0;
}

// Temporary while choosing the song: ?song=2 plays the alternative (works on the live site too)
function getMusicSrc() {
  const { src, alternative } = birthdayContent.music;
  const wantsAlternative = new URLSearchParams(window.location.search).get('song') === '2';
  return wantsAlternative && alternative ? alternative : src;
}

function App() {
  const [sceneIndex, setSceneIndex] = useState(getInitialScene);
  const [isLeaving, setIsLeaving] = useState(false);
  const leavingRef = useRef(false);
  const music = useBackgroundMusic(getMusicSrc());
  const name = birthdayContent.recipientName;

  const goNext = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setIsLeaving(true);
    setTimeout(() => {
      setSceneIndex((i) => Math.min(i + 1, SCENE_COUNT - 1));
      setIsLeaving(false);
      leavingRef.current = false;
    }, SCENE_EXIT_MS);
  }, []);

  const handleStart = () => {
    music.start();
    goNext();
  };

  const scenes = [
    <EntryScreen key="entry" content={birthdayContent.opening} name={name} onStart={handleStart} />,
    <Introduction key="intro" lines={birthdayContent.introduction} onNext={goNext} />,
    <StoryConstellation key="story" ourStory={birthdayContent.ourStory} onNext={goNext} />,
    <MemoryGallery key="moments" moments={birthdayContent.moments} onNext={goNext} />,
    <BirthdayReveal key="birthday" content={birthdayContent.birthday} name={name} music={music} onNext={goNext} />,
    <FuturePlans key="future" plans={birthdayContent.future} onNext={goNext} />,
    <ConstellationFinale key="finale" onNext={goNext} />,
    <GiftScene key="gift" video={birthdayContent.video} music={music} />,
  ];

  return (
    <div className="app-container">
      <StarField />
      <div className="ambient-glow"></div>

      {sceneIndex > 0 && (
        <div className="scene-progress" aria-hidden="true">
          {Array.from({ length: SCENE_COUNT - 1 }, (_, i) => (
            <span
              key={i}
              className={`progress-dot ${i + 1 < sceneIndex ? 'done' : ''} ${i + 1 === sceneIndex ? 'current' : ''}`}
            />
          ))}
        </div>
      )}

      {sceneIndex > 0 && music.isAvailable && (
        <button
          className="audio-toggle glass-panel"
          onClick={music.toggle}
          aria-label={music.isPlaying ? 'Mute music' : 'Play music'}
        >
          {music.isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      )}

      <main
        key={sceneIndex}
        className={`scene ${isLeaving ? 'leaving' : ''}`}
      >
        {scenes[sceneIndex]}
      </main>
    </div>
  );
}

export default App;
