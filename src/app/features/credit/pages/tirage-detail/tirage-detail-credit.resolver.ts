import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { CreditService } from '../../services/credit/credit.service';
import {
  CreditDocumentAnnexe,
  CreditFiche,
  CreditObservation,
  CreditResume,
} from '../../interfaces/credit.interface';

export interface TirageDetailResolvedData {
  fiche: CreditFiche;
  resume: CreditResume;
  ficheDecouvert: CreditFiche | null;
  observations: CreditObservation[];
  documents: CreditDocumentAnnexe[];
}

export const tirageDetailCreditResolver: ResolveFn<TirageDetailResolvedData> = (
  route: ActivatedRouteSnapshot,
) => {
  const ref = route.paramMap.get('ref')!;
  const refDecouvert = route.queryParamMap.get('refDecouvert') ?? '';
  const svc = inject(CreditService);

  return forkJoin({
    fiche: svc.getFicheCredit(ref),
    resume: svc.getResumeAnalyse(ref),
    ficheDecouvert: refDecouvert ? svc.getFicheCredit(refDecouvert) : of(null),
    observations: svc.getObservations(ref),
    documents: svc.getDocuments(ref),
  });
};
