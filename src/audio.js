export function createAudio() {
  let context;
  let muted = false;
  const voices = new Set();
  return {
    get muted() { return muted; },
    async unlock() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      try {
        context ??= new AudioContext();
        await context.resume();
      } catch { /* Audio is optional; gameplay stays available. */ }
    },
    toggle() {
      muted = !muted;
      if (muted) voices.forEach(gain => {
        gain.gain.cancelScheduledValues(context.currentTime);
        gain.gain.setValueAtTime(0, context.currentTime);
      });
      return muted;
    },
    play(kind) {
      if (muted || !context || context.state !== 'running') return;
      const notes = { start: [330, 440], collect: [660, 880, 1100], won: [440, 554, 660, 880], lost: [220, 165, 110] }[kind];
      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const at = context.currentTime + index * 0.09;
        oscillator.type = kind === 'lost' ? 'triangle' : 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, context.currentTime);
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.07, at + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.18);
        oscillator.connect(gain);
        gain.connect(context.destination);
        voices.add(gain);
        oscillator.onended = () => { voices.delete(gain); oscillator.disconnect(); gain.disconnect(); };
        oscillator.start(at);
        oscillator.stop(at + 0.2);
      });
    },
  };
}
