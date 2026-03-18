import { Router } from '@angular/router';
import { CreditDemande } from '../interfaces/credit.interface';

/** Statuts "analyse financière" : saisie en cours côté chargé de compte */
const STATUTS_ANALYSE = [1, 2, 3, 4, 5, 19, 21, 24];

/** Statuts "résumé analyse" : dossier en phase comité / évaluation */
const STATUTS_RESUME = [6, 7, 8, 9, 10, 11, 12];

/** Statuts tirage qui redirigent vers la page détail-tirage */
const STATUTS_TIRAGE_DETAIL = [1, 10, 11, 12, 28];

/**
 * Redirige vers la bonne page de détail selon le statut et le type du dossier.
 *
 * Règles (miroir du frontEnd) :
 *  - tirage=1 + statuts 1,10,11,12,28 → détail tirage  (T15 – TODO)
 *  - tirage=1 autres statuts          → fiche crédit
 *  - statuts 1,2,3,4,5,19,21,24       → analyse financière (T14 – TODO)
 *  - statuts 6,7,8,9,10,11,12         → résumé analyse
 *  - tous les autres                  → fiche crédit
 */
export function navigateByStatut(router: Router, demande: CreditDemande): void {
  const { refDemande, statut, tirage } = demande;

  if (tirage === 1) {
    if (STATUTS_TIRAGE_DETAIL.includes(statut)) {
      router.navigate(['/app/credit/tirage', refDemande]);
    } else {
      router.navigate(['/app/credit', refDemande]);
    }
    return;
  }

  if (STATUTS_ANALYSE.includes(statut)) {
    router.navigate(['/app/credit/analyse', refDemande]);
    return;
  }

  if (STATUTS_RESUME.includes(statut)) {
    router.navigate(['/app/credit/resume', refDemande]);
    return;
  }

  router.navigate(['/app/credit', refDemande]);
}
