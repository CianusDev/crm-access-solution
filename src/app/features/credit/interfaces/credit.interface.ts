export interface CreditTypeCredit {
  id: number;
  code: string;
  libelle: string;
}

export interface CreditNationalite {
  id?: number;
  nationalite?: string;
}

export interface CreditCommune {
  id?: number;
  libelle?: string;
}

export interface CreditSignataire {
  nom?: string;
  prenom?: string;
  numPiece?: string;
  nationalite?: CreditNationalite;
  lieuNaiss?: string;
  rue?: string;
  commune?: CreditCommune;
  dateNaissance?: string;
  dateDelivrancePiece?: string;
  dateExpirationPiece?: string;
  lieuDelivrance?: string;
  numTelephone?: string;
}

export interface CreditClient {
  codeClient: string;
  nomPrenom: string;
  typeAgent: 'PP' | 'PM' | string;
  agence?: { libelle: string };
  // Contact (PP & PM)
  indicatifCel?: string;
  numCel?: string;
  telFixe?: string;
  email?: string;
  nationalite?: CreditNationalite;
  // PP spécifique
  commune?: CreditCommune;
  quartier?: string;
  rue?: string;
  lot?: string;
  villa?: string;
  adresse?: string;
  batimentProche?: string;
  domicille?: string;
  dataNaiss?: string;
  dateInscription?: string;
  // PP signataires PM
  signataires?: CreditSignataire[];
  // PM spécifique
  denomination?: string;
  rccm?: string;
  entreprise?: {
    rccm?: string;
    denomination?: string;
    statutJuridique?: string | number;
    nomDirigeant?: string;
    NumEnregistrement?: string;
    capitalSocial?: number;
    ncc?: string;
    dateCreation?: string;
  };
}

export interface CreditAvsFond {
  id?: number;
  statut: number; // 1 = enregistré, 2 = en validation FO, 3 = validé
  dateDemande?: string;
  mtDepositExige?: number;
  mtAvsfSollicite?: number;
  motif?: string;
  mtAvsf?: number;
  numPerfect?: string;
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

// ── Détail agence depuis le dashboard siège (statCrdAgence) ──────────────────
export interface CreditDetailAgence {
  montantTotal: number;
  demandeEnCrea: number;
  demandeArs: number;
  demandeEnComite: number;
  demandeEnLeveRecom: number;
  demandeCloture: number;
  demandeRejete: number;
  demandes: CreditDemande[];
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
  hypotheque?: number; // 1 = oui, 2 = non
  montantActeNotarie?: number;
  commentaire?: string;
}

export interface CreditObservationUser {
  id?: number;
  nom?: string;
  prenom?: string;
  nomPrenom?: string;
  profil?: { name?: string; libelle?: string };
  libelleAgence?: string;
}

export interface CreditObservation {
  id?: number;
  reference: string;
  libelle?: string;
  decision?: string;
  observation: string;
  operation?: string;
  date: string;
  createdAt?: string;
  user?: CreditObservationUser;
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
  objetCredit?: string | number;
  nbreEcheDiffere?: number;
  ar?: { nomPrenom?: string };
  typeActivite?: { libelle: string };
  numTransaction?: string; // N° demande Perfect
  acteNotarie?: number;    // 0 = non signé, 1 = signé (sur la demande)
  derogation?: number;     // 0 = normal, 1 = en dérogation, 2 = dérogation validée
}

export interface CreditUserGarantie {
  id?: number;
  nom?: string;
  prenom?: string;
}

export interface CreditMagasin {
  id?: number;
  numMagasin?: string;
  adresse?: string;
  telephone?: string;
}

export interface CreditFiche {
  demande: CreditFicheDemandeDetail;
  decision?: CreditDecisionFinale;
  garantieDecision?: CreditDecisionFinale;
  pret?: { numPret?: string; numContrat?: string };
  usersGaranties?: CreditUserGarantie[];
  magasins?: CreditMagasin[];
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

// ── Analyse financière ────────────────────────────────────────────────────────
export interface ActiviteVenteMensuelle {
  id?: number;
  mois?: string;
  montant?: number;
  statut?: string | number;
  refDemande?: string;
}

export interface ActiviteVenteJournaliere {
  id?: number;
  jour?: string;
  montant?: number;
  statut?: string | number;
  refDemande?: string;
}

export interface ActiviteCredit {
  id?: number;
  refDemande?: string;
  libelle?: string;
  typeAnalyse?: string;
  commune?: string | { id?: number; libelle?: string };
  quartier?: string;
  rue?: string;
  boitePostale?: string;
  typeActivite?: CreditTypeActivite;
  niveauActivite?: number;
  margePondere?: number;
  valDernierAchat?: number;
  dateDernierAchat?: string;
  venteJournalieres?: ActiviteVenteJournaliere[];
  venteMensuelles?: ActiviteVenteMensuelle[];
  achatsMensuels?: AchatMensuel[];
}

export interface AchatMensuel {
  id?: number;
  mois?: string;
  montant?: number;
  statut?: string | number;
  refDemande?: string;
  activite?: number;
}

export interface ChargeExploitation {
  id?: number;
  libelle?: string;
  typeCharge?: string;
  montant?: number;
  statut?: string | number;
  refDemande?: string;
}

export interface CreanceClient {
  id?: number;
  libelle?: string;
  montant?: number;
  echeance?: string;
  statut?: string | number;
  refDemande?: string;
}

export interface StockItem {
  id?: number;
  libelle?: string;
  montant?: number;
  statut?: string | number;
  refDemande?: string;
}

export interface DetteFournisseur {
  id?: number;
  libelle?: string;
  montant?: number;
  echeance?: string;
  statut?: string | number;
  refDemande?: string;
}

export interface TresorerieDisponible {
  caisse?: number;
  banque?: number;
  mobileMoney?: number;
}

export interface ProfilFamilial {
  situationMatrimoniale?: string;
  nbreEpouses?: number;
  nbreEnfants?: number;
  niveauInstruction?: string;
  regimeMatrimonial?: string;
  loyerMensuel?: number;
  scolarite?: number;
  sante?: number;
  autresChargesFamiliales?: number;
}

export interface MembreMenage {
  id?: number;
  nom?: string;
  relation?: string;
  age?: number;
  activite?: string;
  revenu?: number;
  refDemande?: string;
}

export type TypeActif = 'IMMOBILIER' | 'VEHICULE' | 'EQUIPEMENT' | 'DAT' | 'AUTRE';

export interface ActifGarantie {
  id?: number;
  type?: TypeActif;
  libelle?: string;
  valeurEstimee?: number;
  localisation?: string;
  superficie?: number;
  marque?: string;
  annee?: number;
  banque?: string;
  echeance?: string;
  statut?: string;
  refDemande?: string;
}

export interface CautionSolidaire {
  id?: number;
  nom?: string;
  prenom?: string;
  telephone?: string;
  profession?: string;
  adresse?: string;
  montantCaution?: number;
  refDemande?: string;
}

export interface DocumentAnalyse {
  id?: number;
  libelle?: string;
  typeDocument?: string;
  document?: string;
  refDemande?: string;
  createdAt?: string;
  user?: { nomPrenom?: string };
}

export interface CreditAnalyseDemandeDetail extends CreditFicheDemandeDetail {
  activites?: ActiviteCredit[];
  chargesExploitation?: ChargeExploitation[];
  creances?: CreanceClient[];
  stocks?: StockItem[];
  dettes?: DetteFournisseur[];
  tresorerie?: TresorerieDisponible;
  profilFamilial?: ProfilFamilial;
  membresMenage?: MembreMenage[];
  actifsGaranties?: ActifGarantie[];
  cautionsSolidaires?: CautionSolidaire[];
  documentsAnalyse?: DocumentAnalyse[];
  swot?: CreditSWOT;
  propositionAR?: CreditPropositionAR;
  precomites?: CreditComiteDecision[];
  comites?: CreditComiteDecision[];
}

// ── Action workflow payload ───────────────────────────────────────────────────
export interface CreditActionPayload {
  refDemande: string;
  observation: string;
  password: string;
  decision?: number;
  checkliste?: string[];
}

// ── Actifs & Garanties (endpoint: /getGarantiesDemande) ──────────────────────

export interface GarantieMedia {
  id?: number;
  url?: string;
  libelle?: string;
}

export interface GarantieVehicule {
  id?: number;
  marque?: string;
  typeProPerso?: string;        // Professionnel / Particulier
  immatriculation?: string;
  couleur?: string;
  typeCommercial?: string;
  typeTechnique?: string;
  evaluation?: string;
  nouvelleAcquisition?: number; // 1=oui, 0=non
  typeVehicule?: string;
  dateMiseEnCirculation?: string;
  valeurAchat?: number;
  valeurEstime?: number;
  miniComm?: number;            // 1=Oui, 2=Non
  vehiculeVu?: number;          // 1=Oui, 2=Non
  garantie?: number;            // 1=Oui, 2=Non
  proprietaire?: 'D' | 'C' | string;
  images?: GarantieMedia[];
  documents?: GarantieMedia[];
}

export interface GarantieImmobilisation {
  id?: number;
  typePropriete?: number;       // 1=Local, 2=Terrain
  dateAcquisition?: string;
  titreFoncier?: string;
  lot?: string;
  ilot?: string;
  quantite?: number;
  garantie?: number;            // 1=Oui, 2=Non
  superficie?: number;
  adressDescr?: string;
  valeurAchat?: number;
  valeurEstime?: number;
  proprietaire?: 'D' | 'C' | string;
  images?: GarantieMedia[];
  documents?: GarantieMedia[];
}

export interface GarantieMateriel {
  id?: number;
  designation?: string;
  valeurAchat?: number;
  dateAcquisition?: string;
  quantite?: number;
  valeurEstime?: number;
  garantie?: number;
  evaluation?: string;
  proprietaire?: 'D' | 'C' | string;
  images?: GarantieMedia[];
  documents?: GarantieMedia[];
}

export interface GarantieDAT {
  id?: number;
  banque?: string;
  montant?: number;
  dateEcheance?: string;
  dateEffet?: string;
  duree?: number;
  numeroPerfect?: string;
  garantie?: number;
  images?: GarantieMedia[];
  documents?: GarantieMedia[];
}

export interface GarantieType {
  id: number;
  libelle?: string;
  garanties: (GarantieVehicule | GarantieImmobilisation | GarantieMateriel | GarantieDAT)[];
  total?: number;
  total_prime?: number;
}

export interface GarantiesCautionSolidaire {
  id?: number;
  nom?: string;
  prenom?: string;
  genre?: string;
  telephone?: string;
  profession?: string;
  adresse?: string;
  quartier?: string;
  rue?: string;
  lieuNaissance?: string;
  nationalite?: CreditNationalite;
  revenu?: number;
  montantCaution?: number;
  photoProfil?: string;
  images?: GarantieMedia[];
  documents?: GarantieMedia[];
}

export interface CreditActifCirculantStock {
  id?: number;
  designation?: string;
  description?: string;
  quantite?: number;
  cout?: number;
  prix?: number;
}

export interface GarantiesData {
  typeGaranties: GarantieType[];
  crCaution: GarantiesCautionSolidaire[];
  actifCirculantStock?: CreditActifCirculantStock[];
}

export const GARANTIE_TYPE_IDS = {
  IMMOBILISATION: 1,
  MATERIEL_PRO: 2,
  BIEN_MOBILIER_FAMILLE: 3,
  VEHICULE: 4,
  DEPOSIT: 5,
  DAT: 6,
} as const;

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
