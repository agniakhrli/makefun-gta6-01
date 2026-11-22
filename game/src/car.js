// Vehicle physics and driving control system
import * as THREE from 'three';
import { CAR } from './config.js';

export function createCarController(carObj, camera) {
  let speed = 0;
  let steerAngle = 0;

  function update(dt, keys) {
    const group = carObj.group;

    // Acceleration & Braking
    if (keys['KeyW'] || keys['ArrowUp']) {
      speed = Math.min(CAR.maxSpeed, speed + CAR.accel * dt);
    } else if (keys['KeyS'] || keys['ArrowDown']) {
      speed = Math.max(-CAR.maxSpeed / 3, speed - CAR.brake * dt);
    } else {
      // Friction / deceleration
      if (speed > 0) speed = Math.max(0, speed - CAR.friction * dt);
      else if (speed < 0) speed = Math.min(0, speed + CAR.friction * dt);
    }

    // Steering
    if (keys['KeyA'] || keys['ArrowLeft']) {
      steerAngle += CAR.turnSpeed * dt * (speed !== 0 ? Math.sign(speed) : 0);
    } else if (keys['KeyD'] || keys['ArrowRight']) {
      steerAngle -= CAR.turnSpeed * dt * (speed !== 0 ? Math.sign(speed) : 0);
    } else {
      steerAngle *= 0.8; // center steering
    }

    group.rotation.y += steerAngle * speed * dt * 0.1;

    // Move forward along car's facing direction
    const forward = new THREE.Vector3(Math.sin(group.rotation.y), 0, Math.cos(group.rotation.y));
    group.position.addScaledVector(forward, speed * dt);

    // Smooth chase camera behind car with lerp damping
    const targetCamPos = group.position.clone().add(new THREE.Vector3(0, 4.5, -9).applyAxisAngle(new THREE.Vector3(0, 1, 0), group.rotation.y));
    camera.position.lerp(targetCamPos, 0.2);
    camera.lookAt(group.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
  }

  return {
    update,
    getSpeed: () => Math.round(Math.abs(speed) * 3.6) // km/h approximation
  };
}
