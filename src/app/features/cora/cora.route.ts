import { Route } from '@angular/router';
import { dashboardCoraDataResolver } from './pages/dashboard/dashboad-cora.resolver';
import { createCoraFormDataResolver } from './pages/create-cora/create-cora.resolver';

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
    {
      path: 'create',
      resolve: {
        formData: createCoraFormDataResolver,
      },
      loadComponent: () =>
        import('./pages/create-cora/create-cora.component').then((m) => m.CreateCoraComponent),
    },
  ],
};
