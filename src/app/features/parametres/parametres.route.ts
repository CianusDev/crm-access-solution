import { utilisateursResolver } from './pages/utilisateurs/utilisateurs.resolver';
import { utilisateurDetailResolver } from './pages/utilisateur-detail/utilisateur-detail.resolver';
import { Route } from '@angular/router';
import { roleGuard } from '@/core/guards/role.guard';
import { UserRole } from '@/core/models/user.model';

const { Admin, DG, DGA } = UserRole;

const PARAMS_ADMINS = [Admin, DG, DGA] as const;

export const parametresRoutes: Route = {
  path: 'parametres',
  canActivateChild: [roleGuard([...PARAMS_ADMINS])],
  children: [
    {
      path: 'utilisateurs',
      resolve: { utilisateurs: utilisateursResolver },
      loadComponent: () =>
        import('./pages/utilisateurs/utilisateurs.component').then((m) => m.UtilisateursComponent),
    },
    {
      path: 'utilisateurs/:id',
      resolve: { data: utilisateurDetailResolver },
      loadComponent: () =>
        import('./pages/utilisateur-detail/utilisateur-detail.component').then((m) => m.UtilisateurDetailComponent),
    },
    {
      path: 'configuration',
      loadComponent: () =>
        import('./pages/configuration/configuration.component').then((m) => m.ConfigurationComponent),
    },
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'utilisateurs',
    },
  ],
};
