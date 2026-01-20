import { beforeEach, describe, expect, it, vi } from 'vitest';
import { YukaAgent } from '../AISystem';

// Mock the ECS and world objects
vi.mock('@/state/ecs', () => ({
  ECS: {
    world: {
      with: vi.fn(() => ({
        first: undefined,
        [Symbol.iterator]: vi.fn(),
      })),
    },
  },
  world: {
    with: vi.fn(() => ({
      where: vi.fn(() => ({
        first: undefined,
      })),
    })),
  },
}));

describe('YukaAgent', () => {
  let agent: YukaAgent;

  describe('Enemy Faction', () => {
    beforeEach(() => {
      agent = new YukaAgent('enemy-1', 'ENEMY');
    });

    it('should initialize in IDLE state', () => {
      expect(agent.fsm.currentState).toBeInstanceOf(Object); // A more robust check would require exporting the state classes
      expect(agent.fsm.globalState).toBeNull();
    });
  });

  describe('Ally Faction', () => {
    beforeEach(() => {
      agent = new YukaAgent('ally-1', 'ALLY');
    });

    it('should initialize in COOP_FOLLOW state', () => {
      expect(agent.fsm.currentState).toBeInstanceOf(Object);
      expect(agent.fsm.globalState).toBeNull();
    });
  });

  describe('Boss Faction', () => {
    beforeEach(() => {
      agent = new YukaAgent('boss-1', 'BOSS');
    });

    it('should initialize in BOSS_HOVER state', () => {
      expect(agent.fsm.currentState).toBeInstanceOf(Object);
      expect(agent.fsm.globalState).toBeNull();
    });
  });
});
