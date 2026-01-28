import { Component, EventEmitter, type OnDestroy, type OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  standalone: false,
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  @Output() complete = new EventEmitter<void>();

  text = '';
  phase = 0;
  private intervalId: number | null = null;
  private timeoutId: number | null = null;

  ngOnInit(): void {
    const bootSequence = [
      'SYSTEM BOOT...',
      'LOADING NAVIGATION GRID...',
      'SYNCING KURENAI LINKS...',
      'ACCESS GRANTED.',
    ];
    let currentLine = 0;

    this.intervalId = window.setInterval(() => {
      if (currentLine < bootSequence.length) {
        this.text += `${bootSequence[currentLine]}\n`;
        currentLine += 1;
      } else {
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
        this.timeoutId = window.setTimeout(() => {
          this.phase = 1;
          this.timeoutId = window.setTimeout(() => this.complete.emit(), 2000);
        }, 500);
      }
    }, 380);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
