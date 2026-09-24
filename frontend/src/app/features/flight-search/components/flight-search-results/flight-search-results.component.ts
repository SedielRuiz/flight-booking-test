import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flight } from '@core/interfaces/flight.interface';
import { PaginationMeta } from '@core/interfaces/api-response.interface';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-flight-search-results',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './flight-search-results.component.html',
})
export class FlightSearchResultsComponent {
  @Input() flights: Flight[] = [];
  @Input() meta: PaginationMeta | null = null;
  @Input() isLoading = false;
  @Input() hasSearched = false;

  @Output() pageChange = new EventEmitter<number>();
  @Output() viewSeats = new EventEmitter<string>();
  @Output() limitChange = new EventEmitter<number>();

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onLimitChange(limit: number): void {
    this.limitChange.emit(limit);
  }

  onViewSeats(flightId: string): void {
    this.viewSeats.emit(flightId);
  }
}
