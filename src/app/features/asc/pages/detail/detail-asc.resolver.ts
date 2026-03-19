import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ActivatedRouteSnapshot } from '@angular/router';
import { AscService } from '../../services/asc/asc.service';
import { AscDemande } from '../../interfaces/asc.interface';

export const detailAscResolver: ResolveFn<AscDemande> = (route: ActivatedRouteSnapshot) => {
  return inject(AscService).getDemandeById(+route.paramMap.get('id')!);
};
