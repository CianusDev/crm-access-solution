import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CoraService } from '../../services/cora/cora.service';
import { Cora } from '../../interfaces/cora.interface';

export const corasPublicResolver: ResolveFn<Cora[]> = () => {
  return inject(CoraService).getPublicCoraList();
};

export const communesPublicResolver: ResolveFn<{ id: number; libelle: string }[]> = () => {
  return inject(CoraService).getCommunes();
};
