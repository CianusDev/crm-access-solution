import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '@/core/services/api/api.service';
import {
  CreditActionPayload,
  CreditAnalyseDemandeDetail,
  CreditClientDetail,
  CreditDashboard,
  CreditDashboardFiltre,
  CreditDashboardStatut,
  CreditDashboardTypeCredit,
  CreditDemande,
  CreditDetailAgence,
  CreditDocumentAnnexe,
  CreditFiche,
  CreditObservation,
  CreditResume,
  CreditSaveDemande,
  CreditSaveTirage,
  Employeur,
  EmployeurDocument,
  EmployeurObservation,
  CreditStatAgence,
  CreditStatRegion,
  CreditTirageSearch,
  GarantiesData,
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

  // ── Détail agence depuis dashboard siège (statCrdAgence) ─────────────────
  getDetailAgence(code: string) {
    const params = new HttpParams().set('agence', code);
    return this.api
      .get<{ data: CreditDetailAgence }>(this.endpoint + '/statCrdAgence', params)
      .pipe(
        map((res) => res.data),
        catchError((err) => throwError(() => err)),
      );
  }

  filtrerDetailAgence(code: string, filtre: CreditDashboardFiltre) {
    let params = new HttpParams().set('agence', code).set('clickSearch', 'YES');
    if (filtre.codeClient) params = params.set('codeClient', filtre.codeClient);
    if (filtre.typeCredit != null) params = params.set('typeCredit', String(filtre.typeCredit));
    if (filtre.statut != null) params = params.set('statut', String(filtre.statut));
    if (filtre.dateDebut) params = params.set('dateDebut', filtre.dateDebut);
    if (filtre.dateFin) params = params.set('dateFin', filtre.dateFin);
    return this.api
      .get<{ data: CreditDetailAgence }>(this.endpoint + '/statCrdAgence', params)
      .pipe(
        map((res) => res.data),
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

  getGarantiesDemande(ref: string) {
    return this.api
      .get<{ demande: GarantiesData }>(this.endpoint + '/getGarantiesDemande/' + ref)
      .pipe(
        map((res) => res.demande),
        catchError((err) => throwError(() => err)),
      );
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

  // ── Analyse financière ────────────────────────────────────────────────────
  getAnalyseFinanciere(ref: string) {
    return this.api
      .get<{ data?: { demande: CreditAnalyseDemandeDetail }; demande?: CreditAnalyseDemandeDetail }>(this.endpoint + '/getAnalyseFinDemande/' + ref)
      .pipe(
        map((res) => ({ demande: (res.data?.demande ?? res.demande) as CreditAnalyseDemandeDetail })),
        catchError((err) => throwError(() => err)),
      );
  }

  saveActivite(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveActiviteDmde', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteActivite(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteActivite/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveVenteMensuelle(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveVenteMensuelle', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteVenteMensuelle(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteVenteMensuelle/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveVenteJournaliere(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveVenteJournaliere', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteVenteJournaliere(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteVenteJournaliere/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveAchatMensuel(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveAchatMensuel', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteAchatMensuel(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteAchatMensuel/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveChargeExploitation(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveChargeExploitation', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteChargeExploitation(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteChargeExploitation/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveTresorerie(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveTresorerie', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveCreance(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveCreance', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteCreance(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteCreance/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveStock(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveStock', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteStock(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteStock/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveDette(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveDette', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteDette(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteDette/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveProfilFamilial(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveProfilFamilial', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveMembreMenage(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveMembreMenage', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteMembreMenage(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteMembreMenage/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveActifGarantie(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveActifGarantie', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteActifGarantie(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteActifGarantie/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveCautionSolidaire(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveCautionSolidaire', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteCautionSolidaire(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteCautionSolidaire/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  uploadDocumentAnalyse(formData: FormData) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveDocAnalyse', formData)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteDocumentAnalyse(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteDocAnalyse/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveSWOT(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveSWOT', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  savePropositionAR(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/savePropositionAR', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  submitAnalyse(data: { refDemande: string; observation: string; password: string }) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/submitAnalyse', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Actions workflow ─────────────────────────────────────────────────────
  saveCrdObservation(data: CreditActionPayload) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveCrdObservation', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  clotureDemande(data: CreditActionPayload) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/clotureDemande', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  checkActeOrVisite(data: CreditActionPayload) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/check_acte_or_visite', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  searchTirage(numDmde: string) {
    return this.api
      .post<CreditTirageSearch>(this.endpoint + '/searchDmde', { numDmde })
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveTirage(data: CreditSaveTirage) {
    return this.api
      .post<{ status: number; demande: { refDemande: string }; message?: string }>(
        this.endpoint + '/saveCrdTirage',
        data,
      )
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Employeurs ────────────────────────────────────────────────────────────
  getListeEmployeurs(action?: 'valide' | 'rejette') {
    const url = action
      ? `${this.endpoint}/listeEmployeur?action=${action}`
      : `${this.endpoint}/listeEmployeur`;
    return this.api
      .get<{ employeurs: Employeur[] }>(url)
      .pipe(
        map((res) => res.employeurs ?? []),
        catchError((err) => throwError(() => err)),
      );
  }

  getDetailEmployeur(id: number) {
    return this.api
      .get<{ employeur: Employeur }>(this.endpoint + '/detailsEmployeur/' + id)
      .pipe(
        map((res) => res.employeur),
        catchError((err) => throwError(() => err)),
      );
  }

  getObservationsEmployeur(id: number) {
    return this.api
      .get<{ observations: EmployeurObservation[] }>(this.endpoint + '/observationEmployeur/' + id)
      .pipe(
        map((res) => res.observations ?? []),
        catchError((err) => throwError(() => err)),
      );
  }

  getDocumentsEmployeur(id: number) {
    return this.api
      .get<{ documents: EmployeurDocument[] }>(this.endpoint + '/employeurDocument/' + id)
      .pipe(
        map((res) => res.documents ?? []),
        catchError((err) => throwError(() => err)),
      );
  }

  saveDemandeCredit(data: CreditSaveDemande) {
    return this.api
      .post<{ status: number; demande: { refDemande: string }; message?: string }>(
        this.endpoint + '/saveDemandeCredit',
        data,
      )
      .pipe(catchError((err) => throwError(() => err)));
  }

  annulerDecaissement(data: CreditActionPayload) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/annulerPrDesistement', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  workByDerogation(data: CreditActionPayload) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/workByDerogation', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveAvsf(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveAvsf', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveDecaissement(data: { refDemande: string; numPret: string; numContrat: string }) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveDecaissement', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateMontantEmprunte(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/mis_a_jour_montant_emprunter', data)
      .pipe(catchError((err) => throwError(() => err)));
  }
}
