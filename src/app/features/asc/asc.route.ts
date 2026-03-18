import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AscService } from './services/asc/asc.service';

export const ASC_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-asc.component').then((m) => m.DashboardAscComponent),
  },
  {
    path: 'dashboard/agence',
    loadComponent: () =>
      import('./pages/dashboard-agence/dashboard-agence-asc.component').then(
        (m) => m.DashboardAgenceAscComponent,
      ),
  },
  {
    path: 'client-search',
    loadComponent: () =>
      import('./pages/client-search/client-search.component').then((m) => m.ClientSearchComponent),
  },
  {
    path: 'create',
    resolve: {
      banques: () => inject(AscService).getBanques(),
      natures: () => inject(AscService).getNaturesPrestations(),
    },
    loadComponent: () =>
      import('./pages/create/create.component').then((m) => m.CreateAscComponent),
  },
  {
    path: 'pending',
    resolve: { demandes: () => inject(AscService).getDemandesEnAttente() },
    loadComponent: () =>
      import('./pages/pending/pending.component').then((m) => m.PendingComponent),
  },
  {
    path: 'detail/:id',
    resolve: {
      demande: (route: import('@angular/router').ActivatedRouteSnapshot) =>
        inject(AscService).getDemandeById(+route.paramMap.get('id')!),
    },
    loadComponent: () => import('./pages/detail/detail.component').then((m) => m.DetailComponent),
  },
  {
    path: 'list',
    resolve: {
      demandes: () => inject(AscService).getListeDemandes(),
      agences: () => inject(AscService).getAgences(),
    },
    loadComponent: () => import('./pages/list/list.component').then((m) => m.ListComponent),
  },
  {
    path: 'tireurs',
    resolve: { tireurs: () => inject(AscService).getTireurs() },
    loadComponent: () => import('./pages/tireurs/tireurs.component').then((m) => m.TireursComponent),
  },
  {
    path: 'cheques-attente',
    resolve: { cheques: () => inject(AscService).getChequesAttente() },
    loadComponent: () =>
      import('./pages/cheques-attente/cheques-attente.component').then(
        (m) => m.ChequesAttenteComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
