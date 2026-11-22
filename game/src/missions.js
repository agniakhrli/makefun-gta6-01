// Mission chain and 3D objective marker system
import * as THREE from 'three';

export function createMissions(scene) {
  const missions = [
    { title: "Steal a parked vehicle", targetPos: null, reward: 250, type: "steal" },
    { title: "Drive to the Coastal Beach Club", targetPos: new THREE.Vector3(-100, 0, 100), reward: 500, type: "drive" },
    { title: "Deliver package at Downtown Plaza", targetPos: new THREE.Vector3(60, 0, -60), reward: 750, type: "deliver" },
    { title: "Evade the police pursuit", targetPos: null, reward: 1000, type: "evade" }
  ];

  let currentIndex = 0;

  // Create 3D marker mesh (pulsing ring / beacon) with enhanced visual pulse
  const markerGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.6, 32);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0xff4757, transparent: true, opacity: 0.75 });
  const markerMesh = new THREE.Mesh(markerGeo, markerMat);
  markerMesh.position.y = 0.2;
  scene.add(markerMesh);

  function getActiveMission() {
    return missions[currentIndex] ?? { title: "Explore Sunset City (Free Roam)", targetPos: null, reward: 0, type: "roam" };
  }

  function update(dt, playerPos, isDriving, wantedLevel) {
    const mission = getActiveMission();
    if (!mission.targetPos) {
      markerMesh.visible = false;
      if (mission.type === "steal" && isDriving) {
        completeCurrent();
      } else if (mission.type === "evade" && wantedLevel === 0 && currentIndex >= 3) {
        completeCurrent();
      }
      return;
    }

    markerMesh.visible = true;
    markerMesh.position.copy(mission.targetPos);
    markerMesh.rotation.y += dt * 2;

    // Check proximity to target
    if (playerPos.distanceTo(mission.targetPos) < 6.0) {
      completeCurrent();
    }
  }

  let onCompleteCallback = null;
  function setOnComplete(cb) { onCompleteCallback = cb; }

  function completeCurrent() {
    const mission = missions[currentIndex];
    if (mission && !mission.completed) {
      mission.completed = true;
      const reward = mission.reward;
      currentIndex = Math.min(missions.length, currentIndex + 1);
      if (onCompleteCallback) {
        onCompleteCallback(reward, mission.title);
      }
    }
  }

  return {
    getActiveMission,
    update,
    setOnComplete,
    markerMesh
  };
}
