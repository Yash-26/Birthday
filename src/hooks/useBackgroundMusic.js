import { useCallback, useEffect, useRef, useState } from 'react';

// Owns the background song: soft fade-ins/outs, a mute toggle,
// and "ducking" so the music steps aside while the video plays.
export function useBackgroundMusic(src, targetVolume = 0.35) {
  const audioRef = useRef(null);
  const fadeRef = useRef(null);
  const userMutedRef = useRef(false);
  const duckedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    const handleError = () => setIsAvailable(false);
    audio.addEventListener('error', handleError);
    audioRef.current = audio;

    return () => {
      cancelAnimationFrame(fadeRef.current);
      audio.pause();
      audio.removeEventListener('error', handleError);
    };
  }, [src]);

  const fade = useCallback((to, duration, onDone) => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelAnimationFrame(fadeRef.current);
    const from = audio.volume;
    const startTime = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      // Eased so the loudness changes evenly to the ear, with no sudden drop at the end
      const eased = t * t * (3 - 2 * t);
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * eased));
      if (t < 1) {
        fadeRef.current = requestAnimationFrame(step);
      } else {
        onDone?.();
      }
    };
    fadeRef.current = requestAnimationFrame(step);
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play()
      .then(() => {
        setIsPlaying(true);
        fade(targetVolume, 1800);
      })
      .catch(() => setIsPlaying(false));
  }, [fade, targetVolume]);

  const pause = useCallback((duration = 900) => {
    setIsPlaying(false);
    fade(0, duration, () => audioRef.current?.pause());
  }, [fade]);

  // Must be called from inside a tap so the browser allows sound
  const start = useCallback(() => {
    userMutedRef.current = false;
    duckedRef.current = false;
    if (audioRef.current) audioRef.current.currentTime = 0;
    play();
  }, [play]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      userMutedRef.current = true;
      pause();
    } else {
      userMutedRef.current = false;
      duckedRef.current = false;
      play();
    }
  }, [isPlaying, pause, play]);

  // Fade the music out for the video or the candle, and back in afterwards
  // (unless she muted it herself)
  const duck = useCallback((duration) => {
    if (!audioRef.current || audioRef.current.paused) return;
    duckedRef.current = true;
    pause(duration);
  }, [pause]);

  const unduck = useCallback(() => {
    if (!duckedRef.current) return;
    duckedRef.current = false;
    if (!userMutedRef.current) play();
  }, [play]);

  return { isPlaying, isAvailable, start, toggle, duck, unduck };
}
