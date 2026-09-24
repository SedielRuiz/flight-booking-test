import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SseService } from '@core/services/sse.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  constructor(private sseService: SseService) {
    this.sseService.connect(`${environment.apiUrl}/events`);
  }
}
