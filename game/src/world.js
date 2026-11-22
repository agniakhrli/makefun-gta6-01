// Procedural coastal city world generator using Three.js
import * as THREE from 'three';
import { WORLD } from './config.js';

export function createWorld(rng) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x7ec8e3); // Sun-soaked coastal sky
  scene.fog = new THREE.FogExp2(0x90c0e0, 0.003);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xfffaed, 0.9);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xfffaed, 1.5);
  dirLight.position.set(150, 250, 100);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Ground / Ocean / Beach (lightened asphalt for elevated camera visibility)
  const groundGeo = new THREE.PlaneGeometry(800, 800);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x687280, roughness: 0.75 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.1;
  scene.add(ground);

  // Road center marker lines for clear street reading from above (clipped to city bounds, avoiding ocean/beach)
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f });
  const stripeGeoZ = new THREE.PlaneGeometry(1, 280);
  for (let offset = -120; offset <= 120; offset += 40) {
    if (offset < -140) continue;
    const stripeX = new THREE.Mesh(stripeGeoZ, stripeMat);
    stripeX.rotation.x = -Math.PI / 2;
    stripeX.position.set(offset, 0.01, 0);
    scene.add(stripeX);
  }
  const stripeGeoX = new THREE.PlaneGeometry(280, 1);
  for (let offset = -120; offset <= 120; offset += 40) {
    const stripeZ = new THREE.Mesh(stripeGeoX, stripeMat);
    stripeZ.rotation.x = -Math.PI / 2;
    stripeZ.position.set(0, 0.01, offset);
    scene.add(stripeZ);
  }

  // Ocean on the west side
  const oceanGeo = new THREE.PlaneGeometry(400, 800);
  const oceanMat = new THREE.MeshStandardMaterial({ color: 0x1e6091, roughness: 0.3, metalness: 0.1 });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(-WORLD.size / 2 - 200, 0, 0);
  scene.add(ocean);

  // Beach sand stripe
  const beachGeo = new THREE.PlaneGeometry(30, 800);
  const beachMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.9 });
  const beach = new THREE.Mesh(beachGeo, beachMat);
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(-WORLD.size / 2 - 15, 0.01, 0);
  scene.add(beach);

  // Canvas texture generator for building windows
  function createBuildingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = rng.choice(['#4a5568', '#2d3748', '#718096', '#2b6cb0', '#2c5282']);
    ctx.fillRect(0, 0, 128, 256);

    ctx.fillStyle = '#ecc94b'; // lit windows
    for (let y = 16; y < 240; y += 24) {
      for (let x = 16; x < 112; x += 20) {
        if (rng.next() > 0.3) {
          ctx.fillRect(x, y, 10, 16);
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  const buildings = [];
  const parkedCars = [];
  const roadBoxes = [];

  // Generate City Grid
  const totalGrid = WORLD.blocksCount;
  const blockSize = WORLD.blockSize;
  const roadW = WORLD.roadWidth;
  const startX = - (totalGrid * blockSize) / 2;
  const startZ = - (totalGrid * blockSize) / 2;

  for (let x = 0; x < totalGrid; x++) {
    for (let z = 0; z < totalGrid; z++) {
      const bx = startX + x * (blockSize + roadW) + blockSize / 2;
      const bz = startZ + z * (blockSize + roadW) + blockSize / 2;
      const bWidth = blockSize - 4;
      const bDepth = blockSize - 4;
      const bHeight = rng.range(20, 70);

      const bTex = createBuildingTexture();
      bTex.repeat.set(2, bHeight / 15);
      const bMat = new THREE.MeshStandardMaterial({ map: bTex, roughness: 0.5 });
      const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      const building = new THREE.Mesh(bGeo, bMat);
      building.position.set(bx, bHeight / 2, bz);
      scene.add(building);

      buildings.push({
        box: new THREE.Box3().setFromObject(building),
        mesh: building
      });

      // Add a parked car near some blocks
      if (rng.next() > 0.5) {
        const carGroup = createCarMesh(rng);
        const carX = bx + bWidth / 2 + 2;
        const carZ = bz + rng.range(-10, 10);
        carGroup.position.set(carX, 0.5, carZ);
        carGroup.rotation.y = rng.choice([0, Math.PI / 2, Math.PI, -Math.PI / 2]);
        scene.add(carGroup);
        parkedCars.push({
          group: carGroup,
          position: carGroup.position,
          interactive: true
        });
      }
    }
  }

  // Helper to create simple car mesh
  function createCarMesh(rngLocal) {
    const group = new THREE.Group();
    const color = rngLocal.choice([0xff3333, 0x3366ff, 0x33cc33, 0xffcc00, 0xeeeeee, 0x111111]);
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 });
    const bodyGeo = new THREE.BoxGeometry(1.8, 0.8, 4.2);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    group.add(body);

    const roofMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
    const roofGeo = new THREE.BoxGeometry(1.5, 0.6, 2.2);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.1, -0.2);
    group.add(roof);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const wheelPositions = [
      [-0.9, 0.35, 1.3], [0.9, 0.35, 1.3],
      [-0.9, 0.35, -1.3], [0.9, 0.35, -1.3]
    ];
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(...pos);
      group.add(wheel);
    });

    return group;
  }

  return {
    scene,
    buildings,
    parkedCars,
    createCarMesh
  };
}
