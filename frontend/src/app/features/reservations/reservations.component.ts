import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FlightsService } from '@core/services/api/flights.service';
import { APP_ROUTES } from '@core/constants/routes.constant';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent {
  private flightsService = inject(FlightsService);
  private router = inject(Router);

  reservationCode = '';
  isLoading = false;
  errorMessage = '';

  onSearch(): void {
    if (!this.reservationCode.trim()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.flightsService.getReservationByCode(this.reservationCode.trim()).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.data) {
          this.router.navigate([APP_ROUTES.BOOKING_CONFIRMATION], {
            state: { bookingResult: res.data }
          });
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Reserva no encontrada. Verifique el código ingresado.';
      }
    });
  }
}
