import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CreditService } from '../../services/credit/credit.service';
import { CreditDetailAgence, CreditTypeCredit } from '../../interfaces/credit.interface';

export interface DetailAgenceCreditResolvedData {
  detail: CreditDetailAgence;
  typesCredit: CreditTypeCredit[];
}

export const detailAgenceCreditResolver: ResolveFn<DetailAgenceCreditResolvedData> = (route: ActivatedRouteSnapshot) => {
  const code = route.paramMap.get('code')!;
  const svc = inject(CreditService);
  return forkJoin({
    detail: svc.getDetailAgence(code),
    typesCredit: svc.getTypesCredit(),
  });
};
