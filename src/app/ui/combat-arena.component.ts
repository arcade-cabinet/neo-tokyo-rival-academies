import { Component, inject, NgZone, type OnDestroy, type OnInit } from '@angular/core';
import type { CombatAction } from '@neo-tokyo/core';
import { useCombatStore } from '@neo-tokyo/core';
import { SaveSystem } from '../systems/save-system';

type CombatStoreState = ReturnType<typeof useCombatStore.getState>;

type CombatPhase = CombatStoreState['phase'];

type CombatLogEntry = CombatStoreState['combatLog'][number];

type Combatant = NonNullable<CombatStoreState['player']>;

type EnemyCombatant = CombatStoreState['enemies'][number];

@Component({
  selector: 'app-combat-arena',
  standalone: false,
  templateUrl: './combat-arena.component.html',
  styleUrls: ['./combat-arena.component.scss'],
})
export class CombatArenaComponent implements OnInit, OnDestroy {
  inCombat = false;
  phase: CombatPhase = 'idle';
  turn = 0;
  player: Combatant | null = null;
  enemies: EnemyCombatant[] = [];
  combatLog: CombatLogEntry[] = [];

  selectedTargetId: string | null = null;
  showVictory = false;
  showDefeat = false;

  private unsubscribe: (() => void) | null = null;
  private enemyTurnTimeout: number | null = null;

  private readonly zone = inject(NgZone);

  ngOnInit(): void {
    this.syncState(useCombatStore.getState());

    this.unsubscribe = useCombatStore.subscribe((state) => {
      this.zone.run(() => {
        this.syncState(state);
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
    this.clearEnemyTurnTimeout();
  }

  get latestLog(): CombatLogEntry | null {
    return this.combatLog.length > 0 ? this.combatLog[this.combatLog.length - 1] : null;
  }

  handleAction(actionType: 'attack' | 'defend'): void {
    if (this.phase !== 'player_turn' || !this.selectedTargetId) return;

    const action: CombatAction = { type: actionType };
    useCombatStore.getState().playerAction(action, this.selectedTargetId);
  }

  handleVictoryContinue(): void {
    this.showVictory = false;
    useCombatStore.getState().endCombat();
  }

  handleDefeatReload(): void {
    this.showDefeat = false;
    SaveSystem.load(0);
    useCombatStore.getState().endCombat();
  }

  selectTarget(enemyId: string): void {
    this.selectedTargetId = enemyId;
  }

  private syncState(state: CombatStoreState): void {
    this.inCombat = state.inCombat;
    this.phase = state.phase;
    this.turn = state.turn;
    this.player = state.player;
    this.enemies = state.enemies;
    this.combatLog = state.combatLog;

    if (this.enemies.length > 0) {
      const targetExists = this.selectedTargetId
        ? this.enemies.some((enemy) => enemy.id === this.selectedTargetId)
        : false;
      if (!targetExists) {
        this.selectedTargetId = this.enemies[0].id;
      }
    } else {
      this.selectedTargetId = null;
    }

    this.showVictory = this.phase === 'victory';
    this.showDefeat = this.phase === 'defeat';

    if (this.phase === 'enemy_turn' && this.inCombat) {
      this.scheduleEnemyTurn();
    } else {
      this.clearEnemyTurnTimeout();
    }
  }

  private scheduleEnemyTurn(): void {
    if (this.enemyTurnTimeout) return;
    this.enemyTurnTimeout = window.setTimeout(() => {
      useCombatStore.getState().enemyTurn();
      this.enemyTurnTimeout = null;
    }, 900);
  }

  private clearEnemyTurnTimeout(): void {
    if (this.enemyTurnTimeout) {
      window.clearTimeout(this.enemyTurnTimeout);
      this.enemyTurnTimeout = null;
    }
  }
}
