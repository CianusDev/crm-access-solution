import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ParametresService } from '../../services/parametres.service';
import { Utilisateur } from '../../interfaces/parametres.interface';

export const utilisateursResolver: ResolveFn<Utilisateur[]> = () => {
  return inject(ParametresService).getUtilisateurs();
};
