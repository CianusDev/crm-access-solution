## 📋 Vue d'ensemble

### Description générale

**Access Solution CRM** est une application frontend de gestion de relation client (CRM) développée pour **Credit Access**, une institution financière basée en Côte d'Ivoire. L'application est construite sur le template commercial **Vuexy Angular Admin** (version 8.2.1).

### Stack technologique

| Technologie | Version | Description |
| --- | --- | --- |
| Angular | 14.1.0 | Framework frontend principal |
| TypeScript | 4.7.4 | Langage de programmation |
| Bootstrap | 4.6.1 | Framework CSS |
| PrimeNG | 14.0.0 | Bibliothèque de composants UI |
| NgBootstrap | 11.0.0 | Composants Bootstrap pour Angular |
| RxJS | 6.6.0 | Programmation réactive |
| ngx-toastr | 14.0.0 | Notifications toast |
| SweetAlert2 | 9.17.2 | Modales d'alerte |

---

## 🏗️ Architecture du projet

### Structure des dossiers principaux

```
frontEnd/
├── src/
│   ├── @core/                    # Module core (template Vuexy)
│   │   ├── animations/           # Animations Angular
│   │   ├── components/           # Composants réutilisables (menu, sidebar, etc.)
│   │   ├── directives/           # Directives personnalisées
│   │   ├── pipes/                # Pipes Angular
│   │   ├── scss/                 # Styles SCSS globaux
│   │   ├── services/             # Services du core
│   │   └── types/                # Types TypeScript
│   │
│   ├── app/
│   │   ├── auth/                 # Module d'authentification
│   │   │   ├── helpers/          # Guards, Interceptors
│   │   │   ├── models/           # Modèles d'authentification
│   │   │   └── service/          # Services d'authentification
│   │   │
│   │   ├── connexion/            # Pages de connexion
│   │   ├── enumeration/          # Enums et constantes
│   │   ├── layout/               # Layout de l'application
│   │   ├── menu/                 # Configuration du menu
│   │   ├── models/               # Modèles de données
│   │   │   ├── asc-models/       # Modèles Avance sur Chèque
│   │   │   ├── cora-models/      # Modèles réseau CORA
│   │   │   └── credit-models/    # Modèles gestion crédit
│   │   │
│   │   ├── modules/              # Modules fonctionnels principaux
│   │   │   ├── accueil/          # Page d'accueil
│   │   │   ├── avance_cheque/    # Module Avance sur Chèque (ASC)
│   │   │   ├── cora/             # Module réseau CORA
│   │   │   ├── credit/           # Module gestion de crédit
│   │   │   ├── parametrage/      # Module paramétrage
│   │   │   └── Power_Bi/         # Module Power BI
│   │   │
│   │   ├── pdf/                  # Services de génération PDF
│   │   ├── pipes-perso/          # Pipes personnalisés
│   │   └── services/             # Services métier
│   │       ├── asc-services/     # Services Avance sur Chèque
│   │       ├── cora-services/    # Services CORA
│   │       └── credit-services/  # Services crédit (34 services!)
│   │
│   ├── assets/                   # Ressources statiques
│   └── environments/             # Configurations d'environnement
```

---

## 🎯 Modules fonctionnels

### 1. Module de Connexion (`/connexion`)

- **Page de connexion** : Authentification des utilisateurs
- **Page maintenance** : Affichage en cas de maintenance
- Gestion des sessions via JWT Token
- Stockage du token dans `localStorage`

### 2. Module Réseau CORA (`/modules/cora`)

Gestion des correspondants agréés (CORA) - agents partenaires de Credit Access.

| Fonctionnalité | Description |
| --- | --- |
| Tableau de bord | Statistiques du réseau CORA |
| CRUD CORA | Création/Modification d'agents CORA |
| Sous-agents | Gestion des sous-agents |
| Demandes en attente | Workflow de validation |
| Géolocalisation | Carte des agents CORA |

### 3. Module Avance sur Chèque (`/modules/avance_cheque`)

Gestion des avances accordées sur présentation de chèques.

| Fonctionnalité | Description |
| --- | --- |
| Tableau de bord Siège | Vue globale pour le siège |
| Tableau de bord Agence | Vue pour les agences |
| CRUD Avance | Création de demandes d'avance |
| Liste chèques | Gestion des chèques |
| Liste tireurs | Gestion des tireurs de chèques |
| Demandes en attente | Workflow de validation |

### 4. Module Gestion de Crédit (`/modules/credit`)

Module principal et le plus complexe - Gestion complète du cycle de vie des crédits.

| Sous-module | Description |
| --- | --- |
| **Tableau de bord** | KPIs et statistiques crédit (siège/agence) |
| **CRUD Demande** | Création de demandes de crédit |
| **Analyse financière** | Analyse complète du dossier client |
| **Fiche crédit** | Visualisation détaillée d'un dossier |
| **Résumé demande** | Synthèse pour décision |
| **Liste crédits** | Liste des dossiers validés |
| **Employeur** | Gestion des employeurs éligibles |
| **Tirage** | Gestion des tirages sur découvert |
| **Organigramme** | Visualisation de l'organisation |

### 5. Module Paramétrage (`/modules/parametrage`)

Administration et configuration du système.

| Fonctionnalité | Description |
| --- | --- |
| Utilisateurs | CRUD utilisateurs système |
| Configurations | Paramètres généraux |
| Zonification | Gestion des zones géographiques |
| Agences | Paramétrage des agences |

### 6. Module Power BI (`/modules/Power_Bi`)

Intégration de tableaux de bord Power BI pour le reporting.

---

## 👥 Gestion des rôles et permissions

### Profils utilisateurs (définis dans `profil.enum.ts`)

L'application gère **30+ profils différents** avec des permissions spécifiques :

| Catégorie | Profils |
| --- | --- |
| **Direction** | Admin, DG, DGA, DR (Directeur Régional) |
| **Exploitation** | D_EXPL, RESPO_EXPL, RESPO_FO |
| **Agence** | CA (Chef Agence), CAA, CC, RC (Responsable Client) |
| **Crédit** | GP (Gestionnaire Portefeuille), CE, ACJ, AR (Analyste Risque) |
| **CORA** | Gestion_Cora, Agent_BO, Charge_Cora |
| **Support** | SUP_PME, SUP_RISQ_ZONE, ADMIN_AUDIT |
| **Juridique/Assurance** | RESPO_JURIDIQUE, RESPO_ASSUR |

### Contrôle d'accès

- **AuthGuard** : Protection des routes
- **JwtInterceptor** : Injection automatique du token
- **ErrorInterceptor** : Gestion des erreurs 401/403
- Menu dynamique basé sur les rôles

---

## 🔌 Communication Backend

### Configuration API

```tsx
// environment.ts
apiUrl: '<https://backend-dev.creditaccess.ci>'  // Dev
apiUrl: '<https://backend2.creditaccess.ci>'     // Production
```

### Endpoints principaux

| Module | Endpoint base |
| --- | --- |
| Authentification | `/api/login` |
| Crédit | `/api/credit/*` |
| CORA | `/api/cora/*` |
| Utilisateurs | `/api/users/*` |
| Zones | `/api/zones` |

### Pattern de service

Tous les services suivent le même pattern :

```tsx
@Injectable()
export class NomService {
    private url = environment.apiUrl + '/api/endpoint';

    constructor(private http: HttpClient) {}

    recuperationData(): Observable<any> {
        return this.http.get(this.url + '/liste');
    }
}
```

---

## 📄 Modèles de données principaux

### Utilisateur (`utilisateur.ts`)

```tsx
class Utilisateur {
    id, nom, prenom, email, phone, matricule
    role, fonction, statut
    agence: Agence
    profil: Profil
    token: string
}
```

### Client Crédit (`client.ts`)

Représente un client demandeur de crédit avec :

- Informations personnelles (PP - Personne Physique)
- Informations entreprise (PM - Personne Morale)
- Code client Perfect (système bancaire)

### Demande de Crédit (`demande-credit.ts`)

Objet central du module crédit avec 50+ propriétés incluant :

- Informations de base (montant, durée, objet)
- Relations (client, type crédit, activités)
- Analyse financière (profil, garanties, trésorerie)
- Workflow (statut, décisions, propositions)

---

## 🔄 Workflow de crédit

```
1. CREATION (ACJ/GP/CC/RC)
       ↓
2. ENVOI AU CHEF AGENCE
       ↓
3. AFFECTATION → Analyste Risque
       ↓
4. ANALYSE FINANCIERE
       ↓
5. PROPOSITION AR
       ↓
6. COMITE/PRE-COMITE
       ↓
7. DECISION FINALE
       ↓
8. DECAISSEMENT
       ↓
9. CLOTURE
```

Chaque étape implique des validations, documents et acteurs spécifiques.

---

## 📊 Fonctionnalités transverses

### Génération PDF

- Contrats de prêt
- Fiches résumé
- Conventions de cautionnement
- Gages de véhicule

### Notifications

- Système de notifications en temps réel
- Badge de compteur sur le menu

### Géolocalisation

- Intégration Google Maps
- Localisation clients et cautions
- Visualisation des agences CORA

### Internationalisation

- Support français (fr-FR)
- Fichiers de traduction dans `/assets/i18n/`

---

## ⚙️ Scripts disponibles

```bash
npm start           # Démarrage en mode développement
npm run build       # Build de développement
npm run build:prod  # Build de production
npm run lint        # Analyse de code
npm run test        # Tests unitaires
```

---

## 📁 Fichiers de configuration importants

| Fichier | Description |
| --- | --- |
| `angular.json` | Configuration Angular CLI |
| `tsconfig.json` | Configuration TypeScript |
| `package.json` | Dépendances npm |
| `app-config.ts` | Configuration de l'application |
| `menu.ts` | Structure du menu de navigation |

---

## 🔐 Sécurité

- **Authentification JWT** avec refresh implicite
- **Stockage localStorage** du token
- **Service de cryptographie** (`crypto.service.ts`) pour les paramètres URL
- **Interception des erreurs** 401/403 avec redirection

---

## 📝 Points d'attention pour le développeur

1. **Template Vuexy** : Le dossier `@core` contient le code du template commercial. Éviter de le modifier directement.
2. **Module principal** : `module.module.ts` est le point d'entrée de tous les modules métier. Très volumineux.
3. **Services crédit** : 34 services différents pour le module crédit - organisation complexe.
4. **Rôles** : Système de rôles très granulaire défini dans `menu.ts`.
5. **Environnements** : Bien distinguer dev et prod dans les fichiers d'environnement.

---

*Document généré pour faciliter l'onboarding des nouveaux développeurs sur le projet Access Solution CRM.*
