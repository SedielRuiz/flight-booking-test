import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'flights', pathMatch: 'full' },
      { 
        path: 'flights', 
        loadComponent: () => import('@features/flight-search/flight-search.component').then(m => m.FlightSearchComponent)
      },
      { 
        path: 'reservations', 
        loadComponent: () => import('@features/reservations/reservations.component').then(m => m.ReservationsComponent)
      }
    ]
  }
];
