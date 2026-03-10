import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Cora } from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';

export const detailCoraResolver: ResolveFn<Cora> = (route) => {
  return inject(CoraService).getCoraById(Number(route.paramMap.get('id')));
};
