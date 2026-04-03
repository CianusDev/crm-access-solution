export interface RequiredDoc {
  libelle: string;
  obligation: boolean;
}

// ── GP — Relais Business / One Shot / Crédit Auto / Crédit Campagne ──────
const GP_RELAIS_ONESHOT: RequiredDoc[] = [
  { libelle: 'Courrier de demande de prêt', obligation: true },
  { libelle: 'Fiche de consentement BIC', obligation: true },
  { libelle: "Fiche d'autorisation de prélèvement des frais de demande", obligation: true },
  { libelle: 'RCCM', obligation: true },
  { libelle: 'CNI du client', obligation: true },
  { libelle: 'Certificat de résidence ou quittance CIE / SODECI', obligation: true },
];

// ── GP — Découvert ───────────────────────────────────────────────────────
const GP_DECOUVERT: RequiredDoc[] = [
  { libelle: 'Courrier de demande de prêt', obligation: true },
  { libelle: 'Fiche de consentement BIC', obligation: true },
  { libelle: 'RCCM', obligation: true },
  { libelle: 'CNI du client', obligation: true },
  { libelle: 'Certificat de résidence ou quittance CIE / SODECI', obligation: true },
];

// ── GP — Avance sur Bon de Commande (statut juridique != Entreprise Individuelle) ─
const GP_BON_COMMANDE_AVEC_STATUT: RequiredDoc[] = [
  { libelle: 'Bon de commande', obligation: true },
  { libelle: 'RCCM', obligation: true },
  { libelle: 'DFE', obligation: true },
  { libelle: 'Statut', obligation: true },
  { libelle: 'Contrat de bails', obligation: true },
  { libelle: 'Certificat de résidence ou quittance CIE / SODECI', obligation: true },
  { libelle: 'CNI du client', obligation: true },
  { libelle: "Demande physique d'avance sur bon de commande", obligation: true },
  { libelle: 'Fiche de prélèvement des frais', obligation: true },
];

// ── GP — Avance sur Bon de Commande (Entreprise Individuelle) ───────────
const GP_BON_COMMANDE_SANS_STATUT: RequiredDoc[] = [
  { libelle: 'Bon de commande', obligation: true },
  { libelle: 'RCCM', obligation: true },
  { libelle: 'DFE', obligation: true },
  { libelle: 'Statut', obligation: false },
  { libelle: 'Contrat de bails', obligation: true },
  { libelle: 'Certificat de résidence ou quittance CIE / SODECI', obligation: true },
  { libelle: 'CNI du client', obligation: true },
  { libelle: "Demande physique d'avance sur bon de commande", obligation: true },
  { libelle: 'Fiche de prélèvement des frais', obligation: true },
];

// ── GP — Avance sur Facture ──────────────────────────────────────────────
const GP_AVANCE_FACTURE: RequiredDoc[] = [
  { libelle: 'Facture', obligation: true },
  { libelle: 'RCCM', obligation: true },
  { libelle: 'DFE', obligation: true },
  { libelle: 'Contrat de bail', obligation: true },
  { libelle: 'Certificat de résidence ou quittance CIE / SODECI', obligation: true },
  { libelle: 'CNI du client', obligation: true },
  { libelle: "Demande physique d'avance sur facture", obligation: true },
  { libelle: 'Fiche de prélèvement des frais', obligation: true },
];

// ── GP — Avance sur Traite ───────────────────────────────────────────────
const GP_AVANCE_TRAITE: RequiredDoc[] = [
  { libelle: 'La traite', obligation: true },
  { libelle: 'Ordre irrévocable de domiciliation', obligation: true },
  { libelle: 'Facture', obligation: true },
  { libelle: 'Bon de commande', obligation: true },
  { libelle: 'Contrat lié à la traite', obligation: true },
  { libelle: "Demande physique d'avance sur traite", obligation: true },
  { libelle: 'Autorisation de prélèvement des frais', obligation: true },
];

// ── GP — Relais Business Magasin ─────────────────────────────────────────
const GP_RELAIS_MAGASIN: RequiredDoc[] = [
  { libelle: 'Courrier de demande de prêt signé par le mandataire', obligation: true },
  { libelle: "Statuts / PV de l'AG donnant quitus au mandataire de contacter un prêt chez CREDIT ACCESS", obligation: true },
  { libelle: "Fiche d'autorisation de prélèvement des frais de demande", obligation: true },
  { libelle: 'RCCM', obligation: true },
  { libelle: 'Contrat de bail', obligation: true },
  { libelle: 'Certificat de résidence ou quittance CIE / SODECI', obligation: true },
  { libelle: 'CNI du client', obligation: true },
  { libelle: 'Quittance de loyer', obligation: true },
  { libelle: 'Relevés des comptes bancaires sur les 6 derniers mois', obligation: true },
  { libelle: "Preuves existance d'activités sur 12 mois", obligation: true },
];

// Documents d'analyse communs à tous les types AR
const AR_COMMON: RequiredDoc[] = [
  { libelle: 'Analyse financière', obligation: true },
  { libelle: 'Actifs garanties', obligation: true },
];

// ── AR — Relais Business / One Shot / Crédit Auto / Découvert ────────────
const AR_RELAIS_ONESHOT: RequiredDoc[] = [
  ...AR_COMMON,
  { libelle: 'Facture', obligation: true },
  { libelle: 'Relève de compte', obligation: true },
  { libelle: "Reçu d'achat", obligation: true },
  { libelle: "Compte d'exploitation", obligation: true },
  { libelle: 'Fiche de renouvellement', obligation: true },
  { libelle: 'Fiche de présentataion', obligation: true },
  { libelle: 'DFE', obligation: true },
  { libelle: 'Les statuts', obligation: true },
  { libelle: 'Contrat de bails', obligation: true },
];

// ── AR — Crédit de Campagne ─────────────────────────────────────────────
const AR_CREDIT_CAMPAGNE: RequiredDoc[] = [
  ...AR_COMMON,
  { libelle: "Formulaire d'évaluation", obligation: true },
  { libelle: 'Fiche de renouvellement', obligation: true },
  { libelle: 'Bordereaux de livraison', obligation: true },
  { libelle: 'SYDORE', obligation: true },
  { libelle: 'Attestation de certification de la coopérative', obligation: true },
  { libelle: 'Relevé de compte', obligation: true },
  { libelle: "Compte d'exploitation", obligation: true },
];

// ── AR — Relais ─────────────────────────────────────────────────────────
const AR_RELAIS: RequiredDoc[] = [
  ...AR_COMMON,
  { libelle: "Fiche de production (s'il fabrique)", obligation: false },
  { libelle: 'Références', obligation: true },
  { libelle: 'Preuve activité / domicile (facture, patente )', obligation: true },
];

/**
 * Retourne la liste des documents requis pour un AR
 * en fonction du code type de crédit.
 * Retourne [] pour les types 032 (bon de commande) et 033 (facture) → pas de dropdown.
 */
export function getRequiredDocsForAR(typeCreditCode: string | undefined): RequiredDoc[] {
  if (!typeCreditCode) return [];

  switch (typeCreditCode) {
    case '011': // Relais Business
    case '004': // One Shot
    case '019': // Crédit Auto
    case '015': // Découvert
    case '035': // Relais Business Magasin
      return AR_RELAIS_ONESHOT;

    case '021': // Crédit de Campagne
      return AR_CREDIT_CAMPAGNE;

    case '002': // Relais
      return AR_RELAIS;

    // Pas de dropdown pour Avance sur Bon de Commande / Facture
    case '032':
    case '033':
      return [];

    default:
      return AR_RELAIS_ONESHOT;
  }
}

/**
 * Retourne la liste des documents requis pour un GP
 * en fonction du code type de crédit et du statut juridique du client.
 */
export function getRequiredDocsForGP(
  typeCreditCode: string | undefined,
  statutJuridique?: string | number | null,
): RequiredDoc[] {
  if (!typeCreditCode) return [];

  switch (typeCreditCode) {
    // Relais Business, One Shot, Crédit Auto, Crédit Campagne
    case '011':
    case '004':
    case '019':
    case '021':
      return GP_RELAIS_ONESHOT;

    // Découvert
    case '015':
      return GP_DECOUVERT;

    // Avance sur Bon de Commande
    case '032':
      return String(statutJuridique) === '1'
        ? GP_BON_COMMANDE_SANS_STATUT
        : GP_BON_COMMANDE_AVEC_STATUT;

    // Avance sur Facture
    case '033':
      return GP_AVANCE_FACTURE;

    // Avance sur Traite
    case '016':
      return GP_AVANCE_TRAITE;

    // Relais Business Magasin
    case '035':
      return GP_RELAIS_MAGASIN;

    default:
      return [];
  }
}

/**
 * Vérifie que tous les documents obligatoires sont présents
 * dans la liste des documents chargés.
 */
export function allRequiredDocsUploaded(
  requiredDocs: RequiredDoc[],
  uploadedLibelles: string[],
): boolean {
  const uploaded = uploadedLibelles.map(l => l.trim().toLowerCase());
  return requiredDocs
    .filter(d => d.obligation)
    .every(d => uploaded.some(u => u === d.libelle.trim().toLowerCase()));
}
