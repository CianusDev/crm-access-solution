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
    path: 'dashboard-agence',
    loadComponent: () =>
      import('./pages/dashboard-agence/dashboard-agence-credit.component').then(
        (m) => m.DashboardAgenceCreditComponent,
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
    path: 'analyse/:ref',
    loadComponent: () =>
      import('./pages/analyse/analyse-credit.component').then(
        (m) => m.AnalyseCreditComponent,
      ),
  },
  {
    path: 'resume/:ref',
    loadComponent: () =>
      import('./pages/resume/resume-credit.component').then(
        (m) => m.ResumeCreditComponent,
      ),
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/list/list-credit.component').then(
        (m) => m.ListCreditComponent,
      ),
  },
  {
    path: 'detail-agence/:code',
    loadComponent: () =>
      import('./pages/detail-agence/detail-agence-credit.component').then(
        (m) => m.DetailAgenceCreditComponent,
      ),
  },
  {
    path: ':ref',
    loadComponent: () =>
      import('./pages/fiche/fiche-credit.component').then(
        (m) => m.FicheCreditComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
