import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiErrorBody } from './api.interface';
import { DEFAULT_ERROR_MESSAGE } from '@/core/constants/error-messages';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl: string = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  private handleResponse<T>() {
    return map<T, T>((res) => {
      const body = res as unknown as Record<string, unknown>;

      if (body['status'] && typeof body['status'] === 'number' && body['status'] >= 400) {
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

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.apiUrl}${endpoint}`, {
        headers: this.getHeaders(),
      })
      .pipe(this.handleResponse<T>());
  }
}
