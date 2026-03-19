import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CreditService } from '../../services/credit/credit.service';
import { CreditFiche, CreditObservation } from '../../interfaces/credit.interface';

export interface TirageDetailResolvedData {
  fiche: CreditFiche;
  observations: CreditObservation[];
}

export const tirageDetailCreditResolver: ResolveFn<TirageDetailResolvedData> = (route: ActivatedRouteSnapshot) => {
  const ref = route.paramMap.get('ref')!;
  const svc = inject(CreditService);
  return forkJoin({
    fiche: svc.getFicheCredit(ref),
    observations: svc.getObservations(ref),
  });
};
