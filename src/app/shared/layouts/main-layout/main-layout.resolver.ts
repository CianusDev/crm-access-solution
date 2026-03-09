import { User } from '@/core/models/user.model';
import { AuthService } from '@/core/services/auth/auth.service';
import { LocalStorageService } from '@/core/services/local-storage/local-storage.service';
import { USER_ID } from '@/core/constants/local-storage-key';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Résolveur qui retourne un Observable<User | null>.
 *
 * Comportement :
 * - Si AuthService possède déjà un utilisateur courant (signal), l'émet immédiatement.
 * - Sinon, si un token et un userId sont présents, appelle fetchCurrentUser(userId)
 *   et mappe la réponse HTTP vers l'utilisateur (response.data). AuthService.fetchCurrentUser
 *   met déjà à jour le signal du service via son effet de bord (tap), donc la valeur mappée
 *   reflétera l'utilisateur récupéré.
 * - En cas d'erreur ou s'il manque le token/userId, émet null.
 */
export const currentUserResolver: ResolveFn<User | null> = (): Observable<User | null> => {
  const authService = inject(AuthService);
  const localStorageService = inject(LocalStorageService);

  // Si le signal currentUser contient déjà un utilisateur, le retourne comme observable.
  const current = authService.currentUser();
  if (current) {
    return of(current as User);
  }

  // Si on a un token et un userId stocké, tente de récupérer l'utilisateur courant.
  const token = authService.getToken();
  const userId = localStorageService.getState<number>(USER_ID);

  if (token && userId != null) {
    return authService.fetchCurrentUser(userId).pipe(
      // fetchCurrentUser retourne la réponse HTTP (qui contient `.data`).
      // Mappe vers l'objet utilisateur réel. Si la forme de la réponse diffère,
      // on revient au signal du service (qui est mis à jour dans le tap du fetch).
      map((res) => {
        const maybeUser = res && (res.data ?? res);
        return (maybeUser as User) ?? (authService.currentUser() as User | null);
      }),
      catchError(() => {
        // Émet null en cas d'erreur pour permettre à la navigation de continuer.
        return of(null);
      }),
    );
  }

  // Pas de token/userId disponible -> émet null.
  return of(null);
};
