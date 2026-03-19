# Matrice des Autorisations & Permissions

> Dernière mise à jour : 2026-03-19
> Source : `sidebar-menu.ts`, `cora.route.ts`, `asc.route.ts`, `credit.route.ts`, `parametres.route.ts`, composants HTML/TS

---

## Légende

| Symbole | Signification |
|---------|--------------|
| ✅ | Autorisé |
| ❌ | Refusé (route redirige vers `/app/home` ou bouton masqué) |
| — | Non applicable / lecture seule |

---

## Profils disponibles

| Code | Libellé |
|------|---------|
| `Admin` | Administrateur |
| `DG` | Directeur Général |
| `DGA` | Directeur Général Adjoint |
| `D_EXPL` | Directrice d'Exploitation |
| `RESPO_EXPL` | Responsable Exploitation |
| `RESPO_FO` | Responsable Front Office |
| `ADMIN_AUDIT` | Administration Audit |
| `Charge_Cora` | Chargé du réseau de correspondants |
| `Gestion_Cora` | Gestionnaire réseau correspondants |
| `Agent_BO` | Agent Back Office |
| `RC` | Responsable Client |
| `CA` | Chef Agence |
| `CAA` | Chef d'Agence Adjoint |
| `CC` | Conseiller Clientèle |
| `GP` | Gestionnaire de Portefeuilles |
| `GPJ` | Gestionnaire de Portefeuilles Junior |
| `CE` | Chef d'Équipe |
| `CUP` | Chef d'Unité Polyvalent |
| `ACJ` | Agent Commercial Junior |
| `CDC` | Chargé de Développement Commercial |
| `AR` | Analyste Risque |
| `SUP_RISQ_ZONE` | Superviseur Risque Zone |
| `RESPO_RGL` | Responsable Régional |
| `SUP_PME` | Superviseur PME |
| `ASSC_PME` | Assistante Clientèle PME |
| `RESPO_CLT_PME` | Responsable Clientèle PME |
| `AGENT_ACC` | Agent Accueil |
| `DR` | Directeur Risque |
| `CHARGE_COMIT` | Chargé du Comité |
| `CDCR` | Chargé du Département Crédit |
| `RESPO_JURIDIQUE` | Responsable Juridique |
| `RESPO_ASSUR` | Responsable Assurance |
| `RESPO_RS` | Responsable Réseau |
| `RESPO_CLT_TPE` | Responsable Clientèle TPE |
| `RESPO_PROD_AGRI` | Responsable Produit Agricole |
| `CHEF_DEPART_MARK` | Chef Département Marketing |

---

## Mécanisme d'enforcement

```
Navigateur
   ↓
Route Guard (roleGuard)  ←── redirige vers /app/home si rôle non autorisé
   ↓
Composant chargé
   ↓
Sidebar (visibleGroups)  ←── masque les items/groupes non autorisés
   ↓
Template (@if canCreate / show*)  ←── masque les boutons d'action non autorisés
```

- **Route guard** (`roleGuard`) : vérifie le rôle avant même de charger le composant.
- **Sidebar** : `visibleGroups` computed signal filtre les items selon `roles[]`.
- **Actions dans les pages** : `@if (canXxx())` — computed signals combinant statut + rôle via `PermissionService.hasRole()`.

---

## 1. Réseau CORA

### 1.1 Pages (route guards)

| Page / Route | Rôles autorisés | Guard |
|---|---|:---:|
| Tableau de bord (`/cora/dashboard`) | Admin, DG, DGA, D_EXPL, RESPO_EXPL, Charge_Cora, RESPO_FO, ADMIN_AUDIT, Gestion_Cora | `roleGuard` |
| Liste des CORAs (`/cora/list`) | Admin, DG, DGA, D_EXPL, RESPO_EXPL, **Agent_BO**, RESPO_FO, Charge_Cora, ADMIN_AUDIT | `roleGuard` |
| Demandes en attente (`/cora/pending`) | Admin, DGA, D_EXPL, RESPO_EXPL, Gestion_Cora, **Agent_BO**, Charge_Cora | `roleGuard` |
| Détail d'un CORA (`/cora/:id`) | Admin, DG, DGA, D_EXPL, RESPO_EXPL, Charge_Cora, RESPO_FO, ADMIN_AUDIT, Gestion_Cora | `roleGuard` |
| Détail d'un agent (`/cora/agent/:id`) | Idem | `roleGuard` |
| Créer un CORA (`/cora/create`) | **Admin, Gestion_Cora** | `roleGuard` |
| Créer un sous-agent (`/cora/agent/create`) | **Admin, Gestion_Cora** | `roleGuard` |
| Mes CORAs (`/cora/my-coras`) | **Gestion_Cora** | `roleGuard` |
| Géolocalisation (`/cora-map`) | **Admin uniquement** | — |

### 1.2 Actions dans les pages

| Action | Page | Rôles autorisés | Enforcement |
|--------|------|-----------------|-------------|
| Bouton "Nouveau CORA" | Liste des CORAs | Admin, Gestion_Cora | `@if (canCreateCora())` dans template |
| Soumettre le formulaire | Page Créer CORA | Admin, Gestion_Cora | Route guard (page inaccessible aux autres) |
| Soumettre le formulaire | Page Créer sous-agent | Admin, Gestion_Cora | Route guard |
| Voir le détail (œil) | Liste des CORAs | Tous les viewers CORA | Lecture seule |
| Export Excel / PDF | Liste des CORAs | Tous les viewers CORA | Lecture seule |

### 1.3 Résumé par profil — CORA

| Profil | Dashboard | Liste | D. Attente | Créer | Mes CORAs |
|--------|:---:|:---:|:---:|:---:|:---:|
| **Admin** | ✅ | ✅ + bouton Nouveau | ✅ | ✅ | ❌ |
| **DG / DGA** | ✅ | ✅ (lecture) | ❌ | ❌ | ❌ |
| **D_EXPL / RESPO_EXPL / Charge_Cora** | ✅ | ✅ (lecture) | ✅ | ❌ | ❌ |
| **RESPO_FO / ADMIN_AUDIT** | ✅ | ✅ (lecture) | ❌ | ❌ | ❌ |
| **Gestion_Cora** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Agent_BO** | ❌ | ✅ (lecture) | ✅ | ❌ | ❌ |
| **Tous les autres** | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 2. Avance sur Chèque (ASC)

### 2.1 Pages (route guards)

| Page / Route | Rôles autorisés | Guard |
|---|---|:---:|
| Tableau de bord siège (`/asc/dashboard`) | Admin, ADMIN_AUDIT, DG, DGA, D_EXPL, ASSC_PME, RESPO_FO, AGENT_ACC, RESPO_EXPL, RESPO_CLT_PME | `roleGuard` |
| Tableau de bord agence (`/asc/dashboard/agence`) | **RC, CA, CC** | `roleGuard` |
| Recherche client (`/asc/client-search`) | **Admin, RC, CC** | `roleGuard` |
| Créer une demande (`/asc/create`) | **Admin, RC, CC** | `roleGuard` |
| Demandes en attente (`/asc/pending`) | Admin, ADMIN_AUDIT, DGA, D_EXPL, ASSC_PME, RC, CC, RESPO_FO, AGENT_ACC, RESPO_EXPL | `roleGuard` |
| Détail demande (`/asc/detail/:id`) | Siège ∪ Agence | `roleGuard` |
| Liste des chèques (`/asc/list`) | Admin, DG, DGA, D_EXPL, ASSC_PME, **CA**, RC, CC, RESPO_FO, AGENT_ACC, RESPO_EXPL, RESPO_CLT_PME | `roleGuard` |
| Liste des tireurs (`/asc/tireurs`) | Admin, DG, DGA, D_EXPL, ASSC_PME, **CA, RC, CC**, RESPO_FO, AGENT_ACC, RESPO_EXPL, RESPO_CLT_PME | `roleGuard` |
| Détail chèque (`/asc/cheque/:numcheque`) | Siège ∪ Agence | `roleGuard` |
| Chèques en attente 7j (`/asc/cheques-attente`) | Admin, ADMIN_AUDIT, DGA, D_EXPL, ASSC_PME, RESPO_EXPL, RESPO_FO, AGENT_ACC, RC, CC | `roleGuard` |

### 2.2 Actions dans les pages — Workflow de validation ASC

Le workflow ASC suit ces statuts :

```
Statut 1/8/10  →  Statut 2  →  Statut 9  →  Statut 3  →  Statut 4  →  Statut 5  →  Statut 6
(Création CC/RC)  (Validation  (Validation  (Approbation  (Suivi FO)  (Décaissement  (Clôturé)
                   Accueil/    R.CLT.PME)   R.Expl)                    CC/RC)
                   PME)
                        ↘ Rejeté (7) / Ajourné (retour en arrière)
```

| Action | Statut | Rôles autorisés | Enforcement |
|--------|--------|-----------------|-------------|
| **Soumettre** | 1, 8, 10 | Admin, RC, CC | `showSoumettre` |
| **Rejeter** | 2 | Admin, ASSC_PME | `showRejeter` |
| **Rejeter** | 3 | Admin, RESPO_EXPL, D_EXPL, DR, DGA | `showRejeter` |
| **Rejeter** | 9 | Admin, RESPO_EXPL, RESPO_CLT_PME, D_EXPL, DR | `showRejeter` |
| **Ajourner** | 2 | Admin, AGENT_ACC, ASSC_PME | `showAjourner` |
| **Ajourner** | 3 | Admin, RESPO_EXPL, D_EXPL, DR, DGA | `showAjourner` |
| **Ajourner** | 4 | Admin, RESPO_FO | `showAjourner` |
| **Ajourner** | 8 | Admin, RC, CC | `showAjourner` |
| **Ajourner** | 9 | Admin, RESPO_EXPL, RESPO_CLT_PME, D_EXPL, DR | `showAjourner` |
| **Approuver** | 2 | Admin, ASSC_PME | `showApprouver` |
| **Approuver** | 3 | Admin, RESPO_EXPL, D_EXPL, DR, DGA | `showApprouver` |
| **Approuver** | 9 | Admin, RESPO_EXPL, RESPO_CLT_PME, D_EXPL, DR | `showApprouver` |
| **Autoriser le décaissement** | 4 | Admin, RESPO_FO | `showAutoriser` |
| **Confirmer le décaissement** | 5 | Admin, RC, CC | `showConfirmer` |
| **Annuler le décaissement** | 5 | Admin, RC, CC | `showAnnuler` |
| **Supprimer la demande** | Tout sauf 6, 11 | **Admin uniquement** | `showDelete` |
| **Export PDF** | Tout | Tous les viewers ASC | Lecture seule |

### 2.3 Résumé par profil — ASC

| Profil | Db siège | Db agence | Créer | Soumettre | Rejeter / Approuver | Ajourner | Autoriser | Confirmer / Annuler | Supprimer |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Admin** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **DG** | ✅ | ❌ | ❌ | — | — | — | — | — | — |
| **DGA** | ✅ | ❌ | ❌ | — | ✅ (statut 3) | ✅ (statut 3) | — | — | — |
| **D_EXPL / DR** | ✅ | ❌ | ❌ | — | ✅ (statuts 3, 9) | ✅ (statuts 3, 9) | — | — | — |
| **RESPO_EXPL** | ✅ | ❌ | ❌ | — | ✅ (statuts 3, 9) | ✅ (statuts 3, 9) | — | — | — |
| **RESPO_FO** | ✅ | ❌ | ❌ | — | — | ✅ (statut 4) | ✅ | — | — |
| **ADMIN_AUDIT** | ✅ | ❌ | ❌ | — | — | — | — | — | — |
| **ASSC_PME** | ✅ | ❌ | ❌ | — | ✅ (statut 2) | ✅ (statut 2) | — | — | — |
| **RESPO_CLT_PME** | ✅ | ❌ | ❌ | — | ✅ (statut 9) | ✅ (statut 9) | — | — | — |
| **AGENT_ACC** | ✅ | ❌ | ❌ | — | — | ✅ (statut 2) | — | — | — |
| **RC** | ❌ | ✅ | ✅ | ✅ | — | ✅ (statut 8) | — | ✅ | — |
| **CA** | ❌ | ✅ | ❌ | — | — | — | — | — | — |
| **CC** | ❌ | ✅ | ✅ | ✅ | — | ✅ (statut 8) | — | ✅ | — |
| **Tous les autres** | ❌ | ❌ | ❌ | — | — | — | — | — | — |

---

## 3. Crédit

### 3.1 Pages (route guards)

| Page / Route | Rôles autorisés | Guard |
|---|---|:---:|
| Tableau de bord réseau (`/credit/dashboard`) | Admin, DG, DGA, CDCR, DR, D_EXPL, RESPO_CLT_TPE, RESPO_PROD_AGRI, ADMIN_AUDIT, RESPO_CLT_PME, RESPO_EXPL, CHARGE_COMIT, RESPO_JURIDIQUE, RESPO_ASSUR, RESPO_FO, ASSC_PME, RESPO_RS | `roleGuard` |
| Tableau de bord agence (`/credit/dashboard-agence`) | CA, CAA, CC, GP, CUP, CE, RC, AR, SUP_RISQ_ZONE, RESPO_RGL, SUP_PME, CDC | `roleGuard` |
| Nouvelle demande (`/credit/create`) | **Admin, ACJ, CE, GP, CC, RC** | `roleGuard` |
| Liste des demandes (`/credit/list`) | Siège ∪ Agence ∪ RESPO_CLT_TPE, RESPO_CLT_PME, RESPO_PROD_AGRI, ASSC_PME | `roleGuard` |
| Analyse dossier (`/credit/analyse/:ref`) | CREDIT_ALL | `roleGuard` |
| Résumé dossier (`/credit/resume/:ref`) | CREDIT_ALL | `roleGuard` |
| Fiche dossier (`/credit/:ref`) | CREDIT_ALL | `roleGuard` |
| Détail agence (`/credit/detail-agence/:code`) | CREDIT_ALL | `roleGuard` |
| Organigramme (`/credit/organigramme`) | CREDIT_ALL | `roleGuard` |
| Employeurs éligibles (`/credit/employeur/list`) | **Admin, CA, CAA, D_EXPL, RC, CC** | `roleGuard` |
| Détail employeur (`/credit/employeur/:id`) | CREDIT_ALL | `roleGuard` |
| Tirages découvert — liste (`/credit/tirage/list`) | Admin, ACJ, CE, GP, CC, RC | `roleGuard` |
| Tirages découvert — détail (`/credit/tirage/:ref`) | Admin, ACJ, CE, GP, CC, RC | `roleGuard` |

> **CREDIT_ALL** : union de tous les rôles ayant accès aux routes crédit — Admin, DG, DGA, DR, CDCR, D_EXPL, RESPO_EXPL, RESPO_FO, RESPO_CLT_TPE, RESPO_CLT_PME, RESPO_PROD_AGRI, SUP_PME, GP, CUP, CE, ASSC_PME, CC, CA, CAA, RC, ACJ, AR, SUP_RISQ_ZONE, CHARGE_COMIT, RESPO_RGL, RESPO_JURIDIQUE, RESPO_ASSUR, CDC

### 3.2 Actions dans les pages

| Action | Page | Rôles autorisés | Enforcement |
|--------|------|-----------------|-------------|
| Bouton "Nouvelle demande" | Liste des demandes | **Tous sauf RC et CC** | `@if (canCreateCredit())` — `lacksRole(RC, CC)` |
| Soumettre le formulaire de création | Page Créer | Admin, ACJ, CE, GP, CC, RC | Route guard |
| Voir le détail (clic ligne) | Liste | CREDIT_ALL | Lecture seule |
| Export / actions sur fiche | Fiche dossier | CREDIT_ALL | Contrôlé par statut (logique interne) |

### 3.3 Résumé par profil — Crédit

| Profil | Db réseau | Db agence | Créer | Liste | Employeurs |
|--------|:---:|:---:|:---:|:---:|:---:|
| **Admin** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **DG** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **DGA** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **D_EXPL** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **RESPO_EXPL / RESPO_FO / ADMIN_AUDIT** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **DR / CHARGE_COMIT / CDCR / RESPO_JURIDIQUE / RESPO_ASSUR** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **RESPO_CLT_TPE / RESPO_PROD_AGRI / RESPO_CLT_PME** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **ASSC_PME** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **RESPO_RS** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **RC** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **CA** | ❌ | ✅ | ❌ | ✅ | ✅ |
| **CAA** | ❌ | ✅ | ❌ | ✅ | ✅ |
| **CC** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **GP** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **CE** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **CUP** | ❌ | ✅ | ❌ | ✅ | ❌ |
| **ACJ** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **CDC** | ❌ | ✅ | ❌ | ✅ | ❌ |
| **AR / SUP_RISQ_ZONE / RESPO_RGL / SUP_PME** | ❌ | ✅ | ❌ | ✅ | ❌ |
| **Tous les autres** | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Paramètres

### 4.1 Pages (route guard `canActivateChild`)

| Page | Rôles autorisés |
|------|-----------------|
| Liste des utilisateurs | **Admin uniquement** |
| Détail utilisateur | **Admin uniquement** |
| Configuration (Agences, ASC, Crédit, Zonification) | **Admin uniquement** |

> Le guard s'applique sur `canActivateChild` au niveau de `/parametres` — toutes les sous-routes sont protégées en bloc.

### 4.2 Actions dans les pages

| Action | Rôles autorisés | Enforcement |
|--------|-----------------|-------------|
| Modifier affectations agence (Drawer) | Admin | Route guard (page inaccessible aux autres) |
| Modifier nature prestation ASC | Admin | Route guard |
| Modifier config crédit (activité, charge, frais) | Admin | Route guard |
| Modifier zones / régions / teams / zone ACJ | Admin | Route guard |
| Activer / désactiver un utilisateur | Admin | Route guard |
| Modifier infos utilisateur | Admin | Route guard |
| Modifier permissions utilisateur | Admin | Route guard |

---

## 5. Vue d'ensemble par profil

| Profil | CORA | ASC | Crédit | Paramètres |
|--------|:----:|:---:|:------:|:----------:|
| **Admin** | Tout sauf Mes CORAs | Siège + Créer + toutes actions | Db réseau + Créer + tout | ✅ |
| **DG** | Dashboard + Liste | Siège (lecture) | Db réseau + Liste | ❌ |
| **DGA** | Dashboard + Liste + D.Attente | Siège + Rejeter/Approuver/Ajourner (statut 3) | Db réseau + Liste | ❌ |
| **D_EXPL** | Dashboard + Liste + D.Attente | Siège + Rejeter/Approuver/Ajourner (statuts 3, 9) | Db réseau + Liste + Employeurs | ❌ |
| **RESPO_EXPL** | Dashboard + Liste + D.Attente | Siège + Rejeter/Approuver/Ajourner (statuts 3, 9) | Db réseau + Liste | ❌ |
| **RESPO_FO** | Dashboard + Liste | Siège + Ajourner + Autoriser (statut 4) | Db réseau + Liste | ❌ |
| **ADMIN_AUDIT** | Dashboard + Liste | Siège (lecture) | Db réseau + Liste | ❌ |
| **Charge_Cora** | Dashboard + Liste + D.Attente | ❌ | ❌ | ❌ |
| **Gestion_Cora** | Dashboard + D.Attente + Créer + Mes CORAs | ❌ | ❌ | ❌ |
| **Agent_BO** | Liste + D.Attente | ❌ | ❌ | ❌ |
| **ASSC_PME** | ❌ | Siège + Rejeter/Approuver/Ajourner (statut 2) | Db réseau + Liste | ❌ |
| **RESPO_CLT_PME** | ❌ | Siège + Rejeter/Approuver (statut 9) | Db réseau + Liste | ❌ |
| **AGENT_ACC** | ❌ | Siège + Ajourner (statut 2) | ❌ | ❌ |
| **RC** | ❌ | Agence + Créer + Soumettre + Confirmer/Annuler | Db agence + Créer + Liste + Employeurs | ❌ |
| **CA** | ❌ | Agence + Liste + Tireurs (lecture) | Db agence + Liste + Employeurs | ❌ |
| **CAA** | ❌ | ❌ | Db agence + Liste + Employeurs | ❌ |
| **CC** | ❌ | Agence + Créer + Soumettre + Confirmer/Annuler + Liste + Tireurs | Db agence + Créer + Liste + Employeurs | ❌ |
| **GP** | ❌ | ❌ | Db agence + Créer + Liste | ❌ |
| **GPJ** | ❌ | ❌ | Liste uniquement | ❌ |
| **CE** | ❌ | ❌ | Db agence + Créer + Liste | ❌ |
| **CUP** | ❌ | ❌ | Db agence + Liste | ❌ |
| **ACJ** | ❌ | ❌ | Créer + Liste | ❌ |
| **CDC** | ❌ | ❌ | Db agence + Liste | ❌ |
| **AR / SUP_RISQ_ZONE / RESPO_RGL / SUP_PME** | ❌ | ❌ | Db agence + Liste | ❌ |
| **DR / CHARGE_COMIT / CDCR / RESPO_JURIDIQUE / RESPO_ASSUR** | ❌ | ❌ | Db réseau + Liste | ❌ |
| **RESPO_CLT_TPE / RESPO_PROD_AGRI** | ❌ | ❌ | Db réseau + Liste | ❌ |
| **RESPO_RS** | ❌ | ❌ | Db réseau uniquement | ❌ |
| **CHEF_DEPART_MARK** | ❌ | ❌ | ❌ | ❌ |
