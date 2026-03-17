# CRM Access Solution — Liste des tâches

> Dernière mise à jour : 2026-03-17 (session 3)
> Les tâches sont ordonnées du plus prioritaire au moins prioritaire.
> Mettre à jour le statut et la date à chaque complétion.

---

## Légende
- `[ ]` À faire
- `[x]` Terminé
- `[~]` En cours / Partiel

> **Estimation** = effort de développement en jours (1 jour ≈ 1 session de travail focused).
> Les estimations n'incluent pas les allers-retours de review ou les bugs inattendus.

---

## 🔴 PRIORITÉ 1 — Infrastructure transversale
> Ces tâches débloquent tout le reste. À faire en premier.

| ID | Tâche | Estimation |
|---|---|---|
| T01 | `PermissionService` | 0.5 j |
| T02 | Pipe `HasRolePipe` | 0.5 j |
| T03 | Guard de route `roleGuard` | 0.5 j |
| T04 | `ExcelExportService` (xlsx) | 1 j |
| T05 | `PdfExportService` (pdfmake) | 1 j |
| | **Sous-total P1** | **3.5 j** |

- [x] **T01** — Créer `PermissionService` avec méthode `hasRole(...roles)` et `currentRole()` `[0.5 j]`
  - Fichier cible : `src/app/core/services/permission/permission.service.ts`
  - Basé sur `AuthService.currentUser().profil.name`
  - Exposer un signal `userRole = computed(...)` injectable partout

- [x] **T02** — Créer le pipe `HasRolePipe` pour les templates `[0.5 j]`
  - Fichier cible : `src/app/shared/pipes/has-role/has-role.pipe.ts`
  - Usage : `@if (UserRole.CA | hasRole)` ou `@if ([UserRole.CA, UserRole.Admin] | hasRole)`

- [x] **T03** — Créer guard de route `roleGuard` `[0.5 j]`
  - Fichier cible : `src/app/core/guards/role.guard.ts`
  - Usage dans les routes : `canActivate: [roleGuard([UserRole.Admin, UserRole.DG])]`

- [x] **T04** — Créer service utilitaire `ExcelExportService` `[1 j]`
  - Fichier cible : `src/app/core/services/export/excel-export.service.ts`
  - `xlsx` remplacé par `exceljs` (lazy load, styles en-tête, alternance couleurs)
  - Vulnérabilités npm résolues : `undici` override `>=7.24.0`, `xlsx` → `exceljs`

- [x] **T05** — Créer service utilitaire `PdfExportService` (base pdfmake) `[1 j]`
  - Fichier cible : `src/app/core/services/export/pdf-export.service.ts`
  - `pdfmake` installé, chargement lazy, helpers `header()`, `footer()`, `baseStyles`, `tableRow()`

---

## 🟠 PRIORITÉ 2 — Workflow Crédit (pages manquantes critiques)
> Cœur métier le plus utilisé. Nécessite T01/T02 pour les restrictions de profil.

| ID | Tâche | Estimation |
|---|---|---|
| T06 | Restrictions profil sur création crédit | 0.5 j |
| T07 | Liste des demandes crédit | 1.5 j |
| T08 | Demandes crédit en attente | 1 j |
| T09 | Fiche crédit (détail dossier) | 4 j |
| T10 | Corriger redirection post-création | 0.25 j |
| T11 | Résumé de demande crédit | 1.5 j |
| T12 | Tableau de bord crédit agence | 2 j |
| T13 | Détail agence depuis le dashboard | 1 j |
| T14a | Analyse financière — Profil activité + ventes | 2 j |
| T14b | Analyse financière — Achats + charges exploitation | 2 j |
| T14c | Analyse financière — Trésorerie + créances + stocks + dettes | 2 j |
| T14d | Analyse financière — Profil familial + composition ménage | 1.5 j |
| T14e | Analyse financière — Actifs & garanties | 2 j |
| T14f | Analyse financière — Cautions solidaires + documents annexes | 1.5 j |
| T14g | Analyse financière — SWOT + pré-comité / comité | 2 j |
| T14h | Analyse financière — Envoi dossier + validation finale | 1.5 j |
| | **Sous-total P2** | **26.25 j** |

- [x] **T06** — Appliquer les restrictions de profil sur la création de demande crédit `[0.5 j]`
  - "Tirage découvert" masqué pour tous sauf `GP` et `Admin` (`canCreateTirage` computed)
  - Types de crédit filtrés par codes selon le profil : GP (9 types dont découvert), ACJ/CE (2), RC/CC (3)
  - `PermissionService` injecté dans `CreateCreditComponent`

- [x] **T07** — Implémenter page "Liste des demandes crédit" `[1.5 j]`
  - Route : `/app/credit/list`
  - 3 onglets : En attente / Clôturés / Rejetés (endpoints `listeDemande?action=...`)
  - Recherche temps réel (ref, client, code, agence, type crédit)
  - Tableau responsive avec avatar initiales, badge statut coloré, badge Tirage
  - Pagination côté client via `PaginationComponent`
  - Ajouté au sidebar + route

- [~] **T08** — ~~Page "Demandes crédit en attente"~~ → **Supprimée, redondante avec T07**
  - La page liste (`/app/credit/list`) affiche déjà l'onglet "En attente" par défaut
  - Helper `navigateByStatut()` conservé dans `utils/credit-navigation.ts` (utilisé par T07)

- [x] **T09** — Implémenter page "Fiche crédit" (détail dossier) `[4 j]`
  - Route : `/app/credit/:ref` (paramètre = `refDemande`)
  - Endpoint : `GET /credit/getinfosdmde/{ref}`
  - Layout 2 colonnes : client + montants (gauche) | onglets (droite)
  - **Onglet Détails** : infos demande + section décision finale (montant, durée, mensualité, frais, indicateurs booléens)
  - **Onglet Documents** : upload + liste avec téléchargement/suppression
  - **Onglet Historique** : timeline observations avec auteur, profil, horodatage
  - Interfaces `CreditFiche`, `CreditDecisionFinale`, `CreditObservation`, `CreditDocumentAnnexe` ajoutées

- [x] **T10** — Corriger la redirection post-création de demande `[0.25 j]`
  - Redirige désormais vers `/app/credit/list` après save réussi

- [x] **T11** — Implémenter page "Résumé de demande crédit" `[1.5 j]`
  - Route : `/app/credit/resume/:ref`
  - Endpoint : `GET /credit/getresume/{ref}`
  - Onglets dynamiques (affichés seulement si la section existe) : Synthèse | SWOT | Garanties | Proposition AR | Contre-éval. | Comités | Décision finale | Historique
  - Synthèse : récapitulatif comparatif de toutes les décisions (AR → contre-éval → pré-comité → comité → finale)
  - SWOT : 4 quadrants colorés (forces/faiblesses/opportunités/menaces)
  - Comités : carte par décision avec décideur, montant, durée, motivation
  - Bannière d'action pour les profils concernés par le statut courant
  - Navigation vers fiche crédit depuis le résumé
  - Interfaces : `CreditResume`, `CreditSWOT`, `CreditComiteDecision`, `CreditPropositionAR`, `CreditContreEvaluation`, `CreditGarantieProposes`

- [x] **T12** — Implémenter page "Tableau de bord crédit agence" `[2 j]`
  - Route : `/app/credit/dashboard-agence`
  - Endpoint : `GET /credit/dashCrdCaa` + filtre `?clickSearch=YES&...`
  - KPIs : 6 compteurs (création, analyse, comité, levée reco, clôturé, rejeté)
  - Montant total (sommeTotaleMontantsProposes) + répartition par type crédit avec barre de progression
  - Formulaire de filtre : typeCredit, statut, codeClient, dateDebut, dateFin
  - Tableau paginé des demandes avec click → `navigateByStatut()`
  - Badge "Avance de fonds" si `avsFond.statut !== 3`
  - Ajouté au sidebar : "Tableau de bord agence"

- [ ] **T13** — Implémenter "Détail agence" depuis le tableau de bord crédit `[1 j]`
  - FrontEnd ref : `detail-tableau-bord-agence-siege`
  - Accessible depuis le tableau des agences dans le dashboard

- [ ] **T14** — Implémenter "Analyse financière" *(décomposée en 8 sous-tâches)* `[14.5 j total]`
  - Route : `/app/credit/analyse/:id`
  - FrontEnd ref : `analyse-financiere-credit`
  - Dépend de : **T01**, **T02**, **T09**

  - [ ] **T14a** — Section profil activité + ventes journalières/mensuelles `[2 j]`
  - [ ] **T14b** — Section achats mensuels + charges exploitation `[2 j]`
  - [ ] **T14c** — Section trésorerie + créances + stocks + dettes `[2 j]`
  - [ ] **T14d** — Section profil familial + composition ménage `[1.5 j]`
  - [ ] **T14e** — Section actifs & garanties (immobilier, véhicules, DAT…) `[2 j]`
  - [ ] **T14f** — Section cautions solidaires + documents annexes `[1.5 j]`
  - [ ] **T14g** — Section analyse SWOT + pré-comité / comité `[2 j]`
  - [ ] **T14h** — Section envoi dossier + validation finale `[1.5 j]`

---

## 🟡 PRIORITÉ 3 — Tirage découvert & Employeurs

| ID | Tâche | Estimation |
|---|---|---|
| T15 | Flow tirage découvert dans la création | 1.5 j |
| T16 | Liste des tirages | 1 j |
| T17 | Détail d'un tirage | 1.5 j |
| T18 | Employeurs éligibles | 1 j |
| T19 | Détail employeur | 1 j |
| T20 | Liste observations employeur | 0.75 j |
| T21 | Liste actions crédit | 1 j |
| T22 | Organigramme — Liste utilisateurs crédit | 0.75 j |
| | **Sous-total P3** | **8.5 j** |

- [ ] **T15** — Finaliser le flow "Tirage découvert" dans la création de demande `[1.5 j]`
  - Actuellement stub vide dans `create-credit.component.html`
  - Implémenter la recherche par numéro PERFECT + affichage infos découvert

- [ ] **T16** — Implémenter page "Liste des tirages" `[1 j]`
  - Route : `/app/credit/tirage/list`
  - FrontEnd ref : `liste-tirage-page`
  - Ajouter dans sidebar + route

- [ ] **T17** — Implémenter page "Détail d'un tirage" `[1.5 j]`
  - Route : `/app/credit/tirage/:id`
  - FrontEnd ref : `detail-tirage-page`

- [ ] **T18** — Implémenter page "Employeurs éligibles" `[1 j]`
  - Route : `/app/credit/employeur/list`
  - FrontEnd ref : `employeur-eligible-credit`

- [ ] **T19** — Implémenter page "Détail employeur" `[1 j]`
  - Route : `/app/credit/employeur/:id`
  - FrontEnd ref : `detail-employeur-credit`

- [ ] **T20** — Implémenter page "Liste observations employeur" `[0.75 j]`
  - Route : `/app/credit/employeur/:id/observations`
  - FrontEnd ref : `liste-observation-employeur`

- [ ] **T21** — Implémenter page "Liste actions crédit" `[1 j]`
  - Route : `/app/credit/actions`
  - FrontEnd ref : `liste-action-credit`

- [ ] **T22** — Implémenter page "Organigramme — Liste utilisateurs crédit" `[0.75 j]`
  - FrontEnd ref : `liste-user-credit`

---

## 🟡 PRIORITÉ 4 — Exports documents

| ID | Tâche | Estimation |
|---|---|---|
| T23 | Export Excel : Liste des CORAs | 0.5 j |
| T24 | Export PDF : Liste des CORAs | 1 j |
| T25 | Export PDF : Contrat CORA individuel | 1.5 j |
| T26 | Export Excel : Liste des tireurs ASC | 0.5 j |
| T27 | Export PDF : Demande d'avance sur chèque | 1.5 j |
| T28 | Export PDF : Convention de crédit (PP + PM) | 3 j |
| T29 | Export Excel : Géolocalisation CORAs | 0.5 j |
| | **Sous-total P4** | **8.5 j** |

- [ ] **T23** — Export Excel : Liste des CORAs `[0.5 j]`
  - Depuis : `/app/cora/list`
  - Colonnes : code, nom, agence, statut, date création
  - Dépend de : **T04**

- [ ] **T24** — Export PDF : Liste des CORAs `[1 j]`
  - Depuis : `/app/cora/list`
  - Dépend de : **T05**

- [ ] **T25** — Export PDF : Contrat CORA individuel `[1.5 j]`
  - Depuis : `/app/cora/:id`
  - Dépend de : **T05**

- [ ] **T26** — Export Excel : Liste des tireurs ASC `[0.5 j]`
  - Depuis : `/app/asc/tireurs`
  - Colonnes : nom tireur, banque, nb chèques, montant total
  - Dépend de : **T04**

- [ ] **T27** — Export PDF : Demande d'avance sur chèque `[1.5 j]`
  - Depuis : `/app/asc/detail/:id`
  - Dépend de : **T05**

- [ ] **T28** — Export PDF : Convention de crédit `[3 j]`
  - Depuis : fiche crédit (`/app/credit/:id`)
  - Versions PP et PM avec mise en page officielle
  - Dépend de : **T05**, **T09**

- [ ] **T29** — Export Excel : Géolocalisation CORAs `[0.5 j]`
  - Depuis : `/cora-map`
  - Dépend de : **T04**

---

## 🟢 PRIORITÉ 5 — ASC (pages manquantes)

| ID | Tâche | Estimation |
|---|---|---|
| T30 | Tableau de bord ASC agence | 1.5 j |
| T31 | Détail d'un chèque | 1.5 j |
| | **Sous-total P5** | **3 j** |

- [ ] **T30** — Implémenter page "Tableau de bord ASC agence" `[1.5 j]`
  - Route : `/app/asc/dashboard/agence`
  - FrontEnd ref : `tableau-bord-asc-agence`
  - Vue allégée pour CA, CAA, RC, CC
  - Dépend de : **T01**, **T02**

- [ ] **T31** — Implémenter page "Détail d'un chèque" `[1.5 j]`
  - Route : `/app/asc/cheque/:id`
  - FrontEnd ref : `detail-cheque`
  - Page dédiée au chèque (différente du détail de la demande)
  - Boutons d'action conditionnés par profil
  - Dépend de : **T01**, **T02**

---

## 🟢 PRIORITÉ 6 — CORA (pages manquantes)

| ID | Tâche | Estimation |
|---|---|---|
| T32 | Mes CORAs | 1 j |
| T33 | Détail agence CORA | 1 j |
| | **Sous-total P6** | **2 j** |

- [ ] **T32** — Implémenter page "Mes CORAs" `[1 j]`
  - Route : `/app/cora/mes-coras`
  - FrontEnd ref : `mes-coras`
  - Vue filtrée sur les CORAs de l'agent connecté
  - Ajouter dans sidebar pour profils `Gestion_Cora`, `Charge_Cora`
  - Dépend de : **T01**, **T02**

- [ ] **T33** — Implémenter page "Détail agence CORA" `[1 j]`
  - Route : `/app/cora/agence/:id`
  - FrontEnd ref : `detail-agence-cora`

---

## 🔵 PRIORITÉ 7 — Paramétrage
> Accès réservé Admin/DG/DGA. Dépend de T01/T03.

| ID | Tâche | Estimation |
|---|---|---|
| T34 | Entrée Paramétrage dans la sidebar | 0.25 j |
| T35 | Liste des utilisateurs | 1.5 j |
| T36 | Détail d'un utilisateur | 1.5 j |
| T37 | Page configuration générale (squelette onglets) | 0.5 j |
| T38 | Sous-onglet config. agences | 1.5 j |
| T39 | Sous-onglet config. ASC | 1.5 j |
| T40 | Sous-onglet config. crédit | 1.5 j |
| T41 | Sous-onglet zonification | 1.5 j |
| | **Sous-total P7** | **9.75 j** |

- [ ] **T34** — Ajouter module Paramétrage dans la sidebar (conditionné par rôle) `[0.25 j]`
  - Dépend de : **T01**, **T02**

- [ ] **T35** — Implémenter page "Liste des utilisateurs" `[1.5 j]`
  - Route : `/app/parametrage/utilisateurs`
  - FrontEnd ref : `utilisateur-liste`
  - Tableau avec filtres + pagination
  - Dépend de : **T03**

- [ ] **T36** — Implémenter page "Détail d'un utilisateur" `[1.5 j]`
  - Route : `/app/parametrage/utilisateurs/:id`
  - FrontEnd ref : `utilisateur-detail`

- [ ] **T37** — Implémenter page "Configuration générale" (squelette onglets) `[0.5 j]`
  - Route : `/app/parametrage/configuration`
  - FrontEnd ref : `parametrage-page`
  - Onglets : Agences / ASC / Crédit / Zonification

- [ ] **T38** — Sous-onglet "Configuration agences" `[1.5 j]`
  - FrontEnd ref : `agence-parametrage`
  - Dépend de : **T37**

- [ ] **T39** — Sous-onglet "Configuration ASC" `[1.5 j]`
  - FrontEnd ref : `asc-parametrage`
  - Dépend de : **T37**

- [ ] **T40** — Sous-onglet "Configuration crédit" `[1.5 j]`
  - FrontEnd ref : `credit-parametrage`
  - Dépend de : **T37**

- [ ] **T41** — Sous-onglet "Zonification" `[1.5 j]`
  - FrontEnd ref : `zonification-parametrage`
  - Dépend de : **T37**

---

## 📊 Récapitulatif

| Priorité | Tâches | Estimation | Terminées |
|---|---|---|---|
| 🔴 P1 — Infrastructure | T01 → T05 | 3.5 j | ✅ 5 / 5 |
| 🟠 P2 — Workflow Crédit | T06 → T14h | 26.25 j | ✅ 6 / 16 (T06, T07, T09, T10, T11 · T08 supprimé) |
| 🟡 P3 — Tirage & Employeurs | T15 → T22 | 8.5 j | 0 / 8 |
| 🟡 P4 — Exports | T23 → T29 | 8.5 j | 0 / 7 |
| 🟢 P5 — ASC | T30 → T31 | 3 j | 0 / 2 |
| 🟢 P6 — CORA | T32 → T33 | 2 j | 0 / 2 |
| 🔵 P7 — Paramétrage | T34 → T41 | 9.75 j | 0 / 8 |
| **TOTAL** | **43 tâches** | **~61.5 j** | **11 / 43** |
