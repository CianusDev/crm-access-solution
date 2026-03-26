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
  AgenceInfo,
  UtilisateurMin,
  NaturePrestation,
  TypeActivite,
  TypeCredit,
  TypeCharge,
  FraisDossier,
  SousZone,
  Zone,
  Region,
  Team,
  ZoneAcj,
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

  uploadPhotoProfil(userId: number, file: File) {
    const fd = new FormData();
    fd.append('utilisateur', String(userId));
    fd.append('photo', file);
    return this.api
      .postFormData<{ photo: string }>('/users/upload_photo', fd)
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

  // ── Config Agences ────────────────────────────────────────────────────────
  getAgencesInfos() {
    return this.api.get<{ agences: AgenceInfo[] }>('/agence/listAgenceInfos')
      .pipe(map((r) => r.agences ?? []), catchError((e) => throwError(() => e)));
  }

  getCAetCAA() {
    return this.api.get<{ chefAgence: UtilisateurMin[]; chefAgenceAdjoint: UtilisateurMin[] }>('/users/caAndCaaListe')
      .pipe(map((r) => ({ ca: r.chefAgence ?? [], caa: r.chefAgenceAdjoint ?? [] })), catchError((e) => throwError(() => e)));
  }

  getUsersSuperviseurPME() {
    return this.api.get<{ superviseuPmes: UtilisateurMin[] }>('/users/superviseurPmeListe')
      .pipe(map((r) => r.superviseuPmes ?? []), catchError((e) => throwError(() => e)));
  }

  getUsersResponsableReseau() {
    return this.api.get<{ superviseuPmes: UtilisateurMin[] }>('/users/respoReseauliste')
      .pipe(map((r) => r.superviseuPmes ?? []), catchError((e) => throwError(() => e)));
  }

  affecterUtilisateurAgence(data: { user: number; agence: number }) {
    return this.api.post('/updateUserZone', data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  // ── Config ASC ────────────────────────────────────────────────────────────
  getNaturesPrestationAsc() {
    return this.api.get<{ naturePrestation: NaturePrestation[] }>('/cheque/liste_nature_prestation')
      .pipe(map((r) => r.naturePrestation ?? []), catchError((e) => throwError(() => e)));
  }

  saveNaturePrestationAsc(data: NaturePrestation) {
    return this.api.post('/cheque/creerNaturePrestation', data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  // ── Config Crédit ─────────────────────────────────────────────────────────
  getTypesActivite() {
    return this.api.get<{ TypeActivites: TypeActivite[] }>('/credit/gettypeactivite')
      .pipe(map((r) => r.TypeActivites ?? []), catchError((e) => throwError(() => e)));
  }

  saveTypeActivite(data: TypeActivite) {
    return this.api.post('/credit/saveTypeactivite', data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  getTypesCredit2() {
    return this.api.get<{ typeCredits: TypeCredit[] }>('/credit/listeTypeCredit')
      .pipe(map((r) => r.typeCredits ?? []), catchError((e) => throwError(() => e)));
  }

  saveTypeCredit(data: TypeCredit) {
    return this.api.post('/credit/saveTypeCredit', data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  getTypesCharge() {
    return this.api.get<{ crTypeCharges: TypeCharge[] }>('/credit/listeTypeCharge')
      .pipe(map((r) => r.crTypeCharges ?? []), catchError((e) => throwError(() => e)));
  }

  saveTypeCharge(data: TypeCharge) {
    return this.api.post('/credit/saveTypeCharge', data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  getFraisDossier() {
    return this.api.get<{ taxe: FraisDossier[] }>('/credit/listeDroitTaxeCrd')
      .pipe(map((r) => r.taxe ?? []), catchError((e) => throwError(() => e)));
  }

  saveFraisDossier(data: FraisDossier) {
    return this.api.post('/credit/saveTaxeCrd', data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  // ── Config Zonification ───────────────────────────────────────────────────
  getSousZones2() {
    return this.api.get<{ zones: SousZone[] }>('/sousZones')
      .pipe(map((r) => r.zones ?? []), catchError((e) => throwError(() => e)));
  }

  saveSousZone(data: Partial<SousZone>) {
    return this.api.post('/saveSousZone', data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  updateSousZone(id: number, data: Partial<SousZone>) {
    return this.api.post(`/updateSousZone/${id}`, data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  getZones2() {
    return this.api.get<{ zones: Zone[] }>('/zones')
      .pipe(map((r) => r.zones ?? []), catchError((e) => throwError(() => e)));
  }

  saveZone(data: Partial<Zone>) {
    return this.api.post('/saveZone', data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  updateZone(id: number, data: Partial<Zone>) {
    return this.api.post(`/updateZone/${id}`, data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  getRegions() {
    return this.api.get<{ regions: Region[] }>('/listeRegion')
      .pipe(map((r) => r.regions ?? []), catchError((e) => throwError(() => e)));
  }

  saveRegion(data: Partial<Region>) {
    return this.api.post('/saveRegion', data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  // ── Config Zonification — Teams & Zone ACJ ────────────────────────────────
  getTeams() {
    return this.api.get<{ allTeams: Team[] }>('/geoloc/listeTeam')
      .pipe(map((r) => r.allTeams ?? []), catchError((e) => throwError(() => e)));
  }

  saveTeam(data: Partial<Team>) {
    return this.api.post('/geoloc/saveTeam', data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  getZonesAcj() {
    return this.api.get<{ zones: ZoneAcj[] }>('/geoloc/zoneAcj')
      .pipe(map((r) => r.zones ?? []), catchError((e) => throwError(() => e)));
  }

  saveZoneAcj(data: Partial<ZoneAcj>) {
    return this.api.post('/geoloc/saveAcjZone', data)
      .pipe(catchError((e) => throwError(() => e)));
  }

  // ── Listes utilisateurs pour zonification ────────────────────────────────
  getResponsablesRegionaux() {
    return this.api.get<{ regionnaux: UtilisateurMin[] }>('/users/regionnauxListe')
      .pipe(map((r) => r.regionnaux ?? []), catchError((e) => throwError(() => e)));
  }

  getSuperviseurs() {
    return this.api.get<{ superviseurs: UtilisateurMin[] }>('/users/superviseursListe')
      .pipe(map((r) => r.superviseurs ?? []), catchError((e) => throwError(() => e)));
  }

  getChefEquipes() {
    return this.api.get<{ chefEquipes: UtilisateurMin[] }>('/users/chefequipeListe')
      .pipe(map((r) => r.chefEquipes ?? []), catchError((e) => throwError(() => e)));
  }

  getCDC() {
    return this.api.get<{ cdc: UtilisateurMin[] }>('/users/cdcListe')
      .pipe(map((r) => r.cdc ?? []), catchError((e) => throwError(() => e)));
  }

  getACJ() {
    return this.api.get<{ data: UtilisateurMin[] }>('/geoloc/listeAcj')
      .pipe(map((r) => r.data ?? []), catchError((e) => throwError(() => e)));
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
