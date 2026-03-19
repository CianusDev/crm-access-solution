import { Route } from '@angular/router';

export const powerBiRoutes: Route = {
  path: 'power-bi',
  children: [
    {
      path: 'dashboard',
      loadComponent: () =>
        import('./pages/dashboard/dashboard-power-bi.component').then((m) => m.DashboardPowerBi),
    },
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'dashboard',
    },
  ],
};
