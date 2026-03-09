import { Route } from '@angular/router';
import { dashboardCoraDataResolver } from './pages/dashboard/dashboad-cora.resolver';

export const coraRoutes: Route = {
  path: 'cora',
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'dashboard',
    },
    {
      path: 'dashboard',
      resolve: {
        dashboardCoraData: dashboardCoraDataResolver,
      },
      loadComponent: () =>
        import('./pages/dashboard/dashboard-cora.component').then((m) => m.DashboardCoraComponent),
    },
  ],
};
