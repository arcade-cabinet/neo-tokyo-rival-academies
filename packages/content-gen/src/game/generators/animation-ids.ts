export const ANIMATION_IDS = {
  // --- Movement (In-Place for Game Engines) ---
  IDLE: 0,
  IDLE_COMBAT: 89,
  IDLE_SWORD: 243,
  IDLE_ALERT: 2,
  
  WALK: 30, // Casual Walk
  WALK_IN_PLACE: 613,
  RUN: 16, // RunFast
  RUN_IN_PLACE: 657, // run_fast_10_inplace (assuming standard run)
  RUN_FAST_IN_PLACE: 530, // run_fast_3

  JUMP_RUN_IN_PLACE: 643,
  JUMP_IDLE: 86, // Basic Jump

  // --- Combat ---
  ATTACK_MELEE_1: 4,
  ATTACK_COMBO_1: 198,
  ATTACK_COMBO_2: 200,
  ATTACK_SWORD_SLASH: 219,
  ATTACK_KICK: 103,
  ATTACK_SPARTAN_KICK: 206,
  
  BLOCK: 138,
  DODGE_ROLL: 158,
  DODGE_BACK: 151,

  // --- Reactions ---
  HIT_REACTION: 178,
  DEATH: 8,
  DEATH_BACKWARDS: 189,
  KNOCKDOWN: 187,

  // --- Parkour / Traversal ---
  CLIMB_LADDER: 438,
  CLIMB_WALL: 444,
  VAULT: 429,
  WALL_RUN: 445,
  LANDING: 506,

  // --- Social / Emotes ---
  WAVE: 28,
  CHEER: 59,
  DANCE: 64,
  SIT: 32,
  
  // --- Specifics ---
  RELOAD_RIFLE: 170,
  SHOOT_RIFLE: 98,
  CAST_SPELL: 125,
} as const;

export type AnimationType = keyof typeof ANIMATION_IDS;
