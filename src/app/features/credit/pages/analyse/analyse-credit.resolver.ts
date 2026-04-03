import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CreditService } from '../../services/credit/credit.service';
import {
  CreditFiche,
  CreditAnalyseDemandeDetail,
  CreditFicheDemandeDetail,
} from '../../interfaces/credit.interface';

export interface AnalyseCreditResolvedData {
  fiche: CreditFiche;
  analyse: { demande: CreditAnalyseDemandeDetail };
  /** `getDetailsDemande` — même charge que la section Demande (évite un double appel). */
  details: CreditFicheDemandeDetail;
}

export const analyseCreditResolver: ResolveFn<AnalyseCreditResolvedData> = (route: ActivatedRouteSnapshot) => {
  const ref = route.paramMap.get('ref')!;
  const svc = inject(CreditService);
  return forkJoin({
    fiche: svc.getFicheCredit(ref),
    analyse: svc.getAnalyseFinanciere(ref),
    details: svc.getDetailsDemande(ref),
  });
};
