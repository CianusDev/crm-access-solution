import type { CreditFiche, CreditFicheDemandeDetail } from '../interfaces/credit.interface';
import {
  type RequiredDoc,
  getRequiredDocsForAR,
  allRequiredDocsUploaded,
} from '../constants/required-documents';
import {
  cacaaRapportVisiteComplete,
  gpClientProfileCompleteForSend,
  gpTypeAttachmentCompleteForSend,
} from './send-dossier.validation';
import { REQUIRED_DOCS_SPME_VISITE } from '../constants/required-documents';

/** Entrée pure : testable sans Angular. */
export interface CanSendDossierInput {
  ficheHeader: CreditFicheDemandeDetail | null;
  fiche: CreditFiche | null;
  demandeDetail: CreditFicheDemandeDetail | null;
  uploadedDocLibelles: string[];
  confirmationFrais: boolean;
  isGP: boolean;
  isAR: boolean;
  isRCCC: boolean;
  isCACaa: boolean;
  /** Superviseur PME — envoi rapport visite (statut 19). */
  isSuperviseurPME: boolean;
  /** Liste déjà filtrée par rôle (GP ou AR) — voir `requiredDocs` du composant. */
  requiredDocs: RequiredDoc[];
}

export function canSendDossierFromState(i: CanSendDossierInput): boolean {
  const h = i.ficheHeader;
  if (!h) return false;

  if (i.isGP) {
    const docsOk =
      i.requiredDocs.length === 0 ||
      allRequiredDocsUploaded(i.requiredDocs, i.uploadedDocLibelles);
    if (!docsOk) return false;
    if (!gpClientProfileCompleteForSend(h.client)) return false;
    const isPM = h.client?.typeAgent !== 'PP';
    if (!gpTypeAttachmentCompleteForSend(h.typeCredit?.code, isPM, i.fiche, i.demandeDetail)) {
      return false;
    }
    return true;
  }

  if (i.isAR) {
    const required = getRequiredDocsForAR(h.typeCredit?.code);
    if (required.length === 0) return true;
    return allRequiredDocsUploaded(required, i.uploadedDocLibelles);
  }

  if (i.isRCCC) {
    if (!h.numTransaction) return false;
    if (h.typeCredit?.code === '015') return true;
    return i.confirmationFrais;
  }

  if (i.isCACaa) {
    return cacaaRapportVisiteComplete(h.statut, h.typeCredit?.code, i.uploadedDocLibelles);
  }

  if (i.isSuperviseurPME) {
    if (h.statut === 19) {
      return allRequiredDocsUploaded(REQUIRED_DOCS_SPME_VISITE, i.uploadedDocLibelles);
    }
    return false;
  }

  return true;
}

export interface CanFaireResumeInput {
  /** AR ou Admin sur dossier en analyse (statut 5) — même règles pièces que l’AR (legacy). */
  enforceAnalysteDocRules: boolean;
  ficheHeader: CreditFicheDemandeDetail | null;
  uploadedDocLibelles: string[];
}

export function canFaireResumeFromState(i: CanFaireResumeInput): boolean {
  if (!i.enforceAnalysteDocRules) return true;
  const h = i.ficheHeader;
  if (!h) return false;
  const required = getRequiredDocsForAR(h.typeCredit?.code);
  if (required.length > 0) {
    return allRequiredDocsUploaded(required, i.uploadedDocLibelles);
  }
  if (h.statut === 5) {
    const uploaded = i.uploadedDocLibelles.map((l) => l.trim().toLowerCase());
    const hasAnalyse = uploaded.some(
      (u) => u.includes('analyse financière') || u.includes('analyse financiere'),
    );
    const hasActifs = uploaded.some((u) => u.includes('actif') && u.includes('garantie'));
    return hasAnalyse && hasActifs;
  }
  return true;
}

/** Message utilisateur quand l’AR (ou Admin en statut 5) ne peut pas ouvrir le résumé. */
export function resumeAccessBlockedMessage(ficheHeader: CreditFicheDemandeDetail | null | undefined): string {
  const required = getRequiredDocsForAR(ficheHeader?.typeCredit?.code);
  if (required.length > 0) {
    return "Merci de charger tous les documents obligatoires (liste dans l'en-tête) avant d'accéder au résumé.";
  }
  if (ficheHeader?.statut === 5) {
    return "Merci de charger l'analyse financière et le document actifs et garanties avant le résumé.";
  }
  return "Documents manquants pour accéder au résumé.";
}
