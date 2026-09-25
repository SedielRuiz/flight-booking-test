import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { API_ENDPOINTS } from '@core/constants/api-endpoints.constant';

export interface BookingResult {
  bookingCode: string;
  seatNumber: string;
  flightNumber: string;
  passengerName: string;
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private http = inject(HttpClient);

  processPayment(
    encryptedPayload: string,
    flightId: string,
    seatId: string,
  ): Observable<ApiResponse<BookingResult>> {
    return this.http.post<ApiResponse<BookingResult>>(
      API_ENDPOINTS.PAYMENTS.PROCESS,
      { encryptedPayload, flightId, seatId },
    );
  }
}
