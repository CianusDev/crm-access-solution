import { SidebarGroup } from '@/shared/components/sidebar/sidebar.interface';
import { UserRole } from '@/core/models/user.model';
import {
  Clock,
  Ellipsis,
  LayoutDashboard,
  List,
  MapPin,
  Search,
  Settings,
  UserPlus,
  Users,
  AlarmClock,
  CreditCard,
  FilePlus,
  SlidersHorizontal,
} from 'lucide-angular';

const {
  Admin,
  DG,
  DGA,
  DirectriceExploitation: D_EXPL,
  ResponsableExploitation: RESPO_EXPL,
  ChargeCora: Charge_Cora,
  ResponsableFrontOffice: RESPO_FO,
  AdministrationAudit: ADMIN_AUDIT,
  GestionCora: Gestion_Cora,
  assistanteClientelePME: ASSC_PME,
  agentAccueil: AGENT_ACC,
  ResponsableClientelePME: RESPO_CLT_PME,
  responsableClient: RC,
  ChefAgence: CA,
  ChefAgenceAdjoint: CAA,
  conseilClientele: CC,
  GestionnairePortefeuilles: GP,
  ChefUnitePolyvalent: CUP,
  ChefEquipe: CE,
  AnalysteRisque: AR,
  SuperviseurRisqueZone: SUP_RISQ_ZONE,
  ResponsableRegional: RESPO_RGL,
  SuperviseurPME: SUP_PME,
  ChargeDeveloppementCommercial: CDC,
  AgentCommercialJunior: ACJ,
  GestionnairePortefeuillesJunior: GPJ,
  DirecteurRisque: DR,
  ChargeDuComite: CHARGE_COMIT,
  Chargedepartementcredit: CDCR,
  ResponsableJuridique: RESPO_JURIDIQUE,
  ResponsableAssurance: RESPO_ASSUR,
  ResponsableClienteleTPE: RESPO_CLT_TPE,
  ResponsableProduitAgricole: RESPO_PROD_AGRI,
  ResponsableReseau: RESPO_RS,
  ChefDepartementMarketing: CHEF_DEPART_MARK,
  AgentBO: Agent_BO,
} = UserRole;

// ── CORA ──────────────────────────────────────────────────────────────────────
// Dashboard / créer / sous-agent / géoloc
const CORA_DASHBOARD_ROLES = [
  Admin,
  DG,
  DGA,
  D_EXPL,
  RESPO_EXPL,
  Charge_Cora,
  RESPO_FO,
  ADMIN_AUDIT,
  Gestion_Cora,
] as const;
// Demandes en attente (old: Admin, DGA, D_EXPL, RESPO_EXPL, Gestion_Cora, Agent_BO, Charge_Cora)
const CORA_PENDING_ROLES = [
  Admin,
  DGA,
  D_EXPL,
  RESPO_EXPL,
  Gestion_Cora,
  Agent_BO,
  Charge_Cora,
] as const;
// Liste des CORAs (old: Admin, DG, DGA, D_EXPL, RESPO_EXPL, Agent_BO, RESPO_FO, Charge_Cora, ADMIN_AUDIT)
const CORA_LIST_ROLES = [
  Admin,
  DG,
  DGA,
  D_EXPL,
  RESPO_EXPL,
  Agent_BO,
  RESPO_FO,
  Charge_Cora,
  ADMIN_AUDIT,
] as const;

// ── ASC ───────────────────────────────────────────────────────────────────────
const ASC_SIEGE_ROLES = [
  Admin,
  ADMIN_AUDIT,
  DG,
  DGA,
  D_EXPL,
  ASSC_PME,
  RESPO_FO,
  AGENT_ACC,
  RESPO_EXPL,
  RESPO_CLT_PME,
] as const;
const ASC_AGENCE_ROLES = [RC, CA, CC] as const;
const ASC_CREATE_ROLES = [Admin, RC, CC] as const;
// Demandes en attente (old: Admin, ADMIN_AUDIT, DGA, D_EXPL, ASSC_PME, RC, CC, RESPO_FO, AGENT_ACC, RESPO_EXPL)
const ASC_PENDING_ROLES = [
  Admin,
  ADMIN_AUDIT,
  DGA,
  D_EXPL,
  ASSC_PME,
  RC,
  CC,
  RESPO_FO,
  AGENT_ACC,
  RESPO_EXPL,
] as const;
// Chèques en cours / 7j (old: Admin, ADMIN_AUDIT, DGA, D_EXPL, ASSC_PME, RESPO_EXPL, RESPO_FO, AGENT_ACC, RC, CC)
const ASC_CHEQUES_ROLES = [
  Admin,
  ADMIN_AUDIT,
  DGA,
  D_EXPL,
  ASSC_PME,
  RESPO_EXPL,
  RESPO_FO,
  AGENT_ACC,
  RC,
  CC,
] as const;
// Liste des chèques + Tireurs (old: Admin, DG, DGA, D_EXPL, ASSC_PME, CA, RC, CC, RESPO_FO, AGENT_ACC, RESPO_EXPL, RESPO_CLT_PME)
const ASC_LIST_ROLES = [
  Admin,
  DG,
  DGA,
  D_EXPL,
  ASSC_PME,
  CA,
  RC,
  CC,
  RESPO_FO,
  AGENT_ACC,
  RESPO_EXPL,
  RESPO_CLT_PME,
] as const;

// ── CRÉDIT ────────────────────────────────────────────────────────────────────
// Dashboard siège (old: Admin, DG, DGA, CDCR, DR, D_EXPL, RESPO_CLT_TPE, RESPO_PROD_AGRI, ADMIN_AUDIT, RESPO_CLT_PME, RESPO_EXPL, CHARGE_COMIT, RESPO_JURIDIQUE, RESPO_ASSUR, RESPO_FO, ASSC_PME, RESPO_RS)
const CREDIT_DASHBOARD_SIEGE_ROLES = [
  Admin,
  DG,
  DGA,
  CDCR,
  DR,
  D_EXPL,
  RESPO_CLT_TPE,
  RESPO_PROD_AGRI,
  ADMIN_AUDIT,
  RESPO_CLT_PME,
  RESPO_EXPL,
  CHARGE_COMIT,
  RESPO_JURIDIQUE,
  RESPO_ASSUR,
  RESPO_FO,
  ASSC_PME,
  RESPO_RS,
] as const;
// Dashboard agence
const CREDIT_AGENCE_ROLES = [
  CA,
  CAA,
  CC,
  GP,
  CUP,
  CE,
  RC,
  AR,
  SUP_RISQ_ZONE,
  RESPO_RGL,
  SUP_PME,
  CDC,
] as const;
// Créer demande
const CREDIT_CREATE_ROLES = [Admin, ACJ, CE, GP, CC, RC] as const;
// Liste des demandes (old: très large — toutes les agences + siège sauf quelques rôles purs BO)
const CREDIT_LIST_ROLES = [
  Admin,
  DG,
  DGA,
  DR,
  CDCR,
  D_EXPL,
  RESPO_EXPL,
  RESPO_FO,
  RESPO_CLT_TPE,
  RESPO_CLT_PME,
  RESPO_PROD_AGRI,
  SUP_PME,
  GP,
  CUP,
  CE,
  ASSC_PME,
  CC,
  CA,
  CAA,
  RC,
  ACJ,
  AR,
  SUP_RISQ_ZONE,
  CHARGE_COMIT,
  RESPO_RGL,
  RESPO_JURIDIQUE,
  RESPO_ASSUR,
] as const;
// Employeurs éligibles (old: Admin, CA, CAA, D_EXPL, RC, CC)
const CREDIT_EMPLOYEUR_ROLES = [Admin, CA, CAA, D_EXPL, RC, CC] as const;
// Tirages découvert (non présent dans old menu — rôles raisonnables)
const CREDIT_TIRAGE_ROLES = CREDIT_CREATE_ROLES;

// ── PARAMÈTRES ────────────────────────────────────────────────────────────────
// Old frontend : Admin uniquement
const PARAMS_ROLES = [Admin] as const;

export const DEFAULT_MENU: SidebarGroup[] = [
  {
    label: 'Power Bi',
    icon: Ellipsis,
    // Aucune restriction : quasiment tous les rôles y ont accès dans l'old frontend
    items: [{ label: 'Tableau de bord', href: '/app/power-bi/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Reseau de CORA',
    icon: Ellipsis,
    items: [
      {
        label: 'Tableau de bord',
        href: '/app/cora/dashboard',
        icon: LayoutDashboard,
        roles: [...CORA_DASHBOARD_ROLES],
      },
      {
        label: 'Créer un CORA',
        href: '/app/cora/create',
        icon: UserPlus,
        roles: [Admin, Gestion_Cora],
      },
      {
        label: 'Créer un sous-agent',
        href: '/app/cora/agent/create',
        icon: UserPlus,
        roles: [Admin, Gestion_Cora],
      },
      {
        label: 'Demandes en attente',
        href: '/app/cora/pending',
        icon: Clock,
        roles: [...CORA_PENDING_ROLES],
      },
      { label: 'Liste des CORAs', href: '/app/cora/list', icon: List, roles: [...CORA_LIST_ROLES] },
      { label: 'Mes CORAs', href: '/app/cora/my-coras', icon: Users, roles: [Gestion_Cora] },
      { label: 'Géolocalisation CORA', href: '/cora-map', icon: MapPin, roles: [Admin] },
    ],
  },
  {
    label: 'Avance sur chèque',
    icon: Ellipsis,
    items: [
      {
        label: 'Tableau de bord',
        href: '/app/asc/dashboard',
        icon: LayoutDashboard,
        roles: [...ASC_SIEGE_ROLES],
      },
      {
        label: 'Tableau de bord agence',
        href: '/app/asc/dashboard/agence',
        icon: LayoutDashboard,
        roles: [...ASC_AGENCE_ROLES],
      },
      {
        label: 'Nouvelle demande',
        href: '/app/asc/client-search',
        icon: Search,
        roles: [...ASC_CREATE_ROLES],
      },
      {
        label: 'Demandes en attente',
        href: '/app/asc/pending',
        icon: Clock,
        roles: [...ASC_PENDING_ROLES],
      },
      { label: 'Liste des chèques', href: '/app/asc/list', icon: List, roles: [...ASC_LIST_ROLES] },
      {
        label: 'Liste des tireurs',
        href: '/app/asc/tireurs',
        icon: Users,
        roles: [...ASC_LIST_ROLES],
      },
      {
        label: 'Chèques en cours (7j)',
        href: '/app/asc/cheques-attente',
        icon: AlarmClock,
        roles: [...ASC_CHEQUES_ROLES],
      },
    ],
  },
  {
    label: 'Crédit',
    icon: CreditCard,
    items: [
      {
        label: 'Tableau de bord réseau',
        href: '/app/credit/dashboard',
        icon: LayoutDashboard,
        roles: [...CREDIT_DASHBOARD_SIEGE_ROLES],
      },
      {
        label: 'Tableau de bord agence',
        href: '/app/credit/dashboard-agence',
        icon: LayoutDashboard,
        roles: [...CREDIT_AGENCE_ROLES],
      },
      {
        label: 'Nouvelle demande',
        href: '/app/credit/create',
        icon: FilePlus,
        roles: [...CREDIT_CREATE_ROLES],
      },
      {
        label: 'Liste des demandes',
        href: '/app/credit/list',
        icon: List,
        roles: [...CREDIT_LIST_ROLES],
      },
      {
        label: 'Tirages découvert',
        href: '/app/credit/tirage/list',
        icon: CreditCard,
        roles: [...CREDIT_TIRAGE_ROLES],
      },
      {
        label: 'Employeurs éligibles',
        href: '/app/credit/employeur/list',
        icon: Users,
        roles: [...CREDIT_EMPLOYEUR_ROLES],
      },
    ],
  },
  {
    label: 'Paramètres',
    icon: SlidersHorizontal,
    items: [
      {
        label: 'Utilisateurs',
        href: '/app/parametres/utilisateurs',
        icon: Users,
        roles: [...PARAMS_ROLES],
      },
      {
        label: 'Configuration',
        href: '/app/parametres/configuration',
        icon: Settings,
        roles: [...PARAMS_ROLES],
      },
    ],
  },
];
