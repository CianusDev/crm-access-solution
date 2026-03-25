import { ApiService } from '@/core/services/api/api.service';
import { Injectable, inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AscBanque, AscCheque, AscClient, AscDashboard, AscDashboardMensuelItem, AscDemande, AscNaturePrestation, AscTireur } from '../../interfaces/asc.interface';

@Injectable({ providedIn: 'root' })
export class AscService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/cheque';
  private readonly banqueEndpoint = '/banque';

  // ── Dashboard ────────────────────────────────────────────────────────────
  getDashboard(annee: number) {
    return this.api
      .get<AscDashboard>(this.endpoint + '/dashboard_asc?annee=' + annee)
      .pipe(
        map((res) => res),
        catchError((err) => throwError(() => err)),
      );
  }

  getDashboardMensuel(annee: number, agenceId: number) {
    return this.api
      .get<AscDashboardMensuelItem[] | { data: AscDashboardMensuelItem[] }>(
        this.endpoint + `/statByAgenceMonth?annee=${annee}&agence=${agenceId}`,
      )
      .pipe(
        map((res) => (Array.isArray(res) ? res : (res as { data: AscDashboardMensuelItem[] }).data ?? [])),
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
      .get<{ avCheques: AscDemande[] }>(this.endpoint + '/ascEnAttente')
      .pipe(
        map((res) => res.avCheques),
        catchError((err) => throwError(() => err)),
      );
  }

  getListeDemandes() {
    return this.api
      .get<{ avCheques: AscDemande[] }>(this.endpoint + '/listeAsc')
      .pipe(
        map((res) => res.avCheques),
        catchError((err) => throwError(() => err)),
      );
  }

  getDemandeById(id: number) {
    return this.api
      .get<{ avCheque: AscDemande }>(this.endpoint + '/showAsc/' + id)
      .pipe(
        map((res) => res.avCheque),
        catchError((err) => throwError(() => err)),
      );
  }

  saveDemandeAsc(formData: FormData) {
    return this.api
      .post<{ asc: AscDemande }>(this.endpoint + '/saveAvanceSurCheque', formData)
      .pipe(
        map((res) => res.asc),
        catchError((err) => throwError(() => err)),
      );
  }

  updateDemandeAsc(id: number, formData: FormData) {
    return this.api
      .post<{ asc: AscDemande }>(this.endpoint + '/updateCheque/' + id, formData)
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
      .post<{ status: number; message?: string }>(this.endpoint + '/saveDecisionAsc', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Référentiels ─────────────────────────────────────────────────────────
  getBanques() {
    return this.api
      .get<{ banque: AscBanque[] }>(this.banqueEndpoint + '/liste')
      .pipe(
        map((res) => res.banque),
        catchError((err) => throwError(() => err)),
      );
  }

  getNaturesPrestations() {
    return this.api
      .get<{ naturePrestation: AscNaturePrestation[] }>(this.endpoint + '/liste_nature_prestation')
      .pipe(
        map((res) => res.naturePrestation),
        catchError((err) => throwError(() => err)),
      );
  }

  getAgences() {
    return this.api
      .get<{ agences: { id: number; libelle: string }[] }>('/agence/list')
      .pipe(
        map((res) => res.agences),
        catchError((err) => throwError(() => err)),
      );
  }

  getChequeDetail(numcheque: string) {
    return this.api
      .get<{ cheques: AscCheque }>(this.endpoint + '/getAvChequeByCheque/' + numcheque)
      .pipe(
        map((res) => res.cheques),
        catchError((err) => throwError(() => err)),
      );
  }

  getListeCheques() {
    return this.api
      .get<{ cheques: AscDemande[] }>(this.endpoint + '/listecheque')
      .pipe(
        map((res) => res.cheques),
        catchError((err) => throwError(() => err)),
      );
  }

  searchCheques(data: { codeClient: string; agence: number | string; dateDebut: string; dateFin: string }) {
    return this.api
      .post<{ cheques: AscCheque[] }>(this.endpoint + '/recherche_asc', data)
      .pipe(
        map((res) => res.cheques),
        catchError((err) => throwError(() => err)),
      );
  }

  saveSousDemande(data: { numcheque: string; montantSollicite: number }) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveSousDemande', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateSousDemande(id: number, data: { numcheque: string; montantSollicite: number; numDemandeAsc?: string }) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/updateAsc/' + id, data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteSousDemande(data: { avCheque: number }) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/delete_asc', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  getChequesAttente() {
    return this.api
      .get<{ cheques: AscDemande[] }>(this.endpoint + '/chequesattente')
      .pipe(
        map((res) => res.cheques),
        catchError((err) => throwError(() => err)),
      );
  }

  getTireurs() {
    return this.api
      .get<{ tireus: AscTireur[] }>(this.endpoint + '/tireurs')
      .pipe(
        map((res) => res.tireus),
        catchError((err) => throwError(() => err)),
      );
  }
}
