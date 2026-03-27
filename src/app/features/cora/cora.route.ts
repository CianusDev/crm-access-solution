import { dashboardCoraDataResolver } from './pages/dashboard/dashboad-cora.resolver';
import { createCoraFormDataResolver } from './pages/create-cora/create-cora.resolver';
import { listCoraResolver } from './pages/list-cora/list-cora.resolver';
import { detailCoraResolver } from './pages/detail-cora/detail-cora.resolver';
import { pendingCoraResolver } from './pages/pending-cora/pending-cora.resolver';
import { detailAgentResolver } from './pages/detail-agent/detail-agent.resolver';
import { createAgentFormDataResolver } from './pages/create-agent/create-agent.resolver';
import { Route } from '@angular/router';
import { roleGuard } from '@/core/guards/role.guard';
import { UserRole } from '@/core/models/user.model';

const {
  Admin, DG, DGA,
  DirectriceExploitation: D_EXPL,
  ResponsableExploitation: RESPO_EXPL,
  ChargeCora: CHARGE_CORA,
  ResponsableFrontOffice: RESPO_FO,
  AdministrationAudit: ADMIN_AUDIT,
  GestionCora: GESTION_CORA,
  AgentBO: AGENT_BO,
} = UserRole;

const CORA_VIEWERS = [Admin, DG, DGA, D_EXPL, RESPO_EXPL, CHARGE_CORA, RESPO_FO, ADMIN_AUDIT, GESTION_CORA, AGENT_BO] as const;

export const coraRoutes: Route = {
  path: 'cora',
  children: [
    {
      path: 'dashboard',
      canActivate: [roleGuard([...CORA_VIEWERS])],
      resolve: { dashboardCoraData: dashboardCoraDataResolver },
      loadComponent: () =>
        import('./pages/dashboard/dashboard-cora.component').then((m) => m.DashboardCoraComponent),
    },
    {
      path: 'create',
      canActivate: [roleGuard([Admin, GESTION_CORA])],
      resolve: { formData: createCoraFormDataResolver },
      loadComponent: () =>
        import('./pages/create-cora/create-cora.component').then((m) => m.CreateCoraComponent),
    },
    {
      path: 'list',
      canActivate: [roleGuard([...CORA_VIEWERS])],
      resolve: { listData: listCoraResolver },
      loadComponent: () =>
        import('./pages/list-cora/list-cora.component').then((m) => m.ListCoraComponent),
    },
    {
      path: 'pending',
      canActivate: [roleGuard([...CORA_VIEWERS])],
      resolve: { agents: pendingCoraResolver },
      loadComponent: () =>
        import('./pages/pending-cora/pending-cora.component').then((m) => m.PendingCoraComponent),
    },
    {
      path: 'agent/create',
      canActivate: [roleGuard([Admin, GESTION_CORA])],
      resolve: { formData: createAgentFormDataResolver },
      loadComponent: () =>
        import('./pages/create-agent/create-agent.component').then((m) => m.CreateAgentComponent),
    },
    {
      path: 'agent/:id',
      canActivate: [roleGuard([...CORA_VIEWERS])],
      resolve: { agent: detailAgentResolver },
      loadComponent: () =>
        import('./pages/detail-agent/detail-agent.component').then((m) => m.DetailAgentComponent),
    },
    {
      path: 'my-coras',
      canActivate: [roleGuard([GESTION_CORA])],
      loadComponent: () =>
        import('./pages/mes-coras/mes-coras.component').then((m) => m.MesCoras),
    },
    {
      path: ':id',
      canActivate: [roleGuard([...CORA_VIEWERS])],
      resolve: { cora: detailCoraResolver },
      loadComponent: () =>
        import('./pages/detail-cora/detail-cora.component').then((m) => m.DetailCoraComponent),
    },
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'dashboard',
    },
  ],
};
