/**
 * Types de documents requis pour les cautions solidaires
 * Basé sur les exigences métier de Credit Access
 */

export interface DocumentType {
  id: number;
  libelle: string;
  obligation: boolean;
}

/**
 * Types d'images à uploader pour une caution
 */
export const CAUTION_IMAGE_TYPES: DocumentType[] = [
  {
    id: 1,
    libelle: 'Photo du domicile',
    obligation: true,
  },
  {
    id: 2,
    libelle: "Photo de l'activité",
    obligation: false,
  },
];

/**
 * Types de documents à uploader pour une caution
 */
export const CAUTION_DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 1,
    libelle: "Pièce d'identité",
    obligation: true,
  },
  {
    id: 2,
    libelle: 'Certificat de résidence ou Quittance CIE / SODECI',
    obligation: true,
  },
  {
    id: 3,
    libelle: 'Bulletin de salaire',
    obligation: false,
  },
  {
    id: 4,
    libelle: 'Relevé de compte',
    obligation: false,
  },
];
