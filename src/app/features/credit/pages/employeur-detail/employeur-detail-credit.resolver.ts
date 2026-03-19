import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CreditService } from '../../services/credit/credit.service';
import { Employeur, EmployeurDocument, EmployeurObservation } from '../../interfaces/credit.interface';

export interface EmployeurDetailResolvedData {
  employeur: Employeur;
  documents: EmployeurDocument[];
  observations: EmployeurObservation[];
}

export const employeurDetailCreditResolver: ResolveFn<EmployeurDetailResolvedData> = (route: ActivatedRouteSnapshot) => {
  const id = +route.paramMap.get('id')!;
  const svc = inject(CreditService);
  return forkJoin({
    employeur: svc.getDetailEmployeur(id),
    documents: svc.getDocumentsEmployeur(id),
    observations: svc.getObservationsEmployeur(id),
  });
};
