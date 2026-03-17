import { Router } from '@angular/router';
import { CreditDemande } from '../interfaces/credit.interface';

/**
 * Statuts "résumé analyse" : dossier en phase d'évaluation/comité
 * → page résumé avec sections SWOT, proposition AR, comités, décision
 */
const STATUTS_RESUME = [6, 7, 8, 9, 10, 11, 12, 28];

/**
 * Redirige vers la bonne page de détail selon le statut et le type du dossier.
 *
 * - Tirage découvert (tirage=1) avec statuts en validation → détail tirage (T17)
 * - Statuts 6-12, 28 → résumé analyse (/app/credit/resume/:ref)
 * - Tous les autres → fiche crédit (/app/credit/:ref)
 */
export function navigateByStatut(router: Router, demande: CreditDemande): void {
  const { refDemande, statut, tirage } = demande;

  if (tirage === 1 && STATUTS_RESUME.includes(statut)) {
    // TODO T17 : détail tirage — fiche pour l'instant
    router.navigate(['/app/credit', refDemande]);
    return;
  }

  if (STATUTS_RESUME.includes(statut)) {
    router.navigate(['/app/credit/resume', refDemande]);
    return;
  }

  router.navigate(['/app/credit', refDemande]);
}
