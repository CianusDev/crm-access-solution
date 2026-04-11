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

export interface CreditZone {
  id: number;
  libelle: string;
  code?: string;
}

export interface CreditAnalysteRisque {
  id: number;
  codeAr: string;
  nom: string;
  prenom: string;
  libelle?: string; // nom + prenom
}

export interface CreditSuperviseurPmeAffectation {
  id: number;
  nom: string;
  prenom: string;
  profil?: string;
  libelle?: string; // nom + prenom (+ profil)
}

export interface CreditSignataire {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  sexe?: string;
  situationMatri?: string;
  codTypePiece?: string;
  numPiece?: string;
  nationalite?: CreditNationalite;
  lieuNaiss?: string;
  quartier?: string;
  rue?: string;
  commune?: CreditCommune;
  dateNaissance?: string;
  dateStatut?: string;
  dateDelivrancePiece?: string;
  dateExpirationPiece?: string;
  lieuDelivrance?: string;
  numTelephone?: string;
  photoProfil?: string;
}

export interface CreditClient {
  id?: number;
  codeClient: string;
  nomPrenom: string;
  nom?: string;
  typeAgent: 'PP' | 'PM' | 'SC' | string;
  tpePme?: string; // "PME" | "TPE"
  agence?: { id?: number; code?: string; libelle: string };
  // Contact commun
  indicatifCel?: string;
  numCel?: string; // alias legacy
  telPortable?: string; // champ réel API
  telFixe?: string;
  telConjoint?: string;
  email?: string;
  nationalite?: CreditNationalite;
  // Adresse commune PP & PM
  commune?: CreditCommune;
  quartier?: string;
  rue?: string;
  lot?: string;
  villa?: string;
  facture?: string; // Adresse CIE / SODECI
  adresse?: string; // Adresse postale
  batimentProche?: string;
  domicille?: string;
  // PP spécifique
  sexe?: string;
  situationMatri?: string;
  typePiece?: string;
  numPiece?: string;
  validitePiece?: string;
  lieuNaiss?: string;
  profession?: string;
  dataNaiss?: string;
  dateInscription?: string;
  latittude?: string | number | null;
  longitude?: string | number | null;
  // Signataires (PM)
  signataires?: CreditSignataire[];
  // PM spécifique
  denomination?: string;
  rccm?: string;
  entreprise?: {
    codeAdherent?: string;
    nomDirigeant?: string;
    dateNaissanceDirig?: string;
    NumEnregistrement?: string;
    capitalSocial?: number;
    statutJuridique?: string | number;
    dateCreation?: string;
    rccm?: string;
    ncc?: string;
    denomination?: string;
    typeActivite?: number;
    typeClientele?: number;
    ancienneteSecteur?: string;
    concurence?: number;
    impactEnvironnement?: number;
    typeLocal?: number;
    statutLocal?: number;
    ancienneteLocal?: string;
    impots?: number;
    numCnss?: string;
    numContribuable?: string;
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
  bonDeCommande?: CreditBonDeCommande;
  crFacture?: CreditFacture;
  autreCommentAgCredit?: string;
}

export interface CreditBonDeCommande {
  id?: number;
  numBonCmde?: string;
  entreprise?: string;
  dateBonCmde?: string;
  mtHt?: number;
  mtTtc?: number;
  adresse?: string;
  tel?: string;
  cel?: string;
  rccm?: string;
  cc?: string;
}

export interface CreditFacture {
  id?: number;
  numFacture?: string;
  entreprise?: string;
  dateFacture?: string;
  dateEcheance?: string;
  mtHt?: number;
  mtTtc?: number;
  adresse?: string;
  tel?: string;
  cel?: string;
  rccm?: string;
  cc?: string;
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

// ── Tirage découvert ──────────────────────────────────────────────────────────
export interface CreditDemandeDecouvert extends CreditDemande {
  dateEffet?: string;
}

export interface CreditTirageSearch {
  demande: CreditDemandeDecouvert;
  decision: { montantEmprunte?: number; montantPropose?: number };
  tirages: CreditDemande[];
}

export interface CreditSaveTirage {
  codeClient: string;
  typeCredit: number;
  objetCredit: string;
  typeActivite: number;
  montantSollicite: number;
  nbreEcheanceSollicite: number;
  montantEcheSouhaite: number;
  nbreEcheDiffere?: number | null;
  description: string;
  numDmde: string;
}

// ── Employeurs éligibles ──────────────────────────────────────────────────────

export interface EmployeurSecteurActivite {
  id: number;
  libelle: string;
}

export interface EmployeurObservation {
  id?: number;
  action?: string;
  observation?: string;
  date?: string;
  user?: { nomPrenom?: string; profil?: { libelle?: string } };
}

export interface EmployeurDocument {
  id: number;
  libelle: string;
  description?: string;
  lien?: string;
  createdAt?: string;
}

export interface Employeur {
  id?: number;
  nomEntreprise?: string;
  secteurActivite?: EmployeurSecteurActivite | EmployeurSecteurActivite[];
  capitalSocial?: number;
  formuleJuridique?: number;
  dateCreation?: string;
  associes?: number;
  banque?: string | string[] | { libelle?: string }[];
  clients?: string[];
  fournisseurs?: string[];
  masseSalariale?: number;
  chiffreAffaire?: number;
  nbreCddEnt?: number;
  nbreCddCA?: number;
  nbreCdiEnt?: number;
  nbreCdiCA?: number;
  nbreAgentmEnt?: number;
  nbreAgentmCA?: number;
  nbreCadreEnt?: number;
  nbreCadreCA?: number;
  nbreEmplEnt?: number;
  nbreEmplCA?: number;
  nbreEmplBacarise?: number;
  commentaire?: string;
  codeAdh?: string;
  statut?: number;
  // Documents et observations chargés dans le détail
  documents?: EmployeurDocument[];
  observations?: EmployeurObservation[];
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
  latittude?: string | number | null; // typo conservé pour compatibilité API
  longitude?: string | number | null;
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

export interface CreditUpdateDemande {
  refDemande: string;
  codeClient: string;
  typeCredit: number;
  objetCredit: string;
  typeActivite: number;
  montantSollicite: number;
  nbreEcheanceSollicite: number;
  montantEcheSouhaite: number;
  nbreEcheDiffere?: number | null;
  description: string;
  numTransaction?: string;
  fraisDemande?: number | null;
  margePondere?: number | null;
  autreCommentAgCredit?: string;
}

export interface CreditSaveMagasin {
  refDemande: string;
  codeClient: string;
  crMagasin?: number | null;
  numMagasin?: string;
  blocCommerciale?: string;
  etage?: string;
  localisation?: string;
  MontantPartPorte?: number | null;
  montantLoyer?: number | null;
  fraisReservation?: number | null;
  acompte?: number | null;
  acomptePercu?: number | null;
}

export interface CreditSaveFacture {
  refDemande: string;
  crFacture?: number | null;
  numFacture?: string;
  entreprise?: string;
  dateFacture?: string;
  dateEcheance?: string;
  mtHt?: number | null;
  mtTtc?: number | null;
  adresse?: string;
  refClient?: string;
  tel?: string;
  cel?: string;
  rccm?: string;
  cc?: string;
}

export interface CreditSaveBonCommande {
  refDemande: string;
  bonDeCommande?: number | null;
  numBonCmde?: string;
  entreprise?: string;
  dateBonCmde?: string;
  mtHt?: number | null;
  mtTtc?: number | null;
  adresse?: string;
  tel?: string;
  cel?: string;
  rccm?: string;
  cc?: string;
}

// ── Fiche crédit ─────────────────────────────────────────────────────────────
export interface CreditDecisionFinale {
  id?: number;
  dateDemande?: string | Date;
  dateDecision?: string | Date;
  refDemande?: string;
  montant?: number; // alias
  montantPropose?: number;
  fraisDossier?: number;
  commissionDeboursement?: number;
  assurDecesInvalidite?: number;
  montantEmprunte?: number;
  duree?: number;
  mensualite?: number;
  montantCaution?: number;
  dateEcheanceSouhaite?: string | Date;
  periodeGrace?: number; // 1 = oui, 2 = non
  nbreMoisGrace?: number;
  commentaire?: string;
  motivation?: string;
  hypotheque?: number; // 1 = oui, 2 = non
  montantActeNotarie?: number;
  acteNotarie?: number;
  authGage?: number;
  deposit?: number;
  tauxCouverture?: number;
  assurMultiRisk?: number;
  signature?: any;
  checkliste?: any;
  comiteClt?: string;
  statut?: number;
  argumentaire?: any;
  user?: {
    id?: string;
    nomPrenom?: string;
    nom?: string;
    prenom?: string;
    agence?: { libelle?: string };
    profil?: { libelle?: string };
  };
  decideur?: {
    id?: string;
    nomPrenom?: string;
    nom?: string;
    prenom?: string;
    agence?: { libelle?: string };
    profil?: { libelle?: string };
  };
  perfectsaver?: any;
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
  userId?: number;
  user?: { nomPrenom?: string };
}

/** Pré-évaluation ACJ / CE (crédit type 002 — aligné legacy `preEvaluationAcjCe`) */
export interface CreditPreEvaluationAcjCe {
  /** Présent / truthy lorsque la pré-évaluation CE est saisie (legacy `ce`) */
  ce?: unknown;
  relationClt?: string;
  relationEmploye?: string;
  relationVosinage?: string;
  affluenceActivite?: string;
  quantiteStock?: string;
  qualiteStock?: string;
  relationCommercial?: string;
  evolutionMtCollect?: string;
  frequenceMtCollect?: string;
  avisAcjDmde?: string;
  avisCeDmde?: string;
  lastMonthCollect?: number;
  montRecurrent?: number;
  enquetteVoisinage?: string;
  recommandationCe?: string;
}

export interface ProfilEntrepreneur {
  id?: number;
  refDemande?: string;
  parcoursPro?: string;
  niveauEducation?: string;
}

export interface CreditFicheDemandeDetail extends CreditDemande {
  description?: string;
  objetCredit?: string | number;
  nbreEcheDiffere?: number;
  checkliste?: string | number[] | null;
  ar?: { nom?: string; prenom?: string; nomPrenom?: string };
  typeActivite?: { libelle: string };
  numTransaction?: string; // N° demande Perfect
  acteNotarie?: number; // 0 = non signé, 1 = signé (sur la demande)
  derogation?: number; // 0 = normal, 1 = en dérogation, 2 = dérogation validée
  preEvaluationAcjCe?: CreditPreEvaluationAcjCe;
  profilEnt?: ProfilEntrepreneur;
  /** Employeur lié (types 001 / 008 — `getDetailsDemande`) */
  employeur?: Employeur;
  /** Parfois renvoyé au niveau demande (sinon utiliser `CreditFiche.decision`) */
  decision?: CreditDecisionFinale;
}

export interface CreditUserGarantie {
  id?: number;
  nom?: string;
  prenom?: string;
}

export interface CreditMagasin {
  id?: number;
  numMagasin?: string;
  blocCommerciale?: string;
  etage?: string;
  localisation?: string;
  adresse?: string;
  telephone?: string;
  MontantPartPorte?: number;
  montantLoyer?: number;
  fraisReservation?: number | string;
  acompte?: number | string;
  acomptePercu?: number | string;
}

export interface CreditAutoInfo {
  id?: number;
  marque?: string;
  typeCommercial?: string;
  nbrePlace?: string | number;
  puissanceFiscale?: string | number;
  dateMiseEnCirculation?: string;
  immatriculation?: string;
  vehiculeVu?: string | number;
  couleur?: string;
}

export interface CreditFiche {
  demande: CreditFicheDemandeDetail;
  decision?: CreditDecisionFinale;
  garantieDecision?: CreditDecisionFinale;
  pret?: { numPret?: string; numContrat?: string };
  usersGaranties?: CreditUserGarantie[];
  magasins?: CreditMagasin[];
  infosCrAuto?: CreditAutoInfo[];
  nombreDemandes?: number;
}

// ── Résumé analyse ────────────────────────────────────────────────────────────
/** Un élément SWOT renvoyé par l'API (flat) */
export interface CreditSWOTItem {
  id?: number;
  refDemande?: string;
  typeAnalyse?: number; // 1=Force, 2=Faiblesse, 3=Opportunité, 4=Menace
  description?: string;
}

/** SWOT regroupé par catégorie (utilisé côté affichage) */
export interface CreditSWOT {
  forces: string[];
  faiblesses: string[];
  opportunites: string[];
  menaces: string[];
}

export interface CreditComiteDecision {
  id?: number;
  dateDemande?: string | Date;
  refDemande?: string;
  user?: {
    id?: number | string;
    nomPrenom?: string;
    nom?: string;
    prenom?: string;
    agence?: { libelle?: string };
    profil?: { name?: string; libelle?: string };
  };
  montantPropose?: number;
  fraisDossier?: number;
  montantEmprunte?: number;
  duree?: number;
  mensualite?: number;
  dateEcheanceSouhaite?: string | Date;
  periodeGrace?: number;
  nbreMoisGrace?: number;
  commentaire?: string;
  motivation?: string;
  hypotheque?: number;
  acteNotarie?: number;
  assurMultiRisk?: number;
  authGage?: number;
  montantActeNotarie?: number;
  deposit?: number;
  tauxCouverture?: number;
  commissionDeboursement?: number;
  assurDecesInvalidite?: number;
  argumentaire?: any;
  signature?: any;
  checkliste?: any;
  comiteClt?: string;
  montantCaution?: number;
  statut?: number; // 1=Approuvée
}

export interface CreditPropositionAR {
  id?: number;
  refDemande?: string;
  user_id?: string;
  user?: {
    id?: string;
    nomPrenom?: string;
    nom?: string;
    prenom?: string;
    agence?: { libelle?: string };
    profil?: { libelle?: string };
  };
  montantPropose?: number;
  fraisDossier?: number;
  montantEmprunte?: number;
  duree?: number;
  mensualite?: number;
  dateEcheanceSouhaite?: string | Date;
  periodeGrace?: number; // 1=Oui, 2=Non
  nbreMoisGrace?: number;
  hypotheque?: number; // 1=Oui, 2=Non
  acteNotarie?: number; // 1=Oui, 0/2=Non
  assurMultiRisk?: number; // 1=Oui, 0/2=Non
  authGage?: number;
  montantActeNotarie?: number;
  deposit?: number; // %
  tauxCouverture?: number; // %
  commissionDeboursement?: number;
  assurDecesInvalidite?: number;
  argumentaire?: string;
  motivation?: string;
  commentaire?: string;
  signature?: string;
  image?: string;
  checkliste?: any;
  typeVehicule?: any;
  nbVehiculeDme?: any;
  statut?: number;
}

export interface CreditContreEvaluation {
  // Identifiants
  id?: number;
  refDemande?: string;
  user?: {
    id?: string;
    nomPrenom?: string;
    nom?: string;
    prenom?: string;
    agence?: { libelle?: string };
    profil?: { libelle?: string };
  };

  // Paramètres financiers (identiques à PropositionAR)
  montantPropose?: number;
  fraisDossier?: number;
  montantEmprunte?: number;
  duree?: number;
  mensualite?: number;
  dateEcheanceSouhaite?: string | Date;
  periodeGrace?: number;
  nbreMoisGrace?: number;
  hypotheque?: number;
  acteNotarie?: number;
  assurMultiRisk?: number;
  montantActeNotarie?: number;
  deposit?: number;
  tauxCouverture?: number;
  commissionDeboursement?: number;
  assurDecesInvalidite?: number;
  argumentaire?: string;
  motivation?: string;
  commentaire?: string;
  signature?: string;
  image?: string;
  checkliste?: any;
  statut?: number;

  // Champs d'analyse bilan (spécifiques à contre-évaluation par Superviseur Risque)
  libelleActPrincipal?: string;
  libelleActPrincipalCom?: string;
  caJour?: string;
  caJourCom?: string;
  venteJour?: string;
  venteJourCom?: string;
  dernierAchatInfo?: string;
  dernierAchatCommentaire?: string;
  appreciationMargeVenteInfo?: string;
  appreciationMargeVenteCommentaire?: string;
  tresorerieInfo?: string;
  tresorerieCommentaire?: string;
  creanceClient?: string;
  creanceClientCom?: string;
  marchandiseTransit?: string;
  marchandiseTransitCom?: string;
  stockInfo?: string;
  stockCommentaire?: string;
  equipementInfo?: string;
  equipementCommentaire?: string;
  detteFournisseurInfo?: string;
  detteFournisseurCommentaire?: string;
  detteBanqueInfo?: string;
  detteBanqueCommentaire?: string;
  avanceClt?: string;
  avanceCltCom?: string;
  autreActiviteInfo?: string;
  autreActiviteRevenu?: string;
  risqueEntreprise?: string;
  caution?: string;
  qualiteEvaluationAC?: string;
  recommandationCA?: string;
  montantEcheance?: string;
  potentielEpargne?: string;
  autreProduit?: string;
  ca?: any;
  dateSignature?: any;
}

export interface CreditGarantieProposes {
  total?: number;
  montantTotal?: number;
  rapportCredit?: number;
  garanties?: Array<{ libelle: string; montant: number }>;
}

export interface CreditGarantieDecisionItem {
  libelle?: string;
  montant?: number;
  pourcentage?: number;
  montantDecision?: number;
  refTypeGarantie?: string;
  elements?: Array<{
    marque?: string;
    immatriculation?: string;
    typeVehicule?: string;
    valeurEstime?: number;
  }>;
}

export interface CreditGarantieDecision {
  total?: number;
  rapportCredit?: number;
  garanties?: CreditGarantieDecisionItem[];
}

export interface AuditLog {
  nom?: string;
  prenom?: string;
  action?: string;
  libelle?: string;
  subject_type?: string;
  subject_id?: number;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
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

export interface CreditCompteResultatCreditAnterieurActivite {
  vente?: number;
  achat?: number;
  margeComm?: number;
  chargeExplo?: number;
}

export interface CreditCompteResultatActivite {
  id?: number;
  libelle?: string;
  ventes?: number;
  achats?: number;
  margeCom?: number;
  chargeExpl?: number;
  resultNet?: number;
  creditAnt?: CreditCompteResultatCreditAnterieurActivite;
}

export interface CreditCompteResultatMontantCreditAnterieur {
  total?: number;
  creditAnt?: number;
}

export interface CreditCompteResultat {
  activitePrincipal?: CreditCompteResultatActivite;
  autresActivite?: Array<{
    id?: number;
    libelle?: string;
    resultNet?: number;
  }>;
  autreRevenuFamille?: CreditCompteResultatMontantCreditAnterieur;
  chargeFamilliale?: CreditCompteResultatMontantCreditAnterieur;
  soldeFamille?: CreditCompteResultatMontantCreditAnterieur;
  capaciteRemb?: CreditCompteResultatMontantCreditAnterieur;
}

export interface CreditResume {
  demande: CreditFicheDemandeDetail;
  aSwots?: CreditSWOTItem[];
  garantieProposes?: CreditGarantieProposes;
  proposition?: CreditPropositionAR;
  contreEvaluation?: CreditContreEvaluation;
  precomites?: CreditComiteDecision[];
  comites?: CreditComiteDecision[];
  decision?: CreditDecisionFinale;
  garantieDecision?: CreditGarantieDecision;
  nombreDemandes?: number;
  observations?: CreditObservation[];
  documentsAnalyse?: DocumentAnalyse[];
  compteResultat?: CreditCompteResultat;
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
  latitude?: string | number | null;
  longitude?: string | number | null;
  typeActivite?: CreditTypeActivite;
  niveauActivite?: number;
  margePondere?: number;
  valDernierAchat?: number;
  dateDernierAchat?: string;
  venteJournalieres?: ActiviteVenteJournaliere[];
  venteMensuelles?: ActiviteVenteMensuelle[];
  achatMensuel?: AchatMensuel[]; // Singulier comme dans l'API
  chargeExploitation?: ChargeExploitation[]; // présent dans activites[] côté API legacy
  margeCommerciale?: MargeCommerciale[]; // Singulier comme dans l'API
  Stock?: StockItem[]; // certains payloads API renvoient "Stock" (S majuscule)
  analyseFin?: {
    detteEtreprise?: number;
    detteFournisseur?: number;
    creanceClient?: number;
    avanceFournisseur?: number;
    tresorerie?: {
      espece?: number;
      banque?: number;
    };
    stock?: {
      totalStock?: number;
    };
    margeCommerciale?: {
      margeMoyenne?: number;
      margePondere?: number;
      margeAretenir?: number;
    };
    chargeExploitation?: {
      imprevu?: number;
      total?: number;
      sousTotal?: number;
    };
  };
}

export interface AchatMensuel {
  id?: number;
  refDemande?: string;
  activite?: number;
  article?: string; // Principaux produits achetés
  fournisseur?: string; // Site / Fournisseur
  frequence?: string; // Fréquence d'achat
  quantite?: number; // Quantité
  achatsMensuels?: number; // Montant des achats mensuels
}

export interface MargeCommerciale {
  id?: number;
  refDemande?: string;
  article?: string;
  quantite?: number;
  prixVente?: number;
  prixAchat?: number;
  marge?: number;
  sousTotal?: number;
  activite?: number | { id?: number };
}

export interface CrTypeCharge {
  id?: number;
  libelle?: string;
}

export interface ChargeExploitation {
  id?: number;
  charge?: CrTypeCharge | number; // objet retourné par l'API, id envoyé
  activite?: number;
  montant?: number;
  commentaire?: string;
  refDemande?: string;
}

export interface CreanceClient {
  id?: number;
  activite?: number;
  objet?: string; // Était libelle - changé pour correspondre au legacy
  montant?: number;
  duree?: number; // Nombre de jours
  solde?: number;
  recouvrMax?: number; // Pourcentage de recouvrement (max 80%)
  montArecevoir?: number; // Montant à recevoir
  echeance?: string;
  statut?: string | number;
  refDemande?: string;
  creanceClient?: number; // ID pour modification
}

// Stock pour section Achats (article + quantite + montantTotal)
export interface StockItem {
  id?: number;
  activite?: number;
  article?: string;
  quantite?: number;
  montantTotal?: number;
  refDemande?: string;
}

// Stock pour section Trésorerie (description + quantite + prix unitaire + assurances)
export interface TresorerieStockItem {
  id?: number;
  description?: string;
  libelle?: string; // Alias pour compatibilité API
  quantite?: number;
  prix?: number;
  montant?: number; // Calculé (quantite * prix)
  assurStock?: number; // 1=OUI, 2=NON
  garantie?: number; // 1=OUI, 2=NON
  refDemande?: string;
}

// Avances fournisseurs (nouveau)
export interface AvanceFournisseur {
  id?: number;
  activite?: number;
  objet?: string;
  montant?: number;
  dateVersAvc?: string; // Date de versement avance
  dateRecepMarch?: string; // Date de réception des marchandises
  resteApay?: number; // Reste à payer
  refDemande?: string;
  statut?: string | number;
  avancesFournisseur?: number; // ID pour modification
}

// Dettes fournisseurs (nouveau - séparé des dettes entreprise)
export interface DetteFournisseur {
  id?: number;
  activite?: number;
  objet?: string;
  montant?: number;
  datePaie?: string; // Date de paiement
  dateRecepMarch?: string; // Date de réception des marchandises
  solde?: number;
  echeance?: string; // Temporaire - pour compatibilité avec l'UI actuelle
  refDemande?: string;
  statut?: string | number;
  detteFournisseur?: number; // ID pour modification
}

// Historique des dettes entreprise (renommé - était DetteFournisseur)
export interface DetteEntreprise {
  id?: number;
  activite?: number;
  preteur?: string;
  montantEmprun?: number; // Montant emprunté
  dateDebut?: string;
  finEcheance?: string; // Fin échéance
  restantDu?: number; // Restant dû
  typeObjDette?: string; // Type et objet des dettes
  refDemande?: string;
  statut?: string | number;
  dette?: number; // ID pour modification
}

// Trésorerie disponible - Actif Circulant (CRUD dynamique comme legacy)
export interface TresorerieActifCirculant {
  id?: number;
  refDemande?: string;
  activite?: number; // ID activité
  libelle?: string; // Nom banque OU type espèce (Espèces du jour / Espèces cumulées)
  montant?: number;
  type?: number; // 1 = Espèce, 2 = Banque
  tresorerie?: number; // ID pour modification
}

// Legacy - utilisé dans les champs de AnalyseFinanciere (caisse/banque/mobileMoney)
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
  commentaire?: string;
}

export interface TresorerieFamille {
  id?: number;
  refDemande?: string;
  libelle?: string;
  montant?: number;
  type?: number; // 1 = Épargne, 2 = Dette
  typeCompte?: number; // 1 = Espèces, 2 = Banque
  provenance?: string;
}

export interface ChargeFamille {
  id?: number;
  refDemande?: string;
  typeCharge?: number;
  chargeMens?: string;
  montant?: number;
  commentaire?: string;
}

export interface MembreMenage {
  id?: number;
  membreFamille?: string; // Type de membre (Demandeur, Conjoint, Enfants, etc.)
  nombre?: number; // Nombre de personnes dans cette catégorie
  age?: number;
  activite?: string;
  revenus?: number;
  justifs?: string;
  refDemande?: string;
  menageRevenuFamille?: number; // ID pour modification
}

export type TypeActif =
  | 'IMMOBILIER'
  | 'VEHICULE'
  | 'EQUIPEMENT'
  | 'DAT'
  | 'BIEN_MOBILIER'
  | 'DEPOSIT'
  | 'AUTRE';

export interface ActifGarantie {
  id?: number;
  type?: TypeActif;
  valeurEstimee?: number;
  localisation?: string;
  superficie?: number;
  marque?: string;
  banque?: string;
  echeance?: string;
  statut?: string;
  refDemande?: string;
  // Commun à plusieurs types
  proprietaire?: string;
  garantie?: number;
  quantite?: number;
  valeurAchat?: number;
  dateAcquisition?: string;
  evaluation?: string;
  // Immobilier
  typePropriete?: string;
  adressDescr?: string;
  titreFoncier?: string;
  lot?: string;
  ilot?: string;
  justifs?: string;
  // DAT
  dureeDat?: number;
  dateEffetDat?: string;
  dateEcheanceDat?: string;
  numeroPerfectDat?: string;
  // Véhicule
  immatriculation?: string;
  couleur?: string;
  typeVehicule?: string;
  dateMiseEnCirculation?: string;
  nbrePlace?: number;
  typeCommercial?: string;
  typeTechnique?: string;
  vehiculeVu?: string;
  typeProPerso?: string;
  nouvelleAcquisition?: number; // 1=oui, 0=non
  miniComm?: number; // 1=Oui, 2=Non
  societeCr?: string;
  societe?: string;
  // Lien caution (propriétaire)
  idCaution?: number;
  // Équipement
  designation?: string;
  // Deposit (espèces en banque)
  especeBanque?: number;
  typeCompte?: string;
  // Médias
  images?: GarantieMedia[];
  documents?: GarantieMedia[];
}

export interface CautionSolidaire {
  id?: number;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  genre?: string;
  situationMatri?: string | number;
  contact?: string;
  telephone?: string;
  typePiece?: string | number;
  numPiece?: string;
  revenu?: number;
  justif?: string;
  nationalite?: CreditNationalite | number;
  profession?: string;
  ville?: CreditCommune | number;
  commune?: CreditCommune | number;
  quartier?: string;
  rue?: string;
  adresse?: string;
  montantCaution?: number;
  refDemande?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  photoProfil?: string;
  images?: GarantieMedia[];
  documents?: GarantieMedia[];
}

export interface CreditAnalyseDemandeDetail extends CreditFicheDemandeDetail {
  imprevuChargeFamille?: number; // % imprévus charges familiales (10/15/20/25/30)
  activites?: ActiviteCredit[];
  chargesExploitation?: ChargeExploitation[];
  creances?: CreanceClient[];
  avancesFournisseurs?: AvanceFournisseur[];
  stocks?: StockItem[];
  dettes?: DetteFournisseur[]; // Alias temporaire pour dettesFournisseurs (compatibilité)
  dettesFournisseurs?: DetteFournisseur[];
  dettesEntreprise?: DetteEntreprise[];
  tresorerie?: TresorerieDisponible; // Ancien format (simple caisse/banque/mobileMoney)
  tresoreriesActifCirculant?: TresorerieActifCirculant[]; // Nouveau format CRUD (legacy-compatible)
  profilFamilial?: ProfilFamilial;
  tresoreriesFamiliales?: TresorerieFamille[];
  chargesFamiliales?: ChargeFamille[];
  membresMenage?: MembreMenage[];
  actifsGaranties?: ActifGarantie[];
  cautionsSolidaires?: CautionSolidaire[];
  documentsAnalyse?: DocumentAnalyse[];
  swot?: CreditSWOT;
  propositionAR?: CreditPropositionAR;
  precomites?: CreditComiteDecision[];
  comites?: CreditComiteDecision[];
}

// ── Payloads comité / décision finale ────────────────────────────────────────
export interface CreditSaveComite {
  refDemande: string;
  decision: number; // toujours 1
  montantPropose: number;
  montantEmprunte: number; // = montantPropose
  mensualite: number; // = montantPropose
  duree: number; // = 1 (1 mois fixe pour tirage)
  fraisDossier: number;
  commissionDeboursement: number;
  assurDecesInvalidite: number;
  assurMultiRisk: number;
  acteNotarie: number;
  montantActeNotarie: number;
  authGage: number;
  hypotheque: number; // = 2
  tauxCouverture: number;
  periodeGrace: number; // = 2
  nbreMoisGrace: number;
  deposit: number;
  dateEcheanceSouhaite?: string;
  argumentaire: string;
  motivation?: string;
  checkliste?: string[];
  // Champ comité vs décision finale
  comite?: number;
  precomite?: number;
  comiteClt?: number;
}

export interface CreditSaveDecisionFinale {
  refDemande: string;
  montantPropose: number;
  montantEmprunte: number;
  mensualite: number;
  duree: number;
  fraisDossier: number;
  commissionDeboursement: number;
  assurDecesInvalidite: number;
  assurMultiRisk: number;
  acteNotarie: number;
  montantActeNotarie: number;
  authGage: number;
  hypotheque: number;
  tauxCouverture: number;
  periodeGrace: number;
  nbreMoisGrace: number;
  deposit: number;
  dateEcheanceSouhaite?: string;
  commentaire: string;
  checkliste?: string[];
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
  lien?: string;
  libelle?: string;
}

export interface GarantieVehicule {
  id?: number;
  marque?: string;
  typeProPerso?: string; // Professionnel / Particulier
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
  miniComm?: number; // 1=Oui, 2=Non
  vehiculeVu?: number; // 1=Oui, 2=Non
  garantie?: number; // 1=Oui, 2=Non
  proprietaire?: 'D' | 'C' | string;
  images?: GarantieMedia[];
  documents?: GarantieMedia[];
}

export interface GarantieImmobilisation {
  id?: number;
  typePropriete?: number; // 1=Local, 2=Terrain
  dateAcquisition?: string;
  titreFoncier?: string;
  lot?: string;
  ilot?: string;
  quantite?: number;
  garantie?: number; // 1=Oui, 2=Non
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
  prix?: number;
  cout?: number; // calculé = quantite * prix
  assurStock?: number; // 1=OUI, 2=NON
  garantie?: number; // 1=OUI, 2=NON
}

export interface GarantiesData {
  typeGaranties: GarantieType[];
  crCaution: CautionSolidaire[];
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
