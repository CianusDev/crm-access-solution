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
| `Agent_BO` | Agent Back Office |

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
| Liste des CORAs (`/cora/list`) | Idem | `roleGuard` |
| Demandes en attente (`/cora/pending`) | Idem | `roleGuard` |
| Détail d'un CORA (`/cora/:id`) | Idem | `roleGuard` |
| Détail d'un agent (`/cora/agent/:id`) | Idem | `roleGuard` |
| Créer un CORA (`/cora/create`) | **Admin, Gestion_Cora** | `roleGuard` |
| Créer un sous-agent (`/cora/agent/create`) | **Admin, Gestion_Cora** | `roleGuard` |
| Mes CORAs (`/cora/my-coras`) | **Gestion_Cora** | `roleGuard` |
| Géolocalisation (`/cora-map`) | Admin, DG, DGA, D_EXPL, RESPO_EXPL, Charge_Cora, RESPO_FO, ADMIN_AUDIT, Gestion_Cora | `roleGuard` |

### 1.2 Actions dans les pages

| Action | Page | Rôles autorisés | Enforcement |
|--------|------|-----------------|-------------|
| Bouton "Nouveau CORA" | Liste des CORAs | Admin, Gestion_Cora | `@if (canCreateCora())` dans template |
| Soumettre le formulaire | Page Créer CORA | Admin, Gestion_Cora | Route guard (page inaccessible aux autres) |
| Soumettre le formulaire | Page Créer sous-agent | Admin, Gestion_Cora | Route guard |
| Voir le détail (œil) | Liste des CORAs | Tous les viewers CORA | Lecture seule — pas de guard supplémentaire |
| Export Excel / PDF | Liste des CORAs | Tous les viewers CORA | Lecture seule |

### 1.3 Résumé par profil — CORA

| Profil | Dashboard | Liste | Créer | Mes CORAs |
|--------|:---:|:---:|:---:|:---:|
| **Admin** | ✅ | ✅ + bouton Nouveau | ✅ | ❌ |
| **DG / DGA / D_EXPL / RESPO_EXPL / RESPO_FO / ADMIN_AUDIT / Charge_Cora** | ✅ | ✅ (lecture) | ❌ | ❌ |
| **Gestion_Cora** | ✅ | ✅ + bouton Nouveau | ✅ | ✅ |
| **Tous les autres** | ❌ | ❌ | ❌ | ❌ |

---

## 2. Avance sur Chèque (ASC)

### 2.1 Pages (route guards)

| Page / Route | Rôles autorisés | Guard |
|---|---|:---:|
| Tableau de bord siège (`/asc/dashboard`) | Admin, ADMIN_AUDIT, DG, DGA, D_EXPL, ASSC_PME, RESPO_FO, AGENT_ACC, RESPO_EXPL, RESPO_CLT_PME | `roleGuard` |
| Tableau de bord agence (`/asc/dashboard/agence`) | **RC, CA, CC** | `roleGuard` |
| Recherche client (`/asc/client-search`) | **Admin, RC, CC** | `roleGuard` |
| Créer une demande (`/asc/create`) | **Admin, RC, CC** | `roleGuard` |
| Demandes en attente (`/asc/pending`) | Siège ∪ Agence | `roleGuard` |
| Détail demande (`/asc/detail/:id`) | Siège ∪ Agence | `roleGuard` |
| Liste des demandes (`/asc/list`) | Siège ∪ Agence | `roleGuard` |
| Liste des tireurs (`/asc/tireurs`) | Siège uniquement | `roleGuard` |
| Détail chèque (`/asc/cheque/:numcheque`) | Siège ∪ Agence | `roleGuard` |
| Chèques en attente 7j (`/asc/cheques-attente`) | Siège ∪ Agence | `roleGuard` |

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
| Tableau de bord réseau (`/credit/dashboard`) | Groupe Siège (27 rôles) | `roleGuard` |
| Tableau de bord agence (`/credit/dashboard-agence`) | CA, CAA, CC, GP, CUP, CE, RC, AR, SUP_RISQ_ZONE, RESPO_RGL, SUP_PME, CDC | `roleGuard` |
| Nouvelle demande (`/credit/create`) | **Admin, ACJ, CE, GP, CC, RC** | `roleGuard` |
| Liste des demandes (`/credit/list`) | Siège ∪ Agence | `roleGuard` |
| Analyse dossier (`/credit/analyse/:ref`) | Siège ∪ Agence | `roleGuard` |
| Résumé dossier (`/credit/resume/:ref`) | Siège ∪ Agence | `roleGuard` |
| Fiche dossier (`/credit/:ref`) | Siège ∪ Agence | `roleGuard` |
| Détail agence (`/credit/detail-agence/:code`) | Siège ∪ Agence | `roleGuard` |
| Organigramme (`/credit/organigramme`) | Siège ∪ Agence | `roleGuard` |
| Employeurs éligibles (`/credit/employeur/list`) | Siège ∪ Agence | `roleGuard` |
| Détail employeur (`/credit/employeur/:id`) | Siège ∪ Agence | `roleGuard` |
| Tirages découvert — liste (`/credit/tirage/list`) | Siège ∪ Agence | `roleGuard` |
| Tirages découvert — détail (`/credit/tirage/:ref`) | Siège ∪ Agence | `roleGuard` |

> **Groupe Siège (27 rôles)** : Admin, DG, DGA, D_EXPL, RESPO_EXPL, RESPO_FO, ADMIN_AUDIT, AR, GP, GPJ, DR, CHARGE_COMIT, CDCR, RESPO_JURIDIQUE, RESPO_ASSUR, RC, CA, CAA, CC, CE, CUP, ACJ, CDC, RESPO_RGL, SUP_RISQ_ZONE, SUP_PME

### 3.2 Actions dans les pages

| Action | Page | Rôles autorisés | Enforcement |
|--------|------|-----------------|-------------|
| Bouton "Nouvelle demande" | Liste des demandes | **Tous sauf RC et CC** | `@if (canCreateCredit())` — `lacksRole(RC, CC)` |
| Soumettre le formulaire de création | Page Créer | Admin, ACJ, CE, GP, CC, RC | Route guard |
| Voir le détail (clic ligne) | Liste | Siège ∪ Agence | Lecture seule |
| Export / actions sur fiche | Fiche dossier | Siège ∪ Agence | Contrôlé par statut (logique interne) |

### 3.3 Résumé par profil — Crédit

| Profil | Db réseau | Db agence | Créer | Consulter |
|--------|:---:|:---:|:---:|:---:|
| **Admin** | ✅ | ❌ | ✅ | ✅ |
| **DG / DGA / D_EXPL / RESPO_EXPL / RESPO_FO / ADMIN_AUDIT** | ✅ | ❌ | ❌ | ✅ |
| **DR / GPJ / CHARGE_COMIT / CDCR / RESPO_JURIDIQUE / RESPO_ASSUR** | ✅ | ❌ | ❌ | ✅ |
| **RC** | ✅ | ✅ | ✅ | ✅ |
| **CA** | ✅ | ✅ | ❌ | ✅ |
| **CAA** | ✅ | ✅ | ❌ | ✅ |
| **CC** | ✅ | ✅ | ✅ | ✅ |
| **GP** | ✅ | ✅ | ✅ | ✅ |
| **CE** | ✅ | ✅ | ✅ | ✅ |
| **CUP** | ✅ | ✅ | ❌ | ✅ |
| **ACJ** | ✅ | ❌ | ✅ | ✅ |
| **CDC** | ✅ | ✅ | ❌ | ✅ |
| **AR / SUP_RISQ_ZONE / RESPO_RGL / SUP_PME** | ✅ | ✅ | ❌ | ✅ |
| **Tous les autres** | ❌ | ❌ | ❌ | ❌ |

---

## 4. Paramètres

### 4.1 Pages (route guard `canActivateChild`)

| Page | Rôles autorisés |
|------|-----------------|
| Liste des utilisateurs | Admin, DG, DGA |
| Détail utilisateur | Admin, DG, DGA |
| Configuration (Agences, ASC, Crédit, Zonification) | Admin, DG, DGA |

> Le guard s'applique sur `canActivateChild` au niveau de `/parametres` — toutes les sous-routes sont protégées en bloc.

### 4.2 Actions dans les pages

| Action | Rôles autorisés | Enforcement |
|--------|-----------------|-------------|
| Modifier affectations agence (Drawer) | Admin, DG, DGA | Route guard (page inaccessible aux autres) |
| Modifier nature prestation ASC | Admin, DG, DGA | Route guard |
| Modifier config crédit (activité, charge, frais) | Admin, DG, DGA | Route guard |
| Modifier zones / régions / teams / zone ACJ | Admin, DG, DGA | Route guard |
| Activer / désactiver un utilisateur | Admin, DG, DGA | Route guard |
| Modifier infos utilisateur | Admin, DG, DGA | Route guard |
| Modifier permissions utilisateur | Admin, DG, DGA | Route guard |

---

## 5. Vue d'ensemble par profil

| Profil | CORA | ASC | Crédit | Paramètres |
|--------|:----:|:---:|:------:|:----------:|
| **Admin** | Tout sauf Mes CORAs | Siège + Créer + toutes actions | Siège + Créer | ✅ |
| **DG** | Lecture | Siège (lecture) | Siège (lecture) | ✅ |
| **DGA** | Lecture | Siège (lecture) | Siège (lecture) | ✅ |
| **D_EXPL** | Lecture | Siège (lecture) | Siège (lecture) | ❌ |
| **RESPO_EXPL** | Lecture | Siège + Valider/Approuver (statut 3) | Siège (lecture) | ❌ |
| **RESPO_FO** | Lecture | Siège + Ajourner + Autoriser (statut 4) | Siège (lecture) | ❌ |
| **ADMIN_AUDIT** | Lecture | Siège (lecture) | Siège (lecture) | ❌ |
| **Charge_Cora** | Lecture | ❌ | ❌ | ❌ |
| **Gestion_Cora** | Tout + Mes CORAs + Créer | ❌ | ❌ | ❌ |
| **ASSC_PME** | ❌ | Siège + Valider/Approuver (statut 2) | ❌ | ❌ |
| **RESPO_CLT_PME** | ❌ | Siège + Valider/Approuver (statut 9) | ❌ | ❌ |
| **AGENT_ACC** | ❌ | Siège + Valider/Approuver (statut 2) | ❌ | ❌ |
| **RC** | ❌ | Agence + Créer + Soumettre + Confirmer/Annuler + Supprimer | Siège + Agence + Créer | ❌ |
| **CA** | ❌ | Agence (lecture) | Siège + Agence (lecture) | ❌ |
| **CAA** | ❌ | ❌ | Agence (lecture) | ❌ |
| **CC** | ❌ | Agence + Créer + Soumettre + Confirmer/Annuler + Supprimer | Agence + Créer | ❌ |
| **GP** | ❌ | ❌ | Siège + Agence + Créer | ❌ |
| **GPJ** | ❌ | ❌ | Siège (lecture) | ❌ |
| **CE** | ❌ | ❌ | Siège + Agence + Créer | ❌ |
| **CUP** | ❌ | ❌ | Siège + Agence (lecture) | ❌ |
| **ACJ** | ❌ | ❌ | Siège + Créer | ❌ |
| **CDC** | ❌ | ❌ | Siège + Agence (lecture) | ❌ |
| **AR** | ❌ | ❌ | Siège + Agence (lecture) | ❌ |
| **SUP_RISQ_ZONE** | ❌ | ❌ | Siège + Agence (lecture) | ❌ |
| **RESPO_RGL** | ❌ | ❌ | Siège + Agence (lecture) | ❌ |
| **SUP_PME** | ❌ | ❌ | Siège + Agence (lecture) | ❌ |
| **DR / CHARGE_COMIT / CDCR / RESPO_JURIDIQUE / RESPO_ASSUR** | ❌ | ❌ | Siège (lecture) | ❌ |
| **RESPO_RS / RESPO_CLT_TPE / RESPO_PROD_AGRI / CHEF_DEPART_MARK / Agent_BO** | ❌ | ❌ | ❌ | ❌ |
