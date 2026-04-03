# 📋 Guide d'Intégration - Système de Gestion des Cautions

## 🔌 APIs Backend Requises

### 1. **Récupération des Référentiels**

**Endpoint :** `GET /api/credit/getPaysCommuneData`

**Réponse :**
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
    { "id": 8, "nationalite": "Béninoise" },
    { "id": 9, "nationalite": "Ghanéenne" },
    { "id": 10, "nationalite": "Guinéenne" },
    { "id": 11, "nationalite": "Libérienne" }
  ],
  "villes": [
    { "id": 1, "libelle": "Abidjan" },
    { "id": 2, "libelle": "Yamoussoukro" },
    { "id": 3, "libelle": "Bouaké" },
    { "id": 4, "libelle": "Daloa" },
    { "id": 5, "libelle": "San-Pédro" },
    { "id": 6, "libelle": "Korhogo" }
  ],
  "communes": [
    { "id": 1, "libelle": "Cocody" },
    { "id": 2, "libelle": "Plateau" },
    { "id": 3, "libelle": "Adjamé" },
    { "id": 4, "libelle": "Yopougon" },
    { "id": 5, "libelle": "Abobo" },
    { "id": 6, "libelle": "Marcory" },
    { "id": 7, "libelle": "Koumassi" },
    { "id": 8, "libelle": "Port-Bouët" },
    { "id": 9, "libelle": "Treichville" },
    { "id": 10, "libelle": "Attécoubé" }
  ]
}
```

**⚠️ Important :** 
- Les listes `pays`, `villes` et `communes` sont **dynamiques** et gérées côté backend
- Les IDs peuvent varier selon votre base de données
- Cette réponse est un exemple type avec les nationalités/villes courantes en Côte d'Ivoire

### 3. **Enregistrement d'une Caution**

**Endpoint :** `POST /api/credit/saveCrCaution`

**Payload :**
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

**Réponse :**
```json
{
  "status": 200,
  "message": "Caution enregistrée avec succès"
}
```

---

### 4. **Suppression d'une Caution**

**Endpoint :** `DELETE /api/credit/deleteCaution/:id`

**Réponse :**
```json
{
  "status": 200
}
```

---

## 🔐 Constantes et Mappings

### Genres (statiques)
```typescript
const GENRES = {
  1: 'Féminin',
  2: 'Masculin'
};
```

### Situations Matrimoniales (statiques)
```typescript
const SITUATIONS_MATRIMONIALES = {
  1: 'Célibataire',
  2: 'Concubinage',
  3: 'Marié(e)',
  4: 'Divorcé',
  5: 'Veuf/Veuve'
};
```

### Types de Pièces (statiques)
```typescript
const TYPES_PIECES = {
  1: 'CNI',
  2: 'Passeport',
  3: 'Carte consulaire',
  4: 'Permis de conduire',
  5: "Attestation d'identité",
  6: 'Carte de résident'
};
```

### Nationalités (DYNAMIQUES - viennent de l'API)

**⚠️ Les nationalités sont chargées depuis l'API `/api/credit/getPaysCommuneData`**

Exemples typiques (IDs peuvent varier) :
```typescript
// Données retournées par l'API dans data.pays
const NATIONALITES_EXEMPLES = [
  { id: 1, nationalite: 'Ivoirienne' },
  { id: 2, nationalite: 'Française' },
  { id: 3, nationalite: 'Burkinabè' },
  { id: 4, nationalite: 'Malienne' },
  { id: 5, nationalite: 'Nigérienne' },
  { id: 6, nationalite: 'Sénégalaise' },
  { id: 7, nationalite: 'Togolaise' },
  { id: 8, nationalite: 'Béninoise' },
  { id: 9, nationalite: 'Ghanéenne' },
  { id: 10, nationalite: 'Guinéenne' },
  { id: 11, nationalite: 'Libérienne' },
  // ... autres nationalités selon votre base
];
```

---
