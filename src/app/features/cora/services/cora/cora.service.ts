import { ApiService } from '@/core/services/api/api.service';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoraService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = '/cora';
  constructor() {}

  getDashboardCoraData() {
    return this.apiService.get(this.endpoint + '/dashboard_cora').pipe(
      catchError((err) => {
        return throwError(() => ({ status: err.status, message: err.message }));
      }),
    );
  }
}
