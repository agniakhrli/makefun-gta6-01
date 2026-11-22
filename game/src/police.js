// Police AI, patrol vehicles, foot officers, and wanted level system
import * as THREE from 'three';
import { WORLD } from './config.js';

export function createPolice(scene, rng) {
  let wantedLevel = 0;
  let wantedTimer = 0;
  const policeUnits = [];

  // Create police car mesh (black & white with siren light)
  function createPoliceCarMesh() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.6 });
    const bodyGeo = new THREE.BoxGeometry(1.8, 0.8, 4.2);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    group.add(body);

    const roofMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const roofGeo = new THREE.BoxGeometry(1.5, 0.6, 2.2);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.1, -0.2);
    group.add(roof);

    // Siren light bar
    const sirenMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sirenGeo = new THREE.BoxGeometry(0.8, 0.2, 0.4);
    const siren = new THREE.Mesh(sirenGeo, sirenMat);
    siren.position.set(0, 1.5, -0.2);
    group.add(siren);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    [[-0.9, 0.35, 1.3], [0.9, 0.35, 1.3], [-0.9, 0.35, -1.3], [0.9, 0.35, -1.3]].forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(...pos);
      group.add(wheel);
    });

    return { group, siren };
  }

  function spawnPoliceUnit() {
    const unit = createPoliceCarMesh();
    const angle = rng.range(0, Math.PI * 2);
    const dist = rng.range(40, 80);
    unit.group.position.set(Math.cos(angle) * dist, 0.5, Math.sin(angle) * dist);
    scene.add(unit.group);
    policeUnits.push(unit);
  }

  function setWanted(level) {
    wantedLevel = Math.max(0, Math.min(5, level));
    wantedTimer = 0;
    if (wantedLevel > 0 && policeUnits.length < wantedLevel * 2) {
      spawnPoliceUnit();
    }
  }

  function addWanted(amount) {
    setWanted(wantedLevel + amount);
  }

  function update(dt, playerPos) {
    if (wantedLevel > 0) {
      wantedTimer += dt;
      if (wantedTimer > 25) { // Cool down after 25s out of sight
        wantedLevel = Math.max(0, wantedLevel - 1);
        wantedTimer = 0;
      }
    }

    // Update police units chasing player and flash siren
    for (let i = 0; i < policeUnits.length; i++) {
      const p = policeUnits[i];
      p.siren.material.color.setHex(Math.floor(Date.now() / 250) % 2 === 0 ? 0xff0000 : 0x0000ff);
      const targetPos = playerPos;
      const dir = new THREE.Vector3().subVectors(targetPos, p.group.position);
      const dist = dir.length();
      if (dist > 3) {
        dir.normalize();
        p.group.rotation.y = Math.atan2(dir.x, dir.z);
        p.group.position.addScaledVector(dir, Math.min(dist, 10 * dt));
      }
      // Flashing siren color
      const red = Math.floor(Date.now() / 200) % 2 === 0;
      p.siren.material.color.setHex(red ? 0xff0000 : 0x0000ff);
    }
  }

  return {
    getWantedLevel: () => wantedLevel,
    setWanted,
    addWanted,
    update,
    policeUnits
  };
}
