// The Set is the source of truth: each crystal index can be added only once.
export function createCollection(crystals, scene, onCollect = () => {}) {
  const collected = new Set();
  return {
    get count() { return collected.size; },
    get unlocked() { return collected.size === crystals.length; },
    collectAt(position) {
      crystals.forEach((crystal, index) => {
        if (collected.has(index)) return;
        if (Math.hypot(position.x - crystal.position.x, position.z - crystal.position.z) <= 0.9) {
          collected.add(index);
          scene.remove(crystal); // Also removes its glow light from the scene.
          onCollect(crystal);
        }
      });
    },
    reset() {
      collected.clear();
      crystals.forEach(crystal => scene.add(crystal));
    },
  };
}
