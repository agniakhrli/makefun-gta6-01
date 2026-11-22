// Game configuration constants for open-world coastal city game.
export const WORLD = {
  size: 300, // City grid size in meters
  blockSize: 40,
  roadWidth: 12,
  sidewalkWidth: 3,
  blocksCount: 6, // 6x6 city blocks
};

export const PLAYER = {
  walkSpeed: 6.0,
  runSpeed: 12.0,
  jumpForce: 8.0,
  gravity: 20.0,
  radius: 0.6,
  height: 1.8,
};

export const CAR = {
  maxSpeed: 35.0,
  accel: 15.0,
  brake: 25.0,
  turnSpeed: 2.2,
  friction: 8.0,
};

export const STORAGE_KEYS = {
  save: 'gta6_save_v1',
};

export const CAMERA_CONFIG = {
  elevatedHeight: 28,
  chaseDistance: 32,
  lookAhead: 8,
};
