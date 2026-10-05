export function createGameState() {
  let state = 'ready';
  let remaining = 90;
  let deadline = 0;
  let reason = '';
  return {
    get state() { return state; },
    get remaining() { return remaining; },
    get reason() { return reason; },
    start(now) {
      if (state !== 'ready') return;
      state = 'playing';
      deadline = now + 90_000;
    },
    update(now, touchingDrone = false, atUnlockedShip = false) {
      if (state !== 'playing') return;
      remaining = Math.max(0, (deadline - now) / 1000);
      // Defeat takes precedence if danger and escape happen in the same frame.
      if (remaining === 0 || touchingDrone) {
        state = 'lost';
        reason = remaining === 0 ? 'Time ran out.' : 'The patrol drone caught you.';
      } else if (atUnlockedShip) {
        state = 'won';
      }
    },
    reset() { state = 'ready'; remaining = 90; deadline = 0; reason = ''; },
  };
}
