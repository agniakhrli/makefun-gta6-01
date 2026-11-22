// Player character system (on foot movement, collision, camera)
import * as THREE from 'three';
import { PLAYER } from './config.js';

export function createPlayer(scene, buildings) {
  const group = new THREE.Group();

  // Character body mesh (capsule/box representation)
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe056fd, roughness: 0.4 });
  const bodyGeo = new THREE.CapsuleGeometry(0.4, 1.0, 4, 8);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.9;
  group.add(body);

  scene.add(group);

  const position = new THREE.Vector3(0, 0, 10);
  let velocityY = 0;
  let rotationY = 0;
  let isGrounded = true;

  group.position.copy(position);

  function update(dt, keys, camera, mouseDeltaX) {
    // Rotation from mouse look
    rotationY -= mouseDeltaX * 0.003;

    // Movement direction vector based on camera/rotation
    const forward = new THREE.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY));
    const right = new THREE.Vector3(Math.cos(rotationY), 0, -Math.sin(rotationY));

    const moveDir = new THREE.Vector3();
    if (keys['KeyW'] || keys['ArrowUp']) moveDir.add(forward);
    if (keys['KeyS'] || keys['ArrowDown']) moveDir.sub(forward);
    if (keys['KeyD'] || keys['ArrowRight']) moveDir.add(right);
    if (keys['KeyA'] || keys['ArrowLeft']) moveDir.sub(right);

    const speed = keys['ShiftLeft'] || keys['ShiftRight'] ? PLAYER.runSpeed : PLAYER.walkSpeed;

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      const nextPos = position.clone().addScaledVector(moveDir, speed * dt);

      // Check building collisions
      if (!checkCollision(nextPos, buildings)) {
        position.copy(nextPos);
      }
      group.rotation.y = Math.atan2(moveDir.x, moveDir.z);
    }

    // Jump / Gravity
    if (isGrounded && keys['Space']) {
      velocityY = PLAYER.jumpForce;
      isGrounded = false;
    }

    velocityY -= PLAYER.gravity * dt;
    position.y += velocityY * dt;

    if (position.y <= 0) {
      position.y = 0;
      velocityY = 0;
      isGrounded = true;
    }

    group.position.copy(position);

    // Third-person camera follow with smooth lerp
    const targetCamPos = position.clone().add(new THREE.Vector3(0, 3.2, -6.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY));
    camera.position.lerp(targetCamPos, 0.25);
    camera.lookAt(position.clone().add(new THREE.Vector3(0, 1.2, 0)));
  }

  function checkCollision(pos, buildings) {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(pos.x - PLAYER.radius, pos.y, pos.z - PLAYER.radius),
      new THREE.Vector3(pos.x + PLAYER.radius, pos.y + PLAYER.height, pos.z + PLAYER.radius)
    );
    for (let i = 0; i < buildings.length; i++) {
      if (playerBox.intersectsBox(buildings[i].box)) {
        return true;
      }
    }
    return false;
  }

  return {
    group,
    position,
    update,
    getRotation: () => rotationY
  };
}
