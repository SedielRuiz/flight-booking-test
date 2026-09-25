import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Flight, Seat } from '@core/interfaces/flight.interface';
import { FlightsService } from '@core/services/api/flights.service';
import { SseService } from '@core/services/sse.service';
import { Subscription } from 'rxjs';

import { SeatStatus } from '@domain/index';
import { ModalComponent } from '@shared/components/modal/modal.component';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent],
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.scss'],
})
export class SeatSelectionComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private flightsService = inject(FlightsService);
  private sseService = inject(SseService);

  readonly SeatStatus = SeatStatus;

  flight: Flight | null = null;
  isLoading = true;
  selectedSeat: Seat | null = null;
  private sseSub?: Subscription;
  private sseLockSub?: Subscription;
  private sseBookedSub?: Subscription;
  private sseUnlockedSub?: Subscription;

  ngOnInit(): void {
    const flightId = this.route.snapshot.paramMap.get('id');
    if (flightId) {
      this.loadFlightDetails(flightId);
    } else {
      this.router.navigate(['/']);
    }

    this.sseSub = this.sseService
      .on<{ flightId: string; status: string }>('FLIGHT_STATUS_UPDATED')
      .subscribe((update) => {
        if (this.flight && this.flight.id === update.flightId) {
          this.flight.status = update.status;
        }
      });

    this.sseLockSub = this.sseService
      .on<{
        flightId: string;
        seatId: string;
        userId: string;
        expiresAt: string;
      }>('SEAT_LOCKED')
      .subscribe((update) => {
        if (this.flight && this.flight.id === update.flightId) {
          const seat = this.flight.seats?.find((s) => s.id === update.seatId);
          if (seat) {
            seat.isAvailable = false;
            // Also clear selection if this user had it selected and someone else locked it
            if (
              this.selectedSeat?.id === update.seatId &&
              update.userId !== 'test-user'
            ) {
              this.selectedSeat = null;
            }
          }
        }
      });

    // SEAT_BOOKED: payment confirmed — mark seat permanently BOOKED for all connected users
    this.sseBookedSub = this.sseService
      .on<{
        flightId: string;
        seatId: string;
        seatNumber: string;
        bookingCode: string;
      }>('SEAT_BOOKED')
      .subscribe((update) => {
        if (this.flight && this.flight.id === update.flightId) {
          const seat = this.flight.seats?.find((s) => s.id === update.seatId);
          if (seat) {
            seat.status = SeatStatus.RESERVED;
            seat.isAvailable = false;
            // Clear selection and warn user if they had this exact seat selected
            if (this.selectedSeat?.id === update.seatId) {
              this.selectedSeat = null;
              this.showErrorModal = true;
            }
          }
        }
      });

    // SEAT_UNLOCKED: checkout abandoned or timer expired — mark seat as AVAILABLE again
    this.sseUnlockedSub = this.sseService
      .on<{ flightId: string; seatId: string }>('SEAT_UNLOCKED')
      .subscribe((update) => {
        if (this.flight && this.flight.id === update.flightId) {
          const seat = this.flight.seats?.find((s) => s.id === update.seatId);
          if (seat && seat.status !== SeatStatus.RESERVED) {
            seat.status = SeatStatus.AVAILABLE;
            seat.isAvailable = true;
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.sseSub?.unsubscribe();
    this.sseLockSub?.unsubscribe();
    this.sseBookedSub?.unsubscribe();
    this.sseUnlockedSub?.unsubscribe();
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

    const rowSet = new Set<string>();
    this.flight.seats.forEach((seat) => {
      const row = seat.seatNumber.slice(0, -1);
      rowSet.add(row);
    });

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
    const isUnavailable =
      seat.status !== SeatStatus.AVAILABLE || seat.isAvailable === false;
    if (isUnavailable) return;
    this.selectedSeat = seat;
  }

  showErrorModal = false;

  closeErrorModal(): void {
    this.showErrorModal = false;
  }

  proceedToCheckout(): void {
    if (!this.selectedSeat || !this.flight) return;

    // Lock the seat before navigating to checkout
    this.flightsService
      .lockSeat(this.flight.id, this.selectedSeat.id)
      .subscribe({
        next: () => {
          this.router.navigate(['/checkout'], {
            queryParams: {
              flightId: this.flight?.id,
              seatId: this.selectedSeat?.id,
              seatNumber: this.selectedSeat?.seatNumber,
              flightNumber: this.flight?.flightNumber,
            },
          });
        },
        error: () => {
          this.showErrorModal = true;
          this.selectedSeat = null;
          if (this.flight) this.loadFlightDetails(this.flight.id);
        },
      });
  }
}
