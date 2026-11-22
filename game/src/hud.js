// HUD, Minimap, Pause Menu, and UI overlay system
import { STORAGE_KEYS } from './config.js';

export function createHud(onMuteToggle) {
  const overlay = document.createElement('div');
  overlay.id = 'hud-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; pointer-events: none;
    font-family: system-ui, sans-serif; color: #fff;
    display: flex; flex-direction: column; justify-content: space-between; padding: 20px;
    box-sizing: border-box; z-index: 10;
  `;

  // Top bar (Health, Cash, Wanted Level, Ammo, Mute)
  const topBar = document.createElement('div');
  topBar.style.cssText = `display: flex; justify-content: space-between; align-items: flex-start; pointer-events: auto;`;
  
  const statsDiv = document.createElement('div');
  statsDiv.style.cssText = `background: rgba(0,0,0,0.7); padding: 10px 15px; border-radius: 8px; font-weight: bold; font-size: 15px; backdrop-filter: blur(4px); display: flex; gap: 12px; align-items: center;`;
  statsDiv.innerHTML = `
    <span>❤️ HP: <span id="hud-hp">100</span></span>
    <span>💵 $<span id="hud-cash">500</span></span>
    <span>⭐ <span id="hud-wanted" style="color: #ffd700;">☆☆☆☆☆</span></span>
    <span>🔫 <span id="hud-ammo">30/30</span></span>
    <button id="mute-btn" style="background: #333; color: white; border: 1px solid #666; padding: 4px 8px; border-radius: 4px; cursor: pointer;">🔊 Mute</button>
  `;
  topBar.appendChild(statsDiv);

  // Minimap container with radar grid border
  const minimapCanvas = document.createElement('canvas');
  minimapCanvas.width = 150;
  minimapCanvas.height = 150;
  minimapCanvas.style.cssText = `background: rgba(10,15,30,0.85); border: 2px solid rgba(255,215,0,0.4); border-radius: 50%; width: 150px; height: 150px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); pointer-events: none;`;
  topBar.appendChild(minimapCanvas);
  const mapCtx = minimapCanvas.getContext('2d');

  overlay.appendChild(topBar);

  // Bottom bar (Objective & Speedometer)
  const bottomBar = document.createElement('div');
  bottomBar.style.cssText = `display: flex; justify-content: space-between; align-items: flex-end; pointer-events: none;`;

  const objectiveDiv = document.createElement('div');
  objectiveDiv.style.cssText = `background: rgba(0,0,0,0.7); padding: 12px 18px; border-radius: 8px; font-size: 15px; max-width: 350px; backdrop-filter: blur(4px); border-left: 4px solid #ff4757;`;
  objectiveDiv.innerHTML = `<strong>Objective:</strong> <span id="hud-objective">Steal a parked vehicle</span>`;
  bottomBar.appendChild(objectiveDiv);

  const speedDiv = document.createElement('div');
  speedDiv.id = 'hud-speed';
  speedDiv.style.cssText = `background: rgba(0,0,0,0.7); padding: 10px 15px; border-radius: 8px; font-size: 20px; font-weight: bold; display: none; backdrop-filter: blur(4px);`;
  speedDiv.innerHTML = `0 <span style="font-size: 12px">KM/H</span>`;
  bottomBar.appendChild(speedDiv);

  overlay.appendChild(bottomBar);

  // Start Screen overlay
  const startScreen = document.createElement('div');
  startScreen.id = 'start-screen';
  startScreen.style.cssText = `
    position: fixed; inset: 0; background: linear-gradient(135deg, #1e3c72, #2a5298);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: white; font-family: system-ui, sans-serif; z-index: 100; text-align: center; padding: 20px;
  `;
  startScreen.innerHTML = `
    <h1 style="font-size: 4rem; margin: 0 0 10px; text-shadow: 0 4px 12px rgba(0,0,0,0.5); font-weight: 900; letter-spacing: 2px;">SUNSET CITY 6</h1>
    <p style="font-size: 1.2rem; margin: 0 0 30px; opacity: 0.9;">An Open-World Coastal Crime Action Adventure</p>
    <div style="background: rgba(0,0,0,0.3); padding: 20px 30px; border-radius: 12px; margin-bottom: 30px; text-align: left; backdrop-filter: blur(6px);">
      <p style="margin: 5px 0;"><strong>WASD / Arrows:</strong> Move / Drive</p>
      <p style="margin: 5px 0;"><strong>Shift:</strong> Run | <strong>Space:</strong> Jump</p>
      <p style="margin: 5px 0;"><strong>E:</strong> Enter / Exit Vehicle | <strong>F / Click:</strong> Shoot Pistol</p>
      <p style="margin: 5px 0;"><strong>R:</strong> Reload | <strong>Esc:</strong> Pause Menu</p>
    </div>
    <button id="start-btn" style="background: #ff4757; color: white; border: none; padding: 15px 40px; font-size: 1.2rem; font-weight: bold; border-radius: 30px; cursor: pointer; box-shadow: 0 6px 20px rgba(255,71,87,0.4); transition: transform 0.2s;">PLAY GAME</button>
  `;
  document.body.appendChild(startScreen);

  // Pause Menu overlay
  const pauseMenu = document.createElement('div');
  pauseMenu.id = 'pause-menu';
  pauseMenu.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: none; flex-direction: column; align-items: center; justify-content: center;
    color: white; font-family: system-ui, sans-serif; z-index: 90; text-align: center; backdrop-filter: blur(5px);
  `;
  pauseMenu.innerHTML = `
    <h1 style="font-size: 3rem; margin-bottom: 20px;">GAME PAUSED</h1>
    <button id="resume-btn" style="background: #ff4757; color: white; border: none; padding: 12px 30px; font-size: 1.1rem; font-weight: bold; border-radius: 20px; cursor: pointer; margin-bottom: 10px;">RESUME</button>
  `;
  document.body.appendChild(pauseMenu);

  // Game Over overlay
  const gameOverScreen = document.createElement('div');
  gameOverScreen.id = 'game-over';
  gameOverScreen.style.cssText = `
    position: fixed; inset: 0; background: rgba(100,0,0,0.85);
    display: none; flex-direction: column; align-items: center; justify-content: center;
    color: white; font-family: system-ui, sans-serif; z-index: 95; text-align: center; backdrop-filter: blur(5px);
  `;
  gameOverScreen.innerHTML = `
    <h1 style="font-size: 4rem; margin-bottom: 10px; color: #ff6b6b;">WASTED</h1>
    <p style="font-size: 1.3rem; margin-bottom: 30px;">You were arrested or taken down.</p>
    <button id="respawn-btn" style="background: white; color: #333; border: none; padding: 15px 40px; font-size: 1.2rem; font-weight: bold; border-radius: 30px; cursor: pointer;">RESPAWN</button>
  `;
  document.body.appendChild(gameOverScreen);

  document.body.appendChild(overlay);

  // Mute button event
  document.getElementById('mute-btn').addEventListener('click', () => {
    const muted = onMuteToggle();
    document.getElementById('mute-btn').textContent = muted ? '🔇 Muted' : '🔊 Mute';
  });

  let cash = 500;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.save);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.cash) cash = data.cash;
    }
  } catch {}

  function saveGame() {
    try {
      localStorage.setItem(STORAGE_KEYS.save, JSON.stringify({ cash }));
    } catch {}
  }

  function update(stateData) {
    document.getElementById('hud-hp').textContent = stateData.hp;
    document.getElementById('hud-cash').textContent = cash;
    document.getElementById('hud-ammo').textContent = `${stateData.ammo}/30`;

    // Wanted stars
    const stars = '★'.repeat(stateData.wantedLevel) + '☆'.repeat(5 - stateData.wantedLevel);
    document.getElementById('hud-wanted').textContent = stars;

    if (stateData.objective) {
      document.getElementById('hud-objective').textContent = stateData.objective;
    }
    if (stateData.isDriving) {
      speedDiv.style.display = 'block';
      speedDiv.innerHTML = `${stateData.speed} <span style="font-size: 12px">KM/H</span>`;
    } else {
      speedDiv.style.display = 'none';
    }

    // Draw minimap
    mapCtx.clearRect(0, 0, 150, 150);
    mapCtx.save();
    mapCtx.beginPath();
    mapCtx.arc(75, 75, 73, 0, Math.PI * 2);
    mapCtx.clip();

    // Background (Dark blue-grey city map)
    mapCtx.fillStyle = '#1e293b';
    mapCtx.fillRect(0, 0, 150, 150);

    const pPos = stateData.playerPos || { x: 0, z: 0 };
    const scale = 0.5;

    function worldToMap(wx, wz) {
      const dx = (wx - pPos.x) * scale;
      const dz = (wz - pPos.z) * scale;
      return { x: 75 + dx, y: 75 + dz };
    }

    // Draw building blocks on minimap
    if (stateData.buildings) {
      mapCtx.fillStyle = '#334155';
      for (const b of stateData.buildings) {
        const pos = b.mesh ? b.mesh.position : { x: 0, z: 0 };
        const mp = worldToMap(pos.x, pos.z);
        mapCtx.fillRect(mp.x - 12, mp.y - 12, 24, 24);
      }
    }

    // Draw mission target marker
    if (stateData.missionTarget) {
      const mp = worldToMap(stateData.missionTarget.x, stateData.missionTarget.z);
      mapCtx.fillStyle = '#ff4757';
      mapCtx.beginPath();
      mapCtx.arc(mp.x, mp.y, 6, 0, Math.PI * 2);
      mapCtx.fill();
    }

    // Draw police units
    if (stateData.policeUnits) {
      mapCtx.fillStyle = '#3b82f6';
      for (const pu of stateData.policeUnits) {
        const ppos = pu.group ? pu.group.position : pu;
        const mp = worldToMap(ppos.x, ppos.z);
        mapCtx.beginPath();
        mapCtx.arc(mp.x, mp.y, 4, 0, Math.PI * 2);
        mapCtx.fill();
      }
    }

    // Draw player position at center
    mapCtx.fillStyle = '#ff4757';
    mapCtx.beginPath();
    mapCtx.arc(75, 75, 5, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.strokeStyle = '#ffffff';
    mapCtx.lineWidth = 2;
    mapCtx.stroke();

    mapCtx.restore();
  }

  return {
    startScreen,
    pauseMenu,
    gameOverScreen,
    update,
    saveGame,
    getCash: () => cash,
    addCash: (amount) => { cash += amount; saveGame(); }
  };
}
