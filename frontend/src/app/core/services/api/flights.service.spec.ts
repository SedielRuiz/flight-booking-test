import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FlightsService } from './flights.service';
import { environment } from '@environments/environment';
import { Flight } from '@core/interfaces/flight.interface';
import { ApiResponse } from '@core/interfaces/api-response.interface';

describe('FlightsService', () => {
  let service: FlightsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlightsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(FlightsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getFlightById and return the flight details', () => {
    const dummyFlightResponse: ApiResponse<Flight> = {
      message: 'Success',
      data: { id: 'test-id', flightNumber: 'AV-100' } as any
    };

    service.getFlightById('test-id').subscribe(res => {
      expect(res.data).toEqual(dummyFlightResponse.data);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/flights/test-id`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyFlightResponse);
  });

  it('should call searchFlights with correct query params', () => {
    service.searchFlights({ page: 2, limit: 10, originId: 'BOG', destinationId: 'MDE', startDate: '2026', endDate: '2027' }).subscribe();

    const req = httpMock.expectOne(request => 
      request.url === `${environment.apiUrl}/flights` &&
      request.params.get('page') === '2' &&
      request.params.get('limit') === '10' &&
      request.params.get('originId') === 'BOG'
    );
    
    expect(req.request.method).toBe('GET');
    req.flush({ data: [] });
  });
});
