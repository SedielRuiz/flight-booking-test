import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Flight, Seat } from '@core/interfaces/flight.interface';
import { FlightsService } from '@core/services/api/flights.service';
import { SseService } from '@core/services/sse.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.scss'],
})
export class SeatSelectionComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private flightsService = inject(FlightsService);
  private sseService = inject(SseService);

  flight: Flight | null = null;
  isLoading = true;
  selectedSeat: Seat | null = null;
  private sseSub?: Subscription;

  ngOnInit(): void {
    const flightId = this.route.snapshot.paramMap.get('id');
    if (flightId) {
      this.loadFlightDetails(flightId);
    } else {
      this.router.navigate(['/']);
    }

    this.sseSub = this.sseService.on<{ flightId: string; status: string }>('FLIGHT_STATUS_UPDATED').subscribe(
      (update) => {
        if (this.flight && this.flight.id === update.flightId) {
          this.flight.status = update.status;
        }
      },
    );
  }

  ngOnDestroy(): void {
    this.sseSub?.unsubscribe();
  }

  private loadFlightDetails(flightId: string): void {
    this.flightsService.getFlightById(flightId).subscribe({
      next: (res) => {
        this.flight = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  getRows(): string[] {
    if (!this.flight || !this.flight.seats) return [];

    // Extract unique row numbers by taking the characters before the last letter
    const rowSet = new Set<string>();
    this.flight.seats.forEach((seat) => {
      const row = seat.seatNumber.slice(0, -1);
      rowSet.add(row);
    });

    // Sort rows numerically
    return Array.from(rowSet).sort((a, b) => parseInt(a) - parseInt(b));
  }

  getSeatsForRow(row: string): Seat[] {
    if (!this.flight || !this.flight.seats) return [];
    return this.flight.seats
      .filter((seat) => seat.seatNumber.startsWith(row))
      .sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
  }

  getSeat(row: string, column: string): Seat | undefined {
    if (!this.flight || !this.flight.seats) return undefined;
    return this.flight.seats.find((s) => s.seatNumber === `${row}${column}`);
  }

  selectSeat(seat: Seat): void {
    if (seat.status !== 'AVAILABLE') return;
    this.selectedSeat = seat;
  }

  proceedToCheckout(): void {
    if (!this.selectedSeat) return;
    // We will navigate to checkout or open modal
    console.log(
      'Proceeding to checkout with seat:',
      this.selectedSeat.seatNumber,
    );
  }
}
