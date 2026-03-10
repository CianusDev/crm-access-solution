export interface CreateCoraDto {
  // Mandataire social
  nomPrenom: string;
  lieuNaiss: string;
  dateNaiss: string;
  nationalite: number;
  typePiece: number;
  numeroPiece: string;
  civilite: number;
  situationMat: number | null;
  fonction: string;
  contactMandataire: string;
  ancieneteMmAn: number;
  ancieneteMmMois: number;
  nombrePtService: number;

  // Description de l'activité
  designation: string;
  dateCreation: string;
  formuleJuridique: number;
  capital: number;
  rccm: string;
  ncc: string;
  mobile: string;
  fixe: string;
  email: string;
  nombreEmploye: number;
  commune: number;
  quartier: string;
  lot: string;
  ilot: string;
  bail: number;
  ancieneteLocalAn: number;
  ancieneteLocalMois: number;
  immeuble: string;
  etage: string;
  porte: string;
  typeFacture: number;
  facture: string;
  rue: string;
  reperes: string;
  partners: string[];
  autrePartners: string;
  typeDevice: string[];
  debit: number;
  internet: string;
  description: string;

  // Description du local
  enDur: boolean;
  ephemere: boolean;
  espaceClient: boolean;
  camera: boolean;
  securite: boolean;
  caisseIsole: boolean;
  caisseNonIsole: boolean;

  statusEnvoyer: number;
}

export interface CoraFormData {
  pays: { id: number; nationalite: string }[];
  communes: { id: number; libelle: string }[];
}
