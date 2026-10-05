import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import './VideoSection.css';

const VideoSection = ({ content }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setProgress((current / duration) * 100);
  };

  const handleSeek = (e) => {
    const seekTo = (e.nativeEvent.offsetX / e.target.offsetWidth) * videoRef.current.duration;
    videoRef.current.currentTime = seekTo;
  };

  const toggleFullscreen = () => {
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="video-section-container">
      <div className="section-header reveal">
        <h2 className="text-gradient">I wish I could have said this to you in person.</h2>
        <p>So I recorded it instead.</p>
      </div>

      <div className="video-player-wrapper glass-panel reveal reveal-delay-2">
        <video 
          ref={videoRef}
          className="custom-video"
          poster={content.poster}
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          playsInline
        >
          <source src={content.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {!isPlaying && (
          <button className="play-overlay" onClick={togglePlay} aria-label="Play video">
            <div className="play-icon-wrapper">
              <Play size={48} fill="white" />
            </div>
          </button>
        )}

        <div className="custom-controls glass-panel">
          <button className="control-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <div className="progress-bar-container" onClick={handleSeek}>
            <div className="progress-bar-bg"></div>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>

          <button className="control-btn" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <button className="control-btn" onClick={toggleFullscreen} aria-label="Fullscreen">
            <Maximize size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
