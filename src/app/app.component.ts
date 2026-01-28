import { Component, inject, type OnInit } from '@angular/core';
import { ViewportService } from './state/viewport.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private readonly viewport = inject(ViewportService);

  ngOnInit(): void {
    this.viewport.enable();
  }
}
