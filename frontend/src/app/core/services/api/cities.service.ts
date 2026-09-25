import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { City } from '@core/interfaces/city.interface';
import { ApiResponse } from '@core/interfaces/api-response.interface';
import { API_ENDPOINTS } from '@core/constants/api-endpoints.constant';

@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  private http = inject(HttpClient);

  getCities(name?: string): Observable<ApiResponse<City[]>> {
    let params = new HttpParams();
    if (name) {
      params = params.set('name', name);
    }
    return this.http.get<ApiResponse<City[]>>(API_ENDPOINTS.CITIES.GET_ALL, { params });
  }
}
