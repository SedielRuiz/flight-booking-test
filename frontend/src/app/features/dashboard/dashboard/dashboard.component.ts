import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightsService } from '@core/services/api/flights.service';
import { SseService } from '@core/services/sse.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private flightsService = inject(FlightsService);
  private sseService = inject(SseService);

  metrics: any[] = [];
  isLoading = true;

  private sseLockSub?: Subscription;
  private sseUnlockSub?: Subscription;
  private sseBookedSub?: Subscription;
  private sseSoldOutSub?: Subscription;

  ngOnInit() {
    this.loadMetrics();
    this.setupSse();
  }

  ngOnDestroy() {
    this.sseLockSub?.unsubscribe();
    this.sseUnlockSub?.unsubscribe();
    this.sseBookedSub?.unsubscribe();
    this.sseSoldOutSub?.unsubscribe();
  }

  loadMetrics() {
    this.flightsService.getMetrics().subscribe((res) => {
      this.metrics = res.data;
      this.isLoading = false;
    });
  }

  setupSse() {
    this.sseLockSub = this.sseService.on<{ flightId: string }>('SEAT_LOCKED').subscribe((update) => {
      const flight = this.metrics.find(f => f.id === update.flightId);
      if (flight) {
        flight.metrics.available = Math.max(0, flight.metrics.available - 1);
        flight.metrics.locked++;
      }
    });

    this.sseUnlockSub = this.sseService.on<{ flightId: string }>('SEAT_UNLOCKED').subscribe((update) => {
      const flight = this.metrics.find(f => f.id === update.flightId);
      if (flight) {
        flight.metrics.locked = Math.max(0, flight.metrics.locked - 1);
        flight.metrics.available++;
      }
    });

    this.sseBookedSub = this.sseService.on<{ flightId: string }>('SEAT_BOOKED').subscribe((update) => {
      const flight = this.metrics.find(f => f.id === update.flightId);
      if (flight) {
        flight.metrics.locked = Math.max(0, flight.metrics.locked - 1);
        flight.metrics.reserved++;
      }
    });

    this.sseSoldOutSub = this.sseService.on<{ flightId: string }>('FLIGHT_SOLD_OUT').subscribe((update) => {
      const flight = this.metrics.find(f => f.id === update.flightId);
      if (flight) {
        flight.status = 'SOLD_OUT';
      }
    });
  }
}
