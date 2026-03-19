import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CreditService } from '../../services/credit/credit.service';
import { CreditDemande } from '../../interfaces/credit.interface';

export const listCreditResolver: ResolveFn<CreditDemande[]> = () => {
  return inject(CreditService).getListeDemandes();
};
