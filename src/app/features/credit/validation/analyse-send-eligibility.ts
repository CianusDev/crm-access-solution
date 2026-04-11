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
import type {
  ActifGarantie,
  CautionSolidaire,
  CreditAnalyseDemandeDetail,
  GarantieMedia,
  GarantiesData,
} from '../interfaces/credit.interface';
import { CAUTION_DOCUMENT_TYPES } from '../constants/caution-documents';
import { getGarantieDocumentTypes } from '../constants/garantie-documents';
import { GARANTIE_TYPE_IDS } from '../interfaces/credit.interface';

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
  return sendDossierBlockedMessage(i) === null;
}

/** Message utilisateur quand l'envoi du dossier est bloqué. */
export function sendDossierBlockedMessage(i: CanSendDossierInput): string | null {
  const h = i.ficheHeader;
  if (!h) return 'Données du dossier indisponibles.';

  if (i.isGP) {
    const docsOk =
      i.requiredDocs.length === 0 || allRequiredDocsUploaded(i.requiredDocs, i.uploadedDocLibelles);
    if (!docsOk) {
      return "Merci de charger tous les documents obligatoires (liste dans l'en-tête) avant d'envoyer le dossier.";
    }

    if (!gpClientProfileCompleteForSend(h.client)) {
      return "Veuillez remplir tous les champs obligatoires avant d'envoyer le dossier au chef d'agence. Merci pour votre collaboration.";
    }

    const isPM = h.client?.typeAgent !== 'PP';
    if (!gpTypeAttachmentCompleteForSend(h.typeCredit?.code, isPM, i.fiche, i.demandeDetail)) {
      return gpMissingAttachmentMessage(h.typeCredit?.code);
    }

    return null;
  }

  if (i.isAR) {
    const required = getRequiredDocsForAR(h.typeCredit?.code);
    if (required.length === 0) return null;
    if (!allRequiredDocsUploaded(required, i.uploadedDocLibelles)) {
      return "Merci de charger tous les documents obligatoires (liste dans l'en-tête) avant d'envoyer le rapport.";
    }
    return null;
  }

  if (i.isRCCC) {
    if (!h.numTransaction) {
      return 'Veuillez ajouter le N° demande Perfect avant de poursuivre.';
    }
    if (h.typeCredit?.code === '015') return null;
    if (!i.confirmationFrais) {
      return "Veuillez confirmer le prélèvement des frais de demande avant d'envoyer le dossier.";
    }
    return null;
  }

  if (i.isCACaa) {
    if (!cacaaRapportVisiteComplete(h.statut, h.typeCredit?.code, i.uploadedDocLibelles)) {
      return "Vérifiez que vous avez chargé votre rapport de visite commanditaire avant d'envoyer la demande.";
    }
    return null;
  }

  if (i.isSuperviseurPME) {
    if (h.statut === 19) {
      if (!allRequiredDocsUploaded(REQUIRED_DOCS_SPME_VISITE, i.uploadedDocLibelles)) {
        return "Vérifiez que vous avez chargé votre rapport de visite commanditaire avant d'envoyer la demande.";
      }
      return null;
    }
    return "Action indisponible pour ce statut de dossier.";
  }

  return null;
}

export interface CanFaireResumeInput {
  /** AR ou Admin sur dossier en analyse (statut 5) — même règles pièces que l’AR (legacy). */
  enforceAnalysteDocRules: boolean;
  ficheHeader: CreditFicheDemandeDetail | null;
  uploadedDocLibelles: string[];
  analyseDemande?: CreditAnalyseDemandeDetail | null;
  garantiesData?: GarantiesData | null;
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
  const { actifs, cautions } = resolveGarantiesForResumeChecks(i);
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

  for (const caution of cautions) {
    for (const docType of CAUTION_DOCUMENT_TYPES.filter((d) => d.obligation)) {
      if (!hasMediaByLabel(caution.documents, docType.libelle)) {
        return `Le chargement du document (${docType.libelle}) de la caution ${caution.nom ?? ''} ${caution.prenom ?? ''} est obligatoire. Merci de la charger dès que possible afin de pouvoir continuer.`;
      }
    }
  }

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

function gpMissingAttachmentMessage(typeCreditCode: string | undefined): string {
  if (typeCreditCode === '019') {
    return "Merci d'enregistrer les informations du véhicule demandées.";
  }
  if (typeCreditCode === '032') {
    return "Merci d'enregistrer les informations du bon de commande.";
  }
  if (typeCreditCode === '033') {
    return "Merci d'enregistrer les informations de la facture.";
  }
  if (typeCreditCode === '035' || typeCreditCode === '036') {
    return "Merci d'enregistrer les informations du magasin.";
  }
  return "Veuillez compléter les informations obligatoires liées au type de crédit avant d'envoyer le dossier.";
}

const LEGACY_GARANTIE_GROUP_TO_ACTIF_TYPE: Partial<Record<number, ActifGarantie['type']>> = {
  [GARANTIE_TYPE_IDS.IMMOBILISATION]: 'IMMOBILIER',
  [GARANTIE_TYPE_IDS.MATERIEL_PRO]: 'EQUIPEMENT',
  [GARANTIE_TYPE_IDS.BIEN_MOBILIER_FAMILLE]: 'BIEN_MOBILIER',
  [GARANTIE_TYPE_IDS.VEHICULE]: 'VEHICULE',
  [GARANTIE_TYPE_IDS.DAT]: 'DAT',
  [GARANTIE_TYPE_IDS.DEPOSIT]: 'DEPOSIT',
};

function resolveGarantiesForResumeChecks(i: CanFaireResumeInput): {
  actifs: ActifGarantie[];
  cautions: CautionSolidaire[];
} {
  const actifsFromAnalyse = i.analyseDemande?.actifsGaranties ?? [];
  const cautionsFromAnalyse = i.analyseDemande?.cautionsSolidaires ?? [];
  if (actifsFromAnalyse.length > 0 || cautionsFromAnalyse.length > 0) {
    return { actifs: actifsFromAnalyse, cautions: cautionsFromAnalyse };
  }

  const garanties = i.garantiesData ?? extractGarantiesFromFicheHeader(i.ficheHeader);
  if (!garanties) {
    return { actifs: [], cautions: [] };
  }

  return {
    actifs: flattenTypeGaranties(garanties.typeGaranties ?? []),
    cautions: garanties.crCaution ?? [],
  };
}

function extractGarantiesFromFicheHeader(
  ficheHeader: CreditFicheDemandeDetail | null,
): GarantiesData | null {
  if (!ficheHeader) return null;
  const raw = ficheHeader as unknown as Partial<GarantiesData>;
  const hasTypeGaranties = Array.isArray(raw.typeGaranties);
  const hasCautions = Array.isArray(raw.crCaution);
  const hasStocks = Array.isArray(raw.actifCirculantStock);
  if (!hasTypeGaranties && !hasCautions && !hasStocks) {
    return null;
  }
  return {
    typeGaranties: hasTypeGaranties ? (raw.typeGaranties as GarantiesData['typeGaranties']) : [],
    crCaution: hasCautions ? (raw.crCaution as GarantiesData['crCaution']) : [],
    actifCirculantStock: hasStocks
      ? (raw.actifCirculantStock as GarantiesData['actifCirculantStock'])
      : [],
  };
}

function flattenTypeGaranties(typeGaranties: GarantiesData['typeGaranties']): ActifGarantie[] {
  return (typeGaranties ?? []).flatMap((group) =>
    (group.garanties ?? []).map((garantie) => {
      const typedGarantie = garantie as ActifGarantie;
      return {
        ...typedGarantie,
        type: LEGACY_GARANTIE_GROUP_TO_ACTIF_TYPE[group.id] ?? typedGarantie.type,
      };
    }),
  );
}
