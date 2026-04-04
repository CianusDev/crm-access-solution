import { UserRole } from '@/core/models/user.model';

export type AnalyseTabId =
  | 'demande'
  | 'activite'
  | 'achats'
  | 'tresorerie'
  | 'familial'
  | 'garanties'
  | 'cautions'
  | 'documents'
  | 'swot'
  | 'geolocalisation'
  | 'envoi';

export interface AnalyseTab {
  id: AnalyseTabId;
  label: string;
  /** Rôles autorisés. Vide = tous les rôles. */
  roles?: UserRole[];
}

export const GP_ROLES: UserRole[] = [
  UserRole.GestionnairePortefeuilles,
  UserRole.GestionnairePortefeuillesJunior,
];
export const RC_CC_ROLES: UserRole[] = [UserRole.responsableClient, UserRole.conseilClientele];
export const CA_CAA_ROLES: UserRole[] = [UserRole.ChefAgence, UserRole.ChefAgenceAdjoint];

const ALL_TABS: AnalyseTab[] = [
  { id: 'demande', label: 'Demande de crédit' },
  { id: 'activite', label: 'Profil Activité', roles: [] },
  { id: 'achats', label: 'Achats & Charges', roles: [] },
  { id: 'tresorerie', label: 'Trésorerie', roles: [] },
  { id: 'familial', label: 'Profil Familial', roles: [] },
  { id: 'garanties', label: 'Actifs & Garanties', roles: [] },
  { id: 'cautions', label: 'Cautions solidaires', roles: [] },
  { id: 'documents', label: 'Documents annexes', roles: [] },
  { id: 'swot', label: 'SWOT & Comités', roles: [] },
  { id: 'geolocalisation', label: 'Géolocalisation' },
  { id: 'envoi', label: 'Envoi & Validation' },
];

const GP_TAB_IDS: AnalyseTabId[] = ['demande', 'documents', 'geolocalisation'];
const RC_CC_TAB_IDS: AnalyseTabId[] = ['demande', 'documents', 'geolocalisation'];
const CA_CAA_TAB_IDS: AnalyseTabId[] = ['demande', 'documents', 'geolocalisation'];

/** Onglets visibles selon le profil (évite d’alourdir le composant page). */
export function filterAnalyseTabsByRole(
  isGP: boolean,
  isRCCC: boolean,
  isCACaa: boolean,
): AnalyseTab[] {
  if (isGP) {
    return ALL_TABS.filter((t) => GP_TAB_IDS.includes(t.id));
  }
  if (isRCCC) {
    return ALL_TABS.filter((t) => RC_CC_TAB_IDS.includes(t.id));
  }
  if (isCACaa) {
    return ALL_TABS.filter((t) => CA_CAA_TAB_IDS.includes(t.id));
  }
  return ALL_TABS;
}

/**
 * Legacy `analyse-financiere-credit` : les onglets « ANALYSE FINANCIÈRE » et « ACTIFS ET GARANTIES »
 * n’existent pas tant que `statut` ∈ {1,2,3,4} (seulement Demande, Documents, Géoloc restent pertinents).
 * On applique la même logique aux onglets détaillés côté nouvelle app.
 */
const TABS_HIDDEN_UNTIL_AFTER_STATUT_4: AnalyseTabId[] = [
  'activite',
  'achats',
  'tresorerie',
  'familial',
  'garanties',
  'cautions',
  'swot',
  'envoi',
];

export function filterAnalyseTabsByWorkflowStatut(
  tabs: AnalyseTab[],
  statut: number | null | undefined,
): AnalyseTab[] {
  if (statut == null || Number.isNaN(Number(statut))) {
    return tabs;
  }
  const s = Number(statut);
  if (s <= 4) {
    return tabs.filter((t) => !TABS_HIDDEN_UNTIL_AFTER_STATUT_4.includes(t.id));
  }
  return tabs;
}
