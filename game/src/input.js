// Keyboard and mouse input tracking system
export function createInput(canvas) {
  const keys = {};
  let mouseDeltaX = 0;

  window.addEventListener('keydown', e => { keys[e.code] = true; });
  window.addEventListener('keyup', e => { keys[e.code] = false; });

  canvas.addEventListener('click', () => {
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  });

  window.addEventListener('mousemove', e => {
    if (document.pointerLockElement === canvas) {
      mouseDeltaX += e.movementX;
    }
  });

  return {
    getKeys: () => keys,
    takeMouseDelta: () => {
      const d = mouseDeltaX;
      mouseDeltaX = 0;
      return d;
    }
  };
}
