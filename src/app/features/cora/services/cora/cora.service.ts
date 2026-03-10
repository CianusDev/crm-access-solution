import { ApiService } from '@/core/services/api/api.service';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { CoraFormData, CreateCoraDto } from '../../interfaces/create-cora-dto.interface';

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
}
