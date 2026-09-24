import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface AppEvent {
  type: string;
  payload: any;
}

@Injectable({
  providedIn: 'root',
})
export class SseService {
  private eventsSubject = new Subject<AppEvent>();
  public events$ = this.eventsSubject.asObservable();
  private eventSource: EventSource | null = null;

  constructor(private zone: NgZone) {}

  connect(url: string = '/api/events'): void {
    if (this.eventSource) return;

    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      this.zone.run(() => {
        try {
          let data = JSON.parse(event.data);
          if (data && data.data && data.data.type) {
            data = data.data;
          }
          if (data && data.type) {
            this.eventsSubject.next(data);
          }
        } catch (e) {
          console.warn('SSE Parse Error:', e);
        }
      });
    };

    this.eventSource.onerror = (error) => {
      this.zone.run(() => {
        console.error('SSE Error:', error);
      });
    };
  }

  on<T = any>(eventType: string): Observable<T> {
    return this.events$.pipe(
      filter((e) => e.type === eventType),
      map((e) => e.payload as T),
    );
  }
}
