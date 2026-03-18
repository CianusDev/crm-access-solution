import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, throwError } from 'rxjs';
import { ApiService } from '@/core/services/api/api.service';
import {
  ParametresAgence,
  ParametresCommune,
  ParametresProfil,
  ServiceItem,
  PermissionTypeCredit,
  SaveUtilisateurDto,
  UpdateUtilisateurDto,
  Utilisateur,
  ZoneItem,
} from '../interfaces/parametres.interface';

@Injectable({ providedIn: 'root' })
export class ParametresService {
  private readonly api = inject(ApiService);

  // ── Utilisateurs ──────────────────────────────────────────────────────────
  getUtilisateurs() {
    return this.api
      .get<{ data: Utilisateur[] }>('/users/all')
      .pipe(
        map((res) => res.data),
        catchError((err) => throwError(() => err)),
      );
  }

  getUtilisateurById(id: number) {
    return this.api
      .get<{ data: Utilisateur }>(`/users/show_user/${id}`)
      .pipe(
        map((res) => res.data),
        catchError((err) => throwError(() => err)),
      );
  }

  saveUtilisateur(data: SaveUtilisateurDto) {
    return this.api
      .post('/users/save_employe', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateUtilisateur(data: UpdateUtilisateurDto) {
    return this.api
      .put('/users/update_employe', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  changerStatut(data: { user: number }) {
    return this.api
      .post('/users/activ_desactiv_employe', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  changerMotPasseUser(data: { old_password: string; password: string; password_confirmation: string }) {
    return this.api
      .post('/users/change_password', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  changerMotPasseAdmin(data: { utilisateur: number; password: string; passwordConfirm: string }) {
    return this.api
      .post('/users/changePwdAdmin', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateCode(data: { user: number; code: string }) {
    return this.api
      .post('/updateUserCode', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Référentiels ──────────────────────────────────────────────────────────
  getProfils() {
    return this.api
      .get<{ data: ParametresProfil[] }>('/profils')
      .pipe(
        map((res) => res.data),
        catchError((err) => throwError(() => err)),
      );
  }

  getServices() {
    return this.api
      .get<{ data: ServiceItem[] }>('/services')
      .pipe(
        map((res) => res.data),
        catchError((err) => throwError(() => err)),
      );
  }

  getAgences() {
    return this.api
      .get<{ agences: ParametresAgence[] }>('/agence/list')
      .pipe(
        map((res) => res.agences),
        catchError((err) => throwError(() => err)),
      );
  }

  getCommunes() {
    return this.api
      .get<{ communes: ParametresCommune[] }>('/pays_commune')
      .pipe(
        map((res) => res.communes),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Types crédit ─────────────────────────────────────────────────────────
  getTypesCredit() {
    return this.api
      .get<{ typeCredits: { id: number; libelle: string }[] }>('/credit/listeTypeCredit')
      .pipe(
        map((res) => res.typeCredits ?? []),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Permissions type crédit ───────────────────────────────────────────────
  getPermissionsTypeCredit(userId: number) {
    return this.api
      .get<{ data: { typeCredit: number; type: string }[] }>(`/credit/permisionComite/${userId}`)
      .pipe(
        map((res) => res.data ?? []),
        catchError((err) => throwError(() => err)),
      );
  }

  savePermissionsTypeCredit(data: { user: number; data: PermissionTypeCredit[] }) {
    return this.api
      .post('/credit/saveChargeComite', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Zonification ──────────────────────────────────────────────────────────
  getZones() {
    return this.api
      .get<{ zones: ZoneItem[] }>('/zones')
      .pipe(
        map((res) => res.zones ?? []),
        catchError((err) => throwError(() => err)),
      );
  }

  getSousZones() {
    return this.api
      .get<{ zones: ZoneItem[] }>('/listeSousZones')
      .pipe(
        map((res) => res.zones ?? []),
        catchError((err) => throwError(() => err)),
      );
  }

  affecterZone(data: { user: number; zone: number }) {
    return this.api
      .post('/updateUserZone', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Form data (forkJoin) ──────────────────────────────────────────────────
  getFormData() {
    return forkJoin({
      profils: this.getProfils(),
      services: this.getServices(),
      agences: this.getAgences(),
      communes: this.getCommunes(),
    }).pipe(catchError((err) => throwError(() => err)));
  }
}
