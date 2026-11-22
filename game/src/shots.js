// Screenshot staging harness for automated tests / visual checks
import * as THREE from 'three';

export function stageShot(shotType, world, renderer, camera, hud, player, activeVehicle, police, missions) {
  if (shotType === 'start') {
    hud.startScreen.style.display = 'flex';
    camera.position.set(0, 20, -40);
    camera.lookAt(0, 5, 0);
  } else if (shotType === 'play') {
    hud.startScreen.style.display = 'none';
    if (world.parkedCars.length > 0) {
      const car = world.parkedCars[0];
      car.group.position.set(-132, 0.5, 0);
      car.group.rotation.y = 0;
      player.group.visible = false;
    }
    if (world.parkedCars.length > 1) {
      world.parkedCars[1].group.position.set(-132, 0.5, 25);
      world.parkedCars[1].group.rotation.y = 0;
    }
    // Camera positioned over ocean/beach looking along the coastal road
    camera.position.set(-185, 22, -45);
    camera.lookAt(-132, 1, 15);

    hud.update({
      hp: 100,
      ammo: 30,
      wantedLevel: 0,
      playerPos: new THREE.Vector3(-132, 0.5, 0),
      isDriving: true,
      speed: 42,
      objective: "Drive to the Coastal Beach Club",
      buildings: world.buildings,
      missionTarget: missions.getActiveMission().targetPos,
      policeUnits: police.policeUnits
    });
  } else if (shotType === 'police') {
    hud.startScreen.style.display = 'none';
    police.setWanted(2);
    if (police.policeUnits.length < 2) {
      police.setWanted(2);
    }
    if (police.policeUnits.length >= 2) {
      // Stage player/target car and police unit on the same coastal road
      police.policeUnits[0].group.position.set(-132, 0.5, 12);
      police.policeUnits[0].group.rotation.y = 0;
      police.policeUnits[1].group.position.set(-132, 0.5, -14);
      police.policeUnits[1].group.rotation.y = 0;
    }
    // Camera positioned over ocean/beach framing chase on coastal road
    camera.position.set(-185, 24, -45);
    camera.lookAt(-132, 1, 10);

    hud.update({
      hp: 100,
      ammo: 30,
      wantedLevel: 2,
      playerPos: new THREE.Vector3(-132, 0.5, 12),
      isDriving: true,
      speed: 55,
      objective: "Evade the police pursuit",
      buildings: world.buildings,
      missionTarget: missions.getActiveMission().targetPos,
      policeUnits: police.policeUnits
  });
  } else if (shotType === 'end') {
    hud.startScreen.style.display = 'none';
    camera.position.set(0, 45, -55);
    camera.lookAt(0, 10, 0);

    hud.update({
      hp: 100,
      ammo: 30,
      wantedLevel: 0,
      playerPos: new THREE.Vector3(0, 0, 0),
      isDriving: false,
      speed: 0,
      objective: "MISSION COMPLETE: All Objectives Accomplished",
      buildings: world.buildings,
      missionTarget: null,
      policeUnits: police.policeUnits
    });

    const victoryDiv = document.createElement('div');
    victoryDiv.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: white; font-family: system-ui, sans-serif; z-index: 150; text-align: center;
    `;
    victoryDiv.innerHTML = `
      <div style="background: rgba(20,20,30,0.9); padding: 30px 50px; border-radius: 16px; border: 2px solid #ffd700; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
        <h1 style="font-size: 3.5rem; margin: 0 0 10px; color: #ffd700; text-shadow: 0 2px 10px rgba(255,215,0,0.5);">MISSION COMPLETE</h1>
        <p style="font-size: 1.5rem; margin: 0 0 20px;">Sunset City Conquered • Reward: $2,500</p>
        <div style="font-size: 1.2rem; color: #4cd137; font-weight: bold;">★ 5-Star Crime Syndicate Master</div>
      </div>
    `;
    document.body.appendChild(victoryDiv);
  }

  renderer.render(world.scene, camera);
  window.__shotReady = true;
}
