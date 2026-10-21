import { useCallback, useEffect, useRef, useState } from 'react';

const CALIBRATION_MS = 400;
// Loudness (RMS) a blow has to pass. Kept low because phone mics read
// blowing softer than you'd expect once auto-gain is off.
const MIN_THRESHOLD = 0.03;
const MAX_THRESHOLD = 0.08;
// Total blowing time needed. Gusts add up, and quiet gaps only slowly
// take progress back, so uneven blowing still gets there.
const BLOW_NEEDED_MS = 450;
const DECAY_RATE = 0.35;

// Listens to the microphone and calls onBlow when someone blows on the phone.
// onLevel(wind, progress) runs every frame: wind (0..1) leans the flame,
// progress (0..1) shrinks it as the candle gets closer to going out.
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
      // All voice processing off: Android's call-style filters treat
      // blowing as wind noise and remove it.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContextClass();
      if (context.state === 'suspended') await context.resume().catch(() => {});
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      micRef.current = { stream, context };
      setStatus('listening');

      const samples = new Float32Array(analyser.fftSize);
      const calibration = [];
      const startTime = performance.now();
      let lastTime = startTime;
      let threshold = MIN_THRESHOLD;
      let blowMs = 0;

      const listen = (now) => {
        const dt = Math.min(now - lastTime, 250);
        lastTime = now;

        analyser.getFloatTimeDomainData(samples);
        let sum = 0;
        for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
        const rms = Math.sqrt(sum / samples.length);

        if (now - startTime < CALIBRATION_MS) {
          calibration.push(rms);
        } else {
          if (calibration.length) {
            // The median ignores a blow that started straight away
            calibration.sort((a, b) => a - b);
            const roomLevel = calibration[Math.floor(calibration.length / 2)];
            threshold = Math.min(MAX_THRESHOLD, Math.max(MIN_THRESHOLD, roomLevel * 3));
            calibration.length = 0;
          }

          if (rms > threshold) {
            blowMs += dt;
          } else {
            blowMs = Math.max(0, blowMs - dt * DECAY_RATE);
          }

          const progress = Math.min(1, blowMs / BLOW_NEEDED_MS);
          callbacksRef.current.onLevel?.(Math.min(1, rms / threshold), progress);

          if (progress >= 1) {
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
