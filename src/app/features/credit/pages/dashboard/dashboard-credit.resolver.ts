import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CreditService } from '../../services/credit/credit.service';
import {
  CreditDashboardTypeCredit,
  CreditDashboardStatut,
  CreditStatAgence,
  CreditStatRegion,
  CreditTbProduit,
} from '../../interfaces/credit.interface';

export interface DashboardCreditResolvedData {
  typeCredit: CreditDashboardTypeCredit;
  statut: CreditDashboardStatut;
  agences: CreditStatAgence[];
  regions: CreditStatRegion[];
  tbProduits: CreditTbProduit[];
}

export const dashboardCreditResolver: ResolveFn<DashboardCreditResolvedData> = () => {
  const svc = inject(CreditService);
  return forkJoin({
    typeCredit: svc.getDashboardTypeCredit(),
    statut: svc.getDashboardStatut(),
    agences: svc.getStatsByAgence(),
    regions: svc.getStatsByRegion(),
    tbProduits: svc.getTbByProd().pipe(catchError(() => of([]))),
  });
};
