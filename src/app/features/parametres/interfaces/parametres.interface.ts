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

// ── Configuration ──────────────────────────────────────────────────────────
export interface AgenceInfo {
  id: number;
  code?: string;
  libelle: string;
  email?: string;
  contact?: string;
  ca?: UtilisateurMin | null;
  caa?: UtilisateurMin | null;
  suPme?: UtilisateurMin | null;
  respoReseau?: UtilisateurMin | null;
}

export interface UtilisateurMin {
  id: number;
  nom: string;
  prenom: string;
}

export interface NaturePrestation {
  id?: number;
  libelle: string;
}

export interface TypeActivite {
  id?: number;
  libelle: string;
  description?: string;
  nb_jour?: number;
}

export interface TypeCredit {
  id?: number;
  code?: string;
  libelle: string;
  nbreEcheMax?: number;
  mttPlafondCrd?: number;
  taux?: number;
  mttMin?: number;
  cible?: string;
}

export interface TypeCharge {
  id?: number;
  libelle: string;
}

export interface FraisDossier {
  id?: number;
  montantMin?: number;
  montantMax?: number;
  droit?: number;
  emolument?: number;
  tva?: number;
  honoraireTTC?: number;
  hypotheque?: number;
}

export interface SousZone {
  id?: number;
  libelle: string;
  delimitation?: string;
  zone?: { id: number; libelle: string };
  ar?: UtilisateurMin | null;
}

export interface Zone {
  id?: number;
  libelle: string;
  description?: string;
  sup?: UtilisateurMin | null;
  region?: { id: number; libelle: string } | null;
}

export interface Region {
  id?: number;
  libelle: string;
  description?: string;
  user?: UtilisateurMin | null;
}

export interface Team {
  id?: number;
  libelle: string;
  chefEquipe?: UtilisateurMin | null;
  cdc?: UtilisateurMin | null;
}

export interface ZoneAcj {
  id?: number;
  libelle: string;
  description?: string;
  team?: { id: number; libelle: string } | null;
  acj?: UtilisateurMin | null;
}
