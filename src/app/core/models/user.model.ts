export interface User {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  phone: string;
  dateNaiss: string;
  sexe: string;
  nationalite: string | null;
  profilPhoto: string;
  role: string;
  fonction: string | null;
  situationMatri: string | null;
  email: string;
  description: string;
  cni: string | null;
  extrait: string | null;
  diplome: string | null;
  adresse: string | null;
  commune: {
    id: number;
    libelle: string;
  } | null;
  quartier: any | null;
  flotte: any | null;
  etat: number;
  statut: number;
  profil: {
    id: number;
    name: string;
    libelle: string;
  } | null;
  agence: {
    id: number;
    code: string;
    libelle: string;
    email: string;
    contact: string;
    ca: any | null;
    caa: any | null;
    suPme: {
      id: number;
      nom: string;
      prenom: string;
      profil: {
        id: number;
        name: string;
        libelle: string;
        created_at: string;
        updated_at: string;
      };
    } | null;
    respoReseau: any | null;
  } | null;
  service: {
    id: number;
    code: string;
    libelle: string;
    email: string;
    contact: string;
  } | null;
  direction: any | null;
  code: string;
}
