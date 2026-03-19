import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AscService } from '../../services/asc/asc.service';
import { AscDemande } from '../../interfaces/asc.interface';

export const listDemandesAscResolver: ResolveFn<AscDemande[]> = () => {
  return inject(AscService).getListeDemandes();
};

export const listAgencesAscResolver: ResolveFn<{ id: number; libelle: string }[]> = () => {
  return inject(AscService).getAgences();
};
