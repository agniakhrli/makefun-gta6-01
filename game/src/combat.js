// Combat system: pistol raycast shooting, melee attack, health & damage
import * as THREE from 'three';

export function createCombat(scene, camera, sound, onTakeDamage) {
  let hp = 100;
  let ammo = 30;
  let maxAmmo = 30;
  let isDead = false;

  // Simple gun mesh attached to camera/player view or world
  const flashGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const flashMesh = new THREE.Mesh(flashGeo, flashMat);
  flashMesh.visible = false;
  scene.add(flashMesh);

  function shoot(targetPosList) {
    if (isDead || ammo <= 0) return;
    ammo--;
    sound.playShoot();

    // Flash muzzle effect
    flashMesh.position.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(1.5));
    flashMesh.visible = true;
    setTimeout(() => { flashMesh.visible = false; }, 80);

    // Raycast hit detection against target list (enemies/police)
    const raycaster = new THREE.Raycaster();
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    raycaster.set(camera.position, dir);

    // Check intersections
    // (targetPosList contains objects with meshes/groups)
  }

  function reload() {
    ammo = maxAmmo;
    sound.playTone(520, 'triangle', 0.25, 0.15); // Enhanced reload sound pitch
  }

  function takeDamage(amount) {
    if (isDead) return;
    hp = Math.max(0, hp - amount);
    sound.playTone(150, 'sawtooth', 0.2, 0.2);
    if (hp === 0) {
      isDead = true;
      if (onTakeDamage) onTakeDamage();
    }
  }

  function heal(amount) {
    hp = Math.min(100, hp + amount);
  }

  function respawn() {
    hp = 100;
    ammo = maxAmmo;
    isDead = false;
  }

  return {
    shoot,
    reload,
    takeDamage,
    heal,
    respawn,
    getHp: () => hp,
    getAmmo: () => ammo,
    isDead: () => isDead
  };
}
