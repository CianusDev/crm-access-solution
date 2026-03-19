# Architecture du projet CRM Access Solution

## Vue d'ensemble

| Élément | Valeur |
|---|---|
| Framework | Angular 21.2.0 |
| Style d'architecture | Composants standalone, signals, pattern resolver |
| Outil de build | Angular CLI + Vite |
| Langage | TypeScript 5.9 |
| CSS | Tailwind CSS 4 |
| Tests | Vitest |
| Locale | Français (fr) |

---

## Table des matières

1. [Structure des dossiers](#1-structure-des-dossiers)
2. [Core](#2-core)
3. [Features](#3-features)
4. [Shared](#4-shared)
5. [Flux de navigation](#5-flux-de-navigation)
6. [Gestion des rôles (RBAC)](#6-gestion-des-rôles-rbac)
7. [Environnements](#7-environnements)
8. [Dépendances principales](#8-dépendances-principales)

---

## 1. Structure des dossiers

```
src/
├── app/
│   ├── app.ts                  ← Composant racine
│   ├── app.config.ts           ← Configuration Angular (providers, router, HTTP)
│   ├── app.routes.ts           ← Assembly des routes racines
│   ├── core/                   ← Services transversaux (singleton)
│   ├── features/               ← Domaines métier
│   └── shared/                 ← UI réutilisable (composants, pipes, directives)
├── environments/
│   ├── environment.ts          ← Dev
│   └── environment.prod.ts     ← Production
└── main.ts                     ← Bootstrap
```

---

## 2. Core

Tout ce qui est transversal à l'application et instancié en singleton.

```
core/
├── constants/
│   ├── cora-form.ts            ← Configuration des formulaires CORA
│   ├── error-messages.ts       ← Messages d'erreur applicatifs
│   ├── local-storage-key.ts    ← Clés de stockage local
│   ├── power-bi-links.ts       ← Liens des dashboards Power BI
│   └── sidebar-menu.ts         ← Structure du menu latéral
├── guards/
│   ├── auth.guard.ts           ← Vérifie l'authentification
│   ├── guest.guard.ts          ← Redirige les utilisateurs déjà connectés
│   └── role.guard.ts           ← Contrôle d'accès par rôle
├── interceptors/
│   └── auth.interceptor.ts     ← Injection automatique du token JWT
├── interfaces/
│   └── environment.interface.ts
├── models/
│   ├── user.model.ts           ← Modèle utilisateur + enum UserRole
│   └── manager.model.ts
├── services/
│   ├── api/                    ← Service HTTP de base (api.service.ts)
│   ├── auth/                   ← Authentification (auth.service.ts)
│   ├── export/                 ← Export Excel (excel-export.service.ts) et PDF (pdf-export.service.ts)
│   ├── local-storage/          ← Wrapper localStorage
│   ├── logger/                 ← Journalisation (logger.service.ts)
│   ├── permission/             ← Vérification des permissions
│   └── toast/                  ← Notifications toast
└── utils/
    ├── http-helper.ts
    └── inject-logger.ts
```

**Alias TypeScript :** `@/*` → `./src/app/*`
Exemple : `import { roleGuard } from '@/core/guards/role.guard'`

---

## 3. Features

Chaque feature est un domaine métier isolé. Elle possède ses propres routes, pages, services et interfaces.

```
features/
├── auth/           ← Authentification
├── home/           ← Page d'accueil
├── cora/           ← Gestion des CORA (Certificats d'enregistrement)
├── asc/            ← Gestion des ASC
├── credit/         ← Gestion des crédits
├── parametres/     ← Configuration et utilisateurs
└── power-bi/       ← Dashboards Power BI
```

### Structure interne d'une feature

```
features/<feature>/
├── <feature>.route.ts          ← Route unique (objet Route, export camelCase)
├── pages/
│   └── <page>/
│       ├── <page>.component.ts
│       ├── <page>.component.html
│       ├── <page>.component.scss
│       └── <page>.resolver.ts  ← Données résolues avant navigation
├── services/
│   └── <feature>/
│       └── <feature>.service.ts
├── interfaces/
│   └── <feature>.interface.ts
└── components/                 ← Composants partagés au sein de la feature (si besoin)
```

### Détail des features

#### Auth
- **Route :** `/auth`
- **Pages :** `login`
- **Composants :** `login-form`
- **Interfaces :** `login-dto.interface.ts`

#### Home
- **Route :** `/app/home`
- **Pages :** `home` (page d'accueil après connexion)

#### CORA
- **Route :** `/app/cora` + route publique `/cora-map`
- **Pages :**
  - `dashboard` — tableau de bord
  - `create-cora` — création d'une CORA
  - `list-cora` — liste des CORA
  - `detail-cora` — fiche détail
  - `pending-cora` — demandes en attente
  - `mes-coras` — CORA de l'utilisateur connecté
  - `create-agent` — création d'un agent
  - `detail-agent` — fiche agent
  - `public-map` — carte publique (sans authentification)
- **Services :** `cora.service.ts`
- **Composants internes :** `cora-form`, `cora-manager-table`, `cora-map`, `stats-card`
- **Interfaces :** `cora.interface.ts`

#### ASC
- **Route :** `/app/asc`
- **Pages :**
  - `dashboard` — tableau de bord siège
  - `dashboard-agence` — tableau de bord agence
  - `create` — création d'une demande ASC
  - `client-search` — recherche client
  - `list` — liste des demandes
  - `detail` — fiche détail
  - `pending` — demandes en attente
  - `tireurs` — gestion des tireurs
  - `cheques-attente` — chèques en attente
  - `cheque-detail` — fiche chèque
- **Services :** `asc.service.ts`
- **Interfaces :** `asc.interface.ts`

#### Credit
- **Route :** `/app/credit`
- **Pages :**
  - `dashboard` — tableau de bord siège
  - `dashboard-agence` — tableau de bord agence
  - `create` — création d'une demande de crédit
  - `list` — liste des demandes
  - `analyse/:ref` — analyse crédit avec sous-sections :
    - `achats`, `activite`, `cautions`, `envoi`, `familial`, `garanties`, `geolocalisation`, `swot`, `tresorerie`
  - `fiche/:ref` — fiche crédit complète
  - `resume/:ref` — résumé crédit
  - `employeur/list` — liste des employeurs
  - `employeur/:id` — fiche employeur
  - `tirage/list` — liste des tirages
  - `tirage/:ref` — fiche tirage
  - `organigramme` — organigramme
  - `detail-agence/:code` — fiche agence
- **Services :** `credit.service.ts`, `credit-pdf.service.ts`
- **Interfaces :** `credit.interface.ts`
- **Utils :** `credit-navigation.ts`

#### Parametres
- **Route :** `/app/parametres`
- **Accès :** Admin, DG, DGA uniquement (`canActivateChild`)
- **Pages :**
  - `utilisateurs` — gestion des utilisateurs
  - `utilisateur-detail/:id` — fiche utilisateur
  - `configuration` — configuration générale (agences, ASC, crédit, zonification)
- **Services :** `parametres.service.ts`
- **Interfaces :** `parametres.interface.ts`

#### Power BI
- **Route :** `/app/power-bi`
- **Pages :** `dashboard` — iframe vers les dashboards Power BI
- **Services :** `power-bi.service.ts`
- **Interfaces :** `power-bi.interface.ts`

---

## 4. Shared

Composants, directives et pipes réutilisables dans toutes les features.

```
shared/
├── components/
│   ├── Formulaires   → form-input, form-checkbox, form-radio-group, form-select, form-textarea
│   ├── Navigation    → breadcrumb, sidebar, dropdown
│   ├── Données       → table, pagination, badge, stats-card
│   ├── Graphiques    → bar-chart, donut-chart, line-chart  (Chart.js)
│   ├── Modales       → dialog, drawer
│   ├── Notifications → toast, toast-container
│   └── Utilitaires   → avatar, button, card, logo, not-found, iframe, searchable-select, tabs
├── layouts/
│   ├── main-layout/  ← Layout principal (sidebar + router-outlet) + resolver currentUser
│   ├── auth-layout/  ← Layout authentification
│   └── route-loader/ ← Indicateur de chargement lors des navigations
├── directives/
│   └── ui/           ← Directives de style : button, h1, h2, input, label, select, table
└── pipes/
    ├── has-role/     ← Vérifie si l'utilisateur possède un rôle donné
    ├── initiales/    ← Extrait les initiales d'un nom
    └── safe-url/     ← Sanitize les URLs (DomSanitizer)
```

---

## 5. Flux de navigation

### Arborescence des routes

```
/                       → redirige vers /auth
/auth                   → AuthLayout (guest.guard)
  /auth/login           → LoginPage
/cora-map               → PublicMapComponent (public, sans auth)
/app                    → MainLayout (authGuard + currentUserResolver)
  /app/home             → HomeComponent
  /app/cora/*           → Feature CORA
  /app/asc/*            → Feature ASC
  /app/credit/*         → Feature Credit
  /app/parametres/*     → Feature Parametres (roleGuard Admin/DG/DGA)
  /app/power-bi/*       → Feature Power BI
/**                     → NotFound (404)
```

### Structure du layout principal

```
App
└── RouterOutlet
    ├── AuthLayout      (pour /auth)
    │   └── RouterOutlet
    └── MainLayout      (pour /app)
        ├── Sidebar
        ├── RouteLoader
        └── RouterOutlet (features)
```

### Cycle de vie d'une navigation protégée

```
Clic sur un lien
  → authGuard (token valide ?)
    → roleGuard (rôle autorisé ?)
      → Resolver(s) (chargement des données HTTP)
        → Composant instancié avec les données en input()
```

---

## 6. Gestion des rôles (RBAC)

### Enum UserRole

Défini dans `core/models/user.model.ts`. Tous les rôles de l'application sont centralisés dans cet enum.

### Guard

```typescript
canActivate: [roleGuard([...GROUPE_ROLE])]
```

### Pattern dans les fichiers de routes

```typescript
const { Admin, DG, ChefAgence: CA } = UserRole;

const FEATURE_SIEGE = [Admin, DG] as const;
const FEATURE_AGENCE = [CA] as const;
```

Les groupes sont définis localement dans chaque fichier `<feature>.route.ts`, avec des noms en `SCREAMING_SNAKE_CASE` préfixés par le nom de la feature (ex. `CREDIT_ALL`, `CORA_CHARGE`).

---

## 7. Environnements

| Variable | Développement | Production |
|---|---|---|
| `production` | `false` | `true` |
| `apiUrl` | `https://backend-dev.creditaccess.ci/api` | `http://localhost:3000/api` |
| `logLevel` | `debug` | `error` |

---

## 8. Dépendances principales

### Angular & Core
| Package | Version | Usage |
|---|---|---|
| `@angular/core` | ^21.2.0 | Framework principal |
| `@angular/router` | ^21.2.0 | Routing |
| `@angular/forms` | ^21.2.0 | Formulaires réactifs |
| `@angular/platform-server` | ^21.2.0 | SSR |
| `rxjs` | ~7.8.0 | Programmation réactive |

### UI & Style
| Package | Version | Usage |
|---|---|---|
| `tailwindcss` | ^4.1.12 | Utilitaires CSS |
| `lucide-angular` | ^0.577.0 | Icônes |
| `class-variance-authority` | ^0.7.1 | Variantes de classes CSS |

### Visualisation
| Package | Version | Usage |
|---|---|---|
| `chart.js` | ^4.5.1 | Graphiques (bar, donut, line) |
| `leaflet` | ^1.9.4 | Cartes interactives |
| `@angular/google-maps` | ^21.2.1 | Intégration Google Maps |

### Export
| Package | Version | Usage |
|---|---|---|
| `pdfmake` | ^0.3.6 | Génération de PDF |
| `exceljs` | ^4.4.0 | Génération de fichiers Excel |
| `file-saver` | ^2.0.5 | Téléchargement de fichiers |

### Dev
| Package | Version | Usage |
|---|---|---|
| `typescript` | ~5.9.2 | Langage |
| `vitest` | ^4.0.8 | Tests unitaires |
| `prettier` | ^3.8.1 | Formatage du code |
