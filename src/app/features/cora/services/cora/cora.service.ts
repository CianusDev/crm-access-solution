import { ApiService } from '@/core/services/api/api.service';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, throwError } from 'rxjs';
import { CoraFormData, CreateCoraDto } from '../../interfaces/create-cora-dto.interface';
import { Cora, CoraFiltre, Gestionnaire, ListCoraData } from '../../interfaces/cora.interface';

@Injectable({
  providedIn: 'root',
})
export class CoraService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = '/cora';
  constructor() {}

  getDashboardCoraData() {
    return this.apiService.get(this.endpoint + '/dashboard_cora').pipe(
      catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
    );
  }

  getFormData() {
    return this.apiService.get<CoraFormData>('/pays_commune').pipe(
      catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
    );
  }

  createCora(data: CreateCoraDto) {
    return this.apiService.post(this.endpoint + '/save_cora', data).pipe(
      catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
    );
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
    }).pipe(
      catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
    );
  }

  searchCoras(filtre: CoraFiltre) {
    return this.apiService.post<{ data: Cora[] }>(this.endpoint + '/recherce_cora', filtre).pipe(
      map((res) => res.data),
      catchError((err) => throwError(() => ({ status: err.status, message: err.message }))),
    );
  }
}
