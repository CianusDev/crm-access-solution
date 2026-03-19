import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CreditService } from '../../services/credit/credit.service';
import { CreditFiche, CreditDocumentAnnexe, CreditObservation } from '../../interfaces/credit.interface';

export interface FicheCreditResolvedData {
  fiche: CreditFiche;
  documents: CreditDocumentAnnexe[];
  observations: CreditObservation[];
}

export const ficheCreditResolver: ResolveFn<FicheCreditResolvedData> = (route: ActivatedRouteSnapshot) => {
  const ref = route.paramMap.get('ref')!;
  const svc = inject(CreditService);
  return forkJoin({
    fiche: svc.getFicheCredit(ref),
    documents: svc.getDocuments(ref),
    observations: svc.getObservations(ref),
  });
};
