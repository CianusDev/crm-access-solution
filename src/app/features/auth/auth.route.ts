import { Route } from '@angular/router';
import { AuthLayout } from '../../shared/layouts/auth-layout/auth-layout';
import { guestGuard } from '@/core/guards/guest.guard';

export const authRoutes: Route = {
  path: 'auth',
  component: AuthLayout,
  canActivate: [guestGuard],
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
