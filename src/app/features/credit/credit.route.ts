import { Routes } from '@angular/router';
import { roleGuard } from '@/core/guards/role.guard';
import { UserRole } from '@/core/models/user.model';

const {
  Admin, DG, DGA,
  DirectriceExploitation: D_EXPL,
  ResponsableExploitation: RESPO_EXPL,
  ResponsableFrontOffice: RESPO_FO,
  AdministrationAudit: ADMIN_AUDIT,
  DirecteurRisque: DR,
  AnalysteRisque: AR,
  GestionnairePortefeuilles: GP,
  GestionnairePortefeuillesJunior: GPJ,
  ChargeDuComite: CHARGE_COMIT,
  Chargedepartementcredit: CDCR,
  ResponsableJuridique: RESPO_JURIDIQUE,
  ResponsableAssurance: RESPO_ASSUR,
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
  Admin, DG, DGA, D_EXPL, RESPO_EXPL, RESPO_FO, ADMIN_AUDIT,
  AR, GP, GPJ, DR, CHARGE_COMIT, CDCR, RESPO_JURIDIQUE, RESPO_ASSUR,
  RC, CA, CAA, CC, CE, CUP, ACJ, CDC, RESPO_RGL, SUP_RISQ_ZONE, SUP_PME,
] as const;

const CREDIT_AGENCE = [CA, CAA, CC, GP, CUP, CE, RC, AR, SUP_RISQ_ZONE, RESPO_RGL, SUP_PME, CDC] as const;

const CREDIT_CREATE = [Admin, ACJ, CE, GP, CC, RC] as const;

const CREDIT_ALL = [...new Set([...CREDIT_SIEGE, ...CREDIT_AGENCE])] as const;

export const CREDIT_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [roleGuard([...CREDIT_SIEGE])],
    loadComponent: () =>
      import('./pages/dashboard/dashboard-credit.component').then(
        (m) => m.DashboardCreditComponent,
      ),
  },
  {
    path: 'dashboard-agence',
    canActivate: [roleGuard([...CREDIT_AGENCE])],
    loadComponent: () =>
      import('./pages/dashboard-agence/dashboard-agence-credit.component').then(
        (m) => m.DashboardAgenceCreditComponent,
      ),
  },
  {
    path: 'create',
    canActivate: [roleGuard([...CREDIT_CREATE])],
    loadComponent: () =>
      import('./pages/create/create-credit.component').then(
        (m) => m.CreateCreditComponent,
      ),
  },
  {
    path: 'analyse/:ref',
    canActivate: [roleGuard([...CREDIT_ALL])],
    loadComponent: () =>
      import('./pages/analyse/analyse-credit.component').then(
        (m) => m.AnalyseCreditComponent,
      ),
  },
  {
    path: 'resume/:ref',
    canActivate: [roleGuard([...CREDIT_ALL])],
    loadComponent: () =>
      import('./pages/resume/resume-credit.component').then(
        (m) => m.ResumeCreditComponent,
      ),
  },
  {
    path: 'list',
    canActivate: [roleGuard([...CREDIT_ALL])],
    loadComponent: () =>
      import('./pages/list/list-credit.component').then(
        (m) => m.ListCreditComponent,
      ),
  },
  {
    path: 'detail-agence/:code',
    canActivate: [roleGuard([...CREDIT_ALL])],
    loadComponent: () =>
      import('./pages/detail-agence/detail-agence-credit.component').then(
        (m) => m.DetailAgenceCreditComponent,
      ),
  },
  {
    path: 'organigramme',
    canActivate: [roleGuard([...CREDIT_ALL])],
    loadComponent: () =>
      import('./pages/organigramme/organigramme-credit.component').then(
        (m) => m.OrganigrammeCreditComponent,
      ),
  },
  {
    path: 'employeur/list',
    canActivate: [roleGuard([...CREDIT_ALL])],
    loadComponent: () =>
      import('./pages/employeur-list/employeur-list-credit.component').then(
        (m) => m.EmployeurListCreditComponent,
      ),
  },
  {
    path: 'employeur/:id',
    canActivate: [roleGuard([...CREDIT_ALL])],
    loadComponent: () =>
      import('./pages/employeur-detail/employeur-detail-credit.component').then(
        (m) => m.EmployeurDetailCreditComponent,
      ),
  },
  {
    path: 'tirage/list',
    canActivate: [roleGuard([...CREDIT_ALL])],
    loadComponent: () =>
      import('./pages/tirage-list/tirage-list-credit.component').then(
        (m) => m.TirageListCreditComponent,
      ),
  },
  {
    path: 'tirage/:ref',
    canActivate: [roleGuard([...CREDIT_ALL])],
    loadComponent: () =>
      import('./pages/tirage-detail/tirage-detail-credit.component').then(
        (m) => m.TirageDetailCreditComponent,
      ),
  },
  {
    path: ':ref',
    canActivate: [roleGuard([...CREDIT_ALL])],
    loadComponent: () =>
      import('./pages/fiche/fiche-credit.component').then(
        (m) => m.FicheCreditComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
