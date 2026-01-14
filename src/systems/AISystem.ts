import { EntityManager, FSM, GameEntity, State } from 'yuka';
import { ECS, world } from '@/state/ecs';

// --- Yuka States ---

class IdleState extends State<YukaEnemy> {
  enter(_enemy: YukaEnemy) {
    // console.log('Enemy Idle');
  }
  execute(enemy: YukaEnemy) {
    // Determine if player is close
    const player = ECS.world.with('isPlayer', 'position').first;
    if (player?.position) {
      const dist = enemy.position.distanceTo(player.position as unknown as import('yuka').Vector3);
      if (dist < 20) {
        enemy.fsm.changeState('CHASE');
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
      // Simple steering: seek player
      // In a side scroller, this is mostly X-axis
      const dx = player.position.x - enemy.position.x;
      if (Math.abs(dx) > 1) {
        enemy.velocity.x = Math.sign(dx) * 5; // Speed
      } else {
        enemy.fsm.changeState('ATTACK');
      }
    }
  }
}

class AttackState extends State<YukaEnemy> {
  enter(enemy: YukaEnemy) {
    // console.log('Enemy Attack');
    // Trigger attack animation in ECS
    const ecsEnt = world.with('id').where((e) => e.id === enemy.ecsId).first;
    if (ecsEnt) ecsEnt.characterState = 'block'; // Reusing block as attack pose for now
  }
  execute(_enemy: YukaEnemy) {
    // Attack logic, then return to idle/chase
  }
}

// --- Yuka Entity Wrapper ---

// In Yuka, GameEntity has position, velocity as Vector3
export class YukaEnemy extends GameEntity {
  ecsId: string;
  fsm: FSM<YukaEnemy>;

  // Type assertions for Yuka properties
  declare position: import('yuka').Vector3;
  declare velocity: import('yuka').Vector3;

  constructor(ecsId: string) {
    super();
    this.ecsId = ecsId;
    this.fsm = new FSM(this);
    this.fsm.add('IDLE', new IdleState());
    this.fsm.add('CHASE', new ChaseState());
    this.fsm.add('ATTACK', new AttackState());
    this.fsm.changeState('IDLE');
  }

  update(delta: number) {
    this.fsm.update();
    super.update(delta);
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
    const enemies = ECS.world.with('isEnemy', 'position', 'velocity', 'id'); // Added ID to query

    // Naive sync: Add missing, Remove dead
    // For a robust system, we'd use OnAdd/OnRemove events from Miniplex

    // For this prototype, we'll just iterate active enemies and ensure they exist
    for (const ecsEnemy of enemies) {
      if (!ecsEnemy.id) continue;

      let yukaEnemy = this.entityMap.get(ecsEnemy.id);
      if (!yukaEnemy) {
        yukaEnemy = new YukaEnemy(ecsEnemy.id);
        if (ecsEnemy.position)
          yukaEnemy.position.copy(ecsEnemy.position as unknown as import('yuka').Vector3);
        this.entityManager.add(yukaEnemy);
        this.entityMap.set(ecsEnemy.id, yukaEnemy);
      }

      // Update Yuka position from ECS (if physics moved it)
      // Actually, AI drives velocity, Physics drives Position.
      // So we might want to read Position from ECS, set Velocity in Yuka, then write Velocity to ECS.
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
        // ecsEnemy.velocity.y = yukaEnemy.velocity.y; // Let gravity handle Y?
        ecsEnemy.velocity.z = yukaEnemy.velocity.z;
      }
    }

    // Cleanup dead entities
    // (Omitted for brevity in this step, handled by Map checks ideally)
  }
}

export const aiSystem = new AISystem();
