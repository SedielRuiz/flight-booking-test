import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flight } from '@core/interfaces/flight.interface';
import { PaginationMeta } from '@core/interfaces/api-response.interface';
import { FlightsService } from '@core/services/api/flights.service';
import { SearchFlightsParams } from '@core/interfaces/search-flights-params.interface';
import { FlightSearchFilterComponent } from './components/flight-search-filter/flight-search-filter.component';
import { FlightSearchResultsComponent } from './components/flight-search-results/flight-search-results.component';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [CommonModule, FlightSearchFilterComponent, FlightSearchResultsComponent],
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.scss'],
})
export class FlightSearchComponent {
  private flightsService = inject(FlightsService);

  flights: Flight[] = [];
  meta: PaginationMeta | null = null;
  isLoading = false;
  hasSearched = false;
  lastSearchParams: SearchFlightsParams | null = null;

  onSearch(params: SearchFlightsParams): void {
    this.lastSearchParams = params;
    this.fetchFlights(params);
  }

  goToPage(page: number): void {
    if (this.meta && page >= 1 && page <= this.meta.totalPages && this.lastSearchParams) {
      this.fetchFlights({ ...this.lastSearchParams, page });
    }
  }

  onLimitChange(limit: number): void {
    if (this.lastSearchParams) {
      this.lastSearchParams.limit = limit;
      this.lastSearchParams.page = 1;
      this.fetchFlights(this.lastSearchParams);
    }
  }

  private fetchFlights(params: SearchFlightsParams): void {
    this.isLoading = true;
    this.hasSearched = true;

    this.flightsService.searchFlights(params).subscribe({
      next: (res) => {
        this.flights = res.data;
        this.meta = res.meta ?? null;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.flights = [];
        this.meta = null;
      },
    });
  }

  onViewSeats(flightId: string): void {
    // Navigate to seat selection page
    console.log('Navigating to seat selection for flight:', flightId);
  }
}
