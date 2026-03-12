import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.route';
import { NotFound } from './shared/components/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { MainLayout } from './shared/layouts/main-layout/main-layout.component';
import { currentUserResolver } from './shared/layouts/main-layout/main-layout.resolver';
import { RouteLoaderComponent } from './shared/layouts/route-loader/route-loader.component';
import { coraRoutes } from './features/cora/cora.route';
import { CoraService } from './features/cora/services/cora/cora.service';
import { ASC_ROUTES } from './features/asc/asc.route';
import { CREDIT_ROUTES } from './features/credit/credit.route';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth',
  },
  {
    path: 'cora-map',
    resolve: {
      coras: () => inject(CoraService).getPublicCoraList(),
      communes: () => inject(CoraService).getCommunes(),
      gestionnaires: () => inject(CoraService).getGestionnaires(),
    },
    loadComponent: () =>
      import('./features/cora/pages/public-map/public-map.component').then(
        (m) => m.PublicMapComponent,
      ),
  },
  authRoutes,
  {
    path: 'app',
    // component: RouteLoaderComponent,
    children: [
      {
        path: '',
        canActivateChild: [authGuard],
        resolve: {
          currentUser: currentUserResolver,
        },
        component: MainLayout,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'home',
          },
          {
            path: 'home',
            loadComponent: () => import('./features/home/home.component').then((m) => m.Home),
          },
          {
            path: 'power-bi',
            children: [
              {
                path: '',
                pathMatch: 'full',
                redirectTo: 'dashboard',
              },
              {
                path: 'dashboard',
                loadComponent: () =>
                  import('./features/power-bi/pages/dashboard/dashboard-power-bi.component').then(
                    (m) => m.DashboardPowerBi,
                  ),
              },
            ],
          },
          coraRoutes,
          {
            path: 'asc',
            children: ASC_ROUTES,
          },
          {
            path: 'credit',
            children: CREDIT_ROUTES,
          },
        ],
      },
    ],
  },
  {
    path: '**',
    component: NotFound,
  },
];
