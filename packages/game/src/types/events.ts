/**
 * Typed Event System for Game Events
 *
 * This replaces string-based message passing with strongly-typed events
 * for better type safety and maintainability.
 */

export interface CombatEvent {
  type: 'damage' | 'critical' | 'kill' | 'item_collected' | 'xp_gained';
  entityId?: string;
  damage?: number;
  xp?: number;
  item?: {
    id: string;
    name: string;
  };
}

export interface DialogueEvent {
  type: 'start' | 'advance' | 'end' | 'choice';
  dialogueId?: string;
  nodeId?: string;
  choice?: number;
}

export interface ProgressionEvent {
  type: 'level_up' | 'stat_increase' | 'skill_learned';
  entityId: string;
  newLevel?: number;
  stat?: string;
  statIncrease?: number;
  skillId?: string;
}

export interface StageEvent {
  type: 'stage_start' | 'stage_complete' | 'stage_transition' | 'checkpoint';
  stageId: string;
  nextStageId?: string;
  progress?: number;
}

/**
 * Helper function to create combat text from events
 */
export function getCombatTextFromEvent(event: CombatEvent): { message: string; color: string } {
  switch (event.type) {
    case 'critical':
      return {
        message: `CRIT ${event.damage || 0}!`,
        color: '#ff0',
      };
    case 'damage':
      return {
        message: `${event.damage || 0}`,
        color: '#f00',
      };
    case 'kill':
      return {
        message: 'DESTROYED!',
        color: '#f80',
      };
    case 'item_collected':
      return {
        message: `${event.item?.name || 'ITEM'} ACQUIRED`,
        color: '#0f0',
      };
    case 'xp_gained':
      return {
        message: `+${event.xp || 0} XP`,
        color: '#0f0',
      };
    default:
      return {
        message: '',
        color: '#fff',
      };
  }
}
