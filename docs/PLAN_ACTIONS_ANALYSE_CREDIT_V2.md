# PLAN D'ACTIONS — Analyse Financière Crédit (New Frontend vs Legacy)

> Comparaison exhaustive entre le composant legacy `analyse-financiere-credit` (Angular 14 / ~5 700 lignes TS) et la nouvelle implémentation `analyse-credit` (Angular 21 / architecture modulaire).
>
> Chaque section liste les **incohérences**, **éléments manquants** et **corrections à apporter**.

---

## ✅ CORRECTIONS TRANSVERSALES APPLIQUÉES EN SESSION

| Fichier | Correction |
|---------|-----------|
| `cautions-section.component.ts` | Suppression image : `openDelete('image', ...)` → `deleteImageCaution` (POST `/delete_image_garantie` avec `{ image: id }`) |
| `cautions-section.component.ts` | Suppression document : `openDelete('doc', ...)` → `deleteDocumentCaution` (POST `/delete_doc_garantie` avec `{ document: id }`) |
| `credit.service.ts` | Corps corrigé : `deleteImageCaution` envoie `{ image: id }`, `deleteDocumentCaution` envoie `{ document: id }` |
| `credit.interface.ts` | `GarantieMedia.url` → `GarantieMedia.lien` (nom réel du champ API) |
| `cautions-section.component.html` | `image.url` → `image.lien`, `doc.url` → `doc.lien` |
| `resume-credit.component.ts` | `safeUrl()` et `downloadDocument()` préfixent maintenant `DOC_BASE_URL` |
| `doc-analyse-upload.component.ts` | Modification PDF : supprime l'ancien document (par ID) avant d'uploader le nouveau |
| `analyse-credit.component.html` | Bouton upload "Actifs & Garanties" déplacé dans `@case ('garanties')` (était dans `@case ('activite')`) |
| `analyse-credit.component.html` | Navigation principale convertie de sidebar verticale → barre d'onglets horizontale scrollable |
| `garanties-section.component.ts/html` | Champs `garantie`, `miniComm`, `nouvelleAcquisition`, `idCaution` : conversion `Number()` dans `save()` (select retourne strings, API attend numbers) |
| `garanties-section.component.ts` | Chargement cautions : `getAnalyseFinanciere → cautionsSolidaires` → **corrigé** `getGarantiesDemande → crCaution` (même source que composant cautions) |
| `garanties-section.component.ts` | Chargement actifs circulants stocks depuis `getGarantiesDemande → actifCirculantStock` |
| `garanties-section.component.html` | DAT : `garantie` maintenant `required` (était optionnel) |
| `garanties-section.component.html` | BIEN_MOBILIER : `garantie` et `evaluation` maintenant `required` |
| `garanties-section.component.html` | Véhicule : un seul bouton "Ajouter", `nouvelleAcquisition` fixé à `0` programmatiquement (comme legacy non-019) |
| `garanties-section.component.html` | Véhicule : `couleur`, `dateMiseEnCirculation`, `immatriculation`, `typeCommercial`, `typeTechnique` — `[required]="nouvelleAcquisition() !== 1"` (optionnels pour nouvelle acquisition) |
| `achats-section.component.ts/html` | Charges exploitation : remplacement constantes statiques `TYPES_CHARGE` → appel API `GET /listeTypeCharge` ; form mis à jour (`activite` + `charge` id + `montant`) |
| `credit.interface.ts` | `ChargeExploitation` réécrit : `charge` (id/objet API), `activite`, `montant`, `commentaire` — suppression `typeCharge`, `libelle`, `statut` |
| `credit.interface.ts` | Ajout interface `CrTypeCharge` |
| `credit.interface.ts` | `CreditActifCirculantStock` : ajout `assurStock` et `garantie` |
| `credit.service.ts` | Ajout `getListeTypeCharge()`, `saveActifCirculantStock()`, `deleteActifCirculantStock()` |
| `familial-section.component.ts` | Trésorerie famille : `TYPES_TRESORERIE` et `TYPES_COMPTE` valeurs string ('1','2') au lieu de number ; casts `String()` dans `openEditTresorerie`, `typeLabel`, `totalEpargnes`, `totalDettes` |
| `achats-section.component.ts/html` | Imprévus charges exploitation : carte par activité avec select 10/20/30% → `POST /saveImprevus` ; `analyseFin.chargeExploitation.imprevu` ajouté dans interface `ActiviteCredit` |
| `swot-section.component.ts/html` | §10.3 — Proposition AR : ajout `dateEcheanceSouhaite`, `periodeGrace`, `nbreMoisGrace`, `hypotheque`, `acteNotarie`, `assurMultiRisk`, `deposit`, `argumentaire` dans form, loadData et saveProposition |
| `garanties-section.component.ts/html` | Boutons modification (pencil) ajoutés sur tous les actifs garanties + actifs circulants stocks ; bug de duplication corrigé (`actifGarantie: editId`, `actifCirculantStock: editId`) |
| `garanties-section.component.ts` | §7.11 — Totaux garanties fixes vs proposées : `totalGarantiesFixes` et `totalGarantiesProposees` calculés séparément (filtre `garantie === 1`) ; 2 cartes dans le header |
| `garanties-section.component.html` | §7.3 — DAT : colonnes `Banque` et `Date effet` ajoutées dans le tableau ; colspan mis à jour |
| `achats-section.component.ts/html` | Boutons modification ajoutés : achats mensuels (`openEditAchat`), charges exploitation (`openEditCharge`), stocks achats (`openEditStock`) ; payload corrigé (`achatMensuel: editId`, `chargeExploitation: editId`, `stock: editId`) |
| `tresorerie-section.component.ts/html` | Boutons modification ajoutés : créances (`openEditCreance`), stocks trésorerie (`openEditStock`), dettes fournisseurs (`openEditDetteFournisseur`), dettes entreprise (`openEditDetteEntreprise`) ; endpoints dédiés pour update |
| `credit.service.ts` | `getActivitesDemande(ref)` ajouté → `GET /getActiviteDemande/{ref}` (liste activités d'un dossier) |
| `achats-section.component.ts` | Bug dropdown Activité vide : ajout appel `getActivitesDemande` en parallèle de `getAnalyseFinanciere` pour garantir le peuplement du dropdown |

---

## TABLE DES MATIÈRES

1. [Bandeau d'actions (Header)](#1-bandeau-dactions-header)
2. [Onglet Demande de Crédit](#2-onglet-demande-de-crédit)
3. [Onglet Activités / Profil Activité](#3-onglet-activités--profil-activité)
4. [Onglet Achats & Charges](#4-onglet-achats--charges)
5. [Onglet Trésorerie](#5-onglet-trésorerie)
6. [Onglet Profil Familial](#6-onglet-profil-familial)
7. [Onglet Actifs & Garanties](#7-onglet-actifs--garanties)
8. [Onglet Cautions Solidaires](#8-onglet-cautions-solidaires)
9. [Onglet Documents Annexes](#9-onglet-documents-annexes)
10. [Onglet SWOT & Comités](#10-onglet-swot--comités)
11. [Onglet Géolocalisation](#11-onglet-géolocalisation)
12. [Onglet Envoi & Validation](#12-onglet-envoi--validation)
13. [Workflow global / Logique métier transversale](#13-workflow-global--logique-métier-transversale)
14. [Services / Endpoints API](#14-services--endpoints-api)
15. [Interfaces / Modèles de données](#15-interfaces--modèles-de-données)

---

## 1. Bandeau d'actions (Header)

### ✅ Ce qui est implémenté
- Superviseur Risque Zone (statut 24) : Ajourner + Confirmation rejet
- Superviseur PME (statut 19) : Ajourner + Charger docs + Envoyer rapport
- AR / Admin (statut 5) : Avis défavorable + Ajourner + Charger docs + Faire résumé
- AR en pause (statut ≠ 5) : Charger docs + Faire résumé
- CA/CAA (statut 4) : Ajourner + Affecter AR
- RC/CC : Ajourner + N° Perfect + Checkbox frais + Envoyer
- GP / Autres : Charger docs + Envoyer
- Voir le résumé (hors statuts 1-5, 19)

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| 1.1 | **GP statut 1 — Boutons spécifiques par type crédit** | Le legacy affiche des boutons différents selon `typeCredit.code` au statut 1 (ex: Relais `002` a un bouton "Avis ACJ", Relais Business `011` a "Envoyer au CA") | Ajouter la logique conditionnelle par `typeCredit.code` dans le bandeau GP au statut 1 |
| 1.2 | **Profils manquants dans le bandeau** | Legacy gère : ACJ (statut 1, code `002`/`036`), CE (statut 2), Directrice Exploitation, Responsable Clientèle PME, Assistante Clientèle PME | Ajouter ces profils dans `analyse-header-card` avec leurs boutons respectifs |
| 1.3 | **Statut 21 — Admin : "Remettre dans le circuit"** | Legacy : `remettreDossierDansCircuit()` via `envoiDossierCreditDataSource` | Ajouter le bouton + dialog pour Admin quand `statut === 21`. Endpoint legacy : `PUT /remettreDossierDansCircuit` |
| 1.4 | **Statut 3 — RC/CC : Validation prêt OUF/Scolaire/Avance salaire** | Legacy : codes `014`, `001`, `008` au statut 3 → bouton "Valider le dossier" pour RC/CC | Ajouter cette condition dans le bandeau RC/CC |
| 1.5 | **CA/CAA statut 4 — Affectation Superviseur PME** | Legacy : `recuperationListeSuperviseurPME()` pour codes `032`, `033` au statut 4 | Ajouter bouton "Affecter Sup OP / CAA" + dialog avec liste superviseurs PME. Endpoint : `GET /listeSuperviseurPME` |
| 1.6 | **Affichage conditionnel "Charger docs" pour CA/CAA** | Legacy : CA/CAA au statut 4 pour codes `032`/`033` voit un dropdown docs spécifique | Ajouter `getRequiredDocsForCACaa()` dans `required-documents.ts` |
| 1.7 | **Vérification `checkInfoObigatoireClientEtSignataire` avant envoi GP** | Legacy : vérifie tous les champs obligatoires du client PP/PM + signataire avant d'ouvrir le dialog d'envoi | Implémenter cette vérification dans `canSendDossierFromState` ou en amont du dialog |
| 1.8 | **Vérification spécifique par type crédit avant envoi** | Legacy : vérifie `infosCrAuto.length` (019), `bonDeCommande != null` (032), `crFacture != null` (033), `crMagasin.length` (035) | Déjà partiellement dans `gpTypeAttachmentCompleteForSend` — **vérifier que c'est complet** |

---

## 2. Onglet Demande de Crédit

### ✅ Ce qui est implémenté
- Sous-sections dynamiques : Demande, Client PP/PM, Signataires, Bon commande, Facture, Véhicules, Magasin, Avis ACJ/CE, Employeur, Décision finale
- `CreditInfoFormComponent` pour modification demande
- `ClientPpCardComponent` / `ClientPmCardComponent`
- `SignatairesCardComponent`
- Composants readonly pour pré-évaluation ACJ/CE, employeur, décision finale

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| 2.1 | **Modification client PP — champs manquants** | Legacy envoie : `codeClient`, `nomPrenom`, `dataNaiss`, `sexe`, `typePiece`, `numPiece`, `validitePiece`, `telPortable`, `telFixe`, `situationMatri`, `telConjoint`, `lot`, `villa`, `facture`, `quartier`, `rue`, `adresse`, `batimentProche`, `lieuNaiss`, `rccm`, `denomination`, `profession`, `tpePme`, `commune`, `nationalite` | Vérifier que `client-pp-card` envoie **tous** ces champs à `POST /update_client` |
| 2.2 | **Modification client PM — champs manquants** | Legacy envoie en plus : `statutJuridique`, `typeActivite`, `typeClientele`, `ancienneteSecteur`, `concurence`, `impactEnvironnement`, `typeLocal`, `statutLocal`, `ancienneteLocal`, `rccm`, `ncc`, `impots`, `dateCreation`, `capitalSocial`, `email` | Vérifier que `client-pm-card` envoie **tous** ces champs à `POST /update_client_entreprise` |
| 2.3 | **Modification signataire — endpoint** | Legacy : `modificationSignataire()` → `POST /updtateSignataire` avec champs : `signataire` (id), `nom`, `prenom`, `dateNaiss`, `typePiece`, `numPiece`, `sexe`, `situationMatri`, `telephone`, `commune`, `quartier`, `rue`, `dateStatut`, `nationalite`, `dateDelivrancePiece`, `dateExpirationPiece`, `lieuDelivrance` | Vérifier que `signataires-card` envoie les bons champs |
| 2.4 | **Modification photo signataire** | Legacy : `modificationPhotoSignataire()` → `POST /updateProfilImgCaution` avec FormData | Vérifier si implémenté dans `signataires-card` |
| 2.5 | **Récupération signataire depuis PERFECT** | Legacy : `recuperationSignataire()` → `POST /recuperationSignataire/{codeClient}` | Ajouter ce bouton si absent |
| ~~2.6~~ | ✅ **Profil Entrepreneur** | Legacy : `profilEntrepreneurForm` avec `parcoursPro`, `niveauEducation` → `POST /saveProfilEnt` | ✅ FAIT — composant `profil-entrepreneur-card`, interface `ProfilEntrepreneur`, service `saveProfilEntrepreneur`, ajouté dans sidebar demande |
| 2.7 | **Pré-évaluation ACJ — mode édition** | Legacy : ACJ et CE peuvent **créer/modifier** la pré-évaluation, pas seulement la lire | Les composants actuels sont `readonly`. Ajouter le mode édition pour ACJ (profil ACJ) et CE (profil CE). Endpoints : `POST /savePreEvaluationACJCE` |
| 2.8 | **Pré-évaluation ACJ — champs complets** | Legacy envoie : `acj`, `refDemande`, `preEvaluation`, `avisAcjDmde`, `relationClt`, `relationEmploye`, `relationVosinage`, `affluenceActivite`, `quantiteStock`, `qualiteStock`, `relationCommercial`, `evolutionMtCollect`, `frequenceMtCollect` | Vérifier que le composant readonly affiche **tous** ces champs |
| 2.9 | **Pré-évaluation CE — champs complets** | Legacy envoie : `ce`, `acj`, `refDemande`, `preEvaluation`, `lastMonthCollect`, `montRecurrent`, `avisCeDmde`, `enquetteVoisinage`, `recommandationCe` | Vérifier que le composant readonly affiche **tous** ces champs |
| 2.10 | **Sous-section "Avis ACJ" visible pour d'autres codes** | Legacy : visible pour code `002` uniquement. New : idem. **OK mais vérifier** que le code `036` est aussi géré (legacy le gère) |
| 2.11 | **Modification demande crédit — champs complets** | Legacy envoie : `refDemande`, `codeClient`, `objetCredit`, `montantSollicite`, `typeCredit`, `autreCommentAgCredit`, `typeActivite`, `nbreEcheanceSollicite`, `montantEcheSouhaite`, `description`, `margePondere`, `nbreEcheDiffere`, `numTransaction` | Vérifier que `credit-info-form` envoie **tous** ces champs à `POST /updateDemandeCredit` |

---

## 3. Onglet Activités / Profil Activité

### ✅ Ce qui est implémenté
- CRUD activités (libelle, typeAnalyse, commune, quartier, rue, boitePostale, typeActivite)
- CRUD ventes mensuelles (mois, montant, statut)
- CRUD ventes journalières (jour, montant, statut)
- Récupération types activité et communes

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| 3.1 | **Marge pondérée — édition inline** | Legacy : `enregistrementModifMargePonderee()` permet de modifier `margePondere` directement sur la ligne activité | Ajouter un champ éditable inline pour `margePondere` sur chaque activité |
| 3.2 | **Valeur derniers achats — édition inline** | Legacy : `enregistrementModifValeursDerniersAchats()` | Ajouter un champ éditable inline pour `valDernierAchat` |
| 3.3 | **Date derniers achats — édition inline** | Legacy : `enregistrementModifDateDernierAchat()` | Ajouter un champ éditable inline pour `dateDernierAchat` |
| ~~3.4~~ | ✅ **Marges commerciales et stock** | Legacy : CRUD complet `margeCommercialeEtStockForm` avec `article`, `quantite`, `prixVente`, `prixAchat` → `POST /saveMargeCommerciale` et `PUT /modifMargeCommerciale/{id}` et `DELETE /deleteMargeCommerciale/{id}` | ✅ FAIT — CRUD complet dans `activite-section` : interface `MargeCommerciale`, service `saveMargeCommerciale`/`updateMargeCommerciale`/`deleteMargeCommerciale`, drawer avec calcul marge live, tableau par activité |
| 3.5 | **Endpoint activité — champs manquants** | Legacy envoie aussi `margePondere`, `valDernierAchat`, `dateDernierAchat` dans `POST /saveActiviteDmde` | Vérifier que le form activité envoie ces champs |
| 3.6 | **Niveau activité** | Legacy : `niveauActivite` (1 = principale, 2 = secondaire) affiché avec badge | Afficher le badge niveau activité dans la liste |

---

## 4. Onglet Achats & Charges

### ✅ Ce qui est implémenté
- CRUD achats mensuels (`activite`, `article`, `fournisseur`, `quantite`, `frequence`, `achatsMensuels`)
- CRUD charges exploitation — types chargés depuis `GET /listeTypeCharge`, form : `activite` + `charge` (id) + `montant`
- CRUD stocks achats (`activite`, `article`, `quantite`, `montantTotal`)
- Totaux calculés

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| ~~4.1~~ | ✅ **Achats mensuels — champs manquants** | Legacy envoie : `article`, `fournisseur`, `frequence`, `quantite`, `achatsMensuels` | ✅ FAIT — form mis à jour, colonnes tableau mises à jour |
| ~~4.2~~ | ✅ **Achats mensuels — endpoint** | `POST /saveAchatMensuel` | ✅ OK — payload vérifié |
| ~~4.3~~ | ✅ **Charges exploitation — champs manquants** | Legacy : `activite` + `charge` (id API) + `montant` | ✅ FAIT — form réécrit, suppression `typeCharge`/`libelle`/`statut` |
| ~~4.4~~ | ✅ **Types de charges — récupération API** | `GET /listeTypeCharge` → `crTypeCharges[]` | ✅ FAIT — `getListeTypeCharge()` ajouté au service, chargé dans `loadData()` |
| ~~4.5~~ | ✅ **Imprévus charges exploitation** | Legacy : `POST /saveImprevus` avec `activite` et `imprevu` (10/20/30%) | ✅ FAIT — carte "Imprévus charges exploitation" ajoutée, select par activité, `saveImprevuChargeExploitation()` dans le service, `analyseFin.chargeExploitation.imprevu` dans l'interface |
| ~~4.6~~ | ✅ **Stocks achats — endpoint + modification** | Legacy : `POST /saveStock` avec `stock` (id), `activite`, `article`, `quantite`, `montanTotal` | ✅ FAIT — payload `stock: editId` corrigé, bouton modification ajouté |
| ~~4.7~~ | ✅ **Lien activité dans charges** | Legacy : `activite` lié à chaque charge | ✅ FAIT — `activite` ajouté dans le form charges |

---

## 5. Onglet Trésorerie

### ✅ Ce qui est implémenté
- Trésorerie disponible (caisse, banque, mobileMoney)
- CRUD créances clients (libelle, montant, echeance)
- CRUD stocks trésorerie
- CRUD dettes fournisseurs (libelle, montant, echeance)

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| 5.1 | **Trésorerie actif circulant — structure legacy** | Legacy : `tresorerieActifCirculantForm` avec `activite`, `libelle`, `montant`, `type` (Espèces du jour / Espèces cumulées) → `POST /saveTresorerieActifCirculant` | Le new a `caisse`, `banque`, `mobileMoney`. **Structure différente**. Vérifier quel endpoint le backend attend réellement |
| ~~5.2~~ | ✅ **Créances clients — champs manquants** | Legacy envoie : `refDemande`, `activite`, `objet`, `duree`, `solde`, `montant`, `recouvrMax` (pourcentage), `montArecevoir` | ✅ DÉJÀ IMPLÉMENTÉ — tous les champs présents |
| ~~5.3~~ | ✅ **Avances fournisseurs** | Legacy : CRUD complet `avanceFournisseurForm` avec `activite`, `objet`, `montant`, `dateVersAvc`, `dateRecepMarch`, `resteApay` → `POST /saveAvanceFournisseur` | ✅ DÉJÀ IMPLÉMENTÉ dans `tresorerie-section.component.ts` |
| ~~5.4~~ | ✅ **Historique des dettes (dettes entreprise)** | Legacy : `historiquesDettesForm` avec `activite`, `preteur`, `montantEmprun`, `dateDebut`, `finEcheance`, `restantDu`, `typeObjDette` | ✅ DÉJÀ IMPLÉMENTÉ — tous les champs présents |
| ~~5.5~~ | ✅ **Dettes fournisseurs (séparées des dettes entreprise)** | Legacy : `detteFournisseurForm` avec `activite`, `objet`, `montant`, `datePaie`, `dateRecepMarch`, `solde` → `POST /saveDetteFournisseur` | ✅ DÉJÀ IMPLÉMENTÉ dans `tresorerie-section.component.ts` avec section séparée |
| ~~5.6~~ | ✅ **Lien activité** | Legacy : chaque créance/avance/stock/dette est liée à une `activite` | ✅ DÉJÀ IMPLÉMENTÉ — `activite` présent dans créances, avances, dettes fournisseurs, dettes entreprise |

---

## 6. Onglet Profil Familial

### ✅ Ce qui est implémenté
- Profil familial (situation matrimoniale, épouses, enfants, instruction, régime)
- Charges familiales (loyer, scolarité, santé, autres)
- CRUD membres ménage (nom, relation, age, activite, revenu)

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| ~~6.1~~ | ✅ **Commentaire profil familial** | Legacy → `POST /saveProfilFamilial` avec `commentaire` | ✅ FAIT — champ `commentaire` ajouté dans `profilForm`, textarea dans HTML, interface `ProfilFamilial` mise à jour |
| ~~6.2~~ | ✅ **Composition ménage — champs manquants** | Legacy : `membreFamille` (select 7 types), `nombre`, `age`, `activite`, `revenus`, `justifs` | ✅ FAIT — `membreForm` réécrit, `MEMBRES_FAMILLE` constant (7 options), interface `MembreMenage` mise à jour, tableau et drawer mis à jour |
| ~~6.3~~ | ✅ **Charges familiales — structure legacy** | Legacy : `chargeFamilialeForm` avec `typeCharge` (Domicile/Transport/Personnel/Familiale/Autres), `chargeMens` (sous-charge), `montant` → `POST /saveChargeFamille` | ✅ FAIT — CRUD dynamique implémenté dans `familial-section` : interface `ChargeFamille`, service `saveChargeFamille`, drawer 2 niveaux (type → sous-charge), tableau avec total |
| ~~6.4~~ | ✅ **Imprévus charges familiales** | Legacy : `POST /saveImprevuChargeFamilial` avec `imprevu` (10/15/20/25/30%) | ✅ FAIT — select dans le pied du tableau charges familiales, autosave, `imprevuChargeFamille` dans l'interface, `saveImprevuChargeFamilial()` dans le service |
| ~~6.5~~ | ✅ **Trésorerie famille** | Legacy : `tresorerieFamilleForm` avec `libelle`, `montant`, `typeCompte`, `type`, `provenance` → `POST /saveTresorerieFamille` | ✅ FAIT — interface `TresorerieFamille`, service `saveTresorerieFamille`, carte + drawer dans `familial-section` avec totaux épargnes/dettes et solde net |
| 6.6 | **Endpoint profil familial** | Legacy : `POST /saveCommentaire` (commentaire), `POST /saveMenageRevenuFamille` (membres), `POST /saveChargeFamilial` (charges), `POST /saveTresorerieFamille` (trésorerie) | Vérifier que les endpoints du new correspondent |

---

## 7. Onglet Actifs & Garanties

### ✅ Ce qui est implémenté
- CRUD actifs avec types : IMMOBILIER, VEHICULE, EQUIPEMENT, DAT, BIEN_MOBILIER, AUTRE
- Formulaire unique avec champs conditionnels par type
- Totaux calculés
- ✅ Upload images/docs par actif avec types prédéfinis par catégorie (ajouté en session)
- ✅ Lightbox images par actif (ajouté en session)
- ✅ Suppression images/docs par actif (ajouté en session)
- ✅ Modification PDF "Actifs garanties" — supprime l'ancien avant d'uploader le nouveau (corrigé en session)

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| 7.1 | **Structure garanties — incohérence majeure** | Legacy : utilise `typeGaranties[]` avec des IDs fixes (1=Immobilisation, 2=Matériel Pro, 3=Bien Mobilier Famille, 4=Véhicule, 5=Deposit, 6=DAT) et `POST /saveActifGarantie` avec `typeActifGarantie` (id) | Le new utilise un champ `type` string (IMMOBILIER, VEHICULE...). **Vérifier** que le backend accepte les deux formats ou adapter |
| 7.2 | **Deposit (espèces en banque)** | Legacy : `depositForm` avec `especeBanque`, `banque`, `typeCompte`, `valeurEstime`, `garantie`, `proprietaire` → `POST /saveActifGarantie` avec `typeActifGarantie = 5` | **Absent** du new. Ajouter le type DEPOSIT |
| ~~7.3~~ | ✅ **DAT — champs manquants** | Legacy : `depotATermeForm` avec `valeurEstime`, `dureeDat`, `dateEffetDat`, `dateEcheanceDat`, `numeroPerfectDat`, `garantie` | ✅ FAIT — form avait déjà tous les champs ; colonnes `Banque` et `Date effet` ajoutées dans le tableau |
| ~~7.4~~ | ✅ **Véhicule — formulaire double** | Legacy : deux formulaires séparés `vehiculeForm` (existant) et `vehiculeNouvelleAcquisitionForm` (nouvelle acquisition) avec des champs obligatoires différents | ✅ FAIT — select `nouvelleAcquisition` (0/1) ajouté, champs `immatriculation`/`dateMiseEnCirculation` masqués si nouvelle acquisition, signal `isNouvelleAcquisition` |
| ~~7.5~~ | ✅ **Véhicule — champs manquants** | Legacy envoie : `societeCr`, `societe`, `couleur`, `evaluation`, `immatriculation`, `garantie`, `typeVehicule`, `proprietaire`, `marque`, `typeProPerso`, `dateMiseEnCirculation`, `miniComm`, `vehiculeVu`, `valeurEstime`, `valeurAchat`, `nbrePlace`, `typeTechnique`, `typeCommercial`, `nouvelleAcquisition`, `idCaution`, `user` | ✅ FAIT — ajout `miniComm`, `societeCr`, `societe`, `nouvelleAcquisition` dans form + interface + payload |
| ~~7.6~~ | ✅ **Immobilisation — champs manquants** | Legacy envoie : `typePropriete`, `proprietaire`, `adressDescr`, `dateAcquisition`, `valeurEstime`, `garantie`, `superficie`, `titreFoncier`, `lot`, `ilot`, `justifs`, `idCaution`, `quantite` | ✅ FAIT — tous les champs présents dans le form, `quantite` ajouté pour immobilier |
| ~~7.7~~ | ✅ **Propriétaire : D (Demandeur) ou C (Caution)** | Legacy : le champ `proprietaire` peut être 'D' ou un id de caution. Le champ `idCaution` lie la garantie à une caution | ✅ FAIT — select `idCaution` dynamique (Demandeur + liste cautions chargées depuis API), `idCaution` dans interface + form + payload |
| ~~7.8~~ | ~~**Images et documents par garantie**~~ | ~~Legacy : chaque garantie a des images (`POST /saveImageGarantie`) et documents (`POST /saveDocGarantie`) avec libellés obligatoires~~ | ✅ **FAIT** — Upload images/docs par actif, lightbox, suppression |
| 7.9 | **Actifs circulants stocks (garanties)** | Legacy : `actifCirculantStocksForm` avec `description`, `quantite`, `prix`, `assurStock`, `garantie`, `cout` → `POST /saveActifCirculantStock` | Vérifier si c'est le même que le stock dans Achats ou un composant séparé |
| 7.10 | **Vérification documents obligatoires par type garantie** | Legacy : `verificationDocumentEtImageACTIFSGARANTIES()` vérifie les docs obligatoires pour immobilisations, véhicules, matériels pro, biens mobiliers | **Absent**. Implémenter cette vérification |
| ~~7.11~~ | ✅ **Totaux garanties fixes vs proposées** | Legacy : calcule `totauxGarantiesFixes` et `totauxGarantiesProposees` séparément (garantie=1 vs total) | ✅ FAIT — `totalGarantiesFixes` et `totalGarantiesProposees` computed signals, affichage 2 cartes dans le header garanties |

---

## 8. Onglet Cautions Solidaires

### ✅ Ce qui est implémenté
- CRUD cautions (nom, prenom, dateNaissance, contact, genre, situationMatri, typePiece, numPiece, revenu, justif, nationalite, profession, ville, commune, quartier, rue)
- Upload images et documents par caution
- Lightbox pour visualisation images (ajouté en session)
- Types de documents/images prédéfinis
- ✅ Suppression image caution — endpoint corrigé (`POST /delete_image_garantie` avec `{ image: id }`)
- ✅ Suppression document caution — endpoint corrigé (`POST /delete_doc_garantie` avec `{ document: id }`)
- ✅ Champ `lien` corrigé dans `GarantieMedia` (API retourne `lien`, pas `url`)
- ✅ URL images/docs préfixée avec `DOC_BASE_URL`

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| ~~8.1~~ | ✅ **Photo profil caution** | Legacy : `POST /updateProfilImgCaution` avec FormData | ✅ DÉJÀ IMPLÉMENTÉ — `onPhotoChange()` + `uploadPhotoCaution()` dans le service |
| ~~8.2~~ | ✅ **Champ `lieuNaissance`** | Legacy : champ obligatoire dans le formulaire caution | ✅ DÉJÀ IMPLÉMENTÉ — présent et required dans `cautionForm` |
| 8.3 | **Vérification docs obligatoires caution** | Legacy : `verificationLibelleDocChargerPourCaution()` vérifie que chaque caution a ses docs obligatoires avant envoi au résumé | Implémenter cette vérification dans `canFaireResumeFromState` |
| 8.4 | **Latitude/Longitude caution** | Legacy : stocke `latitude`, `longitude` pour chaque caution (géoloc mobile) | Vérifier que le form new envoie ces champs |

---

## 9. Onglet Documents Annexes

### ✅ Ce qui est implémenté
- Liste documents avec recherche
- Upload avec libellé prédéfini ou personnalisé
- Suppression
- Vérification docs obligatoires (required-documents.ts)

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| 9.1 | **Documents spécifiques par type crédit — exhaustivité** | Legacy a des listes très détaillées par code crédit ET par statut ET par profil | Vérifier que `required-documents.ts` couvre **tous** les cas du legacy (voir section 14) |
| 9.2 | **Indicateur visuel doc obligatoire vs chargé** | Legacy : affiche un check vert si le doc est chargé, rouge sinon | Vérifier que le dropdown dans le header désactive les docs déjà chargés (semble OK) |
| 9.3 | **Rapport de visite commanditaire** | Legacy : pour codes `032`/`033` au statut 4, vérifie `existenceRapportVisiteCommanditaire` | Vérifier que c'est géré dans `canSendDossierFromState` pour CA/CAA |

---

## 10. Onglet SWOT & Comités

### ✅ Ce qui est implémenté
- SWOT (forces, faiblesses, opportunités, menaces) — édition texte multiligne
- Proposition AR (montant, durée, mensualité, motivation, commentaire)
- Affichage pré-comités et comités

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| 10.1 | **Proposition Chef d'Agence** | Legacy : `propositionChefAgenceForm` avec calcul automatique frais dossier, acte notarié, assurance décès, commission déboursement, taux couverture, deposit → `POST /saveCrDecision` | **Absent** du new pour le profil CA/CAA. Ajouter le formulaire complet |
| 10.2 | **Calcul frais dossier** | Legacy : `recuperationCalculFraisDossier()` → `POST /calculFraisDossier` avec `refDemande`, `hypotheque`, `montant`, `duree` | Ajouter l'appel API et le calcul automatique dans le formulaire proposition |
| ~~10.3~~ | ✅ **Proposition AR — champs manquants** | Legacy envoie beaucoup plus : `montantPropose`, `fraisDossier`, `montantActeNotarie`, `montantEmprunte`, `duree`, `mensualite`, `dateEcheanceSouhaite`, `periodeGrace`, `hypotheque`, `nbreMoisGrace`, `argumentaire`, `motivation`, `tauxCouverture`, `acteNotarie`, `assurMultiRisk`, `deposit`, `authGage`, `commissionDeboursement`, `assurDecesInvalidite` | ✅ FAIT — ajout `dateEcheanceSouhaite`, `periodeGrace`, `nbreMoisGrace`, `hypotheque`, `acteNotarie`, `assurMultiRisk`, `deposit`, `argumentaire` dans form/loadData/saveProposition |

---

## 11. Onglet Géolocalisation

### ✅ Ce qui est implémenté
- Google Maps avec markers (client, activités, cautions)
- Légende, tableau récap, lien itinéraire
- Info window

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| 11.1 | **Markers activités et cautions** | La légende commente les markers activités et cautions (`<!-- -->`) | **Décommenter** les légendes activité et caution |
| 11.2 | **Vérification géolocalisation avant résumé** | Legacy : `verificationGeolocalisation()` vérifie que client + toutes activités sont géolocalisés | Ajouter cette vérification dans `canFaireResumeFromState` pour AR au statut 5 |

---

## 12. Onglet Envoi & Validation

### ✅ Ce qui est implémenté
- Checklist de complétude (activités, achats, trésorerie, familial, garanties, cautions, SWOT, proposition AR)
- Dialog de confirmation avec mot de passe

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| 12.1 | **Endpoint `submitAnalyse`** | Le new appelle `POST /submitAnalyse` qui n'existe pas dans le legacy. Legacy utilise `POST /saveCrdObservation` avec `decision: 1` | **Vérifier** si le backend a cet endpoint ou utiliser `saveCrdObservation` |
| 12.2 | **Checklist — items manquants** | La checklist ne vérifie pas : documents obligatoires, géolocalisation, infos véhicule/facture/bon commande | Ajouter ces vérifications |

---

## 13. Workflow global / Logique métier transversale

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| 13.1 | **Interval 30s actualisation** | Legacy : `interval(30000)` pour actualiser le temps passé sur le dossier | Non implémenté (pas critique mais à considérer) |
| 13.2 | **Onglets masqués selon statut** | Legacy : les onglets Analyse Financière et Actifs & Garanties n'existent pas aux statuts 1-4 | **Déjà implémenté** dans `filterAnalyseTabsByWorkflowStatut`. OK |
| 13.3 | **Onglets masqués selon profil** | Legacy : GP/RC/CC/CA ne voient que Demande + Documents + Géoloc | **Déjà implémenté** dans `filterAnalyseTabsByRole`. OK |
| 13.4 | **`verificationAgenceUser()` — agences Abidjan** | Legacy : vérifie si CA/CAA est dans une agence d'Abidjan (C01-C07, C14-C17) pour certaines actions | **Absent**. Ajouter si nécessaire |
| 13.5 | **Affichage statut dynamique** | Legacy : `affichageStatus()` retourne un libellé différent pour statut 4 selon le type crédit (032/033 : "En attente de la visite commanditaire" si rapport absent) | Vérifier que `CREDIT_STATUTS` gère ce cas |
| 13.6 | **Décryptage query params** | Legacy : utilise `CryptoService` pour décrypter `reference` et `status` des query params | Le new utilise un route param `:ref` directement. **OK** si les routes sont cohérentes |

---

## 14. Services / Endpoints API

### Endpoints présents dans le new mais à vérifier

| Endpoint new | Endpoint legacy | Statut |
|---|---|---|
| `POST /saveActiviteDmde` | `POST /saveActiviteDmde` | ✅ OK |
| `POST /saveVenteMensuelle` | `POST /saveVenteMensuelle` | ✅ OK |
| `POST /saveVenteJournaliere` | `POST /saveVenteJournaliere` | ✅ OK |
| `POST /saveAchatMensuel` | `POST /saveAchatMensuel` | ⚠️ Vérifier payload |
| `POST /saveChargeExploitation` | `POST /saveChargeExploitation` | ⚠️ Vérifier payload |
| `POST /saveTresorerie` | `POST /saveTresorerieActifCirculant` | ⚠️ Endpoint différent ? |
| `POST /saveCreanceClient` | `POST /saveCreanceClient` | ⚠️ Vérifier payload |
| `POST /saveStock` | `POST /saveStock` | ⚠️ Vérifier payload |
| `POST /saveDette` | `POST /saveHistoriqueDette` | ⚠️ Endpoint différent ? |
| `POST /saveProfilFamilial` | `POST /saveCommentaire` | ⚠️ Endpoint différent ? |
| `POST /saveMenageRevenuFamille` | `POST /saveMenageRevenuFamille` | ✅ OK |
| `POST /saveActifGarantie` | `POST /saveActifGarantie` | ⚠️ Vérifier payload |
| `POST /saveCrCaution` | `POST /saveCrCaution` | ✅ OK |
| `POST /saveAswot` | `POST /saveAswot` | ✅ OK |
| `POST /saveProposition` | `POST /saveProposition` | ⚠️ Payload incomplet |
| `POST /saveCrdObservation` | `POST /saveCrdObservation` | ✅ OK |
| `POST /saveDocAnnexe` | `POST /saveDocAnnexe` | ✅ OK |

### Endpoints legacy ABSENTS du new

| Endpoint legacy | Usage | Priorité |
|---|---|---|
| `POST /saveProfilEntrepreneur` | Profil entrepreneur (parcours pro, niveau éducation) | 🔴 Haute |
| `POST /saveAvanceFournisseur` | Avances fournisseurs | 🔴 Haute |
| `POST /saveDetteFournisseur` | Dettes fournisseurs (séparées des dettes entreprise) | 🔴 Haute |
| `POST /saveTresorerieFamille` | Trésorerie famille | 🔴 Haute |
| `POST /saveChargeFamilial` | Charges familiales (CRUD dynamique) | 🔴 Haute |
| `POST /saveImprevuChargeExploitation` | Imprévus charges exploitation | 🟡 Moyenne |
| `POST /saveImprevuChargeFamilial` | Imprévus charges familiales | 🟡 Moyenne |
| `POST /saveMargeCommerciale` | Marges commerciales et stock | 🔴 Haute |
| `PUT /modifMargeCommerciale/{id}` | Modification marge commerciale | 🔴 Haute |
| `DELETE /deleteMargeCommerciale/{id}` | Suppression marge commerciale | 🔴 Haute |
| `POST /saveActifCirculantStock` | Actifs circulants stocks (garanties) | 🟡 Moyenne |
| `POST /saveImageGarantie` | Images par garantie | 🔴 Haute |
| `POST /saveDocGarantie` | Documents par garantie | 🔴 Haute |
| `POST /delete_image_garantie` | Suppression image garantie | 🔴 Haute |
| `POST /delete_doc_garantie` | Suppression document garantie | 🔴 Haute |
| `GET /listeTypeCharge` | Types de charges (API vs constantes) | 🟡 Moyenne |
| `POST /savePreEvaluationACJCE` | Pré-évaluation ACJ/CE (mode édition) | 🟡 Moyenne |
| `POST /calculFraisDossier` | Calcul frais dossier (proposition CA) | 🟡 Moyenne |
| `POST /saveCrDecision` | Proposition Chef d'Agence | 🟡 Moyenne |
| `PUT /remettreDossierDansCircuit` | Remise dossier dans circuit (Admin, statut 21) | 🟡 Moyenne |
| `GET /listeSuperviseurPME` | Liste superviseurs PME | 🟡 Moyenne |
| `POST /recuperationSignataire/{code}` | Récupération signataire depuis PERFECT | 🟢 Basse |

---

## 15. Interfaces / Modèles de données

### Champs manquants dans les interfaces existantes

| Interface | Champs manquants | Source legacy |
|---|---|---|
| `AchatMensuel` | `article`, `fournisseur`, `frequence`, `quantite` | `achatMensuelForm` |
| `ChargeExploitation` | `activite`, `charge` (id type charge), `commentaire`, `imprevu` | `chargeExploitationForm` |
| `CreanceClient` | `activite`, `objet`, `duree`, `solde`, `recouvrMax`, `montArecevoir` | `creanceClientForm` |
| `StockItem` | `stock` (id), `activite` | `stockForm` |
| `MembreMenage` | `membreFamille` (type), `nombre`, `justifs` | `compositionFamilleForm` |
| `ActifGarantie` | `idCaution`, `user`, `entreprise`, `miniComm`, `societeCr`, `nouvelleAcquisition` | Formulaires véhicule/immobilisation |

### Interfaces complètement absentes

| Interface | Champs | Source legacy |
|---|---|---|
| `AvanceFournisseur` | `id`, `activite`, `objet`, `montant`, `dateVersAvc`, `dateRecepMarch`, `resteApay` | `avanceFournisseurForm` |
| `DetteFournisseurCredit` | `id`, `activite`, `objet`, `montant`, `datePaie`, `dateRecepMarch`, `solde` | `detteFournisseurForm` |
| `TresorerieFamille` | `id`, `libelle`, `montant`, `typeCompte`, `type`, `provenance` | `tresorerieFamilleForm` |
| `ChargeFamille` | `id`, `typeCharge`, `chargeMens`, `montant`, `commentaire` | `chargeFamilialeForm` |
| `MargeCommercialeStock` | `id`, `article`, `quantite`, `prixVente`, `prixAchat`, `sousTotal` | `margeCommercialeEtStockForm` |
| `ProfilEntrepreneur` | `parcoursPro`, `niveauEducation` | `profilEntrepreneurForm` |

---

## RÉSUMÉ DES PRIORITÉS

### 🔴 Priorité Haute (bloquant pour la parité fonctionnelle)

1. ✅ ~~**Marges commerciales et stock**~~ — FAIT (§3.4)
2. ✅ ~~**Avances fournisseurs**~~ — DÉJÀ FAIT (§5.3)
3. ✅ ~~**Dettes fournisseurs séparées**~~ — DÉJÀ FAIT (§5.5)
4. ✅ ~~**Trésorerie famille**~~ — FAIT (§6.5)
5. ✅ ~~**Charges familiales dynamiques**~~ — FAIT (§6.3)
6. ✅ ~~**Profil entrepreneur**~~ — FAIT (§2.6)
7. ✅ ~~**Images/documents par garantie**~~ — FAIT (§7.8)
8. ✅ ~~**Champs formulaires incomplets**~~ — FAIT (§4.1, §5.2, §5.4, §7.5-7.6)
9. ✅ ~~**Propriétaire garantie (D/C)**~~ — FAIT (§7.7)
10. ✅ ~~**Véhicule nouvelle acquisition**~~ — FAIT (§7.4)

### 🟡 Priorité Moyenne (fonctionnalités secondaires)

11. ✅ ~~Imprévus charges exploitation/familiales~~ — FAIT (§4.5, §6.4)
12. Proposition Chef d'Agence avec calcul frais (§10.1-10.2)
13. Pré-évaluation ACJ/CE mode édition (§2.7)
14. Profils manquants dans le bandeau (§1.2)
15. Statut 21 — Remise dans circuit (§1.3)
16. ✅ ~~Types charges depuis API~~ — FAIT (§4.4)
17. Vérification géolocalisation avant résumé (§11.2)
18. ✅ ~~Proposition AR champs complets~~ — FAIT (§10.3)

### 🟢 Priorité Basse (améliorations)

19. Édition inline marge pondérée / valeur-date derniers achats (§3.1-3.3)
20. Récupération signataire PERFECT (§2.5)
21. Interval 30s actualisation (§13.1)
22. Vérification agence Abidjan (§13.4)
23. Niveau activité badge (§3.6)
