import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { FlightSearchComponent } from './flight-search.component';
import { FlightsService } from '@core/services/api/flights.service';
import { SseService } from '@core/services/sse.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Flight } from '@core/interfaces/flight.interface';
import { PaginationMeta } from '@core/interfaces/api-response.interface';
import { SearchFlightsParams } from '@core/interfaces/search-flights-params.interface';

describe('FlightSearchComponent', () => {
  let component: FlightSearchComponent;
  let fixture: ComponentFixture<FlightSearchComponent>;
  let flightsServiceSpy: jasmine.SpyObj<FlightsService>;
  let sseServiceSpy: jasmine.SpyObj<SseService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    flightsServiceSpy = jasmine.createSpyObj('FlightsService', ['searchFlights']);
    sseServiceSpy = jasmine.createSpyObj('SseService', ['on']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Mock SSE on() to return empty observables to avoid errors
    sseServiceSpy.on.and.returnValue(of());

    await TestBed.configureTestingModule({
      imports: [FlightSearchComponent],
      providers: [
        provideHttpClient(),
        { provide: FlightsService, useValue: flightsServiceSpy },
        { provide: SseService, useValue: sseServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FlightSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch flights when onSearch is called', fakeAsync(() => {
    const mockFlights: Flight[] = [
      { id: '1', flightNumber: 'AV-100', price: 100, status: 'SCHEDULED' } as any
    ];
    const mockMeta: PaginationMeta = { total: 1, page: 1, limit: 10, totalPages: 1 };
    
    flightsServiceSpy.searchFlights.and.returnValue(of({ data: mockFlights, meta: mockMeta, message: 'Success' }));

    const searchParams: SearchFlightsParams = { 
      page: 1, limit: 10, originId: 'BOG', destinationId: 'MDE', startDate: '2026-01-01', endDate: '2026-12-31' 
    };
    component.onSearch(searchParams);

    expect(component.isLoading).toBeTrue(); // it synchronously sets to true before subscription
    
    tick(); // resolve observables

    expect(flightsServiceSpy.searchFlights).toHaveBeenCalledWith(searchParams);
    expect(component.flights).toEqual(mockFlights);
    expect(component.meta).toEqual(mockMeta);
    expect(component.isLoading).toBeFalse();
    expect(component.hasSearched).toBeTrue();
  }));

  it('should navigate to seats view when onViewSeats is called', () => {
    const flightId = 'test-flight-id';
    component.onViewSeats(flightId);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/flights', flightId, 'seats']);
  });
});
