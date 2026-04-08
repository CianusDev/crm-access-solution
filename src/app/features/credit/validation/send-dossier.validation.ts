import type {
  CreditClient,
  CreditFiche,
  CreditFicheDemandeDetail,
  CreditSignataire,
} from '../interfaces/credit.interface';

/** Valeur présente (non vide pour les chaînes). Les nombres incluent 0. */
function present(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim() !== '';
  if (typeof v === 'number') return !Number.isNaN(v);
  return true;
}

/**
 * Pièces métier obligatoires avant envoi (GP / Chef équipe — aligné legacy `checkInfoObigatoireClientEtSignataire`).
 * Pour les PM : bon de commande / facture / magasin. Pour les PP : seul le crédit auto vérifie les véhicules.
 */
export function gpTypeAttachmentCompleteForSend(
  typeCreditCode: string | undefined,
  isPersonneMorale: boolean,
  fiche: CreditFiche | null | undefined,
  demandeDetail: CreditFicheDemandeDetail | null | undefined,
): boolean {
  if (!typeCreditCode) return true;

  if (typeCreditCode === '019') {
    return (fiche?.infosCrAuto?.length ?? 0) > 0;
  }

  if (!isPersonneMorale) return true;

  if (typeCreditCode === '032') {
    return demandeDetail?.bonDeCommande != null;
  }

  if (typeCreditCode === '033') {
    return demandeDetail?.crFacture != null;
  }

  if (typeCreditCode === '035' || typeCreditCode === '036') {
    return (fiche?.magasins?.length ?? 0) > 0;
  }
  return true;
}

function signataireComplet(s: CreditSignataire | undefined): boolean {
  if (!s) return false;
  return (
    present(s.nom) &&
    present(s.prenom) &&
    present(s.sexe) &&
    present(s.codTypePiece) &&
    present(s.dateDelivrancePiece) &&
    present(s.lieuDelivrance) &&
    present(s.dateExpirationPiece) &&
    present(s.numPiece) &&
    present(s.nationalite?.nationalite ?? s.nationalite?.id) &&
    present(s.numTelephone) &&
    present(s.dateNaissance) &&
    present(s.situationMatri) &&
    present(s.quartier) &&
    present(s.lieuNaiss) &&
    present(s.dateStatut)
  );
}

/** Profil personne morale — champs exigés côté legacy avant envoi au chef d'agence. */
export function gpPmClientProfileCompleteForSend(c: CreditClient | null | undefined): boolean {
  if (!c) return false;
  const ent = c.entreprise;
  if (!ent) return false;

  if (!present(c.tpePme)) return false;
  if (
    ent.statutJuridique === undefined ||
    ent.statutJuridique === null ||
    ent.statutJuridique === ''
  ) {
    return false;
  }
  if (ent.capitalSocial === undefined || ent.capitalSocial === null) return false;
  if (!present(ent.rccm)) return false;
  if (!present(ent.ncc)) return false;
  if (!present(ent.dateCreation)) return false;
  if (ent.impots === undefined || ent.impots === null) return false;
  if (!(present(c.telPortable) || present(c.numCel))) return false;
  if (!present(c.commune?.libelle) && c.commune?.id == null) return false;
  if (!present(c.quartier)) return false;

  return signataireComplet(c.signataires?.[0]);
}

/** Profil personne physique — Validators.required du legacy. */
export function gpPpClientProfileCompleteForSend(c: CreditClient | null | undefined): boolean {
  if (!c) return false;
  const nat = c.nationalite;
  const natOk = nat != null && (nat.id != null || present(nat.nationalite));
  return (
    present(c.dataNaiss) &&
    present(c.sexe) &&
    natOk &&
    present(c.typePiece) &&
    present(c.numPiece) &&
    present(c.validitePiece) &&
    (present(c.telPortable) || present(c.numCel)) &&
    present(c.situationMatri) &&
    present(c.facture) &&
    (c.commune?.id != null || present(c.commune?.libelle)) &&
    present(c.quartier) &&
    present(c.adresse) &&
    present(c.batimentProche) &&
    present(c.tpePme) &&
    present(c.profession) &&
    present(c.rccm) &&
    present(c.denomination) &&
    present(c.lieuNaiss)
  );
}

export function gpClientProfileCompleteForSend(c: CreditClient | null | undefined): boolean {
  if (!c) return false;
  if (c.typeAgent !== 'PP') {
    return gpPmClientProfileCompleteForSend(c);
  }
  return gpPpClientProfileCompleteForSend(c);
}

/** Statut 4 + avance bon / facture : document « Rapport de visite commanditaire » (legacy). */
export function cacaaRapportVisiteComplete(
  statut: number | undefined,
  typeCreditCode: string | undefined,
  uploadedLibelles: string[],
): boolean {
  if (statut !== 4) return true;
  if (typeCreditCode !== '032' && typeCreditCode !== '033') return true;

  const uploaded = uploadedLibelles.map((l) => l.trim().toLowerCase());
  return uploaded.some(
    (u) =>
      u === 'rapport de visite commanditaire' ||
      (u.includes('rapport') && u.includes('visite') && u.includes('command')),
  );
}
