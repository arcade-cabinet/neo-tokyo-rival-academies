import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BabylonCanvasComponent } from './engine/babylon-canvas.component';
import { GameShellComponent } from './game-shell/game-shell.component';
import { AlignmentBarComponent } from './ui/alignment-bar.component';
import { CombatTextComponent } from './ui/combat-text.component';
import { GameHudComponent } from './ui/game-hud.component';
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

@NgModule({
  declarations: [
    AppComponent,
    BabylonCanvasComponent,
    GameShellComponent,
    AlignmentBarComponent,
    CombatTextComponent,
    GameHudComponent,
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
  ],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
