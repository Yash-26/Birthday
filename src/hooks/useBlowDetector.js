import { useCallback, useEffect, useRef, useState } from 'react';

const CALIBRATION_MS = 600;
const MIN_THRESHOLD = 0.12;
const FRAMES_TO_BLOW = 12; // ~200ms of steady blowing

// Listens to the microphone and calls onBlow when someone blows on the phone.
// onLevel receives 0..1 each frame so the flame can lean in the "wind".
export function useBlowDetector({ onBlow, onLevel }) {
  const [status, setStatus] = useState('idle'); // idle | asking | listening | denied | unavailable
  const micRef = useRef(null);
  const rafRef = useRef(null);
  const callbacksRef = useRef({ onBlow, onLevel });

  useEffect(() => {
    callbacksRef.current = { onBlow, onLevel };
  }, [onBlow, onLevel]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (micRef.current) {
      micRef.current.stream.getTracks().forEach((track) => track.stop());
      micRef.current.context.close().catch(() => {});
      micRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setStatus('unavailable');
      return;
    }
    setStatus('asking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      micRef.current = { stream, context };
      setStatus('listening');

      const samples = new Float32Array(analyser.fftSize);
      const startTime = performance.now();
      let baseline = 0.02;
      let loudFrames = 0;

      const listen = () => {
        analyser.getFloatTimeDomainData(samples);
        let sum = 0;
        for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
        const rms = Math.sqrt(sum / samples.length);

        if (performance.now() - startTime < CALIBRATION_MS) {
          baseline = Math.max(baseline, rms);
        } else {
          const threshold = Math.max(MIN_THRESHOLD, baseline * 2.5);
          callbacksRef.current.onLevel?.(Math.min(1, rms / threshold));
          loudFrames = rms > threshold ? loudFrames + 1 : Math.max(0, loudFrames - 1);
          if (loudFrames >= FRAMES_TO_BLOW) {
            stop();
            callbacksRef.current.onBlow?.();
            return;
          }
        }
        rafRef.current = requestAnimationFrame(listen);
      };
      rafRef.current = requestAnimationFrame(listen);
    } catch {
      setStatus('denied');
    }
  }, [stop]);

  return { status, start, stop };
}
