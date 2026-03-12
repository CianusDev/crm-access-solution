import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '@/core/services/api/api.service';
import {
  CreditDashboard,
  CreditDashboardFiltre,
  CreditDashboardStatut,
  CreditDashboardTypeCredit,
  CreditStatAgence,
  CreditStatRegion,
  CreditStatZone,
  CreditTbProduit,
  CreditTypeCredit,
} from '../../interfaces/credit.interface';

@Injectable({ providedIn: 'root' })
export class CreditService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/credit';

  // ── Tab Général — dashCrdCaa ─────────────────────────────────────────────
  // Réponse : { data: CreditDashboard }
  getDashboard() {
    return this.api
      .get<{ data: CreditDashboard }>(this.endpoint + '/dashCrdCaa')
      .pipe(
        map((res) => res.data),
        catchError((err) => throwError(() => err)),
      );
  }

  filtrerDashboard(filtre: CreditDashboardFiltre) {
    let params = new HttpParams().set('clickSearch', 'YES');
    if (filtre.codeClient) params = params.set('codeClient', filtre.codeClient);
    if (filtre.typeCredit != null) params = params.set('typeCredit', String(filtre.typeCredit));
    if (filtre.statut != null) params = params.set('statut', String(filtre.statut));
    if (filtre.dateDebut) params = params.set('dateDebut', filtre.dateDebut);
    if (filtre.dateFin) params = params.set('dateFin', filtre.dateFin);

    return this.api
      .get<{ data: CreditDashboard }>(this.endpoint + '/dashCrdCaa', params)
      .pipe(
        map((res) => res.data),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Tab Réseau — Card A : dashCrdBytype ──────────────────────────────────
  // Réponse directe : { sommeTotaleMontEmprunte, montantDebParCrd }
  getDashboardTypeCredit() {
    return this.api
      .get<CreditDashboardTypeCredit>(this.endpoint + '/dashCrdBytype')
      .pipe(
        map((res) => res),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Tab Réseau — Card B : dashCrdByStatut ────────────────────────────────
  // Réponse directe : { demandeTotal, demandeEnCours, demandeClotures, demandeRjettes }
  getDashboardStatut() {
    return this.api
      .get<CreditDashboardStatut>(this.endpoint + '/dashCrdByStatut')
      .pipe(
        map((res) => res),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Tab Réseau — Card C : dashCrdByAgence ────────────────────────────────
  // Réponse : { demandesParAgence: [...] }
  getStatsByAgence() {
    return this.api
      .get<{ demandesParAgence: CreditStatAgence[] }>(this.endpoint + '/dashCrdByAgence')
      .pipe(
        map((res) => res.demandesParAgence),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Tab Réseau — Card D : dashCrdByRegion ────────────────────────────────
  // Réponse : { demandesParRegion: [...] }
  getStatsByRegion() {
    return this.api
      .get<{ demandesParRegion: CreditStatRegion[] }>(this.endpoint + '/dashCrdByRegion')
      .pipe(
        map((res) => res.demandesParRegion),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Zones par région : statCrdRegion?region={id} ─────────────────────────
  // Réponse : { data: { infosByZone: [...] } }
  getZonesByRegion(idRegion: number) {
    const params = new HttpParams().set('region', String(idRegion));
    return this.api
      .get<{ data: { infosByZone: CreditStatZone[] } }>(this.endpoint + '/statCrdRegion', params)
      .pipe(
        map((res) => res.data.infosByZone),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Tab Total Réseau — tbByProd ───────────────────────────────────────────
  // Réponse : { produits: [...] }
  getTbByProd() {
    return this.api
      .get<{ produits: CreditTbProduit[] }>(this.endpoint + '/tbByProd')
      .pipe(
        map((res) => res.produits),
        catchError((err) => throwError(() => err)),
      );
  }

  getTbByProdFiltre(agence: string, dateDebut: string, dateFin: string) {
    let params = new HttpParams();
    if (agence) params = params.set('agence', agence);
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    return this.api
      .get<{ produits: CreditTbProduit[] }>(this.endpoint + '/tbByProd', params)
      .pipe(
        map((res) => res.produits),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Référentiels ─────────────────────────────────────────────────────────
  getTypesCredit() {
    return this.api
      .get<{ typeCredits: CreditTypeCredit[] }>(this.endpoint + '/listeTypeCredit')
      .pipe(
        map((res) => res.typeCredits),
        catchError((err) => throwError(() => err)),
      );
  }
}
