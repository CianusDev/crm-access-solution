export interface CoraAgent {
  id: number;
  reference?: string;
  nomPrenom?: string;
  commune?: CoraCommune;
  quartier?: string;
  rue?: string;
  typeUser?: number;
  statut?: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CoraUser {
  nom: string;
  prenom: string;
}

export interface CoraCommune {
  id: number;
  libelle: string;
}

export interface Gestionnaire {
  id: number;
  nom: string;
  prenom: string;
}

export interface Cora {
  id: number;
  reference: string;
  designation: string;
  email: string;
  perfect: string;
  pmobile: string;
  mobile?: string;
  fixe?: string;
  commune: CoraCommune;
  quartier: string;
  rue: string;
  nombrePtService?: number;
  formuleJuridique?: number;
  capital?: number;
  rccm?: string;
  ncc?: string;
  enregistreLe?: string;
  user: CoraUser;
  agents: CoraAgent[];
  statut: number;
}

export interface FileCoraModel {
  reference?: string;
  libelle?: string;
  lien?: string;
}

export interface Evaluation {
  historique?: string;
  agenceProche?: string;
  distanceAgence?: number;
  pointCoraProche?: string;
  distanceCoraProche?: number;
  securite?: string;
  force?: string;   // JSON string
  faiblesse?: string; // JSON string
  commentaire?: string;
}

export interface Decision {
  reference?: string;
  decision?: number;
  observation?: string;
  dateDecision?: string;
  user?: { nom: string; prenom: string };
}

export interface AgentCoraDetail {
  id: number;
  reference?: string;
  nomPrenom?: string;
  mobile?: string;
  fixe?: string;
  pmobile?: string;
  email?: string;
  commune?: CoraCommune;
  quartier?: string;
  rue?: string;
  latitude?: number | null;
  longitude?: number | null;
  typeUser?: number;
  statut?: number;
  enDur?: boolean;
  ephemere?: boolean;
  espaceClient?: boolean;
  camera?: boolean;
  securite?: boolean;
  caisseIsole?: boolean;
  caisseNonIsole?: boolean;
  evaluation?: Evaluation;
  decision?: Decision[];
  images?: FileCoraModel[];
  documents?: FileCoraModel[];
  cora?: {
    id?: number;
    designation?: string;
    perfect?: string;
    email?: string;
  };
}

export interface AgentEnAttente {
  id: number;
  reference?: string;
  nomPrenom?: string;
  typeUser?: number;
  commune?: CoraCommune;
  quartier?: string;
  rue?: string;
  statut?: number;
  cora?: {
    designation?: string;
    nomPrenom?: string;
  };
}

export interface CoraFiltre {
  gestionnaire?: number | null;
  commune?: number | null;
  quartier?: string;
  rue?: string;
}

export interface ListCoraData {
  coras: Cora[];
  communes: { id: number; libelle: string }[];
  gestionnaires: Gestionnaire[];
}
