import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { SseService } from '@core/services/sse.service';
import { environment } from '@environments/environment';

describe('AppComponent', () => {
  let sseServiceSpy: jasmine.SpyObj<SseService>;

  beforeEach(async () => {
    sseServiceSpy = jasmine.createSpyObj('SseService', ['connect']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: SseService, useValue: sseServiceSpy }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call SseService.connect with correct URL on initialization', () => {
    TestBed.createComponent(AppComponent);
    expect(sseServiceSpy.connect).toHaveBeenCalledWith(`${environment.apiUrl}/events`);
  });
});
