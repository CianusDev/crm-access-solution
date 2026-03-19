import { SidebarGroup } from '@/shared/components/sidebar/sidebar.interface';
import { UserRole } from '@/core/models/user.model';
import {
  Clock,
  Ellipsis,
  FileText,
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
  Admin, DG, DGA,
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

/** Roles visible for CORA dashboard / list / pending */
const CORA_VIEWERS = [Admin, DG, DGA, D_EXPL, RESPO_EXPL, Charge_Cora, RESPO_FO, ADMIN_AUDIT, Gestion_Cora] as const;

/** Roles for ASC dashboard siège */
const ASC_SIEGE_ROLES = [Admin, ADMIN_AUDIT, DG, DGA, D_EXPL, ASSC_PME, RESPO_FO, AGENT_ACC, RESPO_EXPL, RESPO_CLT_PME] as const;

/** Roles for ASC dashboard agence */
const ASC_AGENCE_ROLES = [RC, CA, CC] as const;

/** Roles for ASC create */
const ASC_CREATE_ROLES = [Admin, RC, CC] as const;

/** Roles for Credit dashboard siège (all office/management roles) */
const CREDIT_SIEGE_ROLES = [
  Admin, DG, DGA, D_EXPL, RESPO_EXPL, RESPO_FO, ADMIN_AUDIT,
  AR, GP, GPJ, DR, CHARGE_COMIT, CDCR, RESPO_JURIDIQUE, RESPO_ASSUR,
  RC, CA, CAA, CC, CE, CUP, ACJ, CDC, RESPO_RGL, SUP_RISQ_ZONE, SUP_PME,
] as const;

/** Roles for Credit dashboard agence */
const CREDIT_AGENCE_ROLES = [CA, CAA, CC, GP, CUP, CE, RC, AR, SUP_RISQ_ZONE, RESPO_RGL, SUP_PME, CDC] as const;

/** Roles for Credit create */
const CREDIT_CREATE_ROLES = [Admin, ACJ, CE, GP, CC, RC] as const;

/** Roles for Paramètres */
const PARAMS_ROLES = [Admin, DG, DGA] as const;

export const DEFAULT_MENU: SidebarGroup[] = [
  {
    label: 'Power Bi',
    icon: Ellipsis,
    items: [{ label: 'Tableau de bord', href: '/app/power-bi/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Reseau de CORA',
    icon: Ellipsis,
    items: [
      { label: 'Tableau de bord', href: '/app/cora/dashboard', icon: LayoutDashboard, roles: [...CORA_VIEWERS] },
      { label: 'Créer un CORA', href: '/app/cora/create', icon: UserPlus, roles: [Admin, Gestion_Cora] },
      { label: 'Créer un sous-agent', href: '/app/cora/agent/create', icon: UserPlus, roles: [Admin, Gestion_Cora] },
      { label: 'Liste des CORAs', href: '/app/cora/list', icon: List, roles: [...CORA_VIEWERS] },
      { label: 'Mes CORAs', href: '/app/cora/my-coras', icon: Users, roles: [Gestion_Cora] },
      { label: 'Demandes en attente', href: '/app/cora/pending', icon: Clock, roles: [...CORA_VIEWERS] },
      { label: 'Géolocalisation CORA', href: '/cora-map', icon: MapPin, roles: [...CORA_VIEWERS] },
    ],
  },
  {
    label: 'Crédit',
    icon: CreditCard,
    items: [
      { label: 'Tableau de bord réseau', href: '/app/credit/dashboard', icon: LayoutDashboard, roles: [...CREDIT_SIEGE_ROLES] },
      { label: 'Tableau de bord agence', href: '/app/credit/dashboard-agence', icon: LayoutDashboard, roles: [...CREDIT_AGENCE_ROLES] },
      { label: 'Nouvelle demande', href: '/app/credit/create', icon: FilePlus, roles: [...CREDIT_CREATE_ROLES] },
      { label: 'Liste des demandes', href: '/app/credit/list', icon: List, roles: [...CREDIT_SIEGE_ROLES] },
      { label: 'Tirages découvert', href: '/app/credit/tirage/list', icon: CreditCard, roles: [...CREDIT_SIEGE_ROLES] },
      { label: 'Employeurs éligibles', href: '/app/credit/employeur/list', icon: Users, roles: [...CREDIT_SIEGE_ROLES] },
    ],
  },
  {
    label: 'Avance sur chèque',
    icon: Ellipsis,
    items: [
      { label: 'Tableau de bord', href: '/app/asc/dashboard', icon: LayoutDashboard, roles: [...ASC_SIEGE_ROLES] },
      { label: 'Tableau de bord agence', href: '/app/asc/dashboard/agence', icon: LayoutDashboard, roles: [...ASC_AGENCE_ROLES] },
      { label: 'Nouvelle demande', href: '/app/asc/client-search', icon: Search, roles: [...ASC_CREATE_ROLES] },
      { label: 'Demandes en attente', href: '/app/asc/pending', icon: Clock, roles: [...ASC_SIEGE_ROLES, ...ASC_AGENCE_ROLES] },
      { label: 'Liste des chèques', href: '/app/asc/list', icon: List, roles: [...ASC_SIEGE_ROLES, ...ASC_AGENCE_ROLES] },
      { label: 'Liste des tireurs', href: '/app/asc/tireurs', icon: Users, roles: [...ASC_SIEGE_ROLES] },
      { label: 'Chèques en attente (7j)', href: '/app/asc/cheques-attente', icon: AlarmClock, roles: [...ASC_SIEGE_ROLES, ...ASC_AGENCE_ROLES] },
    ],
  },
  {
    label: 'Paramètres',
    icon: SlidersHorizontal,
    items: [
      { label: 'Utilisateurs', href: '/app/parametres/utilisateurs', icon: Users, roles: [...PARAMS_ROLES] },
      { label: 'Configuration', href: '/app/parametres/configuration', icon: Settings, roles: [...PARAMS_ROLES] },
    ],
  },
];
