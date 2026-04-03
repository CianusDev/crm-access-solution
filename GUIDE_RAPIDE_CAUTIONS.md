# 🚀 Guide Rapide - Système Cautions

Documentation simplifiée pour intégrer le système de gestion des cautions solidaires.

---

## 📋 Ce dont vous avez besoin

### 1. Fichiers à copier
```
src/app/features/credit/pages/analyse/sections/cautions/
├── cautions-section.component.ts     ← Copier ce fichier
└── cautions-section.component.html   ← Copier ce fichier
```

### 2. Composants UI nécessaires
Votre projet doit avoir ces composants Shadcn-style :
- `Card` (carte)
- `Drawer` (tiroir latéral)
- `Dialog` (modale de confirmation)
- `FormInput` (champ de formulaire)
- `Button` (bouton)

### 3. Service Toast
Pour afficher les notifications (succès/erreur).

---

## 🔌 APIs Backend (9 endpoints)

| Méthode | Endpoint | Usage |
|---------|----------|-------|
| GET | `/api/credit/getPaysCommuneData` | Liste pays, villes, communes |
| GET | `/api/credit/getAnalyseFinDemande/:ref` | Récupère cautions + documents |
| GET | `/api/credit/getDocuments/:ref` | Documents seuls (pour GP) |
| POST | `/api/credit/saveCrCaution` | Enregistrer une caution |
| DELETE | `/api/credit/deleteCaution/:id` | Supprimer une caution |
| POST | `/api/credit/saveDocAnnexe` | Upload doc (GP) |
| POST | `/api/credit/saveDocAnalyse` | Upload doc analyse |
| DELETE | `/api/credit/documents/:id` | Supprimer doc (GP) |
| DELETE | `/api/credit/deleteDocAnalyse/:id` | Supprimer doc analyse |

---

## 📝 Données JSON

### Enregistrer une caution (POST /api/credit/saveCrCaution)

```json
{
  "refDemande": "REF-2024-001",
  "nom": "KOUASSI",
  "prenom": "Jean",
  "dateNaissance": "1985-05-15",
  "lieuNaissance": "Abidjan",
  "genre": "2",
  "situationMatri": "3",
  "contact": "+225 07 12 34 56 78",
  "typePiece": "1",
  "numPiece": "CI123456789",
  "revenu": 500000,
  "justif": "Salarié",
  "nationalite": 1,
  "profession": "Ingénieur",
  "ville": 1,
  "commune": 1,
  "quartier": "Riviera 2",
  "rue": "Boulevard Latrille"
}
```

### Upload document (POST multipart/form-data)

**Pour GP (saveDocAnnexe) :**
```typescript
const formData = new FormData();
formData.append('refDemande', 'REF-2024-001');
formData.append('libelle', 'CNI Caution');
formData.append('version', '1');
formData.append('document', fichier); // File object
```

**Pour Analyse (saveDocAnalyse) :**
```typescript
const formData = new FormData();
formData.append('refDemande', 'REF-2024-001');
formData.append('libelle', 'CNI Caution');
formData.append('document', fichier); // File object
```

---

## 🎯 Codes des Valeurs

### Genre (statique)
- `1` = Féminin
- `2` = Masculin

### Situation Matrimoniale (statique)
- `1` = Célibataire
- `2` = Concubinage
- `3` = Marié(e)
- `4` = Divorcé
- `5` = Veuf/Veuve

### Type de Pièce (statique)
- `1` = CNI
- `2` = Passeport
- `3` = Carte consulaire
- `4` = Permis de conduire
- `5` = Attestation d'identité
- `6` = Carte de résident

### Nationalités (DYNAMIQUE ⚠️)

**Les nationalités viennent de l'API**, pas de constantes.

**Endpoint :** `GET /api/credit/getPaysCommuneData`

**Exemples de valeurs retournées :**
```json
{
  "pays": [
    { "id": 1, "nationalite": "Ivoirienne" },
    { "id": 2, "nationalite": "Française" },
    { "id": 3, "nationalite": "Burkinabè" },
    { "id": 4, "nationalite": "Malienne" },
    { "id": 5, "nationalite": "Nigérienne" },
    { "id": 6, "nationalite": "Sénégalaise" },
    { "id": 7, "nationalite": "Togolaise" },
    { "id": 8, "nationalite": "Béninoise" }
  ]
}
```

**Dans le code :**
```typescript
// 1. Charger au montage du composant
loadReferentiels() {
  this.creditService.getPaysCommuneData().subscribe({
    next: (data) => {
      this.paysListe.set(data.pays ?? []);
    }
  });
}

// 2. Utiliser dans le FormSelect
<app-form-select
  [options]="paysListe()"
  bindLabel="nationalite"
  bindValue="id"
  placeholder="Sélectionner une nationalité"
/>
```

---

## 💻 Utilisation dans votre Code

### 1. Dans votre template parent :

```html
<app-cautions-section
  [ref]="'REF-2024-001'"
  [isGP]="false"
  (docsChanged)="onDocumentsChanged()"
/>
```

### 2. Props du composant :

| Prop | Type | Description |
|------|------|-------------|
| `ref` | `string` | Référence de la demande (obligatoire) |
| `isGP` | `boolean` | `true` si Gestionnaire Portefeuille |
| `prefilledDoc` | `object` | Document pré-rempli (optionnel) |

### 3. Event émis :

| Event | Quand ? |
|-------|---------|
| `docsChanged` | Après ajout/suppression de document |

---

## ⚙️ Méthodes du Service

Ajoutez ces méthodes à votre `CreditService` :

```typescript
// Référentiels
getPaysCommuneData(): Observable<any> {
  return this.http.get(`${API_URL}/credit/getPaysCommuneData`);
}

// Cautions + Documents
getAnalyseFinanciere(ref: string): Observable<any> {
  return this.http.get(`${API_URL}/credit/getAnalyseFinDemande/${ref}`);
}

// Documents seuls (GP)
getDocuments(ref: string): Observable<any> {
  return this.http.get(`${API_URL}/credit/getDocuments/${ref}`);
}

// Enregistrer caution
saveCautionSolidaire(data: any): Observable<any> {
  return this.http.post(`${API_URL}/credit/saveCrCaution`, data);
}

// Supprimer caution
deleteCautionSolidaire(id: number): Observable<any> {
  return this.http.delete(`${API_URL}/credit/deleteCaution/${id}`);
}

// Upload document GP
uploadDocument(formData: FormData): Observable<any> {
  return this.http.post(`${API_URL}/credit/saveDocAnnexe`, formData);
}

// Upload document analyse
uploadDocumentAnalyse(formData: FormData): Observable<any> {
  return this.http.post(`${API_URL}/credit/saveDocAnalyse`, formData);
}

// Supprimer document GP
deleteDocument(id: number): Observable<any> {
  return this.http.delete(`${API_URL}/credit/documents/${id}`);
}

// Supprimer document analyse
deleteDocumentAnalyse(id: number): Observable<any> {
  return this.http.delete(`${API_URL}/credit/deleteDocAnalyse/${id}`);
}
```

---

## 🎨 Fonctionnalités Incluses

✅ **Gestion Cautions**
- Formulaire d'ajout avec validation
- Liste avec toutes les infos
- Suppression avec confirmation

✅ **Gestion Documents**
- Upload de fichiers (PDF, images)
- Liste avec recherche
- Suppression avec confirmation

✅ **UI/UX**
- Tiroir latéral (drawer) pour les formulaires
- Grille responsive 4 colonnes
- Recherche en temps réel
- Loading states
- Toast notifications

---

## 📦 Interface TypeScript Complète

```typescript
export interface CautionSolidaire {
  id?: number;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;           // "YYYY-MM-DD"
  lieuNaissance?: string;
  genre?: string;                    // "1" ou "2"
  situationMatri?: string | number;  // 1-5
  contact?: string;
  typePiece?: string | number;       // 1-6
  numPiece?: string;
  revenu?: number;                   // FCFA
  justif?: string;
  nationalite?: { id?: number; nationalite?: string } | number;
  profession?: string;
  ville?: { id?: number; libelle?: string } | number;
  commune?: { id?: number; libelle?: string } | number;
  quartier?: string;
  rue?: string;
}
```

---

## ⚠️ Points Importants

1. **GP vs Non-GP** : Utilisez les bons endpoints selon le rôle
2. **Validation** : Le formulaire valide tout avant envoi
3. **Sécurité** : Protégez vos APIs avec JWT/session
4. **Taille fichiers** : Limitez à 5 MB max
5. **Formats** : Acceptez PDF, JPG, PNG

---

## 🔗 Liens Utiles

- [Documentation complète](./INTEGRATION_CAUTIONS.md) - Guide détaillé
- [Code source](./src/app/features/credit/pages/analyse/sections/cautions/) - Fichiers du composant

---

**Version :** 1.0  
**Date :** 2026-04-03  
**Framework :** Angular 21+
