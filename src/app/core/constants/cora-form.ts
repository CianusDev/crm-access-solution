export const DOCUMENT_TYPES = [
  { value: 1, label: 'CNI' },
  { value: 2, label: 'PASSEPORT' },
  { value: 3, label: 'CARTE CONSULAIRE' },
  { value: 5, label: "ATTESTATION D'IDENTITE" },
  { value: 4, label: 'PERMIS DE CONDUIRE' },
] as const;

export const SITUATION_MAT = [
  { value: 3, label: 'Marié(e)' },
  { value: 1, label: 'Célibataire' },
  { value: 2, label: 'Concubinage' },
  { value: 4, label: 'Divorcé' },
  { value: 5, label: 'Veuf / Veuve' },
] as const;

export const CIVILITIES_OPTIONS = [
  { value: 1, label: 'Mademoiselle' },
  { value: 2, label: 'Madame' },
  { value: 3, label: 'Monsieur' },
] as const;

export const FORME_JURIDIQUE = [
  { value: 1, label: 'ENTREPRISE INDIVIDUELLE' },
  { value: 2, label: 'SARL' },
  { value: 3, label: 'SA' },
  { value: 4, label: 'SASU' },
  { value: 5, label: 'ASSOCIATION' },
  { value: 6, label: 'COOPERATIVE' },
  { value: 7, label: 'SAS' },
  { value: 8, label: 'INFORMEL' },
] as const;

export const NATURE_BAIL = [
  { value: 2, label: 'Professionnel' },
  { value: 1, label: 'Habitation' },
] as const;

export const TYPE_FACTURE = [
  { value: 1, label: 'CIE' },
  { value: 2, label: 'SODECI' },
  { value: 3, label: 'CERTIFICAT DE RESIDENCE' },
] as const;

export const TYPE_DEBIT = [
  { value: 1, label: '3G' },
  { value: 2, label: '4G' },
] as const;
