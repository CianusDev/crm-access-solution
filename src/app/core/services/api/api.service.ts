import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiErrorBody } from './api.interface';
import { DEFAULT_ERROR_MESSAGE } from '@/core/constants/error-messages';
import { AuthService } from '../auth/auth.service';
import { TOKEN, USER_ID } from '@/core/constants/local-storage-key';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { Router } from '@angular/router';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl: string = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);
  private localStorageService = inject(LocalStorageService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  private handleResponse<T>() {
    return map<T, T>((res) => {
      const body = res as unknown as Record<string, unknown>;

      // console.log('API Response:', body); // Log the response for debugging

      if (body['status'] === 0) {
        this.localStorageService.removeState(TOKEN);
        this.localStorageService.removeState(USER_ID);
        this.router.navigate(['/auth/login']);
      }

      if (body['message'] && body['message'].toString().toLowerCase() === 'success') {
        return res;
        // console.warn('API Warning:', body['message'].toString().toLowerCase());
        // this.toast.warning(String(body['message']) ?? DEFAULT_ERROR_MESSAGE);
      }

      if (body['status'] && typeof body['status'] === 'number' && body['status'] >= 400) {
        this.toast.error(String(body['message']) ?? DEFAULT_ERROR_MESSAGE);
        throw {
          status: body['status'],
          message: body['message'] ?? DEFAULT_ERROR_MESSAGE,
        } as ApiErrorBody;
      }

      return res;
    });
  }

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(`${this.apiUrl}${endpoint}`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(this.handleResponse<T>());
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.apiUrl}${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(this.handleResponse<T>());
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(`${this.apiUrl}${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(this.handleResponse<T>());
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .patch<T>(`${this.apiUrl}${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(this.handleResponse<T>());
  }

  postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, formData).pipe(this.handleResponse<T>());
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.apiUrl}${endpoint}`, {
        headers: this.getHeaders(),
      })
      .pipe(this.handleResponse<T>());
  }
}
