import { dashboardAscResolver, agencesAscResolver } from './pages/dashboard/dashboard-asc.resolver';
import { dashboardAgenceAscResolver } from './pages/dashboard-agence/dashboard-agence-asc.resolver';
import { banquesAscResolver, naturesAscResolver } from './pages/create/create-asc.resolver';
import { pendingAscResolver } from './pages/pending/pending-asc.resolver';
import { detailAscResolver } from './pages/detail/detail-asc.resolver';
import { listDemandesAscResolver, listAgencesAscResolver } from './pages/list/list-asc.resolver';
import { tireursAscResolver } from './pages/tireurs/tireurs-asc.resolver';
import { chequesAttenteAscResolver } from './pages/cheques-attente/cheques-attente-asc.resolver';
import { Route } from '@angular/router';
import { roleGuard } from '@/core/guards/role.guard';
import { UserRole } from '@/core/models/user.model';

const {
  Admin, DG, DGA,
  DirectriceExploitation: D_EXPL,
  ResponsableExploitation: RESPO_EXPL,
  ResponsableFrontOffice: RESPO_FO,
  AdministrationAudit: ADMIN_AUDIT,
  assistanteClientelePME: ASSC_PME,
  agentAccueil: AGENT_ACC,
  ResponsableClientelePME: RESPO_CLT_PME,
  responsableClient: RC,
  ChefAgence: CA,
  ChefAgenceAdjoint: CAA,
  conseilClientele: CC,
} = UserRole;

const ASC_SIEGE  = [Admin, ADMIN_AUDIT, DG, DGA, D_EXPL, ASSC_PME, RESPO_FO, AGENT_ACC, RESPO_EXPL, RESPO_CLT_PME] as const;
const ASC_AGENCE = [RC, CA, CAA, CC] as const;
const ASC_ALL    = [...ASC_SIEGE, ...ASC_AGENCE] as const;
const ASC_CREATE = [Admin, RC, CC] as const;

export const ascRoutes: Route = {
  path: 'asc',
  children: [
    {
      path: 'dashboard',
      canActivate: [roleGuard([...ASC_SIEGE])],
      resolve: { dashboard: dashboardAscResolver, agences: agencesAscResolver },
      loadComponent: () =>
        import('./pages/dashboard/dashboard-asc.component').then((m) => m.DashboardAscComponent),
    },
    {
      path: 'dashboard/agence',
      canActivate: [roleGuard([...ASC_AGENCE])],
      resolve: { dashboard: dashboardAgenceAscResolver },
      loadComponent: () =>
        import('./pages/dashboard-agence/dashboard-agence-asc.component').then(
          (m) => m.DashboardAgenceAscComponent,
        ),
    },
    {
      path: 'client-search',
      canActivate: [roleGuard([...ASC_CREATE])],
      loadComponent: () =>
        import('./pages/client-search/client-search.component').then((m) => m.ClientSearchComponent),
    },
    {
      path: 'create',
      canActivate: [roleGuard([...ASC_CREATE])],
      resolve: { banques: banquesAscResolver, natures: naturesAscResolver },
      loadComponent: () =>
        import('./pages/create/create.component').then((m) => m.CreateAscComponent),
    },
    {
      path: 'pending',
      canActivate: [roleGuard([...ASC_ALL])],
      resolve: { demandes: pendingAscResolver },
      loadComponent: () =>
        import('./pages/pending/pending.component').then((m) => m.PendingComponent),
    },
    {
      path: 'detail/:id',
      canActivate: [roleGuard([...ASC_ALL])],
      resolve: { demande: detailAscResolver },
      loadComponent: () =>
        import('./pages/detail/detail.component').then((m) => m.DetailComponent),
    },
    {
      path: 'list',
      canActivate: [roleGuard([...ASC_ALL])],
      resolve: { demandes: listDemandesAscResolver, agences: listAgencesAscResolver },
      loadComponent: () =>
        import('./pages/list/list.component').then((m) => m.ListComponent),
    },
    {
      path: 'tireurs',
      canActivate: [roleGuard([...ASC_ALL])],
      resolve: { tireurs: tireursAscResolver },
      loadComponent: () =>
        import('./pages/tireurs/tireurs.component').then((m) => m.TireursComponent),
    },
    {
      path: 'cheque/:numcheque',
      canActivate: [roleGuard([...ASC_ALL])],
      loadComponent: () =>
        import('./pages/cheque-detail/cheque-detail.component').then((m) => m.ChequeDetailComponent),
    },
    {
      path: 'cheques-attente',
      canActivate: [roleGuard([...ASC_ALL])],
      resolve: { cheques: chequesAttenteAscResolver },
      loadComponent: () =>
        import('./pages/cheques-attente/cheques-attente.component').then(
          (m) => m.ChequesAttenteComponent,
        ),
    },
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'dashboard',
    },
  ],
};
