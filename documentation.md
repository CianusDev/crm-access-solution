# Formulaire Caution Solidaire — Guide d'intégration

## Apercu

Le formulaire permet d'ajouter une caution solidaire rattachée à une demande de crédit.
Il nécessite le chargement préalable de 3 référentiels (pays, villes, communes) et utilise un seul endpoint pour l'enregistrement.

---

## APIs requises

### 1. Référentiels — `GET /api/pays_commune`

Charge les listes déroulantes du formulaire. A appeler au `ngOnInit`.

**Réponse :**

```json
{
  "pays": [
    { "id": 1, "nationalite": "Ivoirienne" },
    { "id": 2, "nationalite": "Burkinabè" }
  ],
  "villes": [
    { "id": 1, "libelle": "Abidjan" },
    { "id": 2, "libelle": "Bouaké" }
  ],
  "communes": [
    { "id": 1, "libelle": "Cocody" },
    { "id": 2, "libelle": "Plateau" }
  ]
}
```

### 2. Lecture des cautions existantes — `GET /api/credit/getAnalyseFinDemande/{refDemande}`

Retourne l'analyse financière complète. Les cautions sont dans `demande.cautionsSolidaires`.

**Réponse (extrait) :**

```json
{
  "demande": {
    "cautionsSolidaires": [
      {
        "id": 12,
        "nom": "Yao",
        "prenom": "Konan",
        "dateNaissance": "1985-03-15",
        "lieuNaissance": "Abidjan",
        "genre": "Masculin",
        "situationMatri": 3,
        "contact": "07 00 00 00 00",
        "typePiece": 1,
        "numPiece": "CI-1234567",
        "revenu": 500000,
        "justif": "Bulletin de salaire",
        "nationalite": { "id": 1, "nationalite": "Ivoirienne" },
        "profession": "Commerçant",
        "ville": { "id": 1, "libelle": "Abidjan" },
        "commune": { "id": 1, "libelle": "Cocody" },
        "quartier": "Riviera 2",
        "rue": "Rue des jardins"
      }
    ]
  }
}
```

### 3. Enregistrement — `POST /api/credit/saveCrCaution`

**Body (JSON) :**

```json
{
  "refDemande":     "C0502385",
  "crCaution":      "",
  "nom":            "Yao",
  "prenom":         "Konan",
  "dateNaissance":  "1985-03-15",
  "lieuNaissance":  "Abidjan",
  "genre":          "Masculin",
  "situationMatri": "3",
  "contact":        "07 00 00 00 00",
  "typePiece":      "1",
  "numPiece":       "CI-1234567",
  "revenu":         500000,
  "justif":         "Bulletin de salaire",
  "nationalite":    1,
  "profession":     "Commerçant",
  "ville":          1,
  "commune":        1,
  "quartier":       "Riviera 2",
  "rue":            "Rue des jardins"
}
```

> **Note :** `crCaution` = `""` pour une création, `= id` (number) pour une modification.
> `nationalite`, `ville`, `commune` sont des **ID** (number), pas des objets.
> `dateNaissance` au format `YYYY-MM-DD`.

**Réponse :**

```json
{ "status": 1, "message": "ok" }
```

### 4. Suppression — `DELETE /api/credit/deleteCaution/{id}`

**Réponse :**

```json
{ "status": 1 }
```

---

## Champs du formulaire

| Champ              | Type      | Obligatoire | Valeurs possibles / format                                                     |
|--------------------|-----------|:-----------:|--------------------------------------------------------------------------------|
| `nom`              | text      | oui         |                                                                                |
| `prenom`           | text      | oui         |                                                                                |
| `dateNaissance`    | date      | oui         | `YYYY-MM-DD`                                                                   |
| `lieuNaissance`    | text      | oui         |                                                                                |
| `genre`            | select    | oui         | `"Feminin"`, `"Masculin"`                                                      |
| `situationMatri`   | select    | non         | `1` Célibataire, `2` Concubinage, `3` Marié(e), `4` Divorcé, `5` Veuf/Veuve   |
| `contact`          | text      | oui         | Numéro de téléphone                                                            |
| `typePiece`        | select    | oui         | `1` CNI, `2` Passeport, `3` Carte consulaire, `4` Permis, `5` Attestation, `6` Carte résident |
| `numPiece`         | text      | oui         |                                                                                |
| `revenu`           | number    | oui         | Montant en FCFA                                                                |
| `justif`           | text      | oui         | Justificatif du revenu                                                         |
| `nationalite`      | select    | oui         | ID depuis `GET /api/pays_commune` → `pays[].id`                               |
| `profession`       | text      | oui         |                                                                                |
| `ville`            | select    | oui         | ID depuis `GET /api/pays_commune` → `villes[].id`                              |
| `commune`          | select    | oui         | ID depuis `GET /api/pays_commune` → `communes[].id`                            |
| `quartier`         | text      | oui         |                                                                                |
| `rue`              | text      | non         |                                                                                |

---

## Fichiers de référence (new frontend)

| Fichier | Rôle |
|---------|------|
| `src/app/features/credit/pages/analyse/sections/cautions/cautions-section.component.ts` | Logique du composant (form, save, load) |
| `src/app/features/credit/pages/analyse/sections/cautions/cautions-section.component.html` | Template (drawer + affichage) |
| `src/app/features/credit/interfaces/credit.interface.ts` | Interface `CautionSolidaire` |
| `src/app/features/credit/services/credit/credit.service.ts` | Méthodes `saveCautionSolidaire`, `deleteCautionSolidaire`, `getPaysCommuneData` |
