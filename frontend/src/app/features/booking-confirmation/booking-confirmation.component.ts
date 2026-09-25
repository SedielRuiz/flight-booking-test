import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { APP_ROUTES } from '@core/constants/routes.constant';
import { PaymentStatus, ReservationStatus } from '@core/enums/domain.enums';
import { BookingResult } from '@core/services/api/payments.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.scss',
})
export class BookingConfirmationComponent implements OnInit {
  private router = inject(Router);

  booking?: BookingResult;
  confirmedAt = new Date();

  readonly ReservationStatus = ReservationStatus;
  readonly PaymentStatus = PaymentStatus;
  readonly APP_ROUTES = APP_ROUTES;

  ngOnInit(): void {
    const state = history.state as { bookingResult: BookingResult } | undefined;
    this.booking = state?.bookingResult;

    if (!this.booking) {
      this.router.navigate([APP_ROUTES.HOME]);
    }
  }

  goHome(): void {
    this.router.navigate([APP_ROUTES.FLIGHTS]);
  }

  printPage(): void {
    window.print();
  }
}
