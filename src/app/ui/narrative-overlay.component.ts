import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import type { NarrativeLine } from '../content/intro-script';

@Component({
  selector: 'app-narrative-overlay',
  templateUrl: './narrative-overlay.component.html',
  styleUrls: ['./narrative-overlay.component.scss'],
})
export class NarrativeOverlayComponent implements OnChanges {
  @Input() script: NarrativeLine[] = [];
  @Output() complete = new EventEmitter<void>();

  index = 0;
  displayText = '';
  charIndex = 0;
  typingTimeout: number | null = null;
  advanceTimeout: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['script']) {
      this.reset();
      if (!this.script || this.script.length === 0) {
        this.complete.emit();
      } else {
        this.typeNext();
      }
    }
  }

  get currentLine(): NarrativeLine {
    return this.script?.[this.index] || { speaker: 'SYSTEM', text: '...', image: '' };
  }

  handleNext(): void {
    if (this.charIndex < this.currentLine.text.length) {
      this.displayText = this.currentLine.text;
      this.charIndex = this.currentLine.text.length;
      return;
    }

    if (this.index < this.script.length - 1) {
      this.index += 1;
      this.displayText = '';
      this.charIndex = 0;
      this.typeNext();
    } else {
      this.complete.emit();
    }
  }

  skip(): void {
    this.clearTimers();
    this.complete.emit();
  }

  private typeNext(): void {
    this.clearTimers();
    if (this.charIndex < this.currentLine.text.length) {
      this.typingTimeout = window.setTimeout(() => {
        this.displayText += this.currentLine.text[this.charIndex];
        this.charIndex += 1;
        this.typeNext();
      }, 24);
      return;
    }

    const wordCount = this.currentLine.text.split(' ').length;
    const readingDelay = Math.max(1500, wordCount * 80);
    this.advanceTimeout = window.setTimeout(() => this.handleNext(), readingDelay);
  }

  private reset(): void {
    this.clearTimers();
    this.index = 0;
    this.displayText = '';
    this.charIndex = 0;
  }

  private clearTimers(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
    if (this.advanceTimeout) {
      clearTimeout(this.advanceTimeout);
      this.advanceTimeout = null;
    }
  }
}
