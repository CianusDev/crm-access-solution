import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CreditService } from '../../services/credit/credit.service';
import { CreditTypeActivite, CreditTypeCredit } from '../../interfaces/credit.interface';

export interface CreateCreditResolvedData {
  typesActivite: CreditTypeActivite[];
  typesCredit: CreditTypeCredit[];
}

export const createCreditResolver: ResolveFn<CreateCreditResolvedData> = () => {
  const svc = inject(CreditService);
  return forkJoin({ typesActivite: svc.getTypesActivite(), typesCredit: svc.getTypesCredit() });
};
