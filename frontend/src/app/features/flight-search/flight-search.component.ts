import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Flight } from '@core/interfaces/flight.interface';
import { PaginationMeta } from '@core/interfaces/api-response.interface';
import { FlightsService } from '@core/services/api/flights.service';
import { SseService } from '@core/services/sse.service';
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
export class FlightSearchComponent implements OnInit, OnDestroy {
  private flightsService = inject(FlightsService);
  private sseService = inject(SseService);
  private router = inject(Router);
  private sseSub?: Subscription;
  private sseSoldOutSub?: Subscription;

  flights: Flight[] = [];
  meta: PaginationMeta | null = null;
  isLoading = false;
  hasSearched = false;
  lastSearchParams: SearchFlightsParams | null = null;

  ngOnInit() {
    this.sseSub = this.sseService.on<{ flightId: string; status: string }>('FLIGHT_STATUS_UPDATED').subscribe(update => {
      const flight = this.flights.find(f => f.id === update.flightId);
      if (flight) {
        flight.status = update.status;
      }
    });

    this.sseSoldOutSub = this.sseService.on<{ flightId: string }>('FLIGHT_SOLD_OUT').subscribe(update => {
      const flight = this.flights.find(f => f.id === update.flightId);
      if (flight) {
        flight.status = 'SOLD_OUT';
      }
    });
  }

  ngOnDestroy() {
    this.sseSub?.unsubscribe();
    this.sseSoldOutSub?.unsubscribe();
  }

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
    this.router.navigate(['/flights', flightId, 'seats']);
  }
}
