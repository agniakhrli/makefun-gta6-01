// Main entry point and game loop for Sunset City 6
import * as THREE from 'three';
import { createRandom } from './random.js';
import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createCarController } from './car.js';
import { createTraffic } from './traffic.js';
import { createPolice } from './police.js';
import { createMissions } from './missions.js';
import { createHud } from './hud.js';
import { createSound } from './sound.js';
import { createCombat } from './combat.js';
import { createInput } from './input.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shotType = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const rng = createRandom(seed);
const sound = createSound();
const world = createWorld(rng);
const player = createPlayer(world.scene, world.buildings);
const traffic = createTraffic(world.scene, rng, world.createCarMesh);
const police = createPolice(world.scene, rng);
const missions = createMissions(world.scene);

const combat = createCombat(world.scene, camera, sound, () => {
  hud.gameOverScreen.style.display = 'flex';
  document.exitPointerLock();
});

const hud = createHud(() => sound.toggleMute());
const input = createInput(canvas);

let activeVehicle = null;
let carController = null;
let isDriving = false;
let isPaused = false;
let gameStarted = false;

// Mission completion cash reward
missions.setOnComplete((reward, title) => {
  hud.addCash(reward);
  sound.playChime();
});

// Start button
document.getElementById('start-btn').addEventListener('click', () => {
  hud.startScreen.style.display = 'none';
  canvas.requestPointerLock();
  sound.ensureContext();
  gameStarted = true;
});

document.getElementById('resume-btn').addEventListener('click', () => {
  hud.pauseMenu.style.display = 'none';
  canvas.requestPointerLock();
  isPaused = false;
});

document.getElementById('respawn-btn').addEventListener('click', () => {
  hud.gameOverScreen.style.display = 'none';
  combat.respawn();
  player.position.set(0, 0, 10);
  canvas.requestPointerLock();
});

let lastTime = performance.now();

function gameLoop(now) {
  if (shotType) return; // handled in shot mode

  requestAnimationFrame(gameLoop);
  if (isPaused || combat.isDead()) return;

  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  const keys = input.getKeys();
  const mouseDeltaX = input.takeMouseDelta();

  // Pause toggle with Escape
  if (keys['Escape']) {
    keys['Escape'] = false;
    isPaused = !isPaused;
    if (isPaused) {
      hud.pauseMenu.style.display = 'flex';
      document.exitPointerLock();
    } else {
      hud.pauseMenu.style.display = 'none';
      canvas.requestPointerLock();
    }
    return;
  }

  // Shoot with 'F' or left click
  if (keys['KeyF']) {
    keys['KeyF'] = false;
    combat.shoot();
    police.addWanted(1);
  }

  // Reload with 'R'
  if (keys['KeyR']) {
    keys['KeyR'] = false;
    combat.reload();
  }

  // Enter/Exit vehicle with 'E'
  if (keys['KeyE']) {
    keys['KeyE'] = false;
    if (!isDriving) {
      for (const car of world.parkedCars) {
        if (car.position.distanceTo(player.position) < 3.5) {
          activeVehicle = car;
          carController = createCarController(car, camera);
          isDriving = true;
          player.group.visible = false;
          police.addWanted(2); // Stealing raises wanted
          sound.playChime();
          break;
        }
      }
    } else {
      isDriving = false;
      player.position.copy(activeVehicle.position).add(new THREE.Vector3(2, 0, 0));
      player.group.visible = true;
      activeVehicle = null;
      carController = null;
    }
  }

  if (isDriving && carController) {
    carController.update(dt, keys);
    sound.updateEngine(carController.getSpeed(), true);
  } else {
    player.update(dt, keys, camera, mouseDeltaX);
    sound.updateEngine(0, false);
    if (keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD']) {
      sound.playFootstep();
    }
  }

  traffic.update(dt);
  police.update(dt, isDriving ? activeVehicle.position : player.position);
  missions.update(dt, isDriving ? activeVehicle.position : player.position, isDriving, police.getWantedLevel());

  sound.updateSiren(dt, police.getWantedLevel());

  // Update HUD
  hud.update({
    hp: combat.getHp(),
    ammo: combat.getAmmo(),
    wantedLevel: police.getWantedLevel(),
    playerPos: isDriving ? activeVehicle.position : player.position,
    isDriving,
    speed: isDriving ? carController.getSpeed() : 0,
    objective: missions.getActiveMission().title
  });

  renderer.render(world.scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

if (shotType) {
  // If specific police shot, set wanted level to 3
  if (shotType === 'police') {
    police.setWanted(3);
  }
  stageShot(shotType, world, renderer, camera, hud, player, activeVehicle, police, missions);
} else {
  requestAnimationFrame(gameLoop);
}
