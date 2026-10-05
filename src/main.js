import * as THREE from 'three';
import './style.css';
import { createArena, exitPosition } from './arena.js';
import { createPlayer, movePlayer } from './player.js';
import { followPlayer } from './camera.js';
import { createCollection } from './collection.js';
import { createDrone } from './drone.js';
import { createGameState } from './game-state.js';
import { createAudio } from './audio.js';
import { createEffects } from './effects.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070d19);
scene.fog = new THREE.FogExp2(0x070d19, 0.018);
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 150);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.querySelector('#game').appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-label', 'Space arena. Use WASD or arrow keys to collect five energy crystals and unlock the spaceship.');

scene.add(new THREE.HemisphereLight(0xadcff5, 0x24253b, 2.3));
const sun = new THREE.DirectionalLight(0xe0edff, 3);
sun.position.set(-8, 18, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 });
sun.shadow.bias = -0.001;
scene.add(sun);

// Deterministic stars made entirely from geometry.
const stars = [];
for (let i = 0; i < 350; i++) {
  const angle = i * 2.39996;
  const radius = 35 + (i % 17) * 2;
  stars.push(Math.cos(angle) * radius, 8 + (i % 29), Math.sin(angle) * radius);
}
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xa4c6dc, size: 0.1 })));

const { crystals, setShipUnlocked } = createArena(scene);
const audio = createAudio();
const effects = createEffects(scene);
const collection = createCollection(crystals, scene, crystal => {
  effects.burst(crystal.position);
  audio.play('collect');
});
const player = createPlayer(scene);
const drone = createDrone(scene);
const game = createGameState();
const keys = new Set();
const counter = document.querySelector('#crystals');
const objective = document.querySelector('#objective');
const victory = document.querySelector('#victory');
const timer = document.querySelector('#timer');
const startButton = document.querySelector('#start');
const resultRestart = document.querySelector('#result-restart');
let displayedState;
let displayedSeconds;
let displayedCount;
let needsRender = true;
function showState() {
  const seconds = Math.ceil(game.remaining);
  if (seconds !== displayedSeconds) {
    timer.textContent = `Time: ${seconds}s`;
    timer.classList.toggle('urgent', seconds <= 15);
    displayedSeconds = seconds;
  }
  if (displayedState === game.state) return;
  displayedState = game.state;
  document.querySelector('#game').dataset.state = game.state;
  victory.hidden = game.state === 'playing';
  startButton.hidden = game.state !== 'ready';
  resultRestart.hidden = game.state === 'ready';
  document.querySelector('#start-controls').hidden = game.state !== 'ready';
  document.querySelector('#phase').textContent = { ready: 'MISSION READY', playing: 'IN FLIGHT', won: 'DELIVERY CONFIRMED', lost: 'MISSION FAILED' }[game.state];
  document.querySelector('#result-title').textContent = game.state === 'won' ? 'Welcome home, courier.' : game.state === 'lost' ? 'Mission lost.' : 'Ready, courier?';
  document.querySelector('#result-message').textContent = game.state === 'won' ? 'All five crystals are safely aboard.' : game.state === 'lost' ? game.reason : 'Collect five crystals and escape within 90 seconds. Avoid the red patrol drone.';
  if (game.state === 'won' || game.state === 'lost') {
    keys.clear();
    audio.play(game.state);
    resultRestart.focus();
  } else if (game.state === 'ready') startButton.focus();
}
function updateMission() {
  if (displayedCount === collection.count) return;
  displayedCount = collection.count;
  counter.textContent = `Crystals: ${collection.count}/${crystals.length}`;
  setShipUnlocked(collection.unlocked);
  objective.textContent = collection.unlocked
    ? 'Spaceship unlocked. Return to the ship!'
    : 'Spaceship locked. Collect all five crystals.';
}
function reset() {
  needsRender = true;
  player.position.set(0, 0, 10);
  player.rotation.y = 0;
  game.reset();
  effects.clear();
  drone.reset();
  keys.clear();
  collection.reset();
  updateMission();
  crystals.forEach(crystal => { crystal.rotation.set(0, 0, 0); crystal.position.y = 0.9; });
  showState();
  followPlayer(camera, player, 0, true);
}
reset();
addEventListener('keydown', event => {
  if (game.state === 'playing' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
  if (game.state === 'playing') keys.add(event.code);
  if (event.code === 'KeyR' && !event.repeat) reset();
});
addEventListener('keyup', event => keys.delete(event.code));
addEventListener('blur', () => keys.clear());
document.querySelector('#restart').addEventListener('click', reset);
resultRestart.addEventListener('click', reset);
startButton.addEventListener('click', () => {
  audio.unlock().then(() => { if (game.state === 'playing') audio.play('start'); });
  keys.clear();
  clock.getDelta();
  game.start(performance.now());
  showState();
});
const muteButton = document.querySelector('#mute');
muteButton.addEventListener('click', () => {
  audio.unlock();
  const muted = audio.toggle();
  muteButton.textContent = muted ? 'Unmute sound' : 'Mute sound';
  muteButton.setAttribute('aria-pressed', String(muted));
});

function resize() {
  needsRender = true;
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener('resize', resize);
const clock = new THREE.Clock();
document.addEventListener('visibilitychange', () => {
  keys.clear();
  // Discard time spent in another tab rather than teleporting on return.
  clock.getDelta();
});
function animate() {
  const delta = clock.getDelta();
  if (document.hidden) return;
  const wasPlaying = game.state === 'playing';
  const hadEffects = effects.active;
  if (game.state === 'playing') {
    game.update(performance.now());
    // Substeps also prevent missing player/drone contact on slow frames.
    let pending = Math.min(delta, 0.25);
    while (pending > 0 && game.state === 'playing') {
      const step = Math.min(pending, 1 / 120);
      movePlayer(player, keys, step);
      drone.update(step);
      game.update(performance.now(), drone.touches(player));
      if (game.state === 'playing') {
        collection.collectAt(player.position);
        game.update(performance.now(), false, collection.unlocked && player.position.distanceTo(exitPosition) < 2.1);
      }
      pending -= step;
    }
    const time = 90 - game.remaining;
    crystals.forEach((crystal, index) => {
      if (!crystal.parent) return;
      crystal.rotation.y = time;
      crystal.position.y = 0.9 + Math.sin(time * 2 + index) * 0.15;
    });
    updateMission();
    showState();
  }
  if (game.state === 'playing') followPlayer(camera, player, delta);
  effects.update(Math.min(delta, 0.1));
  // Idle/result screens only redraw for resets, resizes, or fading effects.
  if (needsRender || wasPlaying || hadEffects) {
    renderer.render(scene, camera);
    needsRender = false;
  }
}
renderer.setAnimationLoop(animate);
