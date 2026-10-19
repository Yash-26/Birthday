import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Film } from 'lucide-react';
import { vibrate } from '../utils/haptics';
import Confetti from './Confetti';
import './GiftScene.css';

const OPEN_ANIMATION_MS = 1700;

const GiftBox = () => (
  <svg className="gift-svg" viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <linearGradient id="gift-body" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#C4B5FD" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <linearGradient id="gift-lid" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#DDD6FE" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
    <g className="gift-body">
      <rect x="40" y="92" width="120" height="96" rx="8" fill="url(#gift-body)" />
      <rect x="92" y="92" width="16" height="96" fill="#FBCFE8" />
    </g>
    <g className="gift-lid">
      <rect x="32" y="70" width="136" height="28" rx="6" fill="url(#gift-lid)" />
      <rect x="92" y="70" width="16" height="28" fill="#F9A8D4" />
      <path d="M100 70 C80 38 52 50 66 66 C72 72 88 72 100 70 Z" fill="#F9A8D4" />
      <path d="M100 70 C120 38 148 50 134 66 C128 72 112 72 100 70 Z" fill="#F9A8D4" />
      <circle cx="100" cy="68" r="7" fill="#FBCFE8" />
    </g>
  </svg>
);

// The website ends here: the gift opens into the video, nothing comes after it.
const GiftScene = ({ video, music }) => {
  const [phase, setPhase] = useState('gift'); // gift | opening | video
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoMissing, setVideoMissing] = useState(false);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Start the video as soon as the gift has opened
  useEffect(() => {
    if (phase !== 'video' || !videoRef.current) return;
    videoRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [phase]);

  const openGift = () => {
    if (phase !== 'gift') return;
    vibrate([30, 50, 30, 50, 120]);
    music.duck();
    setPhase('opening');
    timerRef.current = setTimeout(() => setPhase('video'), OPEN_ANIMATION_MS);
  };

  // When the video finishes it stays on screen with the play button to watch again,
  // and the background music softly returns
  const handleEnded = () => {
    setIsPlaying(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    music.unduck();
  };

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      music.duck();
      el.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      playerRef.current?.requestFullscreen?.().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (el?.duration) setProgress((el.currentTime / el.duration) * 100);
  };

  const handleSeek = (e) => {
    const el = videoRef.current;
    if (!el?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * el.duration;
    setProgress(ratio * 100);
  };

  if (phase === 'gift' || phase === 'opening') {
    const isOpening = phase === 'opening';
    return (
      <div className="gift-scene">
        <div className="gift-text">
          <h2 className="scene-heading text-gradient">One last thing…</h2>
          <p className="scene-subheading">I couldn't be there, so I wrapped up a little piece of me.</p>
        </div>

        <button
          className={`gift-button ${isOpening ? 'opening' : ''}`}
          onClick={openGift}
          aria-label="Open your gift"
        >
          <span className="gift-rays" aria-hidden="true"></span>
          <GiftBox />
        </button>

        <p className="scene-hint">{isOpening ? '' : 'Tap the gift'}</p>
        {isOpening && <Confetti count={50} hearts />}
      </div>
    );
  }

  return (
    <div className="gift-scene gift-video">
      <div className="video-player" ref={playerRef}>
        {videoMissing ? (
          <div className="video-missing">
            <Film size={36} />
            <p>Your video will appear here.</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="video-element"
              src={`${video.src}#t=0.1`}
              preload="auto"
              playsInline
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleEnded}
              onError={() => setVideoMissing(true)}
            />

            {!isPlaying && (
              <button className="video-play-overlay" onClick={togglePlay} aria-label="Play video">
                <span><Play size={40} fill="white" /></span>
              </button>
            )}

            <div className="video-controls">
              <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <div className="video-progress" onPointerDown={handleSeek}>
                <div className="video-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <button onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button onClick={toggleFullscreen} aria-label="Fullscreen">
                <Maximize size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GiftScene;
