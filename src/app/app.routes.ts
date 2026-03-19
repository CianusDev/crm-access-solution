import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.route';
import { NotFound } from './shared/components/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { MainLayout } from './shared/layouts/main-layout/main-layout.component';
import { currentUserResolver } from './shared/layouts/main-layout/main-layout.resolver';
import { powerBiRoutes } from './features/power-bi/power-bi.route';
import { coraRoutes } from './features/cora/cora.route';
import { coraMapRoute } from './features/cora/pages/public-map/public-map.route';
import { ascRoutes } from './features/asc/asc.route';
import { creditRoutes } from './features/credit/credit.route';
import { parametresRoutes } from './features/parametres/parametres.route';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth',
  },
  coraMapRoute,
  authRoutes,
  {
    path: 'app',
    children: [
      {
        path: '',
        canActivateChild: [authGuard],
        resolve: { currentUser: currentUserResolver },
        component: MainLayout,
        children: [
          {
            path: 'home',
            loadComponent: () =>
              import('./features/home/home.component').then((m) => m.Home),
          },
          powerBiRoutes,
          coraRoutes,
          ascRoutes,
          creditRoutes,
          parametresRoutes,
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'home',
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
