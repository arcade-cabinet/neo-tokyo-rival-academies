import { EntityManager, GameEntity, State, StateMachine } from 'yuka';
import { ECS, world } from '@/state/ecs';

// --- COMMON STATES ---

class IdleState extends State<YukaAgent> {
  enter(_agent: YukaAgent) {
    // console.log('Idle');
  }
  execute(agent: YukaAgent) {
    if (agent.faction === 'ENEMY') {
      // Enemy Logic: Look for Player
      const player = ECS.world.with('isPlayer', 'position').first;
      if (player?.position) {
        const dist = agent.position.distanceTo(
          player.position as unknown as import('yuka').Vector3
        );
        if (dist < 30) {
          agent.fsm.changeTo('CHASE');
        }
      }
    } else if (agent.faction === 'ALLY') {
      // Ally Logic: Follow Player or Attack Enemy
      // Prioritize attacking if enemy near
      const enemy = ECS.world.with('isEnemy', 'position').first;
      if (enemy?.position) {
        const dist = agent.position.distanceTo(enemy.position as unknown as import('yuka').Vector3);
        if (dist < 15) {
          agent.fsm.changeTo('COOP_ATTACK');
          return;
        }
      }
      // Otherwise follow player
      agent.fsm.changeTo('COOP_FOLLOW');
    }
  }
}

// --- ENEMY STATES ---

class ChaseState extends State<YukaAgent> {
  execute(agent: YukaAgent) {
    const player = ECS.world.with('isPlayer', 'position').first;
    if (player?.position) {
      const dx = player.position.x - agent.position.x;
      if (Math.abs(dx) > 2) {
        agent.velocity.x = Math.sign(dx) * 8;
      } else {
        agent.fsm.changeTo('ATTACK');
      }
    }
  }
}

class AttackState extends State<YukaAgent> {
  enter(agent: YukaAgent) {
    const ecsEnt = world.with('id').where((e) => e.id === agent.ecsId).first;
    if (ecsEnt) ecsEnt.characterState = 'block'; // Attack anim
  }
  execute(agent: YukaAgent) {
    if (Math.random() < 0.02) {
      agent.fsm.changeTo('IDLE');
    }
  }
}

// --- ALLY STATES ---

class CoopFollowState extends State<YukaAgent> {
  execute(agent: YukaAgent) {
    const player = ECS.world.with('isPlayer', 'position').first;
    if (player?.position) {
      // Stay slightly behind or ahead
      const targetX = player.position.x - 3;
      const dx = targetX - agent.position.x;
      if (Math.abs(dx) > 1) {
        agent.velocity.x = dx * 2; // Catch up fast
      } else {
        agent.velocity.x = 0;
      }

      // Jump if player jumps?
      // Simplified: If player is way above, teleport or super jump.
      // For now, let physics handle Y, just move X.
    }

    // Check for enemies to engage
    const enemy = ECS.world.with('isEnemy', 'position').first;
    if (enemy?.position) {
      const dist = agent.position.distanceTo(enemy.position as unknown as import('yuka').Vector3);
      if (dist < 10) {
        agent.fsm.changeTo('COOP_ATTACK');
      }
    }
  }
}

class CoopAttackState extends State<YukaAgent> {
  enter(agent: YukaAgent) {
    const ecsEnt = world.with('id').where((e) => e.id === agent.ecsId).first;
    if (ecsEnt) ecsEnt.characterState = 'attack';
  }
  execute(agent: YukaAgent) {
    // Find nearest enemy
    const enemy = ECS.world.with('isEnemy', 'position').first;
    if (enemy?.position) {
      const dx = enemy.position.x - agent.position.x;
      if (Math.abs(dx) > 2) {
        agent.velocity.x = Math.sign(dx) * 10; // Rush them
      } else {
        // Attacking
      }

      // If enemy dead (no enemy found next frame) or far away, return to follow
      const dist = agent.position.distanceTo(enemy.position as unknown as import('yuka').Vector3);
      if (dist > 20) {
        agent.fsm.changeTo('COOP_FOLLOW');
      }
    } else {
      agent.fsm.changeTo('COOP_FOLLOW');
    }
  }
}

// --- BOSS STATES ---

class BossHoverState extends State<YukaAgent> {
  enter(agent: YukaAgent) {
    agent.velocity.y = 0;
  }
  execute(agent: YukaAgent) {
    const player = ECS.world.with('isPlayer', 'position').first;
    if (player?.position) {
      const targetX = player.position.x + 10;
      const dx = targetX - agent.position.x;
      agent.velocity.x = dx * 1.0;

      const targetY = 6 + Math.sin(performance.now() * 0.003) * 2;
      const dy = targetY - agent.position.y;
      agent.velocity.y = dy * 2.0;
    }

    if (Math.random() < 0.005) {
      agent.fsm.changeTo('BOSS_SLAM');
    }
  }
}

class BossSlamState extends State<YukaAgent> {
  enter(agent: YukaAgent) {
    agent.velocity.x = 0;
    agent.velocity.y = -25;
  }
  execute(agent: YukaAgent) {
    if (agent.position.y <= 0.5) {
      agent.velocity.y = 0;
      agent.position.y = 0.5;
      if (Math.random() < 0.1) {
        agent.fsm.changeTo('BOSS_HOVER');
      }
    }
  }
}

// --- Yuka Entity Wrapper ---

export class YukaAgent extends GameEntity {
  ecsId: string;
  fsm: StateMachine<YukaAgent>;
  faction: 'ENEMY' | 'ALLY' | 'BOSS';

  declare position: import('yuka').Vector3;
  declare velocity: import('yuka').Vector3;

  constructor(ecsId: string, faction: 'ENEMY' | 'ALLY' | 'BOSS') {
    super();
    this.ecsId = ecsId;
    this.faction = faction;
    this.fsm = new StateMachine(this);

    if (faction === 'BOSS') {
      this.fsm.add('BOSS_HOVER', new BossHoverState());
      this.fsm.add('BOSS_SLAM', new BossSlamState());
      this.fsm.changeTo('BOSS_HOVER');
    } else if (faction === 'ALLY') {
      this.fsm.add('IDLE', new IdleState()); // Fallback
      this.fsm.add('COOP_FOLLOW', new CoopFollowState());
      this.fsm.add('COOP_ATTACK', new CoopAttackState());
      this.fsm.changeTo('COOP_FOLLOW');
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
  entityMap: Map<string, YukaAgent>;
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

    // 1. Sync ECS Enemies/Allies -> Yuka
    // We need to query both enemies and allies.
    // Let's assume we add 'isAlly' to ECS for the Rival.
    // Or we just query 'characterState' and infer?
    // Better to have a unified query or iterate multiple.

    // Query Enemies (and Bosses tagged as isEnemy)
    const enemies = ECS.world.with('isEnemy', 'position', 'velocity', 'id', 'modelColor');
    for (const e of enemies) {
      this.syncEntity(e, 'ENEMY');
    }

    // Query Allies (Need to add isAlly component or similar tag to ECS defs,
    // for now we can infer from 'faction' string if present, but simpler to use isAlly)
    // Let's assume we use 'isAlly' tag.
    const allies = ECS.world.with('isAlly', 'position', 'velocity', 'id');
    for (const a of allies) {
      this.syncEntity(a, 'ALLY');
    }

    // 2. Update Yuka Logic
    this.entityManager.update(delta);

    // 3. Write Yuka Velocity -> ECS
    this.writeBackVelocity(enemies);
    this.writeBackVelocity(allies);
  }

  syncEntity(ecsEntity: any, defaultFaction: 'ENEMY' | 'ALLY') {
    if (!ecsEntity.id) return;

    let agent = this.entityMap.get(ecsEntity.id);
    if (!agent) {
      let faction = defaultFaction;
      // Check for explicit boss tag or fallback legacy color check
      if (ecsEntity.isBoss || (defaultFaction === 'ENEMY' && ecsEntity.modelColor === 0xffffff)) {
        faction = 'BOSS';
      }

      agent = new YukaAgent(ecsEntity.id, faction);
      if (ecsEntity.position)
        agent.position.copy(ecsEntity.position as unknown as import('yuka').Vector3);

      this.entityManager.add(agent);
      this.entityMap.set(ecsEntity.id, agent);
    }

    // Update Yuka position
    if (ecsEntity.position) {
      agent.position.x = ecsEntity.position.x;
      agent.position.y = ecsEntity.position.y;
      agent.position.z = ecsEntity.position.z;
    }
  }

  writeBackVelocity(ecsEntities: any) {
    for (const e of ecsEntities) {
      if (!e.id) continue;
      const agent = this.entityMap.get(e.id);
      if (agent && e.velocity) {
        e.velocity.x = agent.velocity.x;
        // Boss/Flying check? For now trust Yuka velocity
        // If agent has heavy gravity logic, we might override Y here.
        // But we rely on PhysicsSystem for gravity usually.
        // EXCEPT for BossHover/Slam which drives Y.
        if (agent.faction === 'BOSS') {
          e.velocity.y = agent.velocity.y;
        }
        // Allies/Enemies: Yuka controls X, Physics controls Y (gravity).
        // So we only write X for them?
        // ChaseState only sets X.
        // So safe to copy X.
        if (agent.faction !== 'BOSS') {
          // Keep ECS Y velocity (gravity), only take X
          e.velocity.x = agent.velocity.x;
        }
      }
    }
  }
}

export const aiSystem = new AISystem();
