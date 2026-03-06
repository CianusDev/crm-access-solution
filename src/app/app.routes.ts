import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.route';
import { NotFound } from './shared/components/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { MainLayout } from './shared/layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth',
  },
  authRoutes,
  {
    path: 'app',
    canActivateChild: [authGuard],
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
    ],
  },
  {
    path: '**',
    component: NotFound,
  },
];
