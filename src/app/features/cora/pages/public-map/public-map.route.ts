import { corasPublicResolver, communesPublicResolver, gestionnairesPublicResolver } from './public-map.resolver';
import { Route } from '@angular/router';

export const coraMapRoute: Route = {
  path: 'cora-map',
  resolve: {
    coras: corasPublicResolver,
    communes: communesPublicResolver,
    gestionnaires: gestionnairesPublicResolver,
  },
  loadComponent: () =>
    import('./public-map.component').then((m) => m.PublicMapComponent),
};
