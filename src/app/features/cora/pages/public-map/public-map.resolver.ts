import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { CoraService } from '../../services/cora/cora.service';
import { Cora, Gestionnaire } from '../../interfaces/cora.interface';

export const corasPublicResolver: ResolveFn<Cora[]> = () => {
  return inject(CoraService).getPublicCoraList();
};

export const communesPublicResolver: ResolveFn<{ id: number; libelle: string }[]> = () => {
  return inject(CoraService).getCommunes();
};

export const gestionnairesPublicResolver: ResolveFn<Gestionnaire[]> = () => {
  return inject(CoraService).getGestionnaires();
};
