import { EntityManager, GameEntity, State, StateMachine } from 'yuka';
import { ECS, world } from '@/state/ecs';

// --- Yuka States ---

class IdleState extends State<YukaEnemy> {
  enter(_enemy: YukaEnemy) {
    // console.log('Enemy Idle');
  }
  execute(enemy: YukaEnemy) {
    const player = ECS.world.with('isPlayer', 'position').first;
    if (player?.position) {
      const dist = enemy.position.distanceTo(player.position as unknown as import('yuka').Vector3);
      if (dist < 30) {
        enemy.fsm.changeTo('CHASE');
      }
    }
  }
}

class ChaseState extends State<YukaEnemy> {
  enter(_enemy: YukaEnemy) {
    // console.log('Enemy Chase');
  }
  execute(enemy: YukaEnemy) {
    const player = ECS.world.with('isPlayer', 'position').first;
    if (player?.position) {
      const dx = player.position.x - enemy.position.x;
      if (Math.abs(dx) > 2) {
        enemy.velocity.x = Math.sign(dx) * 8; // Faster chase
      } else {
        enemy.fsm.changeTo('ATTACK');
      }
    }
  }
}

class AttackState extends State<YukaEnemy> {
  enter(enemy: YukaEnemy) {
    // console.log('Enemy Attack');
    const ecsEnt = world.with('id').where((e) => e.id === enemy.ecsId).first;
    if (ecsEnt) ecsEnt.characterState = 'block'; // Attack anim
  }
  execute(enemy: YukaEnemy) {
    // Simple cooldown
    if (Math.random() < 0.02) {
      enemy.fsm.changeTo('IDLE');
    }
  }
}

// --- BOSS STATES ---

class BossHoverState extends State<YukaEnemy> {
  enter(enemy: YukaEnemy) {
    enemy.velocity.y = 0;
  }
  execute(enemy: YukaEnemy) {
    const player = ECS.world.with('isPlayer', 'position').first;
    if (player?.position) {
      // Hover ahead of player
      const targetX = player.position.x + 10;
      const dx = targetX - enemy.position.x;
      enemy.velocity.x = dx * 1.0;

      // Hover Height (Sine wave around height 6)
      const targetY = 6 + Math.sin(performance.now() * 0.003) * 2;
      const dy = targetY - enemy.position.y;
      enemy.velocity.y = dy * 2.0;
    }

    if (Math.random() < 0.005) {
      enemy.fsm.changeTo('BOSS_SLAM');
    }
  }
}

class BossSlamState extends State<YukaEnemy> {
  enter(enemy: YukaEnemy) {
    enemy.velocity.x = 0;
    enemy.velocity.y = -25; // Fast Crash down
  }
  execute(enemy: YukaEnemy) {
    // Detect ground hit (approximate)
    if (enemy.position.y <= 0.5) {
      // Impact logic could go here (shake, particles)
      enemy.velocity.y = 0;
      enemy.position.y = 0.5;

      // Wait a bit or immediately return?
      // For now, bounce back up
      if (Math.random() < 0.1) {
          enemy.fsm.changeTo('BOSS_HOVER');
      }
    }
  }
}

// --- Yuka Entity Wrapper ---

export class YukaEnemy extends GameEntity {
  ecsId: string;
  fsm: StateMachine<YukaEnemy>;
  isBoss: boolean;

  // Type assertions for Yuka properties
  declare position: import('yuka').Vector3;
  declare velocity: import('yuka').Vector3;

  constructor(ecsId: string, isBoss = false) {
    super();
    this.ecsId = ecsId;
    this.isBoss = isBoss;
    this.fsm = new StateMachine(this);

    if (isBoss) {
      this.fsm.add('BOSS_HOVER', new BossHoverState());
      this.fsm.add('BOSS_SLAM', new BossSlamState());
      this.fsm.changeTo('BOSS_HOVER');
    } else {
      this.fsm.add('IDLE', new IdleState());
      this.fsm.add('CHASE', new ChaseState());
      this.fsm.add('ATTACK', new AttackState());
      this.fsm.changeTo('IDLE');
    }
  }

  update(delta: number): this {
    this.fsm.update();
    super.update(delta);
    return this;
  }
}

// --- System ---

class AISystem {
  entityManager: EntityManager;
  entityMap: Map<string, YukaEnemy>;
  lastTime: number;

  constructor() {
    this.entityManager = new EntityManager();
    this.entityMap = new Map();
    this.lastTime = performance.now();
  }

  update() {
    const time = performance.now();
    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // 1. Sync ECS Enemies -> Yuka
    const enemies = ECS.world.with('isEnemy', 'position', 'velocity', 'id', 'modelColor');

    for (const ecsEnemy of enemies) {
      if (!ecsEnemy.id) continue;

      let yukaEnemy = this.entityMap.get(ecsEnemy.id);
      if (!yukaEnemy) {
        // Check if boss based on color or some tag?
        // Ideally we add 'isBoss' tag to ECS.
        // For now, hack: Yakuza/Biker are normal.
        // If we spawn a Boss, we need a flag.
        // Let's assume normal for now, will add Boss tag later.
        const isBoss = ecsEnemy.modelColor === 0xffffff; // White/Silver = Vera?
        yukaEnemy = new YukaEnemy(ecsEnemy.id, isBoss);
        if (ecsEnemy.position)
          yukaEnemy.position.copy(ecsEnemy.position as unknown as import('yuka').Vector3);
        this.entityManager.add(yukaEnemy);
        this.entityMap.set(ecsEnemy.id, yukaEnemy);
      }

      // Update Yuka position from ECS (if physics moved it)
      if (ecsEnemy.position) {
        yukaEnemy.position.x = ecsEnemy.position.x;
        yukaEnemy.position.y = ecsEnemy.position.y;
        yukaEnemy.position.z = ecsEnemy.position.z;
      }
    }

    // 2. Update Yuka Logic
    this.entityManager.update(delta);

    // 3. Write Yuka Velocity -> ECS
    for (const ecsEnemy of enemies) {
      if (!ecsEnemy.id) continue;
      const yukaEnemy = this.entityMap.get(ecsEnemy.id);
      if (yukaEnemy && ecsEnemy.velocity) {
        ecsEnemy.velocity.x = yukaEnemy.velocity.x;
        if (yukaEnemy.isBoss) ecsEnemy.velocity.y = yukaEnemy.velocity.y; // Boss flies
        ecsEnemy.velocity.z = yukaEnemy.velocity.z;
      }
    }
  }
}

export const aiSystem = new AISystem();
