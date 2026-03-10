export interface CoraAgent {
  id: number;
  typeUser?: number;
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
  commune: CoraCommune;
  quartier: string;
  rue: string;
  user: CoraUser;
  agents: CoraAgent[];
  statut: number;
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
