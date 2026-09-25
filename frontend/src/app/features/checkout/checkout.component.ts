import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_ROUTES } from '@core/constants/routes.constant';
import { FlightsService } from '@core/services/api/flights.service';
import {
  BookingResult,
  PaymentsService,
} from '@core/services/api/payments.service';
import { CryptoService } from '@core/services/crypto.service';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { firstValueFrom, interval, Subscription } from 'rxjs';

const CHECKOUT_DURATION_SECONDS = 10 * 60; // 10 minutes

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  paymentForm!: FormGroup;
  flightId?: string;
  flightNumber?: string;
  seatId?: string;
  seatNumber?: string;
  isProcessing = false;
  isPaymentSuccessful = false;

  // Timer
  timeLeft = CHECKOUT_DURATION_SECONDS;
  timerDisplay = '10:00';
  timerExpired = false;
  private timerSub?: Subscription;

  // Modals — only error and expired remain; success navigates to a dedicated page
  showErrorModal = false;
  showExpiredModal = false;

  // Card display helpers
  maskedCardNumber = '•••• •••• •••• ••••';
  cardholderName = 'NOMBRE APELLIDO';
  cardExpiry = 'MM/YY';

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cryptoService = inject(CryptoService);
  private paymentsService = inject(PaymentsService);
  private flightsService = inject(FlightsService);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.flightId = params['flightId'];
      this.flightNumber = params['flightNumber'];
      this.seatId = params['seatId'];
      this.seatNumber = params['seatNumber'];

      if (!this.flightId || !this.seatId) {
        this.router.navigate(['/']);
        return;
      }
    });

    this.paymentForm = this.fb.group({
      cardName: ['', [Validators.required, Validators.minLength(3)]],
      cardNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{16}$')],
      ],
      expiryDate: [
        '',
        [
          Validators.required,
          Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$'),
        ],
      ],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
    });

    // Live card preview
    this.paymentForm.get('cardName')?.valueChanges.subscribe((v) => {
      this.cardholderName = v ? v.toUpperCase() : 'NOMBRE APELLIDO';
    });
    this.paymentForm.get('cardNumber')?.valueChanges.subscribe((v) => {
      if (v) {
        const chunks = v.match(/.{1,4}/g) || [];
        this.maskedCardNumber = chunks
          .join(' ')
          .padEnd(19, '•')
          .substring(0, 19);
      } else {
        this.maskedCardNumber = '•••• •••• •••• ••••';
      }
    });
    this.paymentForm.get('expiryDate')?.valueChanges.subscribe((v) => {
      this.cardExpiry = v || 'MM/YY';
    });

    this.startTimer();
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
    // If the user abandons checkout or the timer expires before a successful payment,
    // manually unlock the seat so others can book it immediately.
    if (!this.isPaymentSuccessful && this.flightId && this.seatId) {
      this.flightsService.unlockSeat(this.flightId, this.seatId).subscribe({
        error: (err) =>
          console.error('Failed to unlock seat on checkout exit', err),
      });
    }
  }

  private startTimer(): void {
    this.timerSub = interval(1000).subscribe(() => {
      this.timeLeft--;
      const mins = Math.floor(this.timeLeft / 60);
      const secs = this.timeLeft % 60;
      this.timerDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      if (this.timeLeft <= 0) {
        this.timerSub?.unsubscribe();
        this.timerExpired = true;
        this.showExpiredModal = true;
      }
    });
  }

  get timerUrgent(): boolean {
    return this.timeLeft <= 60;
  }

  get timerWarning(): boolean {
    return this.timeLeft <= 180 && this.timeLeft > 60;
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').substring(0, 16);
    this.paymentForm
      .get('cardNumber')
      ?.setValue(input.value, { emitEvent: true });
  }

  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    input.value = value;
    this.paymentForm.get('expiryDate')?.setValue(value, { emitEvent: true });
  }

  closeErrorModal() {
    this.showErrorModal = false;
  }

  closeExpiredModal() {
    this.showExpiredModal = false;
    this.router.navigate([APP_ROUTES.FLIGHTS]);
  }

  async processPayment() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    if (this.timerExpired) {
      this.showExpiredModal = true;
      return;
    }

    this.isProcessing = true;

    try {
      // 1. Fetch public key from backend (exposed via GET /api/crypto/public-key)
      const publicKey = await this.cryptoService.getPublicKey();

      // 2. Build payment payload WITHOUT flight/seat
      const payload = JSON.stringify({
        ...this.paymentForm.value,
      });

      // 3. Encrypt payload using RSA-OAEP
      const encryptedPayload = await this.cryptoService.encryptRSA(
        publicKey,
        payload,
      );

      // 4. Send encrypted payload + context to backend;
      const response = await firstValueFrom(
        this.paymentsService.processPayment(
          encryptedPayload,
          this.flightId!,
          this.seatId!,
        ),
      );

      const bookingResult: BookingResult = response.data;
      this.isPaymentSuccessful = true;
      this.timerSub?.unsubscribe();

      // Navigate to the dedicated confirmation page — pass data via router state
      // to avoid exposing booking details in the URL
      this.router.navigate([APP_ROUTES.BOOKING_CONFIRMATION], {
        state: { bookingResult },
      });
    } catch (error) {
      console.error('Payment processing failed', error);
      this.showErrorModal = true;
    } finally {
      this.isProcessing = false;
    }
  }
}
