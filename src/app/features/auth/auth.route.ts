import { Route } from '@angular/router';
import { AuthLayout } from '../../shared/layouts/auth-layout/auth-layout';
import { LoginPage } from './pages/login/login.component';

export const authRoutes: Route = {
  path: 'auth',
  component: AuthLayout,
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'login',
    },
    {
      path: 'login',
      loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginPage),
    },
  ],
};
