export interface CoraAgent {
  id: number;
  reference?: string;
  nomPrenom?: string;
  pmobile?: string;
  commune?: CoraCommune;
  quartier?: string;
  rue?: string;
  typeUser?: number;
  statut?: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CoraUser {
  id?: number;
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

// Sous-objet "agent" présent dans les réponses de l'ancienne API
export interface LegacyAgentData {
  situationMat?: number | string;
  situationMatri?: number | string; // variante old API
  mobile?: string;
  ancieneteLocalAn?: number | string;
  ancieneteLocalMois?: number | string;
  bail?: number | string;
  lot?: string;
  ilot?: string;
  immeuble?: string;
  etage?: number | string;
  porte?: number | string;
  quartier?: string;
  rue?: string;
  typeFacture?: number | string;
  facture?: string;
  tel3g?: number | string;
  internet?: string | number;
  reperes?: string | number;
  espaceClient?: boolean;
  camera?: boolean;
  securite?: boolean;
  caisseIsole?: boolean;
  enDur?: boolean;
  ephemere?: boolean;
  caisseNonIsole?: boolean;
}

export interface Cora {
  id: number;
  reference?: string;
  designation?: string;
  email?: string;
  perfect?: string;
  pmobile?: string;
  mobile?: string;
  fixe?: string;
  commune?: CoraCommune;
  quartier?: string;
  rue?: string;
  nombrePtService?: number | string;
  formuleJuridique?: number;
  capital?: number;
  rccm?: string;
  ncc?: string;
  enregistreLe?: string;
  civilite?: number;
  nomPrenom?: string;
  fonction?: string;
  user?: CoraUser;
  agents?: CoraAgent[];
  statut?: number;
  // Mandataire social (détail)
  dateNaiss?: string;
  lieuNaiss?: string;
  nationalite?: { id: number; nationalite?: string } | number;
  pays?: { id: number; nationalite?: string };
  typePiece?: number;
  numeroPiece?: string;
  situationMat?: number | string;
  situationMatri?: number | string; // variante old API
  contactMandataire?: string;
  ancieneteMmAn?: number;
  ancieneteMmMois?: number;
  dateCreation?: string;
  nombreEmploye?: number;
  // Local
  lot?: string;
  ilot?: string;
  bail?: number;
  ancieneteLocalAn?: number;
  ancieneteLocalMois?: number;
  immeuble?: string;
  etage?: string;
  porte?: string;
  typeFacture?: number;
  facture?: string;
  reperes?: string;
  autrePartners?: string;
  debit?: number;
  internet?: string;
  description?: string;
  enDur?: boolean;
  ephemere?: boolean;
  espaceClient?: boolean;
  camera?: boolean;
  securite?: boolean;
  caisseIsole?: boolean;
  caisseNonIsole?: boolean;
  partners?: string[] | string;
  typeDevice?: string[] | string;
  // Sous-objet présent dans les réponses de l'ancienne API
  agent?: LegacyAgentData;
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
  force?: string; // JSON string
  faiblesse?: string; // JSON string
  commentaire?: string;
}

export interface Decision {
  reference?: string;
  decision?: number;
  observation?: string;
  dateDecision?: string;
  etat?: number;
  status?: number;
  user?: { nom: string; prenom: string; libelle: string };
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
  lot?: string;
  ilot?: string;
  immeuble?: string;
  etage?: string;
  porte?: string;
  ancieneteLocalAn?: number;
  ancieneteLocalMois?: number;
  reperes?: string;
  bail?: number;
  typeFacture?: string;
  facture?: string;
  debit?: number;
  tel3g?: number | string; // nom old API, fallback
  internet?: string | number;
  description?: string;
  typeDevice?: string[] | string;
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

export interface CoraRefDesig {
  id: number;
  ref?: string;
  reference?: string;
  designation: string;
}

export interface CreateAgentFormData {
  communes: { id: number; libelle: string }[];
  coras: CoraRefDesig[];
}

export interface CreateAgentDto {
  cora: number;
  commune: number;
  typeUser: number;
  mobile: string;
  fixe?: string;
  bail: number;
  lot?: string;
  ilot?: string;
  immeuble?: string;
  etage?: string;
  porte?: string;
  ancieneteLocalAn: number;
  ancieneteLocalMois: number;
  quartier: string;
  rue?: string;
  typeFacture?: string;
  facture?: string;
  reperes: string;
  debit: number;
  internet: number | string;
  description: string;
  espaceClient?: boolean;
  camera?: boolean;
  securite?: boolean;
  caisseIsole?: boolean;
  enDur?: boolean;
  ephemere?: boolean;
  caisseNonIsole?: boolean;
  typeDevice?: string[];
  agent?: number;
}
