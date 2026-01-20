import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StageSystem } from '../StageSystem';

// Mock the STAGES configuration
vi.mock('@/content/stages', () => ({
  STAGES: {
    intro_cutscene: {
      cutsceneId: 'intro',
      nextStageId: 'stage1',
    },
    stage1: {
      length: 100,
      nextStageId: 'stage2',
    },
    stage2: {
      length: 200,
    },
  },
}));

describe('StageSystem', () => {
  let stageSystem: StageSystem;

  beforeEach(() => {
    stageSystem = new StageSystem();
  });

  it('should initialize with the intro cutscene', () => {
    expect(stageSystem.currentStageId).toBe('intro_cutscene');
    expect(stageSystem.state).toBe('cutscene');
  });

  describe('loadStage', () => {
    it('should load a stage and set the state to playing', () => {
      stageSystem.loadStage('stage1');
      expect(stageSystem.currentStageId).toBe('stage1');
      expect(stageSystem.state).toBe('playing');
      expect(stageSystem.progress).toBe(0);
    });

    it('should load a stage with a cutscene and set the state to cutscene', () => {
      stageSystem.loadStage('intro_cutscene');
      expect(stageSystem.currentStageId).toBe('intro_cutscene');
      expect(stageSystem.state).toBe('cutscene');
    });
  });

  describe('update', () => {
    it('should update the progress if the state is playing', () => {
      stageSystem.loadStage('stage1');
      stageSystem.update(50);
      expect(stageSystem.progress).toBe(50);
    });

    it('should not update the progress if the state is not playing', () => {
      stageSystem.loadStage('intro_cutscene');
      stageSystem.update(50);
      expect(stageSystem.progress).toBe(0);
    });

    it('should complete the stage if the progress reaches the end', () => {
      stageSystem.loadStage('stage1');
      stageSystem.update(100);
      expect(stageSystem.currentStageId).toBe('stage2');
      expect(stageSystem.state).toBe('playing');
    });
  });

  describe('triggerEvent', () => {
    it('should set the state to event and set the active event', () => {
      stageSystem.triggerEvent('test-event');
      expect(stageSystem.state).toBe('event');
      expect(stageSystem.activeEvent).toBe('test-event');
    });
  });
});
