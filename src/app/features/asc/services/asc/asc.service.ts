import { ApiService } from '@/core/services/api/api.service';
import { Injectable, inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AscBanque, AscClient, AscDashboard, AscDemande, AscNaturePrestation, AscTireur } from '../../interfaces/asc.interface';

@Injectable({ providedIn: 'root' })
export class AscService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/cheque';

  // ── Dashboard ────────────────────────────────────────────────────────────
  getDashboard(annee: number) {
    return this.api
      .get<AscDashboard>(this.endpoint + '/dashboard_asc?annee=' + annee)
      .pipe(
        map((res) => res),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Client ────────────────────────────────────────────────────────────────
  searchClient(codeClient: string) {
    return this.api
      .post<{ client: AscClient }>(this.endpoint + '/searchClientAvc', { codeClient })
      .pipe(
        map((res) => res.client),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Demandes ──────────────────────────────────────────────────────────────
  getDemandesEnAttente() {
    return this.api
      .get<{ asc: AscDemande[] }>(this.endpoint + '/ascEnAttente')
      .pipe(
        map((res) => res.asc),
        catchError((err) => throwError(() => err)),
      );
  }

  getListeDemandes() {
    return this.api
      .get<{ asc: AscDemande[] }>(this.endpoint + '/listeAsc')
      .pipe(
        map((res) => res.asc),
        catchError((err) => throwError(() => err)),
      );
  }

  getDemandeById(id: number) {
    return this.api
      .get<{ asc: AscDemande }>(this.endpoint + '/showAsc/' + id)
      .pipe(
        map((res) => res.asc),
        catchError((err) => throwError(() => err)),
      );
  }

  saveDemandeAsc(formData: FormData) {
    return this.api
      .post<{ asc: AscDemande }>(this.endpoint + '/saveSousDemande', formData)
      .pipe(
        map((res) => res.asc),
        catchError((err) => throwError(() => err)),
      );
  }

  updateDemandeAsc(id: number, formData: FormData) {
    return this.api
      .post<{ asc: AscDemande }>(this.endpoint + '/updateAsc/' + id, formData)
      .pipe(
        map((res) => res.asc),
        catchError((err) => throwError(() => err)),
      );
  }

  deleteDemandeAsc(id: number) {
    return this.api
      .delete<void>(this.endpoint + '/delete/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  sendDecision(data: { idAsc: number; decision: number; observation?: string }) {
    return this.api
      .post<{ asc: AscDemande }>(this.endpoint + '/saveDecisionAsc', data)
      .pipe(
        map((res) => res.asc),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Référentiels ─────────────────────────────────────────────────────────
  getBanques() {
    return this.api
      .get<{ banques: AscBanque[] }>(this.endpoint + '/banques')
      .pipe(
        map((res) => res.banques),
        catchError((err) => throwError(() => err)),
      );
  }

  getNaturesPrestations() {
    return this.api
      .get<{ natures: AscNaturePrestation[] }>(this.endpoint + '/natures_prestations')
      .pipe(
        map((res) => res.natures),
        catchError((err) => throwError(() => err)),
      );
  }

  getTireurs() {
    return this.api
      .get<{ tireurs: AscTireur[] }>(this.endpoint + '/tireurs')
      .pipe(
        map((res) => res.tireurs),
        catchError((err) => throwError(() => err)),
      );
  }
}
