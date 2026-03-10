import { Route } from '@angular/router';
import { dashboardCoraDataResolver } from './pages/dashboard/dashboad-cora.resolver';
import { createCoraFormDataResolver } from './pages/create-cora/create-cora.resolver';
import { listCoraResolver } from './pages/list-cora/list-cora.resolver';

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
    {
      path: 'list',
      resolve: {
        listData: listCoraResolver,
      },
      loadComponent: () =>
        import('./pages/list-cora/list-cora.component').then((m) => m.ListCoraComponent),
    },
  ],
};
