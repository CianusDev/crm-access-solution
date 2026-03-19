import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { CreditService } from '../../services/credit/credit.service';
import { CreditResume } from '../../interfaces/credit.interface';

export const resumeCreditResolver: ResolveFn<CreditResume> = (route: ActivatedRouteSnapshot) => {
  const ref = route.paramMap.get('ref')!;
  return inject(CreditService).getResumeAnalyse(ref);
};
