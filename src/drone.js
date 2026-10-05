import * as THREE from 'three';

// Rectangle around the obstacles, traversed clockwise at 3 units per second.
export const patrolRoute = [[-9, 8], [-9, -8], [9, -8], [9, 8]];
export function createDrone(scene) {
  const mesh = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8), new THREE.MeshStandardMaterial({ color: 0x735d83, metalness: 0.6, roughness: 0.3 }));
  body.castShadow = true;
  mesh.add(body);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshStandardMaterial({ color: 0xff4e63, emissive: 0xff1838, emissiveIntensity: 2 }));
  eye.position.set(0, 0, -0.45);
  mesh.add(eye);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.07, 8, 24), new THREE.MeshStandardMaterial({ color: 0xff685c, emissive: 0x7e1725 }));
  ring.rotation.x = Math.PI / 2;
  mesh.add(ring);
  scene.add(mesh);
  let next = 1;
  function reset() { mesh.position.set(...[patrolRoute[0][0], 0.9, patrolRoute[0][1]]); mesh.rotation.y = 0; next = 1; }
  reset();
  return {
    mesh, reset,
    update(delta) {
      let distance = delta * 3;
      while (distance > 0) {
        const [x, z] = patrolRoute[next];
        const dx = x - mesh.position.x, dz = z - mesh.position.z;
        const length = Math.hypot(dx, dz);
        mesh.rotation.y = Math.atan2(-dx, -dz);
        if (distance >= length) {
          mesh.position.set(x, 0.9, z);
          distance -= length;
          next = (next + 1) % patrolRoute.length;
        } else {
          mesh.position.x += dx / length * distance;
          mesh.position.z += dz / length * distance;
          distance = 0;
        }
      }
    },
    touches(player) { return Math.hypot(mesh.position.x - player.position.x, mesh.position.z - player.position.z) <= 1.15; },
  };
}
