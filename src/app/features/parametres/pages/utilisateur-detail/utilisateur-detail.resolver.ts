import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ActivatedRouteSnapshot } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ParametresService } from '../../services/parametres.service';
import {
  Utilisateur,
  ParametresProfil,
  ParametresAgence,
  ParametresCommune,
  ServiceItem,
} from '../../interfaces/parametres.interface';

export interface UtilisateurDetailResolvedData {
  user: Utilisateur;
  formData: {
    profils: ParametresProfil[];
    services: ServiceItem[];
    agences: ParametresAgence[];
    communes: ParametresCommune[];
  };
}

export const utilisateurDetailResolver: ResolveFn<UtilisateurDetailResolvedData> = (route: ActivatedRouteSnapshot) => {
  const id = +route.paramMap.get('id')!;
  const svc = inject(ParametresService);
  return forkJoin({ user: svc.getUtilisateurById(id), formData: svc.getFormData() });
};
