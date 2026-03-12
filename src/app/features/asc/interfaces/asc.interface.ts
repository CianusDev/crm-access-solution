export interface AscAgence {
  id: number;
  libelle: string;
}

export interface AscClientGerant {
  nomDirigeant?: string;
}

export interface AscClient {
  id: number;
  codeClient: string;
  nomPrenom: string;
  typeAgent: 'SC' | 'PP' | string;
  agence: AscAgence;
  dateOuvertureCompte?: string;
  nbreChequeRemise: number;
  nbreIncidentPaie: number;
  nbreAvChequeBenef: number;
  montantChequeAccordeAsc: number;
  montantMaxCreditObtenu?: number;
  autreCreditBeneficie: { typeCreditBenef: string }[];
  gerant?: AscClientGerant;
  historiqueAvCheque?: AscDemande[];
}

export interface AscBanque {
  id: number;
  libelle: string;
}

export interface AscNaturePrestation {
  id: number;
  libelle: string;
}

export interface AscCheque {
  id: number;
  numcheque: string;
  numTransaction: string;
  tireur: string;
  banque: string;
  montantCheque: number;
  dateCheque?: string;
  imageCheque?: string;
  image?: string;
  checkliste?: string; // JSON stringified number[]
}

export interface AscObservation {
  decision: string;
  date: string;
  observation: string;
  user: { nom: string; prenom: string; profil: string };
}

export interface AscDemande {
  id: number;
  numDemandeAsc?: string;
  dateRemise?: string;
  dateDemande?: string;
  datedemande?: string;
  montantSollicite: number;
  montantMaxEncaisse?: number;
  montantAccorde?: number;
  autreCreditEncours?: string;
  natureObjetReglement?: string;
  statut: number;
  description?: string;
  client?: AscClient;
  cheque: AscCheque;
  preuveTransaction?: string;
  preuveEntreprise?: string;
  observation?: AscObservation[];
  user?: { nom: string; prenom: string };
  agence?: AscAgence;
  decision?: {
    decision?: number;
    observation?: string;
    dateDecision?: string;
    user?: { nom: string; prenom: string };
  };
}

export interface AscTireur {
  dateRemise?: string;
  client?: string;
  tireur?: string;
  bankTireur?: string;
  nature?: string;
  agence?: string;
}

export interface AscDashboardAgence {
  libelle: string;
  avcAttente: number;
  avcValide: number;
  montDebourse: number;
}

export interface AscDashboard {
  totalCheques: number;
  totalAscAttente: number;
  totalAscValide: number;
  totalAscDecaisAnul: number;
  totalAscRejette: number;
  montTotalAscDebourse: number;
  montTotalAscRejette: number;
  topAgences: { libelle: string; montant: number }[];
  agences: AscDashboardAgence[];
}

export interface SaveAscDto {
  codeClient: string;
  tireur: string;
  banque: number;
  numcheque: string;
  numTransaction: string;
  montantCheque: number;
  dateCheque: string;
  montantMaxEncaisse: number;
  montantSollicite: number;
  autreCreditEncours: string[];
  naturePrestation?: number;
  description?: string;
  // Files sent as FormData
}
