import * as THREE from 'three';
import { obstacles } from './arena.js';

export function createPlayer(scene) {
  const player = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.45, 6, 12), new THREE.MeshStandardMaterial({ color: 0xffb35c, roughness: 0.45 }));
  body.position.y = 0.8;
  player.add(body);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.2), new THREE.MeshStandardMaterial({ color: 0x172c43, metalness: 0.7, roughness: 0.2 }));
  visor.position.set(0, 1.05, -0.33);
  player.add(visor);
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.25), new THREE.MeshStandardMaterial({ color: 0xe5edf2 }));
  pack.position.set(0, 0.7, 0.37);
  player.add(pack);
  const suit = new THREE.MeshStandardMaterial({ color: 0xffb35c });
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.3, 4, 8), suit);
    arm.position.set(side * 0.51, 0.75, 0);
    player.add(arm);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.4), new THREE.MeshStandardMaterial({ color: 0x26394e }));
    boot.position.set(side * 0.22, 0.125, -0.08);
    player.add(boot);
  }
  player.traverse(object => { if (object.isMesh) object.castShadow = true; });
  scene.add(player);
  return player;
}

export function canMove(x, z) {
  const radius = 0.48;
  if (Math.abs(x) > 12.2 || Math.abs(z) > 12.2) return false;
  return !obstacles.some(o => Math.abs(x - o.x) < o.w / 2 + radius && Math.abs(z - o.z) < o.d / 2 + radius);
}

export function movePlayer(player, keys, delta) {
  const direction = new THREE.Vector3(
    Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')),
    0,
    Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp')),
  );
  if (!direction.lengthSq()) return;
  direction.normalize();
  const distance = 5 * delta;
  // Small steps prevent crossing an obstacle during a slow frame.
  const steps = Math.max(1, Math.ceil(distance / 0.1));
  for (let step = 0; step < steps; step++) {
    const x = player.position.x + direction.x * distance / steps;
    const z = player.position.z + direction.z * distance / steps;
    // Resolve each axis independently so the courier slides along surfaces.
    if (canMove(x, player.position.z)) player.position.x = x;
    if (canMove(player.position.x, z)) player.position.z = z;
  }
  player.rotation.y = Math.atan2(-direction.x, -direction.z);
}
