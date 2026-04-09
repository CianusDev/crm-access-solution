import { UserRole } from '@/core/models/user.model';

export type AnalyseTabId = 'demande' | 'analyse' | 'garanties' | 'documents' | 'geolocalisation';

/** Sous-sections du tab "Analyse financière" (navigation secondaire) */
export type AnalyseSectionId =
  | 'activite'
  | 'achats'
  | 'tresorerie'
  | 'familial'
  | 'analyse-financiere';

/** Sous-sections du tab "Actifs & Garanties" */
export type GarantiesSectionId =
  | 'actifs-totaux'
  | 'cautions'
  | 'actifs-immobiliers'
  | 'actifs-dat'
  | 'actifs-equipements'
  | 'actifs-biens-mobiliers'
  | 'actifs-vehicules'
  | 'actifs-stocks'
  | 'actifs-garanties';

export interface AnalyseTab {
  id: AnalyseTabId;
  label: string;
  /** Rôles autorisés. Vide = tous les rôles. */
  roles?: UserRole[];
}

export interface AnalyseSection {
  id: AnalyseSectionId;
  label: string;
}

export interface GarantiesSection {
  id: GarantiesSectionId;
  label: string;
}

export const GP_ROLES: UserRole[] = [
  UserRole.GestionnairePortefeuilles,
  UserRole.GestionnairePortefeuillesJunior,
];
export const RC_CC_ROLES: UserRole[] = [UserRole.responsableClient, UserRole.conseilClientele];
export const CA_CAA_ROLES: UserRole[] = [UserRole.ChefAgence, UserRole.ChefAgenceAdjoint];

const ALL_TABS: AnalyseTab[] = [
  { id: 'demande', label: 'Demande de crédit' },
  { id: 'analyse', label: 'Analyse financière', roles: [] },
  { id: 'garanties', label: 'Actifs & Garanties', roles: [] },
  { id: 'documents', label: 'Documents annexes', roles: [] },
  { id: 'geolocalisation', label: 'Géolocalisation' },
];

/** Sous-sections du tab "Analyse financière" */
export const ANALYSE_SECTIONS: AnalyseSection[] = [
  { id: 'activite', label: 'Activité' },
  { id: 'achats', label: 'Achats & Charges' },
  { id: 'tresorerie', label: 'Trésorerie' },
  { id: 'familial', label: 'Profil Familial' },
  { id: 'analyse-financiere', label: 'Analyse Financière' },
];

/** Sous-sections du tab "Actifs & Garanties" */
export const GARANTIES_SECTIONS: GarantiesSection[] = [
  { id: 'actifs-totaux', label: 'Totaux garanties' },
  { id: 'cautions', label: 'Cautions solidaires' },
  { id: 'actifs-immobiliers', label: 'Immobilisations' },
  { id: 'actifs-dat', label: 'Dépôts à terme (DAT)' },
  { id: 'actifs-equipements', label: 'Matériels professionnels' },
  { id: 'actifs-biens-mobiliers', label: 'Biens mobiliers de la famille' },
  { id: 'actifs-vehicules', label: 'Véhicules' },
  { id: 'actifs-stocks', label: 'Actifs circulants (Stocks)' },
  { id: 'actifs-garanties', label: 'Document Actifs & Garanties' },
];

const GP_TAB_IDS: AnalyseTabId[] = ['demande', 'documents', 'geolocalisation'];
const RC_CC_TAB_IDS: AnalyseTabId[] = ['demande', 'documents', 'geolocalisation'];
const CA_CAA_TAB_IDS: AnalyseTabId[] = ['demande', 'documents', 'geolocalisation'];

/** Onglets visibles selon le profil (évite d'alourdir le composant page). */
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
 * n'existent pas tant que `statut` ∈ {1,2,3,4} (seulement Demande, Documents, Géoloc restent pertinents).
 */
const TABS_HIDDEN_UNTIL_AFTER_STATUT_4: AnalyseTabId[] = ['analyse', 'garanties'];

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
