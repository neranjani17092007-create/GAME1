import * as THREE from 'three';

const offset = new THREE.Vector3(0, 7, 10);
const target = new THREE.Vector3();
const desired = new THREE.Vector3();

// Keep a stable compass direction: W/up always moves toward the screen's top.
export function followPlayer(camera, player, delta, snap = false) {
  desired.copy(player.position).add(offset);
  camera.position.lerp(desired, snap ? 1 : 1 - Math.exp(-8 * delta));
  target.copy(camera.position).sub(offset);
  target.y = 0.8;
  camera.lookAt(target);
}
