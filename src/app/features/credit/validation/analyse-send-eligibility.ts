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
import type { CreditAnalyseDemandeDetail, GarantieMedia } from '../interfaces/credit.interface';
import { CAUTION_DOCUMENT_TYPES } from '../constants/caution-documents';
import { getGarantieDocumentTypes } from '../constants/garantie-documents';

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
      i.requiredDocs.length === 0 || allRequiredDocsUploaded(i.requiredDocs, i.uploadedDocLibelles);
    console.log('docsOk:', docsOk);

    const profileOk = gpClientProfileCompleteForSend(h.client);
    console.log('profileOk:', profileOk);

    const isPM = h.client?.typeAgent !== 'PP';
    const attachmentOk = gpTypeAttachmentCompleteForSend(
      h.typeCredit?.code,
      isPM,
      i.fiche,
      i.demandeDetail,
    );
    console.log(
      'attachmentOk:',
      attachmentOk,
      '| isPM:',
      isPM,
      '| crFacture:',
      i.demandeDetail?.crFacture,
    );

    if (!docsOk) return false;
    if (!profileOk) return false;
    if (!attachmentOk) return false;
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
  analyseDemande?: CreditAnalyseDemandeDetail | null;
}

export function canFaireResumeFromState(i: CanFaireResumeInput): boolean {
  return resumeAccessBlockedMessage(i) === null;
}

/** Message utilisateur quand l’AR (ou Admin en statut 5) ne peut pas ouvrir le résumé. */
export function resumeAccessBlockedMessage(i: CanFaireResumeInput): string | null {
  if (!i.enforceAnalysteDocRules) return null;
  const h = i.ficheHeader;
  if (!h) return 'Données du dossier indisponibles.';

  const required = getRequiredDocsForAR(h.typeCredit?.code);
  if (required.length > 0 && !allRequiredDocsUploaded(required, i.uploadedDocLibelles)) {
    return "Merci de charger tous les documents obligatoires (liste dans l'en-tête) avant d'accéder au résumé.";
  }

  if (h.statut !== 5) return null;

  const uploaded = i.uploadedDocLibelles.map((l) => l.trim().toLowerCase());
  const hasAnalyse = uploaded.some(
    (u) => u.includes('analyse financière') || u.includes('analyse financiere'),
  );
  if (!hasAnalyse) {
    return "Merci de bien vouloir charger votre document d'analyse financière.";
  }

  const hasActifs = uploaded.some((u) => u.includes('actif') && u.includes('garantie'));
  if (!hasActifs) {
    return "Merci de bien vouloir charger votre document d'actif et garanties.";
  }

  const analyse = i.analyseDemande;
  const activites = analyse?.activites ?? [];
  if (activites.length === 0) {
    return "Veuillez ajouter les activités du client dans l'analyse financière.";
  }

  // Legacy checks geolocation on demandeCredit.client.
  // Keep same behavior by prioritizing fiche header client, with fallback to analyse payload.
  const clientLat = h.client?.latittude ?? analyse?.client?.latittude;
  const clientLng = h.client?.longitude ?? analyse?.client?.longitude;
  if (clientLat == null && clientLng == null) {
    return "Merci de géolocaliser le domicile du client via l'application mobile.";
  }

  for (const activite of activites) {
    if (activite.latitude == null && activite.longitude == null) {
      return `Merci de géolocaliser l'activité du client (${activite.libelle ?? 'N/A'}) via l'application mobile.`;
    }
  }

  for (const caution of analyse?.cautionsSolidaires ?? []) {
    for (const docType of CAUTION_DOCUMENT_TYPES.filter((d) => d.obligation)) {
      if (!hasMediaByLabel(caution.documents, docType.libelle)) {
        return `Le chargement du document (${docType.libelle}) de la caution ${caution.nom ?? ''} ${caution.prenom ?? ''} est obligatoire. Merci de la charger dès que possible afin de pouvoir continuer.`;
      }
    }
  }

  const actifs = analyse?.actifsGaranties ?? [];
  for (const actif of actifs.filter((a) => a.type === 'IMMOBILIER')) {
    for (const docType of getGarantieDocumentTypes('IMMOBILIER').filter((d) => d.obligation)) {
      if (!hasMediaByLabel(actif.documents, docType.libelle)) {
        return `Le chargement du document (${docType.libelle}) de l'immobilisation dont le Numéro titre foncier (${actif.titreFoncier ?? 'N/A'}) est obligatoire. Merci de la charger dès que possible afin de pouvoir continuer.`;
      }
    }
  }

  for (const vehicule of actifs.filter((a) => a.type === 'VEHICULE')) {
    if ((vehicule.nouvelleAcquisition ?? 0) === 0) {
      for (const docType of getGarantieDocumentTypes('VEHICULE').filter((d) => d.obligation)) {
        if (!hasMediaByLabel(vehicule.documents, docType.libelle)) {
          return `Le chargement du document (${docType.libelle}) du véhicule (${vehicule.marque ?? 'N/A'}) est obligatoire. Merci de le charger dès que possible afin de pouvoir continuer.`;
        }
      }
    }
    if ((vehicule.images?.length ?? 0) === 0) {
      return `Veuillez charger les images du véhicule (${vehicule.marque ?? 'N/A'}). Merci de les charger dès que possible afin de pouvoir continuer.`;
    }
  }

  for (const equip of actifs.filter((a) => a.type === 'EQUIPEMENT')) {
    if ((equip.images?.length ?? 0) === 0) {
      return `Veuillez charger les images du matériel professionnel (${equip.designation ?? 'N/A'}). Merci de les charger dès que possible afin de pouvoir continuer.`;
    }
  }

  for (const bien of actifs.filter((a) => a.type === 'BIEN_MOBILIER')) {
    if ((bien.images?.length ?? 0) === 0) {
      return `Veuillez charger les images du bien mobilier de la famille (${bien.designation ?? 'N/A'}). Merci de les charger dès que possible afin de pouvoir continuer.`;
    }
  }

  return null;
}

function hasMediaByLabel(media: GarantieMedia[] | undefined, label: string): boolean {
  const wanted = label.trim().toLowerCase();
  return (media ?? []).some((m) => (m.libelle ?? '').trim().toLowerCase() === wanted);
}
