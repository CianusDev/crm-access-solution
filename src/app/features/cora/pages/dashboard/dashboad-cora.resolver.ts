import { ResolveFn } from '@angular/router';
import { DashboardCoraData } from '../../interfaces/dashbaord-cora.interface';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { CoraService } from '../../services/cora/cora.service';

export const dashboardCoraDataResolver: ResolveFn<
  DashboardCoraData
> = (): Observable<DashboardCoraData> => {
  const coraService = inject(CoraService);
  return coraService.getDashboardCoraData() as Observable<DashboardCoraData>;
};
