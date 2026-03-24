import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { UserRole } from '@/core/models/user.model';
import { AuthService } from '@/core/services/auth/auth.service';
import { PermissionService } from '@/core/services/permission/permission.service';

/**
 * Guard de route basé sur les rôles utilisateur.
 *
 * Usage dans app.routes.ts :
 *   canActivate: [roleGuard([UserRole.Admin, UserRole.DG])]
 *
 * Redirige vers /app/home si l'utilisateur n'a pas le bon rôle.
 * Attend la fin de l'initialisation de l'auth avant de trancher (évite la
 * race condition au refresh / saisie directe d'URL).
 */
export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const permissions = inject(PermissionService);
    const router = inject(Router);

    const check = () =>
      permissions.hasRole(...allowedRoles) ? true : router.createUrlTree(['/app/home']);

    if (auth.initialized()) {
      return check();
    }

    return toObservable(auth.initialized).pipe(
      filter((done) => done),
      take(1),
      map(() => check()),
    );
  };
};
