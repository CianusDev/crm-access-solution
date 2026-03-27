import { ApiService } from '@/core/services/api/api.service';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, of, throwError } from 'rxjs';
import { CoraFormData, CreateCoraDto } from '../../interfaces/create-cora-dto.interface';
import {
  AgentCoraDetail,
  AgentEnAttente,
  Cora,
  CoraFiltre,
  CoraRefDesig,
  CreateAgentDto,
  CreateAgentFormData,
  Gestionnaire,
  ListCoraData,
} from '../../interfaces/cora.interface';

@Injectable({
  providedIn: 'root',
})
export class CoraService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = '/cora';
  constructor() {}

  getDashboardCoraData() {
    return this.apiService
      .get(this.endpoint + '/dashboard_cora')
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  getFormData() {
    return this.apiService
      .get<CoraFormData>('/pays_commune')
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  createCora(data: CreateCoraDto) {
    return this.apiService
      .post(this.endpoint + '/save_cora', data)
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  updateCora(data: CreateCoraDto & { cora: number }) {
    return this.apiService
      .put(this.endpoint + '/update_cora', data)
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  getListCoraData() {
    return forkJoin({
      coras: this.apiService
        .get<{ coras: Cora[] }>(this.endpoint + '/cora_list')
        .pipe(map((res) => res.coras)),
      communes: this.apiService
        .get<{ communes: { id: number; libelle: string }[] }>('/pays_commune')
        .pipe(map((res) => res.communes)),
      gestionnaires: this.apiService
        .get<{ data: Gestionnaire[] }>(this.endpoint + '/all_gestionnaires')
        .pipe(map((res) => res.data)),
    }).pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  getCoraById(id: number) {
    return this.apiService.get<{ cora: Cora }>(this.endpoint + '/show_cora/' + id).pipe(
      map((res) => res.cora),
      catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
    );
  }

  getCoraByRef(ref?: string | null) {
    return this.apiService
      .post<{ cora: Cora }>(this.endpoint + '/show_cora?reference=' + ref, {})
      .pipe(
        map((res) => res.cora),
        catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
      );
  }

  getAgentById(id: number) {
    return this.apiService
      .post<{ agent: AgentCoraDetail }>(this.endpoint + '/show_agent', { agent: id })
      .pipe(
        map((res) => res.agent),
        catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
      );
  }

  getAgentsEnAttente() {
    return this.apiService.get<{ agents: AgentEnAttente[] }>(this.endpoint + '/agent_attente').pipe(
      map((res) => res.agents),
      catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
    );
  }

  getGestionnaires() {
    return this.apiService.get<{ data: Gestionnaire[] }>(this.endpoint + '/all_gestionnaires').pipe(
      map((res) => res.data),
      catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
    );
  }

  getCommunes() {
    return this.apiService
      .get<{ communes: { id: number; libelle: string }[] }>('/pays_commune')
      .pipe(
        map((res) => res.communes),
        catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
      );
  }

  getQuartiersByCommune(communeId: number) {
    return this.apiService.get<{ quartiers: string[] }>(`/quartiers?commune=${communeId}`).pipe(
      map((res) => res.quartiers ?? []),
      catchError(() => of([])),
    );
  }

  getPublicCoraList() {
    return this.apiService.get<{ coras: Cora[] }>(this.endpoint + '/cora_list').pipe(
      map((res) => res.coras),
      catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
    );
  }

  getMesCoras() {
    return this.apiService.get<{ coras: Cora[] }>(this.endpoint + '/cora_list').pipe(
      map((res) => res.coras),
      catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
    );
  }

  getCreateAgentFormData() {
    return forkJoin({
      communes: this.apiService
        .get<{ communes: { id: number; libelle: string }[] }>('/pays_commune')
        .pipe(map((res) => res.communes)),
      coras: this.apiService
        .get<{ coras: CoraRefDesig[] }>(this.endpoint + '/coras_list_ref_design')
        .pipe(map((res) => res.coras)),
    }).pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  saveAgent(data: CreateAgentDto) {
    return this.apiService
      .post<{ agent: AgentCoraDetail }>(this.endpoint + '/save_agent', data)
      .pipe(
        map((res) => res.agent),
        catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
      );
  }

  updateAgent(data: CreateAgentDto & { agent: number }) {
    return this.apiService
      .put<{ agent: AgentCoraDetail }>(this.endpoint + '/update_agent', data)
      .pipe(
        map((res) => res.agent),
        catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
      );
  }

  updatePmobile(agentId: number, pmobileNumber: string) {
    return this.apiService
      .post(this.endpoint + '/update_pmobile_number', { agent: agentId, pmobileNumber })
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  searchCoras(filtre: CoraFiltre) {
    return this.apiService.post<{ data: Cora[] }>(this.endpoint + '/recherce_cora', filtre).pipe(
      map((res) => res.data),
      catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
    );
  }

  sendAgentForValidation(agentId: number) {
    return this.apiService
      .post(this.endpoint + '/change_statut_agent_evaluation', { agent: agentId })
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  closeAgent(agentId: number) {
    return this.apiService
      .post(this.endpoint + '/cloturer_agent', { agent: agentId })
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  saveDecision(data: { decision: number; observation: string; agent: number }) {
    return this.apiService
      .post(this.endpoint + '/save_decision', data)
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  savePerfectNumber(data: { agent: number; perfectNumber?: string; pmobileNumber: string }) {
    return this.apiService
      .post(this.endpoint + '/save_perfect_number', data)
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  // ── Fichiers ──────────────────────────────────────────────────────────────
  uploadDocument(agentId: number, libelle: string, file: File) {
    const fd = new FormData();
    fd.append('agent', agentId.toString());
    fd.append('libelle', libelle);
    fd.append('file', file);
    return this.apiService
      .postFormData(this.endpoint + '/save_doc', fd)
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  uploadDocuments(agentId: number, libelle: string, files: FileList) {
    const fd = new FormData();
    fd.append('agent', agentId.toString());
    fd.append('libelle', libelle);
    for (let i = 0; i < files.length; i++) fd.append(`files${i}`, files[i]);
    fd.append('length', files.length.toString());
    return this.apiService
      .postFormData(this.endpoint + '/save_multiple_doc', fd)
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  uploadImage(agentId: number, libelle: string, file: File) {
    const fd = new FormData();
    fd.append('agent', agentId.toString());
    fd.append('libelle', libelle);
    fd.append('description', '');
    fd.append('photo', file);
    return this.apiService
      .postFormData(this.endpoint + '/save_image', fd)
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  uploadImages(agentId: number, libelle: string, files: FileList) {
    const fd = new FormData();
    fd.append('agent', agentId.toString());
    fd.append('libelle', libelle);
    fd.append('description', '');
    for (let i = 0; i < files.length; i++) fd.append(`photos${i}`, files[i]);
    fd.append('length', files.length.toString());
    return this.apiService
      .postFormData(this.endpoint + '/save_multiples_image', fd)
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  deleteDocumentsByType(agentId: number, libelle: string) {
    return this.apiService
      .post(this.endpoint + '/delete_multiple_doc', { agent: agentId, libelle })
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  deleteImagesByType(agentId: number, libelle: string) {
    return this.apiService
      .post(this.endpoint + '/delete_multiple_image', { agent: agentId, libelle })
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }


  saveEvaluation(data: {
    agent: number; historique: string; agenceProche: string;
    distanceAgence: number; securite: string;
    forces: string[]; faibesses: string[]; commentaire: string;
  }) {
    return this.apiService
      .post(this.endpoint + '/save_evaluation', data)
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }

  updateEvaluation(data: {
    agent: number; historique: string; agenceProche: string;
    distanceAgence: number; securite: string;
    forces: string[]; faibesses: string[]; commentaire: string;
  }) {
    return this.apiService
      .post(this.endpoint + '/update_evaluation', data)
      .pipe(catchError((err) => throwError(() => ({ status: err.status, message: err.message }))));
  }
}
