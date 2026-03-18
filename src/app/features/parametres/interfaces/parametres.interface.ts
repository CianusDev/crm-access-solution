export interface ParametresProfil {
  id: number;
  name: string;
  libelle?: string;
}

export interface ServiceItem {
  id: number;
  libelle: string;
}

export interface ParametresAgence {
  id: number;
  libelle: string;
  code?: string;
}

export interface ParametresCommune {
  id: number;
  libelle: string;
}

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  phone?: string;
  flotte?: string;
  matricule?: string;
  sexe?: string;
  code?: string;
  fonction?: string;
  dateNaiss?: string;
  nationalite?: string;
  cni?: string;
  typPiece?: string;
  situation?: string;
  adresse?: string;
  quartier?: string;
  statut?: number;
  profil?: ParametresProfil;
  service?: ServiceItem;
  agence?: ParametresAgence;
  commune?: ParametresCommune;
  zone?: { id: number; libelle: string };
  sousZone?: { id: number; libelle: string };
}

export interface SaveUtilisateurDto {
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  profilUser: number;
  serviceUser: number;
  agenceUser: number;
  sexe: string;
  commune?: number;
}

export interface UpdateUtilisateurDto {
  utilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  profil: number;
  service: number;
  agence: number;
  sexe?: string;
  commune?: number;
  dateNaissance?: string;
  fonction?: string;
  numPiece?: string;
  situationMatri?: string;
  quartier?: string;
  matricule?: string;
  flotte?: string;
  adresse?: string;
  typPiece?: string;
  nationalite?: string;
}

export interface PermissionTypeCredit {
  typeCredit: number;
  libelle: string;
  type: string; // '0' | '1' | '2'
}

export interface ZoneItem {
  id: number;
  libelle: string;
}
