import { corasPublicResolver, communesPublicResolver } from './public-map.resolver';
import { Route } from '@angular/router';

export const coraMapRoute: Route = {
  path: 'cora-map',
  resolve: {
    coras: corasPublicResolver,
    communes: communesPublicResolver,
  },
  loadComponent: () =>
    import('./public-map.component').then((m) => m.PublicMapComponent),
};
