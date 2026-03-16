import { Routes } from '@angular/router';

export const CREDIT_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-credit.component').then(
        (m) => m.DashboardCreditComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/create/create-credit.component').then(
        (m) => m.CreateCreditComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
