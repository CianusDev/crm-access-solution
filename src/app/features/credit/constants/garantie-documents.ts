import { DocumentType } from './caution-documents';

/** Images requises pour un actif IMMOBILIER */
export const GARANTIE_IMMOBILIER_IMAGES: DocumentType[] = [
  { id: 1, libelle: "Photo de la propriété", obligation: true },
  { id: 2, libelle: "Photo de l'entrée", obligation: false },
];

/** Documents requis pour un actif IMMOBILIER */
export const GARANTIE_IMMOBILIER_DOCUMENTS: DocumentType[] = [
  { id: 1, libelle: "Titre de propriété", obligation: true },
];

/** Images requises pour un actif VEHICULE */
export const GARANTIE_VEHICULE_IMAGES: DocumentType[] = [
  { id: 1, libelle: "Photo du véhicule (face avant)", obligation: true },
  { id: 2, libelle: "Photo du véhicule (face arrière)", obligation: false },
];

/** Documents requis pour un actif VEHICULE */
export const GARANTIE_VEHICULE_DOCUMENTS: DocumentType[] = [
  { id: 1, libelle: "Carte grise", obligation: true },
  { id: 2, libelle: "Visite technique", obligation: true },
];

/** Images pour EQUIPEMENT / Matériel */
export const GARANTIE_EQUIPEMENT_IMAGES: DocumentType[] = [
  { id: 1, libelle: "Photo de l'équipement", obligation: true },
];

/** Documents pour EQUIPEMENT */
export const GARANTIE_EQUIPEMENT_DOCUMENTS: DocumentType[] = [
  { id: 1, libelle: "Facture d'achat", obligation: false },
];

/** Images génériques pour autres types */
export const GARANTIE_GENERIC_IMAGES: DocumentType[] = [
  { id: 1, libelle: "Photo", obligation: false },
];

/** Documents génériques pour autres types */
export const GARANTIE_GENERIC_DOCUMENTS: DocumentType[] = [
  { id: 1, libelle: "Justificatif", obligation: false },
];

export function getGarantieImageTypes(type: string): DocumentType[] {
  switch (type) {
    case 'IMMOBILIER': return GARANTIE_IMMOBILIER_IMAGES;
    case 'VEHICULE':   return GARANTIE_VEHICULE_IMAGES;
    case 'EQUIPEMENT': return GARANTIE_EQUIPEMENT_IMAGES;
    default:           return GARANTIE_GENERIC_IMAGES;
  }
}

export function getGarantieDocumentTypes(type: string): DocumentType[] {
  switch (type) {
    case 'IMMOBILIER': return GARANTIE_IMMOBILIER_DOCUMENTS;
    case 'VEHICULE':   return GARANTIE_VEHICULE_DOCUMENTS;
    case 'EQUIPEMENT': return GARANTIE_EQUIPEMENT_DOCUMENTS;
    default:           return GARANTIE_GENERIC_DOCUMENTS;
  }
}
