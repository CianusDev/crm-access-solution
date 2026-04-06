# Résumé — `analyse-financiere-credit` (Legacy Angular 14)

## Vue d'ensemble

Composant **monolithique central** du module crédit dans l'app legacy.  
- **TS** : ~5 737 lignes  
- **HTML** : ~10 431 lignes  
- **SCSS** : ~160 lignes  

Il gère la totalité de la fiche d'analyse financière d'une demande de crédit : affichage, édition, workflow d'envoi, documents, garanties, cautions, Google Maps, etc.

---

## Composant TypeScript

### Décorateur & Metadata

```ts
@Component({
  selector: 'app-analyse-financiere-credit',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'todo-application' }
})
export class AnalyseFinanciereCreditComponent implements OnInit
```

### Dépendances injectées (~35 services)

| Catégorie | Services |
|---|---|
| **Crédit** | `DemandeCreditService`, `ActiviteCreditService`, `VenteJournaliereService`, `VenteMensuelleService`, `MargeCommercialeStockService`, `AchatMensuelService`, `TypeCreditService`, `TypeChargeService`, `TresorerieActifCirculantService`, `CreanceClientService`, `AvanceFournisseurService`, `StockService`, `HistoriqueDetteService`, `DetteFournisseurService`, `ProfilFamilialService`, `CompositionMenageFamilleService`, `ChargeFamilleService`, `TresorerieFamilleService`, `ActifGarantieService`, `SignataireCreditService`, `DocumentAnnexeService`, `EnvoiDossierCreditService`, `FactureCreditService`, `MagasinCreditService`, `AnalyseSWOTService`, `DecisionComiteEtPreComiteService`, `ProfilEntrepriseEntrepreneurService` |
| **Commun** | `ClientService`, `PaysCommuneService`, `UtilisateurService`, `CryptoService` |
| **UI** | `NgbModal`, `MessageService` (PrimeNG), `ConfirmationService` (PrimeNG), `PrimeNGConfig`, `CoreSidebarService`, `TranslateService` |
| **Angular** | `FormBuilder`, `ActivatedRoute`, `Router`, `HttpClient` |

### Formulaires réactifs (~25 FormGroup)

| Formulaire | Rôle |
|---|---|
| `personnePhysiqueClientForm` | Infos client personne physique |
| `personneMoraleClientForm` | Infos client personne morale (entreprise) |
| `signataireForm` | Infos signataire |
| `demandeCreditForm` | Demande de crédit |
| `checkInfoObigatoireClientEtSignataireForm` | Validation champs obligatoires avant envoi |
| `profilEntrepreneurForm` | Profil entrepreneur |
| `activiteForm` | Activité du client |
| `margeCommercialeEtStockForm` | Marge commerciale et stock |
| `venteMensuelleForm` | Ventes mensuelles |
| `venteJournaliereForm` | Ventes journalières |
| `achatMensuelForm` | Achats mensuels |
| `chargeExploitationForm` | Charges d'exploitation |
| `tresorerieActifCirculantForm` | Trésorerie actif circulant |
| `creanceClientForm` | Créances clients |
| `avanceFournisseurForm` | Avances fournisseurs |
| `stockForm` | Stocks |
| `historiquesDettesForm` | Historique des dettes |
| `detteFournisseurForm` | Dettes fournisseurs |
| `profilFamilialCommentaireForm` | Commentaire profil familial |
| `compositionFamilleForm` | Composition ménage / revenus famille |
| `chargeFamilialeForm` | Charges familiales |
| `tresorerieFamilleForm` | Trésorerie famille |
| `immobilisationGarantieForm` | Garantie immobilisation |
| `depositForm` | Garantie deposit |
| `depotATermeForm` | Garantie DAT |
| `materielProfessionnelForm` | Garantie matériel professionnel |
| `vehiculeForm` | Garantie véhicule existant |
| `vehiculeNouvelleAcquisitionForm` | Garantie véhicule nouvelle acquisition |
| `actifCirculantStocksForm` | Actifs circulants stocks |
| `cautionSolidaireForm` | Caution solidaire |
| `ajoutFichierGarantieEtCautionForm` | Upload fichier garantie/caution |
| `ajoutFichierAnnexeForm` | Upload document annexe |
| `verifiePassWordForm` | Vérification mot de passe pour actions sensibles |
| `preEvaluationACJForm` | Pré-évaluation ACJ |
| `preEvaluationCEForm` | Pré-évaluation Chef d'Équipe |
| `propositionChefAgenceForm` | Proposition Chef d'Agence |
| `calculFraisDossierForm` | Calcul frais de dossier |
| `vehiculeDmdeCreditAutoForm` | Véhicule demandé (crédit auto) |
| `bonCommandeForm` | Bon de commande |
| `factureForm` | Facture |
| `infoMagasinForm` | Infos magasin |
| `envoieDossierCreditForm` | Envoi dossier crédit |

### `ngOnInit()` — Initialisation

1. Configure le breadcrumb (Accueil → Dossiers en attentes → Analyse financière)
2. Décrypte les query params (`reference`, `status` PP/PM) via `CryptoService`
3. Récupère l'utilisateur connecté depuis `localStorage`
4. Lance 4 appels API parallèles :
   - `recuperationListSecteurActivite()`
   - `recuperationListPaysEtCommune()`
   - `recuperationDemandeCreditByReference()`
   - `recuperationDataAnalyseFinByReference(true)`
   - `recuperationDataGarantiesByReference(true)`
5. Met en place un `interval(30000)` pour actualiser le temps passé sur le dossier

### Méthodes principales (~100+ méthodes)

#### Récupération de données

| Méthode | Rôle |
|---|---|
| `recuperationDemandeCreditByReference()` | Charge la demande de crédit complète |
| `actualisationDemandeCreditByReference()` | Rafraîchit sans loader |
| `refreshDemandeCreditByReference()` | Rafraîchit avec recalcul garanties |
| `recuperationDataAnalyseFinByReference()` | Charge les activités (analyse financière) |
| `recuperationDataGarantiesByReference()` | Charge les garanties (immobilisations, véhicules, etc.) |
| `recuperationHistoriqueObservation()` | Charge l'historique des observations |
| `recuperationListDocumentAnnexe()` | Charge les documents annexes |
| `recuperationDesCalculsByReference()` | Charge les calculs (ventes, marges, achats) |
| `recuperationListeTypeCredit()` | Charge les types de crédit |
| `recuperationListSecteurActivite()` | Charge les secteurs d'activité |
| `recuperationListPaysEtCommune()` | Charge pays, villes, communes |

#### Workflow d'envoi du dossier

| Méthode | Rôle |
|---|---|
| `checkInfoObigatoireClientEtSignataire()` | Vérifie les champs obligatoires avant envoi |
| `verificationMDPasse()` | Vérifie le mot de passe utilisateur |
| `envoyerDossierAuNplus1()` | Envoie le dossier au niveau supérieur |
| `envoieDossierChefAgence()` | Envoie au chef d'agence |
| `recuperationListZone()` | Récupère les zones pour affectation AR |
| `recuperationListAnalysteRisque()` | Récupère les AR par zone |
| `recuperationListeSuperviseurPME()` | Récupère les superviseurs PME |
| `remettreDossierDansCircuit()` | Remet un dossier ajourné dans le circuit |
| `rejetDuDossier()` | Rejette le dossier |

#### CRUD par domaine

Chaque domaine suit le pattern : `openModal*()` → `enregistrement*()` → `closeModal*()` + `openModifModal*()` + `suppression*()`

- **Activités** : ajout, modification, suppression, marge pondérée, valeur/date derniers achats
- **Ventes mensuelles** : CRUD complet
- **Ventes journalières** : CRUD complet
- **Marges commerciales et stock** : CRUD complet
- **Achats mensuels** : CRUD complet
- **Charges d'exploitation** : CRUD + imprévus
- **Trésorerie actif circulant** : CRUD complet
- **Créances clients** : CRUD complet
- **Avances fournisseurs** : CRUD complet
- **Stocks** : CRUD complet
- **Historique des dettes** : CRUD complet
- **Dettes fournisseurs** : CRUD complet
- **Profil familial** : commentaire, composition ménage, charges familiales, trésorerie famille
- **Garanties** : immobilisations, DAT, deposit, matériels pro, biens mobiliers famille, véhicules (existants + nouvelles acquisitions), actifs circulants stocks
- **Cautions solidaires** : CRUD + photo profil
- **Documents annexes** : upload, suppression, vérification docs obligatoires
- **Fichiers garanties/cautions** : images + documents PDF
- **Véhicule demandé (crédit auto)** : CRUD
- **Bon de commande** : CRUD
- **Facture** : CRUD
- **Magasin** : CRUD
- **Pré-évaluation ACJ/CE** : enregistrement, modification
- **Proposition Chef d'Agence** : calcul frais dossier, taux couverture, enregistrement

#### Google Maps

| Méthode | Rôle |
|---|---|
| `contitutionDeLaMapData()` | Construit les markers (client, activités, cautions) |
| `openGoogleMapsPourSuivreItineraire()` | Ouvre Google Maps externe |
| `openInfo()` | Affiche l'info window d'un marker |

#### Vérifications métier

| Méthode | Rôle |
|---|---|
| `verificationDocACharger()` | Vérifie que tous les docs obligatoires sont chargés |
| `verificationLibelleDocCharger()` | Vérifie si un doc spécifique est chargé |
| `verificationGeolocalisation()` | Vérifie que client + activités sont géolocalisés |
| `verificationDocumentEtImageACTIFSGARANTIES()` | Vérifie docs/images obligatoires des garanties |
| `verificationAgenceUser()` | Vérifie si l'agence est à Abidjan (codes C01-C07, C14-C17) |

#### Navigation

| Méthode | Rôle |
|---|---|
| `goResumeDemande()` | Navigue vers le résumé (avec vérifications préalables au statut 5) |
| `goDemandeEnAttente()` / `goDossiersEnAttentes()` | Retour à la liste des demandes |

#### Affichage conditionnel (sous-onglets)

| Variable | Valeurs | Sections |
|---|---|---|
| `affichageDemandeCredit` | 1-12 | Demande, PM, Signataire, PP, Avis ACJ, Avis CE, Véhicules, Bon commande, Facture, Magasin, Employeur, Décision finale |
| `affichageAnalyseFinanciere` | 1-6 | Activités, Résultat entreprise, Actif circulant, Dette entreprise, Profil familial, PDF analyse financière |
| `affichageActifGarantie` | 1-9 | Totaux, Caution solidaire, Immobilisation, Deposit, Matériel pro, Bien mobilier famille, Véhicule, Stocks, Document |

---

## Template HTML — Structure

### Barre d'actions (haut de page)

Boutons conditionnels selon la combinaison `typeCredit.code` × `statut` × `profil utilisateur` :

#### Types de crédit gérés

| Code | Type |
|---|---|
| `002` | Relais (personne physique) |
| `036` | Autre personne physique |
| `004` | Prêt One Shot |
| `008` | Prêt OUF |
| `001` | Avance sur salaire |
| `014` | Scolaire |
| `011` | Relais Business |
| `015` | Découvert |
| `016` | Avance sur traite |
| `019` | Crédit Auto |
| `021` | Crédit de campagne |
| `032` | Avance sur bon de commande |
| `033` | Avance sur facture |
| `035` | Relais Business Magasin |

#### Statuts du workflow

| Statut | Libellé |
|---|---|
| 1 | Enregistrement de la demande |
| 2 | Pré-évaluation |
| 3 | En attente de création du dossier dans PERFECT |
| 4 | En attente d'affectation de la demande |
| 5 | En attente de l'analyse financière |
| 19 | Visite commanditaire |
| 21 | Dossier ajourné (remise dans le circuit par Admin) |
| 24 | Avis défavorable |
| 25 | Rejeté |
| 30 | Autre statut |

#### Profils utilisateurs impliqués

- Agent Commercial Junior (ACJ)
- Chef d'Équipe (CE)
- Gestionnaire Portefeuilles (GP)
- Conseiller Clientèle (CC)
- Responsable Client (RC)
- Chef Agence (CA)
- Chef Agence Adjoint (CAA)
- Analyste Risque (AR)
- Superviseur PME
- Superviseur Risque Zone
- Responsable Clientèle PME
- Assistante Clientèle PME
- Directrice Exploitation
- Admin

#### Actions disponibles

- **Charger les documents** (dropdown avec liste dynamique selon type crédit + statut)
- **Envoyer le dossier** (avec vérification MDP)
- **Ajourner** (avec observation)
- **Avis défavorable** (avec vérification MDP)
- **Confirmation du rejet** (Superviseur Risque)
- **Affecter le dossier à un AR** (Chef Agence)
- **Affecter le dossier (Sup OP / CAA)** (Responsable Clientèle PME)
- **Faire le résumé** (Analyste Risque)
- **Voir le résumé** (tous, après statut 5)
- **Avis de l'ACJ** / **Avis du Chef d'Équipe** / **Pré-évaluation**
- **Valider le dossier** (Chef Agence pour prêts OUF/scolaire/avance salaire)
- **Remettre le dossier dans le circuit** (Admin, statut 21)

### Corps de la page

- Infos demande : référence, statut (badge coloré), date, type crédit
- Sidebar : historique des observations/actions
- 3 onglets principaux avec sous-onglets (voir section "Affichage conditionnel")
- ~20+ modals NgBootstrap pour les CRUD
- Google Maps avec markers

---

## Données statiques embarquées

- `listeBanquesEtMicroFinance` : 29 banques/microfinances ivoiriennes
- `selectJourDeLaSemaine` : Lundi → Dimanche
- `selectPourcentageImprevuChargesExploitation` : 10%, 20%, 30%
- `selectPourcentageImprevuChargesFamiliales` : 10% → 30% (par 5%)
- `selectCreanceClientRecouvrementPourcentage` : 10% → 80% (par 5%)
- `selectMembreFamille` : Demandeur, Conjoint(e), Enfants, Parents, Famille, Domestiques, Autres
- `listeTypeCharge` : Domicile, Transport, Personnel, Familiale, Autres (avec sous-charges)

---

## Points notables

- **Typo persistante** : `laoder` au lieu de `loader` dans toutes les variables
- **Deux patterns de rafraîchissement** : `refreshDemandeCreditByReference()` (recalcul complet) vs `actualisationDemandeCreditByReference()` (léger)
- **Vérifications métier complexes** avant envoi : docs obligatoires, géolocalisation, infos véhicule/facture/bon commande
- **Logique spécifique Abidjan** : `verificationAgenceUser()` avec codes agences C01-C07, C14-C17
- **Documents obligatoires dynamiques** : la liste change selon `typeCredit.code` × `statut` × `profil`
- **Interval 30s** : actualisation automatique du temps passé sur le dossier
- **Pas de lazy loading interne** : tout est chargé d'un coup
- **Pas de `OnPush`** : utilise `ViewEncapsulation.None`
