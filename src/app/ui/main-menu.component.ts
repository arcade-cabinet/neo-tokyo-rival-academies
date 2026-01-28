import { Component, EventEmitter, type OnInit, Output } from '@angular/core';
import { SaveSystem } from '../systems/save-system';
import {
  generateSeedPhrase,
  isValidSeedPhrase,
  type SeedPhrase,
  suggestCompletions,
} from '../utils/seed-phrase';

interface SeedSuggestions {
  adjectives: string[];
  nouns: string[];
  locations: string[];
}

export interface MenuStartPayload {
  seed: string;
  loadSave: boolean;
}

@Component({
  selector: 'app-main-menu',
  standalone: false,
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent implements OnInit {
  @Output() start = new EventEmitter<MenuStartPayload>();

  seedInput = '';
  isValid = false;
  suggestions: SeedSuggestions = { adjectives: [], nouns: [], locations: [] };
  hasSave = false;
  saveSeed: string | null = null;
  lastSavedLabel = '';

  ngOnInit(): void {
    const seed = generateSeedPhrase();
    this.seedInput = seed;
    this.isValid = true;
    this.updateSuggestions();

    const slot = SaveSystem.getSlot(0);
    if (slot.data) {
      this.hasSave = true;
      this.saveSeed = slot.data.seed;
      const timestamp = slot.data.timestamp ?? Date.now();
      this.lastSavedLabel = new Date(timestamp).toLocaleString();
    }
  }

  get adjective(): string {
    return this.seedInput.split('-')[0] ?? '';
  }

  get noun(): string {
    return this.seedInput.split('-')[1] ?? '';
  }

  get location(): string {
    return this.seedInput.split('-')[2] ?? '';
  }

  get allSuggestions(): string[] {
    return [
      ...this.suggestions.adjectives,
      ...this.suggestions.nouns,
      ...this.suggestions.locations,
    ];
  }

  onSeedInput(value: string): void {
    const normalized = value.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
    this.seedInput = normalized;
    this.isValid = isValidSeedPhrase(normalized);
    this.updateSuggestions();
  }

  handleGenerateNew(): void {
    const seed = generateSeedPhrase();
    this.seedInput = seed;
    this.isValid = true;
    this.updateSuggestions();
  }

  handleSuggestionClick(word: string): void {
    const parts = this.seedInput.split('-');
    parts[parts.length - 1] = word;
    this.seedInput = parts.join('-');
    this.isValid = isValidSeedPhrase(this.seedInput);
    this.updateSuggestions();
  }

  handleStartNew(): void {
    if (!this.isValid) return;
    this.start.emit({ seed: this.seedInput as SeedPhrase, loadSave: false });
  }

  handleContinue(): void {
    if (!this.hasSave || !this.saveSeed) return;
    this.start.emit({ seed: this.saveSeed, loadSave: true });
  }

  private updateSuggestions(): void {
    if (!this.seedInput || this.isValid) {
      this.suggestions = { adjectives: [], nouns: [], locations: [] };
      return;
    }

    this.suggestions = suggestCompletions(this.seedInput);
  }
}
