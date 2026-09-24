import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout/main-layout.component';
import { FlightSearchComponent } from '@features/flight-search/flight-search.component';
import { ReservationsComponent } from '@features/reservations/reservations.component';
import { SeatSelectionComponent } from './features/seat-selection/seat-selection.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'flights', pathMatch: 'full' },
      { 
        path: 'flights', 
        component: FlightSearchComponent
      },
      { 
        path: 'reservations', 
        component: ReservationsComponent
      },
      {
        path: 'flights/:id/seats',
        component: SeatSelectionComponent
      }
    ]
  }
];
