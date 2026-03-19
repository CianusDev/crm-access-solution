import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AscService } from '../../services/asc/asc.service';
import { AscDashboard } from '../../interfaces/asc.interface';

export const dashboardAgenceAscResolver: ResolveFn<AscDashboard> = () => {
  return inject(AscService).getDashboard(new Date().getFullYear());
};
