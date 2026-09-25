import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ENDPOINTS } from '@core/constants/api-endpoints.constant';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { Flight } from '@core/interfaces/flight.interface';
import { SearchFlightsParams } from '@core/interfaces/search-flights-params.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FlightsService {
  private http = inject(HttpClient);

  searchFlights(
    paramsData: SearchFlightsParams,
  ): Observable<ApiResponse<Flight[]>> {
    const {
      originId,
      destinationId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = paramsData;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (originId) params = params.set('originId', originId);
    if (destinationId) params = params.set('destinationId', destinationId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<Flight[]>>(API_ENDPOINTS.FLIGHTS.SEARCH, {
      params,
    });
  }

  getFlightById(id: string): Observable<ApiResponse<Flight>> {
    return this.http.get<ApiResponse<Flight>>(API_ENDPOINTS.FLIGHTS.BY_ID(id));
  }

  lockSeat(
    flightId: string,
    seatId: string,
    userId: string = 'test-user',
  ): Observable<any> {
    return this.http.patch(API_ENDPOINTS.FLIGHTS.LOCK_SEAT(flightId, seatId), {
      userId,
    });
  }

  unlockSeat(flightId: string, seatId: string): Observable<any> {
    return this.http.patch(API_ENDPOINTS.FLIGHTS.UNLOCK_SEAT(flightId, seatId), {});
  }
}
