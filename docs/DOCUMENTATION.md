# Documentation — CRM Access Solution

## Vue d'ensemble

**CRM Access Solution** est l'application frontend de gestion de relation client développée pour **Credit Access**, institution financière basée en Côte d'Ivoire. Elle couvre la gestion des crédits, des avances sur chèque (ASC), du réseau CORA, ainsi que l'administration des utilisateurs et la consultation de tableaux de bord Power BI.

### Stack technologique

| Technologie | Version | Rôle |
|---|---|---|
| Angular | 21.2.0 | Framework frontend principal |
| TypeScript | ~5.9.2 | Langage |
| Tailwind CSS | ^4.1.12 | Styles utilitaires |
| RxJS | ~7.8.0 | Programmation réactive |
| Chart.js | ^4.5.1 | Graphiques |
| Leaflet | ^1.9.4 | Cartes interactives |
| pdfmake | ^0.3.6 | Génération PDF |
| exceljs | ^4.4.0 | Export Excel |
| Vitest | ^4.0.8 | Tests unitaires |

---

## Table des matières

1. [Démarrage rapide](#1-démarrage-rapide)
2. [Modules fonctionnels](#2-modules-fonctionnels)
3. [Authentification & sécurité](#3-authentification--sécurité)
4. [Gestion des rôles](#4-gestion-des-rôles)
5. [Workflow crédit](#5-workflow-crédit)
6. [Communication backend](#6-communication-backend)
7. [Fonctionnalités transverses](#7-fonctionnalités-transverses)
8. [Scripts disponibles](#8-scripts-disponibles)

---

## 1. Démarrage rapide

```bash
# Installation des dépendances
npm install

# Démarrage en développement
npm start

# Build de production
npm run build

# Tests
npm test
```

L'application démarre sur `http://localhost:4200`.

### Alias de chemin

Tous les imports internes utilisent l'alias `@/` qui pointe vers `src/app/` :

```typescript
import { roleGuard } from '@/core/guards/role.guard';
import { UserRole } from '@/core/models/user.model';
```

---

## 2. Modules fonctionnels

### 2.1 Authentification (`/auth`)

- Page de connexion avec formulaire email / mot de passe
- Authentification JWT — token stocké en `localStorage`
- Redirection automatique vers `/app/home` après connexion
- `authGuard` protège toutes les routes sous `/app`
- `guestGuard` empêche les utilisateurs connectés d'accéder à `/auth`

---

### 2.2 Accueil (`/app/home`)

Page d'atterrissage après connexion. Affiche un résumé des accès disponibles selon le rôle de l'utilisateur connecté.

---

### 2.3 Réseau CORA (`/app/cora`)

Gestion des Correspondants Agréés (agents partenaires de Credit Access).

| Route | Description | Accès |
|---|---|---|
| `/app/cora/dashboard` | Tableau de bord CORA | Rôles CORA_SIEGE |
| `/app/cora/create-cora` | Création d'un agent CORA | Rôles CHARGE_CORA |
| `/app/cora/list-cora` | Liste des agents CORA | Rôles CORA_ALL |
| `/app/cora/detail-cora/:id` | Fiche d'un agent CORA | Rôles CORA_ALL |
| `/app/cora/pending-cora` | Demandes en attente | Rôles GESTION_CORA |
| `/app/cora/mes-coras` | CORA de l'agent connecté | Rôle CHARGE_CORA |
| `/app/cora/create-agent` | Création d'un sous-agent | Rôles CHARGE_CORA |
| `/app/cora/detail-agent/:id` | Fiche d'un sous-agent | Rôles CORA_ALL |
| `/cora-map` | Carte publique des agents | **Public** (sans auth) |

---

### 2.4 Avance sur Chèque — ASC (`/app/asc`)

Gestion des avances accordées sur présentation de chèques.

| Route | Description | Accès |
|---|---|---|
| `/app/asc/dashboard` | Tableau de bord siège | Rôles ASC_SIEGE |
| `/app/asc/dashboard-agence` | Tableau de bord agence | Rôles ASC_AGENCE |
| `/app/asc/create` | Création d'une demande ASC | Rôles ASC_CREATE |
| `/app/asc/list` | Liste des demandes | Rôles ASC_ALL |
| `/app/asc/detail/:ref` | Fiche détail d'une demande | Rôles ASC_ALL |
| `/app/asc/pending` | Demandes en attente | Rôles ASC_ALL |
| `/app/asc/tireurs` | Gestion des tireurs | Rôles ASC_ALL |
| `/app/asc/cheques-attente` | Chèques en attente | Rôles ASC_ALL |
| `/app/asc/cheque-detail/:id` | Fiche chèque | Rôles ASC_ALL |

---

### 2.5 Gestion de Crédit (`/app/credit`)

Module principal. Couvre le cycle de vie complet d'une demande de crédit.

| Route | Description | Accès |
|---|---|---|
| `/app/credit/dashboard` | Tableau de bord siège | Rôles CREDIT_SIEGE |
| `/app/credit/dashboard-agence` | Tableau de bord agence | Rôles CREDIT_AGENCE |
| `/app/credit/create` | Création d'une demande | Rôles CREDIT_CREATE |
| `/app/credit/list` | Liste des dossiers | Rôles CREDIT_ALL |
| `/app/credit/analyse/:ref` | Analyse financière | Rôles CREDIT_ALL |
| `/app/credit/fiche/:ref` | Fiche crédit complète | Rôles CREDIT_ALL |
| `/app/credit/resume/:ref` | Résumé pour décision | Rôles CREDIT_ALL |
| `/app/credit/employeur/list` | Liste des employeurs | Rôles CREDIT_ALL |
| `/app/credit/employeur/:id` | Fiche employeur | Rôles CREDIT_ALL |
| `/app/credit/tirage/list` | Liste des tirages | Rôles CREDIT_ALL |
| `/app/credit/tirage/:ref` | Fiche tirage | Rôles CREDIT_ALL |
| `/app/credit/organigramme` | Organigramme crédit | Rôles CREDIT_ALL |
| `/app/credit/detail-agence/:code` | Fiche agence crédit | Rôles CREDIT_ALL |

#### Page d'analyse — sous-sections

La page `/app/credit/analyse/:ref` est découpée en sections indépendantes :

| Section | Contenu |
|---|---|
| `achats` | Analyse des achats |
| `activite` | Analyse de l'activité |
| `cautions` | Gestion des cautions |
| `envoi` | Documents envoyés |
| `familial` | Situation familiale |
| `garanties` | Garanties proposées |
| `geolocalisation` | Localisation du client/projet |
| `swot` | Analyse SWOT |
| `tresorerie` | Analyse de trésorerie |

---

### 2.6 Paramètres (`/app/parametres`)

Administration réservée aux profils Admin, DG et DGA.

| Route | Description |
|---|---|
| `/app/parametres/utilisateurs` | Liste et gestion des utilisateurs |
| `/app/parametres/utilisateurs/:id` | Fiche utilisateur |
| `/app/parametres/configuration` | Configuration générale (agences, ASC, crédit, zonification) |

---

### 2.7 Power BI (`/app/power-bi`)

Intégration de tableaux de bord Power BI via iframe. Les liens sont définis dans `core/constants/power-bi-links.ts`.

| Route | Description |
|---|---|
| `/app/power-bi/dashboard` | Dashboard Power BI |

---

## 3. Authentification & sécurité

### Flux d'authentification

```
POST /api/login  { email, password }
  → Réponse : { token, user }
    → Stockage en localStorage
      → Redirection vers /app/home
```

### Composants de sécurité

| Élément | Rôle |
|---|---|
| `authGuard` | Vérifie la présence d'un token valide avant d'accéder aux routes `/app` |
| `guestGuard` | Redirige vers `/app/home` si déjà connecté |
| `roleGuard` | Vérifie que le rôle de l'utilisateur est dans la liste autorisée |
| `auth.interceptor.ts` | Injecte automatiquement le token JWT dans chaque requête HTTP |

### Gestion des erreurs HTTP

Les erreurs `401 Unauthorized` et `403 Forbidden` sont interceptées et redirigent vers `/auth/login` après nettoyage du localStorage.

---

## 4. Gestion des rôles

L'application gère **30+ rôles** définis dans `core/models/user.model.ts` (enum `UserRole`).

### Catégories de profils

| Catégorie | Rôles |
|---|---|
| **Direction** | Admin, DG, DGA |
| **Exploitation** | D_EXPL, RESPO_EXPL, RESPO_FO |
| **Risque & Crédit** | DR, AR, CDCR, CHARGE_COMIT, GP |
| **Agence** | CA, CAA, CC, RC, CE, CUP, ACJ, CDC |
| **CORA** | CHARGE_CORA, GESTION_CORA |
| **PME / Réseau** | RESPO_CLT_PME, RESPO_CLT_TPE, RESPO_PROD_AGRI, RESPO_RS, RESPO_RGL, SUP_PME, SUP_RISQ_ZONE, ASSC_PME |
| **Support** | ADMIN_AUDIT, RESPO_JURIDIQUE, RESPO_ASSUR |

### Contrôle d'accès dans les routes

Chaque route sensible est protégée par `roleGuard` avec un groupe de rôles constant :

```typescript
// Exemple dans credit.route.ts
const CREDIT_SIEGE = [Admin, DG, DGA, CDCR, DR, D_EXPL, ...] as const;

{
  path: 'dashboard',
  canActivate: [roleGuard([...CREDIT_SIEGE])],
  ...
}
```

### Pipe de rôle dans les templates

```html
<!-- Afficher un élément uniquement si l'utilisateur a le rôle Admin -->
<div *ngIf="'Admin' | hasRole">...</div>
```

---

## 5. Workflow crédit

```
1. CRÉATION
   Acteurs : ACJ, GP, CC, RC
       ↓
2. ENVOI AU CHEF D'AGENCE
   Acteurs : CA, CAA
       ↓
3. AFFECTATION À UN ANALYSTE RISQUE
   Acteurs : CA, CAA → AR
       ↓
4. ANALYSE FINANCIÈRE
   Acteurs : AR
   → Sections : achats, activité, cautions, garanties, trésorerie, SWOT...
       ↓
5. PROPOSITION DE L'ANALYSTE
   Acteurs : AR
       ↓
6. PRÉ-COMITÉ / COMITÉ
   Acteurs : CHARGE_COMIT, DR, DGA, DG
       ↓
7. DÉCISION FINALE
   Acteurs : DG, DGA
       ↓
8. DÉCAISSEMENT
       ↓
9. CLÔTURE
```

Chaque étape implique des validations, des pièces justificatives et des acteurs spécifiques. Le statut de la demande est visible sur la fiche crédit (`/app/credit/:ref`).

---

## 6. Communication backend

### URLs d'API

| Environnement | URL |
|---|---|
| Développement | `https://backend-dev.creditaccess.ci/api` |
| Production | `http://localhost:3000/api` *(à configurer)* |

### Pattern de service

Tous les services métier injectent `ApiService` (wrapper HTTP) et retournent des `Observable` :

```typescript
@Injectable({ providedIn: 'root' })
export class CreditService {
  private readonly api = inject(ApiService);

  getDemandes(): Observable<DemandCredit[]> {
    return this.api.get<DemandCredit[]>('/credit/demandes');
  }
}
```

### Intercepteur d'authentification

`auth.interceptor.ts` ajoute automatiquement le header `Authorization: Bearer <token>` à chaque requête sortante.

---

## 7. Fonctionnalités transverses

### Génération de PDF

Utilise **pdfmake**. Le service `credit-pdf.service.ts` génère :
- Contrats de prêt
- Fiches résumé de demande
- Conventions de cautionnement
- Documents de garantie

### Export Excel

Utilise **exceljs** via `excel-export.service.ts` (core). Disponible sur les pages de liste.

### Notifications toast

Système centralisé via `toast.service.ts` (core). Utilisé pour confirmer les actions ou afficher les erreurs.

```typescript
this.toast.success('Demande créée avec succès');
this.toast.error('Une erreur est survenue');
```

### Cartes interactives

- **Leaflet** : carte publique des agents CORA (`/cora-map`)
- **Google Maps** (`@angular/google-maps`) : localisation clients et cautions dans le module crédit

### Graphiques

**Chart.js** est utilisé dans les tableaux de bord via trois composants partagés :

| Composant | Usage |
|---|---|
| `bar-chart` | Histogrammes (volumes, comparaisons) |
| `donut-chart` | Répartitions (statuts, catégories) |
| `line-chart` | Évolutions temporelles |

### Journalisation

`logger.service.ts` (core) centralise les logs. Le niveau est configuré par environnement (`debug` en dev, `error` en prod).

---

## 8. Scripts disponibles

```bash
npm start           # Démarrage en développement (http://localhost:4200)
npm run build       # Build développement
npm run build:prod  # Build production (dossier dist/)
npm test            # Tests unitaires (Vitest)
npm run lint        # Analyse statique du code
```

---

*Ce document décrit l'état actuel du projet (Angular 21, composants standalone, signals).*
