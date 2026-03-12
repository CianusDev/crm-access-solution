export interface CreditTypeCredit {
  id: number;
  code: string;
  libelle: string;
}

export interface CreditClient {
  codeClient: string;
  nomPrenom: string;
  typeAgent: 'PP' | 'PM' | string;
}

export interface CreditAvsFond {
  statut: number;
}

export interface CreditDemande {
  id: number;
  refDemande: string;
  refTirage?: string;
  dateDemande: string;
  montantSollicite: number;
  montantEcheSouhaite: number;
  nbreEcheanceSollicite: number;
  statut: number;
  tirage: number; // 0 = crédit classique, 1 = tirage/découvert
  pause?: number; // 1 = dossier en pause chez analyste risque
  client: CreditClient;
  typeCredit: CreditTypeCredit;
  avsFond?: CreditAvsFond;
}

export interface CreditTypeItem {
  id: number;
  code: string;
  libelle: string;
  montant: number;
  pourcentage?: number;
}

// ── Tab Général — dashCrdCaa ──────────────────────────────────────────────────
export interface CreditDashboard {
  sommeTotaleMontantsProposes: number;
  montantDebParCrd: CreditTypeItem[];
  demandeEnCrea: number;
  demandeArs: number;
  demandeEnComite: number;
  demandeEnLeveRecom: number;
  demandeCloture: number;
  demandeRejete: number;
  demandes: CreditDemande[];
}

export interface CreditDashboardFiltre {
  typeCredit?: number | null;
  statut?: number | null;
  codeClient?: string;
  dateDebut?: string;
  dateFin?: string;
}

// ── Tab Total Réseau — dashCrdBytype ─────────────────────────────────────────
export interface CreditDashboardTypeCredit {
  sommeTotaleMontEmprunte: number;  // champ réel backend
  montantDebParCrd: CreditTypeItem[];
}

// ── Tab Total Réseau — dashCrdByStatut ───────────────────────────────────────
export interface CreditDashboardStatut {
  demandeTotal: number;
  demandeEnCours: number;
  demandeClotures: number;
  demandeRjettes: number;
}

// ── Tab Total Réseau — dashCrdByAgence (data.demandesParAgence) ──────────────
export interface CreditStatAgence {
  code: string;
  libelle: string;
  montant: number;
  demandeEncours: number;
  demandeCloture: number;
  demandeRejete: number;
}

// ── Tab Total Réseau — dashCrdByRegion (data.demandesParRegion) ──────────────
export interface CreditStatRegion {
  id: number;
  libelle: string;
  regional?: string;       // nom du responsable régional
  montantTotal: number;
  totalDemandes: number;
  demandeArs: number;
  demandeEnComite: number;
  demandeEnLeveRecom: number;
  demandeCloture: number;
  demandeRejete: number;
}

// ── Zones — statCrdRegion?region={id} (data.data.infosByZone) ────────────────
export interface CreditStatZone {
  id: number;
  libelle: string;
  regional?: string;
  demandeArs: number;
  demandeEnComite: number;
  demandeEnLeveRecom: number;
  demandeCloture: number;
  demandeRejete: number;
}

// ── Tab Total Réseau — tbByProd ───────────────────────────────────────────────
export interface CreditTbStatut {
  nombre: number;
  volume: number;
}

export interface CreditTbProduit {
  libelle: string;
  decaisses:      CreditTbStatut;
  enDecaissement: CreditTbStatut;
  enComite:       CreditTbStatut;
  enContreVal:    CreditTbStatut;
  enInstruction:  CreditTbStatut;
  nonInstruit:    CreditTbStatut;
  total:          CreditTbStatut;
  probable:       CreditTbStatut;
  valide:         CreditTbStatut;
}

// ── Statuts ───────────────────────────────────────────────────────────────────
export const CREDIT_STATUTS: Record<number, { label: string; variant: 'default' | 'success' | 'destructive' | 'warning' }> = {
  1:  { label: 'Enregistrement de la demande',                              variant: 'default'     },
  2:  { label: 'Pré-Évaluation',                                            variant: 'default'     },
  3:  { label: 'En attente de création dans PERFECT',                       variant: 'warning'     },
  4:  { label: "En attente d'affectation",                                  variant: 'warning'     },
  5:  { label: "En attente de l'analyse financière",                        variant: 'warning'     },
  6:  { label: 'En attente de la contre-évaluation',                        variant: 'warning'     },
  7:  { label: 'En attente du pré-comité',                                  variant: 'warning'     },
  8:  { label: 'En attente du Responsable Régional',                        variant: 'warning'     },
  9:  { label: 'En attente du comité CDCR',                                 variant: 'warning'     },
  10: { label: 'En attente DGA Risque',                                     variant: 'warning'     },
  11: { label: 'En attente DGA EXPL.',                                      variant: 'warning'     },
  12: { label: 'En attente Directeur Général',                              variant: 'warning'     },
  13: { label: 'Levée des recommandations',                                 variant: 'warning'     },
  14: { label: 'En attente de suivi',                                       variant: 'warning'     },
  16: { label: 'En attente de décaissement et de clôture',                  variant: 'warning'     },
  17: { label: 'Enregistrement des contrats',                               variant: 'warning'     },
  18: { label: 'Formalités post décaissement',                              variant: 'warning'     },
  19: { label: 'Visite commanditaire',                                      variant: 'default'     },
  21: { label: 'Dossier rejeté',                                            variant: 'destructive' },
  22: { label: "En attente d'authentification des gages (demande)",         variant: 'warning'     },
  23: { label: "En attente d'authentification des gages",                   variant: 'warning'     },
  24: { label: 'Avis défavorable',                                          variant: 'destructive' },
  25: { label: 'Décaissement annulé',                                       variant: 'destructive' },
  26: { label: 'Validation décaissement par dérogation',                    variant: 'warning'     },
  27: { label: 'Confirmation décaissement par dérogation',                  variant: 'warning'     },
  28: { label: 'En attente DIRECTRICE EXPL.',                               variant: 'warning'     },
  30: { label: 'Dossier clôturé',                                           variant: 'success'     },
};
