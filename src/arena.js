import * as THREE from 'three';

export const obstacles = [
  { x: -5, z: -2, w: 3, d: 3 },
  { x: 4, z: 2, w: 3, d: 2 },
  { x: 0, z: -6, w: 4, d: 2 },
  { x: -3, z: 5, w: 2, d: 2 },
];
export const crystalPositions = [[-9, -7], [9, 5], [3, -10], [-9, 8], [8, -2]];
export const exitPosition = new THREE.Vector3(8, 0, -9);

function box(scene, size, position, color, emissive = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color, emissive, roughness: 0.65, metalness: 0.25 }));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

export function createArena(scene) {
  box(scene, [26, 0.5, 26], [0, -0.25, 0], 0x17283c);
  const grid = new THREE.GridHelper(26, 26, 0x42647c, 0x263f56);
  grid.position.y = 0.012;
  scene.add(grid);
  for (const z of [-13, 13]) box(scene, [27, 0.8, 0.5], [0, 0.4, z], 0x354861);
  for (const x of [-13, 13]) box(scene, [0.5, 0.8, 26], [x, 0.4, 0], 0x354861);
  for (const x of [-13, 13]) for (const z of [-13, 13]) {
    box(scene, [0.7, 2, 0.7], [x, 1, z], 0x42647c);
    box(scene, [0.74, 0.16, 0.74], [x, 2.1, z], 0x8bdaf5, 0x59bbdd);
  }
  obstacles.forEach(({ x, z, w, d }) => {
    box(scene, [w, 1.8, d], [x, 0.9, z], 0x344660);
    box(scene, [w + 0.04, 0.08, d + 0.04], [x, 1.6, z], 0xffb35c, 0x6f380b);
  });

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.08, 48), new THREE.MeshStandardMaterial({ color: 0x334d40 }));
  pad.position.set(8, 0.05, -9);
  scene.add(pad);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.035, 8, 64), new THREE.MeshBasicMaterial({ color: 0xa7f573 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(8, 0.12, -9);
  scene.add(ring);
  const ship = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.8, 8), new THREE.MeshStandardMaterial({ color: 0xd8e8eb, metalness: 0.6, roughness: 0.3 }));
  hull.rotation.x = -Math.PI / 2;
  ship.add(hull);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), new THREE.MeshStandardMaterial({ color: 0x65d9ee, emissive: 0x164f68, metalness: 0.5 }));
  cockpit.position.set(0, 0.35, -0.3);
  ship.add(cockpit);
  for (const x of [-0.9, 0.9]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 1.2), new THREE.MeshStandardMaterial({ color: 0x87a4b4 }));
    wing.position.set(x, -0.2, 0.5);
    ship.add(wing);
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 12), new THREE.MeshStandardMaterial({ color: 0xa7f573, emissive: 0x527d29 }));
    engine.rotation.x = Math.PI / 2;
    engine.position.set(x, -0.2, 1.1);
    ship.add(engine);
  }
  ship.position.set(8, 1, -9);
  ship.traverse(object => { if (object.isMesh) object.castShadow = true; });
  scene.add(ship);

  const crystals = crystalPositions.map(([x, z]) => {
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45),
      new THREE.MeshStandardMaterial({ color: 0xa7f573, emissive: 0x83ee43, emissiveIntensity: 1.5, roughness: 0.25 }),
    );
    crystal.geometry.scale(1, 1.6, 1);
    crystal.position.set(x, 0.9, z);
    crystal.add(new THREE.PointLight(0xa7f573, 2, 3));
    scene.add(crystal);
    return crystal;
  });
  function setShipUnlocked(unlocked) {
    ring.material.color.setHex(unlocked ? 0xa7f573 : 0xff685c);
    pad.material.color.setHex(unlocked ? 0x334d40 : 0x4d3034);
  }
  setShipUnlocked(false);
  return { crystals, setShipUnlocked };
}
