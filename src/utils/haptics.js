// Short vibrations on Android. iOS and desktop browsers simply ignore this.
export function vibrate(pattern) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibration not supported, nothing to do
  }
}
