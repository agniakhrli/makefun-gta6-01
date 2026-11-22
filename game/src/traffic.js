// Traffic AI and pedestrian system
import * as THREE from 'three';
import { WORLD } from './config.js';

export function createTraffic(scene, rng, createCarMeshFn) {
  const trafficCars = [];
  const pedestrians = [];

  // Spawn traffic cars (increased count for bustling city life)
  for (let i = 0; i < 16; i++) {
    const car = createCarMeshFn(rng);
    const x = rng.range(-WORLD.size / 2 + 10, WORLD.size / 2 - 10);
    const z = rng.range(-WORLD.size / 2 + 10, WORLD.size / 2 - 10);
    car.position.set(x, 0.5, z);
    car.rotation.y = rng.choice([0, Math.PI / 2, Math.PI, -Math.PI / 2]);
    scene.add(car);
    trafficCars.push({
      group: car,
      speed: rng.range(6, 15),
      dir: rng.choice([0, Math.PI / 2, Math.PI, -Math.PI / 2])
    });
  }

  // Spawn pedestrians
  const pedGeo = new THREE.CapsuleGeometry(0.3, 0.9, 4, 8);
  const pedMat = new THREE.MeshStandardMaterial({ color: 0x00cec9, roughness: 0.6 });
  for (let i = 0; i < 20; i++) {
    const ped = new THREE.Mesh(pedGeo, pedMat);
    const x = rng.range(-WORLD.size / 2 + 5, WORLD.size / 2 - 5);
    const z = rng.range(-WORLD.size / 2 + 5, WORLD.size / 2 - 5);
    ped.position.set(x, 0.8, z);
    scene.add(ped);
    pedestrians.push({
      mesh: ped,
      speed: rng.range(1.5, 3.0),
      patrolTimer: rng.range(0, 5)
    });
  }

  function update(dt) {
    // Move traffic cars
    for (const tCar of trafficCars) {
      const fwd = new THREE.Vector3(Math.sin(tCar.group.rotation.y), 0, Math.cos(tCar.group.rotation.y));
      tCar.group.position.addScaledVector(fwd, tCar.speed * dt);
      // Wrap around world bounds
      if (Math.abs(tCar.group.position.x) > WORLD.size / 2) tCar.group.position.x *= -0.9;
      if (Math.abs(tCar.group.position.z) > WORLD.size / 2) tCar.group.position.z *= -0.9;
    }

    // Move pedestrians slightly
    for (const ped of pedestrians) {
      ped.patrolTimer += dt;
      if (ped.patrolTimer > 4) {
        ped.patrolTimer = 0;
        ped.mesh.rotation.y += Math.PI / 2;
      }
      const fwd = new THREE.Vector3(Math.sin(ped.mesh.rotation.y), 0, Math.cos(ped.mesh.rotation.y));
      ped.mesh.position.addScaledVector(fwd, ped.speed * dt * 0.3);
    }
  }

  return { update };
}
