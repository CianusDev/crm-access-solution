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
  CreditFicheDemandeDetail,
  CreditObservation,
  CreditResume,
  CreditSaveDemande,
  CreditUpdateDemande,
  CreditSaveMagasin,
  CreditSaveFacture,
  CreditSaveBonCommande,
  CreditSaveComite,
  CreditSaveDecisionFinale,
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
  ActiviteCredit,
  CreditTypeActivite,
  CreditTypeCredit,
  CreditZone,
  CreditAnalysteRisque,
  AuditLog,
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

  // ── Sous-zones par zone : statCrdZone?zone={id} ───────────────────────────
  // Réponse : { data: { sousZone: [...] } }
  getSousZonesByZone(idZone: number) {
    const params = new HttpParams().set('zone', String(idZone));
    return this.api
      .get<{ data: { sousZone: CreditStatZone[] } }>(this.endpoint + '/statCrdZone', params)
      .pipe(
        map((res) => res.data.sousZone),
        catchError((err) => throwError(() => err)),
      );
  }


  // ── Tab Total Réseau — tbByProd ───────────────────────────────────────────
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

  getDetailsDemande(ref: string) {
    return this.api
      .get<{ demande: CreditFicheDemandeDetail }>(this.endpoint + '/getDetailsDemande/' + ref)
      .pipe(
        map((res) => res.demande),
        catchError((err) => throwError(() => err)),
      );
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
      .postFormData<{ status: number; message?: string }>(this.endpoint + '/saveDocAnnexe', formData)
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

  getActivitesDemande(ref: string) {
    return this.api
      .get<{ activite?: ActiviteCredit[] }>(this.endpoint + '/getActiviteDemande/' + ref)
      .pipe(
        map((res) => res.activite ?? []),
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
      .delete<{ status: number }>(this.endpoint + '/deleteMargeCom/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveMargeCommerciale(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveMargeCommerciale', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateMargeCommerciale(id: number, data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/updateMargeCom/' + id, data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteMargeCommerciale(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteMargeCom/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveActifCirculantStock(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveActifCirculantStock', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteActifCirculantStock(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteActifCirculantStock/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  getListeTypeCharge() {
    return this.api
      .get<{ crTypeCharges: { id: number; libelle?: string }[] }>(this.endpoint + '/listeTypeCharge')
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveChargeExploitation(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveChargeExploitation', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveImprevuChargeExploitation(data: { activite?: number | null; imprevu?: number | null; refDemande?: string }) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveImprevus', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveImprevuChargeFamilial(data: { imprevu?: number | null; refDemande?: string }) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveImprevuChargeFamilial', data)
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

  deleteTresorerie(id: number) {
    return this.api
      .post<{ status: number }>(this.endpoint + '/deleteTresorerie', { tresorerie: id })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Créances clients ──────────────────────────────────────────────────
  saveCreance(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveCreanceClient', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveCreanceClient(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveCreanceClient', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateCreanceClient(id: number, data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/updateCreanceClient/' + id, data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteCreance(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteCreance/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteCreanceClient(id: number) {
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

  // ── Avances fournisseurs ──────────────────────────────────────────────
  saveAvanceFournisseur(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveAvanceFournisseur', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateAvanceFournisseur(id: number, data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/updateAvanceFournisseur/' + id, data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteAvanceFournisseur(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteAvanceFournisseur/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Dettes fournisseurs ───────────────────────────────────────────────
  saveDette(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveDette', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveDetteFournisseur(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveDetteFournisseur', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateDetteFournisseur(id: number, data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/updateDetteFournisseur/' + id, data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteDette(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteDette/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteDetteFournisseur(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteDette/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Dettes entreprise (historique) ────────────────────────────────────
  saveDetteEntreprise(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveDetteEntreprise', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateDetteEntreprise(id: number, data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/updateDetteEntreprise/' + id, data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteDetteEntreprise(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteDetteEntreprise/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveProfilEntrepreneur(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveProfilEnt', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveTresorerieFamille(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveTresorerieFamille', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveChargeFamille(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveChargeFamille', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveProfilFamilial(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveProfilFamilial', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveMembreMenage(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveMenageRevenuFamille', data)
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
      .post<{ status: number; message?: string }>(this.endpoint + '/saveCrCaution', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteCautionSolidaire(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteCaution/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Upload photo profil caution ─────────────────────────────────────────
  updatePhotoProfilCaution(cautionId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', cautionId.toString());
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/updateProfilImgCaution', formData)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Upload image caution ────────────────────────────────────────────────
  saveImageCaution(cautionId: number, libelle: string, file: File) {
    const formData = new FormData();
    formData.append('type', 'CAUTION');
    formData.append('libelle', libelle);
    formData.append('description', libelle);
    formData.append('photo', file);
    formData.append('element', cautionId.toString());
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveImageGarantie', formData)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Upload document caution ─────────────────────────────────────────────
  saveDocumentCaution(cautionId: number, libelle: string, file: File) {
    const formData = new FormData();
    formData.append('type', 'CAUTION');
    formData.append('libelle', libelle);
    formData.append('description', libelle);
    formData.append('file', file);
    formData.append('element', cautionId.toString());
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveDocumentGarantie', formData)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Suppression image caution ───────────────────────────────────────────
  deleteImageCaution(imageId: number) {
    return this.api
      .post<{ status: number }>(this.endpoint + '/delete_image_garantie', { image: imageId })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Suppression document caution ────────────────────────────────────────
  deleteDocumentCaution(docId: number) {
    return this.api
      .post<{ status: number }>(this.endpoint + '/delete_doc_garantie', { document: docId })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /** Upload photo profil caution — FormData: refDemande, crCaution, photoProfil */
  uploadPhotoCaution(formData: FormData) {
    return this.api
      .postFormData<{ status: number }>(this.endpoint + '/updateProfilImgCaution', formData)
      .pipe(catchError((err) => throwError(() => err)));
  }

  /** Upload image (photo) liée à une caution — FormData: type=CAUTION, element=id, libelle, description, photo */
  uploadImageGarantie(formData: FormData) {
    return this.api
      .postFormData<{ status: number }>(this.endpoint + '/saveImageGarantie', formData)
      .pipe(catchError((err) => throwError(() => err)));
  }

  /** Upload document lié à une caution — FormData: type=CAUTION, element=id, libelle, description, file */
  uploadDocumentGarantie(formData: FormData) {
    return this.api
      .postFormData<{ status: number }>(this.endpoint + '/saveDocGarantie', formData)
      .pipe(catchError((err) => throwError(() => err)));
  }

  uploadDocumentAnalyse(formData: FormData) {
    return this.api
      .postFormData<{ status: number; message?: string }>(this.endpoint + '/saveDocAnalyse', formData)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteDocumentAnalyse(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteDocAnalyse/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveSWOT(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveAswot', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  savePropositionAR(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveProposition', data)
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

  saveComiteDecision(data: CreditSaveComite) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveComite', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveDecisionFinale(data: CreditSaveDecisionFinale) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveCrDecision', data)
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

  updateClientPP(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/update_client', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateClientPM(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/update_client_entreprise', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateDemandeCredit(data: CreditUpdateDemande) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/updateDemandeCredit', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveMagasin(data: CreditSaveMagasin) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveCrMagasin', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveFacture(data: CreditSaveFacture) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveCrFacture', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveBonCommande(data: CreditSaveBonCommande) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveBonCmde', data)
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

  // ── Véhicules demandés (Crédit Auto) ──────────────────────────────────────
  saveInfoCrAuto(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveInfoCrAuto', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteInfoCrAuto(id: number) {
    return this.api
      .delete<{ status: number }>(this.endpoint + '/deleteCrAuto/' + id)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Signataires ───────────────────────────────────────────────────────────
  updateSignataire(data: Record<string, unknown>) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/updtateSignataire', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateSignataireAvecPhoto(formData: FormData) {
    return this.api
      .postFormData<{ status: number; message?: string }>(this.endpoint + '/updateProfilImgCaution', formData)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Référentiel pays / communes ──────────────────────────────────────────
  getPaysCommuneData() {
    return this.api
      .get<{
        pays: { id: number; nationalite: string }[];
        villes: { id: number; libelle: string }[];
        communes: { id: number; libelle: string }[];
      }>('/pays_commune')
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Zones et ARs ──────────────────────────────────────────────────────────
  getZones() {
    return this.api
      .get<{ zones: CreditZone[] }>('/zones')
      .pipe(
        map(response => response.zones || []),
        catchError((err) => throwError(() => err))
      );
  }

  getARsByZone(zoneId: number) {
    return this.api
      .get<{ ars: CreditAnalysteRisque[] }>(`/get_ars_by_zone/${zoneId}`)
      .pipe(
        map(response => response.ars || []),
        catchError((err) => throwError(() => err))
      );
  }

  affecterDemandeAR(data: {
    refDemande: string;
    decision: number;
    zone: number;
    codeAr: string;
    password: string;
    observation?: string;
  }) {
    return this.api
      .post<{ status: number; message?: string }>(this.endpoint + '/saveCrdObservation', data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ── Audit logs ───────────────────────────────────────────────────────────
  getLogs(ref: string, type: 'documents' | 'modifications' | 'ajouts') {
    const action = type === 'ajouts' ? 'created' : 'updated';
    const params = new HttpParams()
      .set('module', 'credit')
      .set('reference', ref)
      .set('action', action)
      .set('type', type);
    return this.api
      .get<{ statut: boolean; data: AuditLog[] }>(this.endpoint + '/getLogs', params)
      .pipe(catchError((err) => throwError(() => err)));
  }
}
