import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { BabylonCanvasComponent } from './engine/babylon-canvas.component';
import { GameShellComponent } from './game-shell/game-shell.component';
import { AlignmentBarComponent } from './ui/alignment-bar.component';
import { CombatArenaComponent } from './ui/combat-arena.component';
import { CombatTextComponent } from './ui/combat-text.component';
import { DialogueOverlayComponent } from './ui/dialogue-overlay.component';
import { GameHudComponent } from './ui/game-hud.component';
import { HudDebugOverlayComponent } from './ui/hud-debug-overlay.component';
import { InventoryScreenComponent } from './ui/inventory-screen.component';
import { JrpgHudComponent } from './ui/jrpg-hud.component';
import { MainMenuComponent } from './ui/main-menu.component';
import { NarrativeOverlayComponent } from './ui/narrative-overlay.component';
import { QuestAcceptDialogComponent } from './ui/quest-accept-dialog.component';
import { QuestCompletionDialogComponent } from './ui/quest-completion-dialog.component';
import { QuestLogComponent } from './ui/quest-log.component';
import { QuestObjectiveComponent } from './ui/quest-objective.component';
import { SaveSlotSelectComponent } from './ui/save-slot-select.component';
import { SplashScreenComponent } from './ui/splash-screen.component';
import { StatAllocationModalComponent } from './ui/stat-allocation-modal.component';

const GAME_DECLARATIONS = [
  BabylonCanvasComponent,
  GameShellComponent,
  AlignmentBarComponent,
  CombatArenaComponent,
  CombatTextComponent,
  DialogueOverlayComponent,
  GameHudComponent,
  HudDebugOverlayComponent,
  InventoryScreenComponent,
  JrpgHudComponent,
  MainMenuComponent,
  NarrativeOverlayComponent,
  QuestAcceptDialogComponent,
  QuestCompletionDialogComponent,
  QuestLogComponent,
  QuestObjectiveComponent,
  SaveSlotSelectComponent,
  SplashScreenComponent,
  StatAllocationModalComponent,
];

@NgModule({
  declarations: [...GAME_DECLARATIONS],
  imports: [CommonModule, IonicModule],
  exports: [...GAME_DECLARATIONS],
})
export class GameModule {}
