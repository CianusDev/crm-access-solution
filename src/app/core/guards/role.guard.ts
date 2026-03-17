import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '@/core/models/user.model';
import { PermissionService } from '@/core/services/permission/permission.service';

/**
 * Guard de route basé sur les rôles utilisateur.
 *
 * Usage dans app.routes.ts :
 *   canActivate: [roleGuard([UserRole.Admin, UserRole.DG])]
 *
 * Redirige vers /app/home si l'utilisateur n'a pas le bon rôle.
 */
export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const permissions = inject(PermissionService);
    const router = inject(Router);

    if (permissions.hasRole(...allowedRoles)) {
      return true;
    }

    return router.createUrlTree(['/app/home']);
  };
};
