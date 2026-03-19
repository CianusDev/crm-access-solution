import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CreditService } from '../../services/credit/credit.service';
import { Employeur } from '../../interfaces/credit.interface';

export const employeurListCreditResolver: ResolveFn<Employeur[]> = () => {
  return inject(CreditService).getListeEmployeurs();
};
