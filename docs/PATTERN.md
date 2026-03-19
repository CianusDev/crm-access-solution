# Patterns & Conventions

Ce document décrit les patterns et conventions à respecter dans cette codebase. Toute nouvelle fonctionnalité doit s'y conformer. La feature **CORA** sert d'implémentation de référence.

---

## Table des matières

1. [Fichiers de routes](#1-fichiers-de-routes)
2. [Fichiers de resolvers](#2-fichiers-de-resolvers)
3. [Consommation des données dans les composants](#3-consommation-des-données-dans-les-composants)
4. [Guards de rôles & alias UserRole](#4-guards-de-rôles--alias-userrole)
5. [Assembly dans app.routes.ts](#5-assembly-dans-approutests)
6. [Co-location des fichiers](#6-co-location-des-fichiers)

---

## 1. Fichiers de routes

### Emplacement

```
src/app/features/<feature>/<feature>.route.ts
```

### Règles

- Exporter un **unique objet `Route`** (pas un tableau `Routes`).
- Le nom de l'export est en **camelCase** : `featureRoutes`.
- Le `path` est défini **à l'intérieur** du fichier de route de la feature, pas dans `app.routes.ts`.
- Ordre des imports : **resolvers en premier**, puis `Route`, puis `roleGuard`, puis `UserRole`.
- L'entrée `redirectTo` est toujours **en dernière position** dans le tableau `children`.
- Utiliser `canActivate: [roleGuard([...GROUPE_ROLE])]` par route (pas `canActivateChild`), sauf si le guard doit s'appliquer à tous les enfants d'un coup.

### Modèle

```typescript
import { somePageResolver } from './pages/some-page/some-page.resolver';
import { anotherPageResolver } from './pages/another-page/another-page.resolver';
import { Route } from '@angular/router';
import { roleGuard } from '@/core/guards/role.guard';
import { UserRole } from '@/core/models/user.model';

const { Admin, DG, DGA } = UserRole;

const FEATURE_ALL = [Admin, DG, DGA] as const;
const FEATURE_ADMIN = [Admin] as const;

export const featureRoutes: Route = {
  path: 'feature',
  children: [
    {
      path: 'some-page',
      canActivate: [roleGuard([...FEATURE_ALL])],
      resolve: { data: somePageResolver },
      loadComponent: () =>
        import('./pages/some-page/some-page.component').then((m) => m.SomePageComponent),
    },
    {
      path: 'another-page',
      canActivate: [roleGuard([...FEATURE_ADMIN])],
      resolve: { data: anotherPageResolver },
      loadComponent: () =>
        import('./pages/another-page/another-page.component').then((m) => m.AnotherPageComponent),
    },
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'some-page',
    },
  ],
};
```

### Alias UserRole — SCREAMING_SNAKE_CASE

Déstructurer `UserRole` avec des alias en **SCREAMING_SNAKE_CASE** :

```typescript
const {
  Admin, DG, DGA,
  DirectriceExploitation: D_EXPL,
  ResponsableExploitation: RESPO_EXPL,
  ChefAgence: CA,
  ChefAgenceAdjoint: CAA,
  conseilClientele: CC,
} = UserRole;
```

### Constantes de groupes de rôles — pattern FEATURE_GROUPE

Nommer les constantes de groupes de rôles sous la forme `FEATURE_GROUPE` en SCREAMING_SNAKE_CASE :

```typescript
const CREDIT_SIEGE = [Admin, DG, DGA, D_EXPL] as const;
const CREDIT_AGENCE = [CA, CAA, CC] as const;
const CREDIT_ALL = [...new Set([...CREDIT_SIEGE, ...CREDIT_AGENCE])] as const;
```

---

## 2. Fichiers de resolvers

### Emplacement

Co-localisé à côté du composant qu'il alimente :

```
src/app/features/<feature>/pages/<page>/<page>.resolver.ts
src/app/features/<feature>/pages/<page>/<page>.component.ts   ← même dossier
```

### Règles

- Utiliser des resolvers fonctionnels `ResolveFn<T>` — pas de classes.
- **Un resolver par clé de données.** Ne pas utiliser `forkJoin` pour regrouper plusieurs valeurs dans un seul resolver ; utiliser des fonctions séparées.
- Le nom de la fonction resolver doit correspondre à la clé de route sous laquelle il sera utilisé.
- Nom de l'export : `<clé><Feature>Resolver` (camelCase).

### Modèle — valeur unique

```typescript
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FeatureService } from '../../services/feature/feature.service';
import { SomeModel } from '../../interfaces/feature.interface';

export const dataFeatureResolver: ResolveFn<SomeModel> = () => {
  return inject(FeatureService).getSomeData();
};
```

### Modèle — plusieurs valeurs sur la même route

Quand une route a besoin de plusieurs sources de données indépendantes, déclarer des **resolvers séparés** :

```typescript
// create-feature.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FeatureService } from '../../services/feature/feature.service';
import { Banque, Nature } from '../../interfaces/feature.interface';

export const banquesFeatureResolver: ResolveFn<Banque[]> = () =>
  inject(FeatureService).getBanques();

export const naturesFeatureResolver: ResolveFn<Nature[]> = () =>
  inject(FeatureService).getNatures();
```

Puis dans le fichier de route :

```typescript
{
  path: 'create',
  resolve: {
    banques: banquesFeatureResolver,   // le composant doit avoir : banques = input<Banque[]>()
    natures: naturesFeatureResolver,   // le composant doit avoir : natures = input<Nature[]>()
  },
  loadComponent: () =>
    import('./pages/create/create-feature.component').then((m) => m.CreateFeatureComponent),
},
```

---

## 3. Consommation des données dans les composants

### La règle critique

Angular injecte les données résolues dans les composants standalone sous forme de **signal inputs**. Le nom de l'`input()` dans le composant **doit correspondre exactement** à la clé utilisée dans `resolve` sur la route.

```typescript
// route :      resolve: { utilisateurs: utilisateursResolver }
// composant :  readonly utilisateurs = input<Utilisateur[]>();     ✅
//              readonly utilisateursInput = input<Utilisateur[]>(); ❌ ne recevra pas les données
```

### Pattern — input + signal + effect

Utiliser `input()` pour recevoir les données résolues, un `signal()` mutable pour l'état local (permet de recharger sans navigation), et `effect()` pour les synchroniser :

```typescript
import { Component, effect, inject, input, signal } from '@angular/core';
import { SomeModel } from '../../interfaces/feature.interface';
import { FeatureService } from '../../services/feature/feature.service';

@Component({ ... })
export class SomePageComponent {
  private readonly featureService = inject(FeatureService);

  // Correspond exactement à la clé resolve de la route
  readonly data = input<SomeModel>();

  // Copie locale mutable — permet le rechargement
  protected items = signal<SomeModel | undefined>(undefined);

  constructor() {
    effect(() => {
      const d = this.data();
      if (d) this.items.set(d);
    }, { allowSignalWrites: true });
  }

  load(): void {
    this.featureService.getSomeData().subscribe((d) => this.items.set(d));
  }
}
```

### Conflits de nommage

Si le nom de l'`input()` entrerait en collision avec un signal existant, **renommer le signal** (et garder l'`input()` avec le nom exact de la clé de route) :

```typescript
// La clé de route est 'dashboard' → l'input doit s'appeler 'dashboard'
// Mais il existe déjà : dashboard = signal<Dashboard | undefined>(undefined)
// Solution : renommer le signal

readonly dashboard = input<Dashboard>();                          // correspond à la clé ✅
protected dashboardData = signal<Dashboard | undefined>(undefined); // signal renommé ✅
```

---

## 4. Guards de rôles & alias UserRole

### Utilisation du guard

```typescript
canActivate: [roleGuard([...GROUPE_ROLE])]
```

Passer un spread d'un tableau `const` — ne jamais inliner la liste des rôles directement.

### Table des alias

| Nom source | Alias |
|---|---|
| `DirectriceExploitation` | `D_EXPL` |
| `ResponsableExploitation` | `RESPO_EXPL` |
| `ResponsableFrontOffice` | `RESPO_FO` |
| `AdministrationAudit` | `ADMIN_AUDIT` |
| `assistanteClientelePME` | `ASSC_PME` |
| `DirecteurRisque` | `DR` |
| `AnalysteRisque` | `AR` |
| `GestionnairePortefeuilles` | `GP` |
| `ChargeDuComite` | `CHARGE_COMIT` |
| `Chargedepartementcredit` | `CDCR` |
| `ResponsableJuridique` | `RESPO_JURIDIQUE` |
| `ResponsableAssurance` | `RESPO_ASSUR` |
| `ResponsableClientelePME` | `RESPO_CLT_PME` |
| `ResponsableClienteleTPE` | `RESPO_CLT_TPE` |
| `ResponsableProduitAgricole` | `RESPO_PROD_AGRI` |
| `ResponsableReseau` | `RESPO_RS` |
| `responsableClient` | `RC` |
| `ChefAgence` | `CA` |
| `ChefAgenceAdjoint` | `CAA` |
| `conseilClientele` | `CC` |
| `ChefEquipe` | `CE` |
| `ChefUnitePolyvalent` | `CUP` |
| `AgentCommercialJunior` | `ACJ` |
| `ChargeDeveloppementCommercial` | `CDC` |
| `ResponsableRegional` | `RESPO_RGL` |
| `SuperviseurRisqueZone` | `SUP_RISQ_ZONE` |
| `SuperviseurPME` | `SUP_PME` |
| `ChargeCoraFinancement` | `CHARGE_CORA` |
| `GestionCoraFinancement` | `GESTION_CORA` |

---

## 5. Assembly dans app.routes.ts

`app.routes.ts` est le fichier d'assemblage racine. Il ne doit contenir **aucune définition de route inline et aucun resolver inline**.

### Règles

- Importer l'objet route de chaque feature et l'utiliser directement dans le tableau `children`.
- Les routes publiques (sans authentification) sont placées **au niveau racine**, en dehors des enfants de `app`.
- Les routes protégées sont regroupées sous le chemin `app` avec `canActivateChild: [authGuard]` et le `currentUserResolver`.

### Modèle

```typescript
import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.route';
import { NotFound } from './shared/components/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { MainLayout } from './shared/layouts/main-layout/main-layout.component';
import { currentUserResolver } from './shared/layouts/main-layout/main-layout.resolver';
import { powerBiRoutes } from './features/power-bi/power-bi.route';
import { coraRoutes } from './features/cora/cora.route';
import { coraMapRoute } from './features/cora/pages/public-map/public-map.route';
import { ascRoutes } from './features/asc/asc.route';
import { creditRoutes } from './features/credit/credit.route';
import { parametresRoutes } from './features/parametres/parametres.route';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth',
  },
  coraMapRoute,   // route publique — sans authentification
  authRoutes,
  {
    path: 'app',
    children: [
      {
        path: '',
        canActivateChild: [authGuard],
        resolve: { currentUser: currentUserResolver },
        component: MainLayout,
        children: [
          {
            path: 'home',
            loadComponent: () =>
              import('./features/home/home.component').then((m) => m.Home),
          },
          powerBiRoutes,
          coraRoutes,
          ascRoutes,
          creditRoutes,
          parametresRoutes,
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'home',
          },
        ],
      },
    ],
  },
  {
    path: '**',
    component: NotFound,
  },
];
```

---

## 6. Co-location des fichiers

Chaque dossier de page regroupe tous les fichiers appartenant à cette page :

```
src/app/features/<feature>/
  <feature>.route.ts              ← définition de route pour toute la feature
  pages/
    <page>/
      <page>.component.ts
      <page>.resolver.ts          ← resolvers utilisés par la route de cette page
      <page>.component.html
      <page>.component.scss
```

Les routes publiques (non authentifiées) placées au niveau racine de `app.routes.ts` co-localisent également leurs fichiers resolver et route dans le dossier de la page :

```
src/app/features/cora/pages/public-map/
  public-map.component.ts
  public-map.resolver.ts    ← corasPublicResolver, communesPublicResolver, gestionnairesPublicResolver
  public-map.route.ts       ← coraMapRoute  (importé par app.routes.ts)
```
