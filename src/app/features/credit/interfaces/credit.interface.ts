export interface CreditTypeCredit {
  id: number;
  code: string;
  libelle: string;
}

export interface CreditClient {
  codeClient: string;
  nomPrenom: string;
  typeAgent: 'PP' | 'PM' | string;
  agence?: { libelle: string };
}

export interface CreditAvsFond {
  statut: number;
}

export interface CreditDemande {
  id: number;
  refDemande: string;
  refTirage?: string;
  dateDemande: string;
  montantSollicite: number;
  montantEcheSouhaite: number;
  nbreEcheanceSollicite: number;
  statut: number;
  tirage: number; // 0 = crédit classique, 1 = tirage/découvert
  pause?: number; // 1 = dossier en pause chez analyste risque
  client: CreditClient;
  typeCredit: CreditTypeCredit;
  avsFond?: CreditAvsFond;
}

export interface CreditTypeItem {
  id: number;
  code: string;
  libelle: string;
  montant: number;
  pourcentage?: number;
}

// ── Tab Général — dashCrdCaa ──────────────────────────────────────────────────
export interface CreditDashboard {
  sommeTotaleMontantsProposes: number;
  montantDebParCrd: CreditTypeItem[];
  demandeEnCrea: number;
  demandeArs: number;
  demandeEnComite: number;
  demandeEnLeveRecom: number;
  demandeCloture: number;
  demandeRejete: number;
  demandes: CreditDemande[];
}

export interface CreditDashboardFiltre {
  typeCredit?: number | null;
  statut?: number | null;
  codeClient?: string;
  dateDebut?: string;
  dateFin?: string;
}

// ── Tab Total Réseau — dashCrdBytype ─────────────────────────────────────────
export interface CreditDashboardTypeCredit {
  sommeTotaleMontEmprunte: number; // champ réel backend
  montantDebParCrd: CreditTypeItem[];
}

// ── Tab Total Réseau — dashCrdByStatut ───────────────────────────────────────
export interface CreditDashboardStatut {
  demandeTotal: number;
  demandeEnCours: number;
  demandeClotures: number;
  demandeRjettes: number;
}

// ── Tab Total Réseau — dashCrdByAgence (data.demandesParAgence) ──────────────
export interface CreditStatAgence {
  code: string;
  libelle: string;
  montant: number;
  demandeEncours: number;
  demandeCloture: number;
  demandeRejete: number;
}

// ── Tab Total Réseau — dashCrdByRegion (data.demandesParRegion) ──────────────
export interface CreditStatRegion {
  id: number;
  libelle: string;
  regional?: string; // nom du responsable régional
  montantTotal: number;
  totalDemandes: number;
  demandeArs: number;
  demandeEnComite: number;
  demandeEnLeveRecom: number;
  demandeCloture: number;
  demandeRejete: number;
}

// ── Zones — statCrdRegion?region={id} (data.data.infosByZone) ────────────────
export interface CreditStatZone {
  id: number;
  libelle: string;
  regional?: string;
  demandeArs: number;
  demandeEnComite: number;
  demandeEnLeveRecom: number;
  demandeCloture: number;
  demandeRejete: number;
}

// ── Tab Total Réseau — tbByProd ───────────────────────────────────────────────
export interface CreditTbStatut {
  nombre: number;
  volume: number;
}

export interface CreditTbProduit {
  libelle: string;
  decaisses: CreditTbStatut;
  enDecaissement: CreditTbStatut;
  enComite: CreditTbStatut;
  enContreVal: CreditTbStatut;
  enInstruction: CreditTbStatut;
  nonInstruit: CreditTbStatut;
  total: CreditTbStatut;
  probable: CreditTbStatut;
  valide: CreditTbStatut;
}

// ── Création de demande ───────────────────────────────────────────────────────
export interface CreditClientEntreprise {
  nomDirigeant: string;
  NumEnregistrement: string;
}

export interface CreditClientDetail {
  codeClient: string;
  nomPrenom: string;
  typeAgent: 'PP' | 'PM' | string;
  agence: { libelle: string };
  indicatifCel?: string;
  numCel?: string;
  ville?: {
    id: number;
    libelle: string;
  };
  domicille?: string;
  dataNaiss?: string;
  dateInscription?: string;
  adresse?: string;
  entreprise?: CreditClientEntreprise;
}

export interface CreditTypeActivite {
  id: number;
  libelle: string;
}

export interface CreditSaveDemande {
  codeClient: string;
  typeCredit: number;
  objetCredit: string;
  typeActivite: number;
  montantSollicite: number;
  nbreEcheanceSollicite: number;
  montantEcheSouhaite: number;
  nbreEcheDiffere?: number | null;
  description: string;
}

// ── Fiche crédit ─────────────────────────────────────────────────────────────
export interface CreditDecisionFinale {
  montant?: number;
  montantPropose?: number;
  fraisDossier?: number;
  commissionDeboursement?: number;
  assurDecesInvalidite?: number;
  montantEmprunte?: number;
  duree?: number;
  mensualite?: number;
  montantCaution?: number;
  periodeGrace?: number; // 1 = oui, 2 = non
  nbreMoisGrace?: number;
  acteNotarie?: number;
  authGage?: number;
  assurMultiRisk?: number;
  deposit?: number;
  tauxCouverture?: number;
  commentaire?: string;
}

export interface CreditObservation {
  id: number;
  observation: string;
  createdAt: string;
  user?: { nomPrenom?: string; profil?: { name: string } };
}

export interface CreditDocumentAnnexe {
  id: number;
  libelle: string;
  description?: string;
  document: string; // URL
  refDemande: string;
  createdAt?: string;
  user?: { nomPrenom?: string };
}

export interface CreditFicheDemandeDetail extends CreditDemande {
  description?: string;
  objetCredit?: string;
  nbreEcheDiffere?: number;
  ar?: { nomPrenom?: string };
  typeActivite?: { libelle: string };
}

export interface CreditFiche {
  demande: CreditFicheDemandeDetail;
  decision?: CreditDecisionFinale;
  garantieDecision?: unknown;
  pret?: { numPret?: string; numContrat?: string };
  usersGaranties?: unknown[];
  magasins?: unknown[];
  nombreDemandes?: number;
}

// ── Résumé analyse ────────────────────────────────────────────────────────────
export interface CreditSWOT {
  id?: number;
  forces?: string[];
  faiblesses?: string[];
  opportunites?: string[];
  menaces?: string[];
}

export interface CreditComiteDecision {
  id?: number;
  dateDemande?: string;
  montantPropose?: number;
  montantEmprunte?: number;
  duree?: number;
  mensualite?: number;
  fraisDossier?: number;
  commissionDeboursement?: number;
  assurDecesInvalidite?: number;
  assurMultiRisk?: number;
  acteNotarie?: number;
  montantActeNotarie?: number;
  authGage?: number;
  tauxCouverture?: number;
  deposit?: number;
  periodeGrace?: number;
  nbreMoisGrace?: number;
  montantCaution?: number;
  motivation?: string;
  commentaire?: string;
  statut?: number;
  user?: { nomPrenom?: string; profil?: { name: string; libelle: string } };
}

export interface CreditPropositionAR {
  montantPropose?: number;
  duree?: number;
  mensualite?: number;
  motivation?: string;
  commentaire?: string;
  statut?: number;
  user?: { nomPrenom?: string };
}

export interface CreditContreEvaluation {
  montantPropose?: number;
  duree?: number;
  mensualite?: number;
  motivation?: string;
  commentaire?: string;
  statut?: number;
  user?: { nomPrenom?: string };
}

export interface CreditGarantieProposes {
  montantTotal?: number;
  rapportCredit?: number;
  garanties?: Array<{ libelle: string; montant: number }>;
}

export interface CreditResume {
  demande: CreditFicheDemandeDetail;
  aSwots?: CreditSWOT[];
  garantieProposes?: CreditGarantieProposes;
  proposition?: CreditPropositionAR;
  contreEvaluation?: CreditContreEvaluation;
  precomites?: CreditComiteDecision[];
  comites?: CreditComiteDecision[];
  decision?: CreditDecisionFinale;
  garantieDecision?: unknown;
  observations?: CreditObservation[];
}

// ── Statuts ───────────────────────────────────────────────────────────────────
export const CREDIT_STATUTS: Record<
  number,
  { label: string; variant: 'default' | 'success' | 'destructive' | 'warning' }
> = {
  1: { label: 'Enregistrement de la demande', variant: 'default' },
  2: { label: 'Pré-Évaluation', variant: 'default' },
  3: { label: 'En attente de création dans PERFECT', variant: 'warning' },
  4: { label: "En attente d'affectation", variant: 'warning' },
  5: { label: "En attente de l'analyse financière", variant: 'warning' },
  6: { label: 'En attente de la contre-évaluation', variant: 'warning' },
  7: { label: 'En attente du pré-comité', variant: 'warning' },
  8: { label: 'En attente du Responsable Régional', variant: 'warning' },
  9: { label: 'En attente du comité CDCR', variant: 'warning' },
  10: { label: 'En attente DGA Risque', variant: 'warning' },
  11: { label: 'En attente DGA EXPL.', variant: 'warning' },
  12: { label: 'En attente Directeur Général', variant: 'warning' },
  13: { label: 'Levée des recommandations', variant: 'warning' },
  14: { label: 'En attente de suivi', variant: 'warning' },
  16: { label: 'En attente de décaissement et de clôture', variant: 'warning' },
  17: { label: 'Enregistrement des contrats', variant: 'warning' },
  18: { label: 'Formalités post décaissement', variant: 'warning' },
  19: { label: 'Visite commanditaire', variant: 'default' },
  21: { label: 'Dossier rejeté', variant: 'destructive' },
  22: { label: "En attente d'authentification des gages (demande)", variant: 'warning' },
  23: { label: "En attente d'authentification des gages", variant: 'warning' },
  24: { label: 'Avis défavorable', variant: 'destructive' },
  25: { label: 'Décaissement annulé', variant: 'destructive' },
  26: { label: 'Validation décaissement par dérogation', variant: 'warning' },
  27: { label: 'Confirmation décaissement par dérogation', variant: 'warning' },
  28: { label: 'En attente DIRECTRICE EXPL.', variant: 'warning' },
  30: { label: 'Dossier clôturé', variant: 'success' },
};
