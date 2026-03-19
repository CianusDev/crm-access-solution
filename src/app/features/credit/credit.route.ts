import { dashboardCreditResolver } from './pages/dashboard/dashboard-credit.resolver';
import { dashboardAgenceCreditResolver } from './pages/dashboard-agence/dashboard-agence-credit.resolver';
import { listCreditResolver } from './pages/list/list-credit.resolver';
import { createCreditResolver } from './pages/create/create-credit.resolver';
import { ficheCreditResolver } from './pages/fiche/fiche-credit.resolver';
import { analyseCreditResolver } from './pages/analyse/analyse-credit.resolver';
import { resumeCreditResolver } from './pages/resume/resume-credit.resolver';
import { employeurListCreditResolver } from './pages/employeur-list/employeur-list-credit.resolver';
import { employeurDetailCreditResolver } from './pages/employeur-detail/employeur-detail-credit.resolver';
import { tirageDetailCreditResolver } from './pages/tirage-detail/tirage-detail-credit.resolver';
import { organigrammeCreditResolver } from './pages/organigramme/organigramme-credit.resolver';
import { detailAgenceCreditResolver } from './pages/detail-agence/detail-agence-credit.resolver';
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
  DirecteurRisque: DR,
  AnalysteRisque: AR,
  GestionnairePortefeuilles: GP,
  ChargeDuComite: CHARGE_COMIT,
  Chargedepartementcredit: CDCR,
  ResponsableJuridique: RESPO_JURIDIQUE,
  ResponsableAssurance: RESPO_ASSUR,
  ResponsableClientelePME: RESPO_CLT_PME,
  ResponsableClienteleTPE: RESPO_CLT_TPE,
  ResponsableProduitAgricole: RESPO_PROD_AGRI,
  ResponsableReseau: RESPO_RS,
  responsableClient: RC,
  ChefAgence: CA,
  ChefAgenceAdjoint: CAA,
  conseilClientele: CC,
  ChefEquipe: CE,
  ChefUnitePolyvalent: CUP,
  AgentCommercialJunior: ACJ,
  ChargeDeveloppementCommercial: CDC,
  ResponsableRegional: RESPO_RGL,
  SuperviseurRisqueZone: SUP_RISQ_ZONE,
  SuperviseurPME: SUP_PME,
} = UserRole;

const CREDIT_SIEGE = [
  Admin, DG, DGA, CDCR, DR, D_EXPL,
  RESPO_CLT_TPE, RESPO_PROD_AGRI, ADMIN_AUDIT, RESPO_CLT_PME,
  RESPO_EXPL, CHARGE_COMIT, RESPO_JURIDIQUE, RESPO_ASSUR,
  RESPO_FO, ASSC_PME, RESPO_RS,
] as const;

const CREDIT_AGENCE = [CA, CAA, CC, GP, CUP, CE, RC, AR, SUP_RISQ_ZONE, RESPO_RGL, SUP_PME, CDC] as const;

const CREDIT_CREATE = [Admin, ACJ, CE, GP, CC, RC] as const;

const CREDIT_ALL = [...new Set([
  Admin, DG, DGA, DR, CDCR, D_EXPL, RESPO_EXPL, RESPO_FO,
  RESPO_CLT_TPE, RESPO_CLT_PME, RESPO_PROD_AGRI,
  SUP_PME, GP, CUP, CE, ASSC_PME, CC, CA, CAA, RC, ACJ, AR,
  SUP_RISQ_ZONE, CHARGE_COMIT, RESPO_RGL, RESPO_JURIDIQUE, RESPO_ASSUR, CDC,
])] as const;

export const creditRoutes: Route = {
  path: 'credit',
  children: [
    {
      path: 'dashboard',
      canActivate: [roleGuard([...CREDIT_SIEGE])],
      resolve: { data: dashboardCreditResolver },
      loadComponent: () =>
        import('./pages/dashboard/dashboard-credit.component').then((m) => m.DashboardCreditComponent),
    },
    {
      path: 'dashboard-agence',
      canActivate: [roleGuard([...CREDIT_AGENCE])],
      resolve: { data: dashboardAgenceCreditResolver },
      loadComponent: () =>
        import('./pages/dashboard-agence/dashboard-agence-credit.component').then((m) => m.DashboardAgenceCreditComponent),
    },
    {
      path: 'create',
      canActivate: [roleGuard([...CREDIT_CREATE])],
      resolve: { data: createCreditResolver },
      loadComponent: () =>
        import('./pages/create/create-credit.component').then((m) => m.CreateCreditComponent),
    },
    {
      path: 'analyse/:ref',
      canActivate: [roleGuard([...CREDIT_ALL])],
      resolve: { data: analyseCreditResolver },
      loadComponent: () =>
        import('./pages/analyse/analyse-credit.component').then((m) => m.AnalyseCreditComponent),
    },
    {
      path: 'resume/:ref',
      canActivate: [roleGuard([...CREDIT_ALL])],
      resolve: { data: resumeCreditResolver },
      loadComponent: () =>
        import('./pages/resume/resume-credit.component').then((m) => m.ResumeCreditComponent),
    },
    {
      path: 'list',
      canActivate: [roleGuard([...CREDIT_ALL])],
      resolve: { demandes: listCreditResolver },
      loadComponent: () =>
        import('./pages/list/list-credit.component').then((m) => m.ListCreditComponent),
    },
    {
      path: 'detail-agence/:code',
      canActivate: [roleGuard([...CREDIT_ALL])],
      resolve: { data: detailAgenceCreditResolver },
      loadComponent: () =>
        import('./pages/detail-agence/detail-agence-credit.component').then((m) => m.DetailAgenceCreditComponent),
    },
    {
      path: 'organigramme',
      canActivate: [roleGuard([...CREDIT_ALL])],
      resolve: { demandes: organigrammeCreditResolver },
      loadComponent: () =>
        import('./pages/organigramme/organigramme-credit.component').then((m) => m.OrganigrammeCreditComponent),
    },
    {
      path: 'employeur/list',
      canActivate: [roleGuard([...CREDIT_ALL])],
      resolve: { employeurs: employeurListCreditResolver },
      loadComponent: () =>
        import('./pages/employeur-list/employeur-list-credit.component').then((m) => m.EmployeurListCreditComponent),
    },
    {
      path: 'employeur/:id',
      canActivate: [roleGuard([...CREDIT_ALL])],
      resolve: { data: employeurDetailCreditResolver },
      loadComponent: () =>
        import('./pages/employeur-detail/employeur-detail-credit.component').then((m) => m.EmployeurDetailCreditComponent),
    },
    {
      path: 'tirage/list',
      canActivate: [roleGuard([...CREDIT_ALL])],
      loadComponent: () =>
        import('./pages/tirage-list/tirage-list-credit.component').then((m) => m.TirageListCreditComponent),
    },
    {
      path: 'tirage/:ref',
      canActivate: [roleGuard([...CREDIT_ALL])],
      resolve: { data: tirageDetailCreditResolver },
      loadComponent: () =>
        import('./pages/tirage-detail/tirage-detail-credit.component').then((m) => m.TirageDetailCreditComponent),
    },
    {
      path: ':ref',
      canActivate: [roleGuard([...CREDIT_ALL])],
      resolve: { data: ficheCreditResolver },
      loadComponent: () =>
        import('./pages/fiche/fiche-credit.component').then((m) => m.FicheCreditComponent),
    },
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'dashboard',
    },
  ],
};
