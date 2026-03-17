import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '@/core/services/api/api.service';
import {
  CreditClientDetail,
  CreditDashboard,
  CreditDashboardFiltre,
  CreditDashboardStatut,
  CreditDashboardTypeCredit,
  CreditDemande,
  CreditDocumentAnnexe,
  CreditFiche,
  CreditObservation,
  CreditResume,
  CreditSaveDemande,
  CreditStatAgence,
  CreditStatRegion,
  CreditStatZone,
  CreditTbProduit,
  CreditTypeActivite,
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

  // ── Création de demande ───────────────────────────────────────────────────
  searchClientCredit(codeClient: string) {
    return this.api
      .post<{ client: CreditClientDetail }>(this.endpoint + '/searchClient', { codeClient })
      .pipe(
        map((res) => res.client),
        catchError((err) => throwError(() => err)),
      );
  }

  getTypesActivite() {
    return this.api
      .get<{ TypeActivites: CreditTypeActivite[] }>(this.endpoint + '/gettypeactivite')
      .pipe(
        map((res) => res.TypeActivites),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Liste des demandes ────────────────────────────────────────────────────
  getListeDemandes(action?: 'cloture' | 'rejette') {
    let params = new HttpParams();
    if (action) params = params.set('action', action);
    return this.api
      .get<{ demande: CreditDemande[] }>(this.endpoint + '/listeDemande', params)
      .pipe(
        map((res) => res.demande ?? []),
        catchError((err) => throwError(() => err)),
      );
  }

  // ── Fiche crédit ─────────────────────────────────────────────────────────────
  // ── Résumé analyse ───────────────────────────────────────────────────────────
  getResumeAnalyse(ref: string) {
    return this.api
      .get<CreditResume>(this.endpoint + '/getresume/' + ref)
      .pipe(catchError((err) => throwError(() => err)));
  }

  getFicheCredit(ref: string) {
    return this.api
      .get<CreditFiche>(this.endpoint + '/getinfosdmde/' + ref)
      .pipe(catchError((err) => throwError(() => err)));
  }

  getObservations(ref: string) {
    return this.api
      .get<{ observations: CreditObservation[] }>(this.endpoint + '/listeObservations/' + ref)
      .pipe(
        map((res) => res.observations ?? []),
        catchError((err) => throwError(() => err)),
      );
  }

  getDocuments(ref: string) {
    return this.api
      .get<{ documents: CreditDocumentAnnexe[] }>(this.endpoint + '/listeDocument/' + ref)
      .pipe(
        map((res) => res.documents ?? []),
        catchError((err) => throwError(() => err)),
      );
  }

  uploadDocument(formData: FormData) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveDocAnnexe', formData)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteDocument(idDocument: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/documents/' + idDocument)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveDemandeCredit(data: CreditSaveDemande) {
    return this.api
      .post<{ status: number; demande: { refDemande: string }; message?: string }>(
        this.endpoint + '/saveDemandeCredit',
        data,
      )
      .pipe(catchError((err) => throwError(() => err)));
  }
}
