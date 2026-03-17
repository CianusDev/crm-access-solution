import { Pipe, PipeTransform, inject } from '@angular/core';
import { UserRole } from '@/core/models/user.model';
import { PermissionService } from '@/core/services/permission/permission.service';

/**
 * Vérifie si l'utilisateur connecté possède l'un des rôles fournis.
 *
 * Usage dans un template :
 *   @if (UserRole.Admin | hasRole)           — un seul rôle
 *   @if ([UserRole.Admin, UserRole.DG] | hasRole)  — plusieurs rôles (OU)
 */
@Pipe({
  name: 'hasRole',
  standalone: true,
  pure: false, // recalcule si le signal currentUser change
})
export class HasRolePipe implements PipeTransform {
  private readonly permissions = inject(PermissionService);

  transform(roles: UserRole | UserRole[]): boolean {
    const list = Array.isArray(roles) ? roles : [roles];
    return this.permissions.hasRole(...list);
  }
}
