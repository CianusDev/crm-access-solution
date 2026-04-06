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
| 2.6 | **Profil Entrepreneur** | Legacy : `profilEntrepreneurForm` avec `parcoursPro`, `niveauEducation` → `POST /saveProfilEntrepreneur` | **Complètement absent** de la nouvelle version. Ajouter un sous-composant |
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
| 3.4 | **Marges commerciales et stock** | Legacy : CRUD complet `margeCommercialeEtStockForm` avec `article`, `quantite`, `prixVente`, `prixAchat` → `POST /saveMargeCommerciale` et `PUT /modifMargeCommerciale/{id}` et `DELETE /deleteMargeCommerciale/{id}` | **Complètement absent**. Ajouter un sous-composant pour les marges commerciales |
| 3.5 | **Endpoint activité — champs manquants** | Legacy envoie aussi `margePondere`, `valDernierAchat`, `dateDernierAchat` dans `POST /saveActiviteDmde` | Vérifier que le form activité envoie ces champs |
| 3.6 | **Niveau activité** | Legacy : `niveauActivite` (1 = principale, 2 = secondaire) affiché avec badge | Afficher le badge niveau activité dans la liste |

---

## 4. Onglet Achats & Charges

### ✅ Ce qui est implémenté
- CRUD achats mensuels (activite, mois, montant, statut)
- CRUD charges exploitation (typeCharge, libelle, montant, statut)
- CRUD stocks (description, quantite, prix, assurStock, garantie)
- Totaux calculés

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| 4.1 | **Achats mensuels — champs manquants** | Legacy envoie : `refDemande`, `activite`, `article`, `fournisseur`, `frequence`, `quantite`, `achatsMensuels` (montant) | Le form new n'a que `activite`, `mois`, `montant`, `statut`. **Ajouter** : `article`, `fournisseur`, `frequence`, `quantite` |
| 4.2 | **Achats mensuels — endpoint** | Legacy : `POST /saveAchatMensuel` | New utilise le même. **OK** mais vérifier le payload |
| 4.3 | **Charges exploitation — champs manquants** | Legacy envoie : `refDemande`, `activite`, `charge` (id du type charge depuis API), `montant`, `commentaire`, `chargeExploitation` (id pour modif) | Le form new a `typeCharge`, `libelle`, `montant`, `statut`. **Incohérence** : legacy utilise un `charge` (id) récupéré via `GET /listeTypeCharge` (endpoint `recuperationTypeCharge`). Le new utilise des valeurs statiques |
| 4.4 | **Types de charges — récupération API** | Legacy : `typeChargeDataSource.recuperationTypeCharge()` → `GET /listeTypeCharge` retourne `crTypeCharges[]` | Le new utilise des constantes statiques `TYPES_CHARGE`. **Remplacer** par un appel API ou vérifier que les valeurs correspondent |
| 4.5 | **Imprévus charges exploitation** | Legacy : `enregistrementModifImprevuChargeExploitation()` → `POST /saveImprevuChargeExploitation` avec `activite` et `imprevu` (pourcentage 10/20/30%) | **Complètement absent**. Ajouter la gestion des imprévus par activité |
| 4.6 | **Stocks — endpoint** | Legacy : `POST /saveStock` avec `refDemande`, `stock` (id), `activite`, `article`, `quantite`, `montanTotal` | Vérifier que le payload correspond |
| 4.7 | **Lien activité manquant** | Legacy : chaque achat/charge/stock est lié à une `activite` (id). Le new semble avoir le lien pour achats mais pas pour charges | Vérifier et ajouter le champ `activite` dans le form charges |

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
| 5.2 | **Créances clients — champs manquants** | Legacy envoie : `refDemande`, `activite`, `objet`, `duree`, `solde`, `montant`, `recouvrMax` (pourcentage), `montArecevoir`, `creanceClient` (id) | Le new n'a que `libelle`, `montant`, `echeance`. **Ajouter** : `activite`, `objet`→`libelle`, `duree`, `solde`, `recouvrMax`, `montArecevoir` |
| 5.3 | **Avances fournisseurs** | Legacy : CRUD complet `avanceFournisseurForm` avec `activite`, `objet`, `montant`, `dateVersAvc`, `dateRecepMarch`, `resteApay` → `POST /saveAvanceFournisseur` | **Complètement absent** du new. Ajouter un sous-composant |
| 5.4 | **Historique des dettes (dettes entreprise)** | Legacy : `historiquesDettesForm` avec `activite`, `preteur`, `montantEmprun`, `dateDebut`, `finEcheance`, `restantDu`, `typeObjDette` → `POST /saveHistoriqueDette` | Le new a un CRUD dettes simplifié (`libelle`, `montant`, `echeance`). **Ajouter les champs manquants** |
| 5.5 | **Dettes fournisseurs (séparées des dettes entreprise)** | Legacy : `detteFournisseurForm` avec `activite`, `objet`, `montant`, `datePaie`, `dateRecepMarch`, `solde` → `POST /saveDetteFournisseur` | Le new mélange dettes entreprise et dettes fournisseurs. **Séparer** en deux sous-sections |
| 5.6 | **Lien activité** | Legacy : chaque créance/avance/stock/dette est liée à une `activite` | Ajouter le select activité dans chaque formulaire |

---

## 6. Onglet Profil Familial

### ✅ Ce qui est implémenté
- Profil familial (situation matrimoniale, épouses, enfants, instruction, régime)
- Charges familiales (loyer, scolarité, santé, autres)
- CRUD membres ménage (nom, relation, age, activite, revenu)

### ❌ Manquant / À corriger

| # | Problème | Legacy | Action requise |
|---|----------|--------|----------------|
| 6.1 | **Commentaire profil familial** | Legacy : `profilFamilialCommentaireForm` avec `commentaire` → `POST /saveCommentaireProfilFamilial` | **Absent**. Ajouter un champ commentaire |
| 6.2 | **Composition ménage — champs manquants** | Legacy envoie : `refDemande`, `membreFamille` (nom du type : Demandeur, Conjoint, Enfants, Parents, Famille, Domestiques, Autres), `nombre`, `age`, `activite`, `revenus`, `justifs` | Le new a `nom`, `relation`, `age`, `activite`, `revenu`. **Manque** : `nombre`, `justifs`, et le `membreFamille` devrait être un select avec les 7 options legacy |
| 6.3 | **Charges familiales — structure legacy** | Legacy : `chargeFamilialeForm` avec `typeCharge` (Domicile/Transport/Personnel/Familiale/Autres), `chargeMens` (sous-charge), `montant` → `POST /saveChargeFamilial` | Le new a des champs fixes (loyer, scolarité, santé, autres). **Incohérence majeure** : le legacy a un CRUD dynamique avec types/sous-types, le new a des champs statiques |
| 6.4 | **Imprévus charges familiales** | Legacy : `enregistrementModifImprevuChargeFamiliale()` → `POST /saveImprevuChargeFamilial` avec pourcentage (10-30%) | **Absent**. Ajouter |
| 6.5 | **Trésorerie famille** | Legacy : `tresorerieFamilleForm` avec `libelle`, `montant`, `typeCompte`, `type`, `provenance` → `POST /saveTresorerieFamille` | **Complètement absent**. Ajouter un sous-composant |
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
| 7.3 | **DAT — champs manquants** | Legacy : `depotATermeForm` avec `valeurEstime`, `dureeDat`, `dateEffetDat`, `dateEcheanceDat`, `numeroPerfectDat`, `garantie` | Vérifier que le form new a tous ces champs |
| 7.4 | **Véhicule — formulaire double** | Legacy : deux formulaires séparés `vehiculeForm` (existant) et `vehiculeNouvelleAcquisitionForm` (nouvelle acquisition) avec des champs obligatoires différents | Le new a un seul formulaire. **Ajouter** la distinction `nouvelleAcquisition` (0/1) avec validation conditionnelle |
| 7.5 | **Véhicule — champs manquants** | Legacy envoie : `societeCr`, `societe`, `couleur`, `evaluation`, `immatriculation`, `garantie`, `typeVehicule`, `proprietaire`, `marque`, `typeProPerso`, `dateMiseEnCirculation`, `miniComm`, `vehiculeVu`, `valeurEstime`, `valeurAchat`, `nbrePlace`, `typeTechnique`, `typeCommercial`, `nouvelleAcquisition`, `idCaution`, `user` | Vérifier que le form new a **tous** ces champs |
| 7.6 | **Immobilisation — champs manquants** | Legacy envoie : `typePropriete`, `proprietaire`, `adressDescr`, `dateAcquisition`, `valeurEstime`, `garantie`, `superficie`, `titreFoncier`, `lot`, `ilot`, `justifs`, `idCaution`, `quantite` | Vérifier exhaustivité |
| 7.7 | **Propriétaire : D (Demandeur) ou C (Caution)** | Legacy : le champ `proprietaire` peut être 'D' ou un id de caution. Le champ `idCaution` lie la garantie à une caution | Ajouter le select propriétaire (Demandeur / liste des cautions) |
| ~~7.8~~ | ~~**Images et documents par garantie**~~ | ~~Legacy : chaque garantie a des images (`POST /saveImageGarantie`) et documents (`POST /saveDocGarantie`) avec libellés obligatoires~~ | ✅ **FAIT** — Upload images/docs par actif, lightbox, suppression |
| 7.9 | **Actifs circulants stocks (garanties)** | Legacy : `actifCirculantStocksForm` avec `description`, `quantite`, `prix`, `assurStock`, `garantie`, `cout` → `POST /saveActifCirculantStock` | Vérifier si c'est le même que le stock dans Achats ou un composant séparé |
| 7.10 | **Vérification documents obligatoires par type garantie** | Legacy : `verificationDocumentEtImageACTIFSGARANTIES()` vérifie les docs obligatoires pour immobilisations, véhicules, matériels pro, biens mobiliers | **Absent**. Implémenter cette vérification |
| 7.11 | **Totaux garanties fixes vs proposées** | Legacy : calcule `totauxGarantiesFixes` et `totauxGarantiesProposees` séparément (garantie=1 vs total) | Vérifier que le new fait cette distinction |

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
| 8.1 | **Photo profil caution** | Legacy : `modificationPhotoProfilCaution()` → `POST /updateProfilImgCaution` avec FormData (`refDemande`, `crCaution`, `photoProfil`) | Vérifier que le new gère l'upload de photo profil séparément des images |
| 8.2 | **Champ `lieuNaissance`** | Legacy : champ obligatoire dans le formulaire caution | Vérifier présence dans le form new |
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
| 10.3 | **Proposition AR — champs manquants** | Legacy envoie beaucoup plus : `montantPropose`, `fraisDossier`, `montantActeNotarie`, `montantEmprunte`, `duree`, `mensualite`, `dateEcheanceSouhaite`, `periodeGrace`, `hypotheque`, `nbreMoisGrace`, `argumentaire`, `motivation`, `tauxCouverture`, `acteNotarie`, `assurMultiRisk`, `deposit`, `authGage`, `commissionDeboursement`, `assurDecesInvalidite` | Le new n'a que `montantPropose`, `duree`, `mensualite`, `motivation`, `commentaire`. **Ajouter** tous les champs manquants |

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

1. **Marges commerciales et stock** — CRUD complet absent (§3.4)
2. **Avances fournisseurs** — CRUD complet absent (§5.3)
3. **Dettes fournisseurs séparées** — Mélangées avec dettes entreprise (§5.5)
4. **Trésorerie famille** — Absent (§6.5)
5. **Charges familiales dynamiques** — Structure incompatible (§6.3)
6. **Profil entrepreneur** — Absent (§2.6)
7. **Images/documents par garantie** — Absent (§7.8)
8. **Champs formulaires incomplets** — Achats (§4.1), Créances (§5.2), Dettes (§5.4), Garanties (§7.5-7.6)
9. **Propriétaire garantie (D/C)** — Lien caution absent (§7.7)
10. **Véhicule nouvelle acquisition** — Distinction absente (§7.4)

### 🟡 Priorité Moyenne (fonctionnalités secondaires)

11. Imprévus charges exploitation/familiales (§4.5, §6.4)
12. Proposition Chef d'Agence avec calcul frais (§10.1-10.2)
13. Pré-évaluation ACJ/CE mode édition (§2.7)
14. Profils manquants dans le bandeau (§1.2)
15. Statut 21 — Remise dans circuit (§1.3)
16. Types charges depuis API (§4.4)
17. Vérification géolocalisation avant résumé (§11.2)
18. Proposition AR champs complets (§10.3)

### 🟢 Priorité Basse (améliorations)

19. Édition inline marge pondérée / valeur-date derniers achats (§3.1-3.3)
20. Récupération signataire PERFECT (§2.5)
21. Interval 30s actualisation (§13.1)
22. Vérification agence Abidjan (§13.4)
23. Niveau activité badge (§3.6)
