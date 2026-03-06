import { TOKEN, USER_ID } from '@/core/constants/local-storage-key';
import { User } from '@/core/models/user.model';
import { LoginDto } from '@/features/auth/interfaces/login-dto.interface';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { LoggerService } from '../logger/logger.service';
import { CurrentUserResponse, LoginResponse } from './auth.interface';
import { DEFAULT_ERROR_MESSAGE } from '@/core/constants/error-messages';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiService = inject(ApiService);
  private localStorageService = inject(LocalStorageService);
  private logger = inject(LoggerService);

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser() && !!this.getToken());

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const userId = this.localStorageService.getState<number>(USER_ID);

    if (token && userId != null) {
      this.fetchCurrentUser(userId).subscribe({
        error: (err) => {
          this.logger.error({
            message: 'initializeAuth failed',
            data: { status: err.status, error: err.message },
          });

          // Only logout if the token is truly invalid (401)
          // For other errors (network, 500, etc.), keep the session alive
          if (err.status === 401) {
            this.logout();
          }
        },
      });
    }
  }

  fetchCurrentUser(id: number): Observable<CurrentUserResponse> {
    return this.apiService.get<CurrentUserResponse>('/users/show_user/' + id).pipe(
      tap((user) => {
        this.logger.info({
          message: 'fetchCurrentUser success',
          data: { user: user.data },
        });
        this.currentUser.set(user.data);
      }),
      catchError((err) => {
        this.currentUser.set(null);
        return throwError(() => err);
      }),
    );
  }

  login(data: LoginDto): Observable<CurrentUserResponse> {
    return this.apiService.post<LoginResponse>('/login', data).pipe(
      tap((res) => {
        this.localStorageService.setState(TOKEN, res.token);
        this.localStorageService.setState(USER_ID, res.user.id);
      }),
      switchMap((res) => this.fetchCurrentUser(res.user.id)),
      catchError((err) => {
        this.currentUser.set(null);
        this.localStorageService.removeState(TOKEN);
        this.localStorageService.removeState(USER_ID);
        let errorMessage = DEFAULT_ERROR_MESSAGE;

        if (err.status === 401) {
          errorMessage = 'Identifiants incorrects. Veuillez vérifier votre email et mot de passe.';
        } else if (err.status === 403) {
          errorMessage = "Accès refusé. Vous n'avez pas la permission.";
        } else if (err.status === 500) {
          errorMessage = 'Erreur serveur. Merci de réessayer plus tard.';
        }

        return throwError(() => ({ status: err.status, message: errorMessage }));
      }),
    );
  }

  logout(): void {
    this.currentUser.set(null);
    this.localStorageService.removeState(TOKEN);
    this.localStorageService.removeState(USER_ID);
  }

  getToken(): string | null {
    return this.localStorageService.getState<string>(TOKEN) ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
