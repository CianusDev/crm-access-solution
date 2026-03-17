import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '@/core/models/user.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly auth = inject(AuthService);

  /** Rôle de l'utilisateur connecté (null si non connecté) */
  readonly userRole = computed<UserRole | null>(() => {
    const name = this.auth.currentUser()?.profil?.name;
    return (name as UserRole) ?? null;
  });

  /** Vérifie si l'utilisateur a l'un des rôles passés en paramètre */
  hasRole(...roles: UserRole[]): boolean {
    const current = this.userRole();
    if (!current) return false;
    return roles.includes(current);
  }

  /** Vérifie si l'utilisateur n'a aucun des rôles passés en paramètre */
  lacksRole(...roles: UserRole[]): boolean {
    return !this.hasRole(...roles);
  }
}
