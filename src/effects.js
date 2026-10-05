import * as THREE from 'three';

export function createEffects(scene) {
  const bursts = [];
  const geometry = new THREE.OctahedronGeometry(0.07);
  function remove(burst) {
    scene.remove(burst.group);
    burst.material.dispose();
  }
  return {
    get active() { return bursts.length > 0; },
    burst(position) {
      const group = new THREE.Group();
      group.position.copy(position);
      const material = new THREE.MeshBasicMaterial({ color: 0xc4ff87, transparent: true });
      for (let i = 0; i < 12; i++) {
        const spark = new THREE.Mesh(geometry, material);
        const angle = i * Math.PI * 2 / 12;
        spark.userData.velocity = new THREE.Vector3(Math.cos(angle) * 2, 0.5 + (i % 3) * 0.5, Math.sin(angle) * 2);
        group.add(spark);
      }
      scene.add(group);
      bursts.push({ group, material, age: 0 });
    },
    update(delta) {
      for (let i = bursts.length - 1; i >= 0; i--) {
        const burst = bursts[i];
        burst.age += delta;
        burst.material.opacity = Math.max(0, 1 - burst.age / 0.45);
        burst.group.children.forEach(spark => spark.position.addScaledVector(spark.userData.velocity, delta));
        if (burst.age >= 0.45) { remove(burst); bursts.splice(i, 1); }
      }
    },
    clear() { bursts.forEach(remove); bursts.length = 0; },
  };
}
