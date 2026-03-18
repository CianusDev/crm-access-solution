import { Route } from '@angular/router';
import { UserRole } from '@/core/models/user.model';
import { roleGuard } from '@/core/guards/role.guard';

const ADMIN_ROLES: UserRole[] = [UserRole.Admin, UserRole.DG, UserRole.DGA];

export const PARAMETRES_ROUTES: Route = {
  path: 'parametres',
  canActivateChild: [roleGuard(ADMIN_ROLES)],
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'utilisateurs',
    },
    {
      path: 'utilisateurs',
      loadComponent: () =>
        import('./pages/utilisateurs/utilisateurs.component').then((m) => m.UtilisateursComponent),
    },
    {
      path: 'utilisateurs/:id',
      loadComponent: () =>
        import('./pages/utilisateur-detail/utilisateur-detail.component').then((m) => m.UtilisateurDetailComponent),
    },
    {
      path: 'configuration',
      loadComponent: () =>
        import('./pages/configuration/configuration.component').then((m) => m.ConfigurationComponent),
    },
  ],
};
