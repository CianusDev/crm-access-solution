import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CreditService } from '../../services/credit/credit.service';
import { CreditDashboard, CreditTypeCredit } from '../../interfaces/credit.interface';

export interface DashboardAgenceCreditResolvedData {
  dashboard: CreditDashboard;
  typesCredit: CreditTypeCredit[];
}

export const dashboardAgenceCreditResolver: ResolveFn<DashboardAgenceCreditResolvedData> = () => {
  const svc = inject(CreditService);
  return forkJoin({ dashboard: svc.getDashboard(), typesCredit: svc.getTypesCredit() });
};
