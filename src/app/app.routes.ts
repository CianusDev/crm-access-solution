import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.route';
import { NotFound } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth',
  },
  authRoutes,
  {
    path: 'ui',
    loadComponent: () => import('./features/ui/pages/ui.component').then((m) => m.UiComponent),
  },
  {
    path: '**',
    component: NotFound,
  },
];
