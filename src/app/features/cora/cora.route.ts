import { Route } from '@angular/router';
import { dashboardCoraDataResolver } from './pages/dashboard/dashboad-cora.resolver';
import { createCoraFormDataResolver } from './pages/create-cora/create-cora.resolver';
import { listCoraResolver } from './pages/list-cora/list-cora.resolver';
import { detailCoraResolver } from './pages/detail-cora/detail-cora.resolver';
import { pendingCoraResolver } from './pages/pending-cora/pending-cora.resolver';
import { detailAgentResolver } from './pages/detail-agent/detail-agent.resolver';
import { createAgentFormDataResolver } from './pages/create-agent/create-agent.resolver';

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
    {
      path: 'pending',
      resolve: {
        agents: pendingCoraResolver,
      },
      loadComponent: () =>
        import('./pages/pending-cora/pending-cora.component').then((m) => m.PendingCoraComponent),
    },
    {
      path: 'agent/create',
      resolve: {
        formData: createAgentFormDataResolver,
      },
      loadComponent: () =>
        import('./pages/create-agent/create-agent.component').then((m) => m.CreateAgentComponent),
    },
    {
      path: 'agent/:id',
      resolve: { agent: detailAgentResolver },
      loadComponent: () =>
        import('./pages/detail-agent/detail-agent.component').then((m) => m.DetailAgentComponent),
    },
    {
      path: 'my-coras',
      loadComponent: () =>
        import('./pages/mes-coras/mes-coras.component').then((m) => m.MesCoras),
    },
    {
      path: ':id',
      resolve: {
        cora: detailCoraResolver,
      },
      loadComponent: () =>
        import('./pages/detail-cora/detail-cora.component').then((m) => m.DetailCoraComponent),
    },
  ],
};
