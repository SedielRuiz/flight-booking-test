import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { Flight } from '@core/interfaces/flight.interface';
import { SearchFlightsParams } from '@core/interfaces/search-flights-params.interface';

@Injectable({
  providedIn: 'root',
})
export class FlightsService {
  private http = inject(HttpClient);

  searchFlights(paramsData: SearchFlightsParams): Observable<ApiResponse<Flight[]>> {
    const { originId, destinationId, startDate, endDate, page = 1, limit = 10 } = paramsData;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (originId) params = params.set('originId', originId);
    if (destinationId) params = params.set('destinationId', destinationId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<Flight[]>>('/flights', { params });
  }
}
