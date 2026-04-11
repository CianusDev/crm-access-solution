import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  Pencil,
  AlertCircle,
  Building2,
  Car,
  Wrench,
  PiggyBank,
  Box,
  Users,
  Image,
  FileText,
  Eye,
  Upload,
  ChevronDown,
  Package,
  Banknote,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import {
  DrawerComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
  DrawerContentComponent,
  DrawerFooterComponent,
} from '@/shared/components/drawer/drawer.component';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect, SelectOption } from '@/shared/components/form-select/form-select.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../../services/credit/credit.service';
import {
  ActifGarantie,
  CautionSolidaire,
  CreditActifCirculantStock,
  GarantieType,
  TypeActif,
} from '../../../../interfaces/credit.interface';
import { LightboxComponent, LightboxImage } from '@/shared/components/lightbox/lightbox.component';
import { DocumentType } from '../../../../constants/caution-documents';
import {
  getGarantieImageTypes,
  getGarantieDocumentTypes,
} from '../../../../constants/garantie-documents';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';
import { Dropdown } from '@/shared/components/dropdown/dropdown.component';
import { DropdownItem } from '@/shared/components/dropdown/dropdown.interface';

const DOC_BASE_URL = 'https://crm-fichiers.creditaccess.ci/crm/credit-ca/';

const TYPES_ACTIF: SelectOption[] = [
  { value: 'IMMOBILIER', label: 'Bien immobilier' },
  { value: 'VEHICULE', label: 'Véhicule' },
  { value: 'EQUIPEMENT', label: 'Équipement / Matériel' },
  { value: 'DAT', label: 'Dépôt à terme (DAT)' },
  { value: 'BIEN_MOBILIER', label: 'Biens mobiliers famille' },
  { value: 'DEPOSIT', label: 'Dépôt (Espèces en banque)' },
  { value: 'AUTRE', label: 'Autre actif' },
];

// DEPOSIT — code mort dans le legacy (modal définie mais aucun bouton ne l'ouvre)
// const TYPES_COMPTE_DEPOSIT: SelectOption[] = [
//   { value: 'Compte courant', label: 'Compte courant' },
//   { value: 'Compte épargne', label: 'Compte épargne' },
//   { value: 'Compte à terme', label: 'Compte à terme' },
//   { value: 'Autre', label: 'Autre' },
// ];

const TYPES_PROPRIETE: SelectOption[] = [
  { value: '1', label: 'LOCAL' },
  { value: '2', label: 'TERRAIN' },
];

const TYPES_VEHICULE: SelectOption[] = [
  { value: 'Voiture', label: 'Voiture' },
  { value: 'Motocyclette', label: 'Motocyclette' },
  { value: 'Véhicule tout-terrain', label: 'Véhicule tout-terrain' },
  { value: 'Camion', label: 'Camion' },
];

const TYPES_PRO_PERSO: SelectOption[] = [
  { value: 'Professionel', label: 'Professionnel' },
  { value: 'Personnel', label: 'Personnel' },
];

const OUI_NON: SelectOption[] = [
  { value: '1', label: 'OUI' },
  { value: '2', label: 'NON' },
];


const JUSTIFS_OPTIONS: SelectOption[] = [
  { value: '1', label: 'Titre foncier' },
  { value: '2', label: 'Titre de propriété' },
];

const LEGACY_TYPE_ACTIF_GARANTIE_MAP: Partial<Record<TypeActif, number>> = {
  IMMOBILIER: 1,
  EQUIPEMENT: 2,
  BIEN_MOBILIER: 3,
  VEHICULE: 4,
  DEPOSIT: 5,
  DAT: 6,
};

const LEGACY_TYPE_ACTIF_GARANTIE_REVERSE_MAP: Record<number, TypeActif> = {
  1: 'IMMOBILIER',
  2: 'EQUIPEMENT',
  3: 'BIEN_MOBILIER',
  4: 'VEHICULE',
  5: 'DEPOSIT',
  6: 'DAT',
};

const GARANTIE_TYPE_SECTION_TO_ACTIF: Record<number, TypeActif> = {
  1: 'IMMOBILIER',
  2: 'EQUIPEMENT',
  3: 'BIEN_MOBILIER',
  4: 'VEHICULE',
  5: 'DEPOSIT',
  6: 'DAT',
};

// Parité legacy frontEnd: seules ces familles entrent dans les "totaux garanties".
const LEGACY_TOTAL_GARANTIE_TYPES: readonly TypeActif[] = [
  'IMMOBILIER',
  'EQUIPEMENT',
  'VEHICULE',
  'BIEN_MOBILIER',
];

type GarantiesViewId =
  | 'all'
  | 'totaux'
  | 'immobilier'
  | 'vehicule'
  | 'equipement'
  | 'dat'
  | 'bien-mobilier'
  | 'autre'
  | 'stock';

@Component({
  selector: 'app-garanties-section',
  templateUrl: './garanties-section.component.html',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    ButtonDirective,
    DrawerComponent,
    DrawerHeaderComponent,
    DrawerTitleComponent,
    DrawerContentComponent,
    DrawerFooterComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogFooterComponent,
    FormInput,
    FormTextarea,
    FormSelect,
    Dropdown,
    DatePipe,
    LightboxComponent,
  ],
})
export class GarantiesSectionComponent implements OnInit {
  ref = input<string>('');
  view = input<GarantiesViewId>('all');
  canAddOrUpload = input<boolean>(false);
  canEditDelete = input<boolean>(false);

  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
  readonly PencilIcon = Pencil;
  readonly AlertCircleIcon = AlertCircle;
  readonly Building2Icon = Building2;
  readonly CarIcon = Car;
  readonly WrenchIcon = Wrench;
  readonly PiggyBankIcon = PiggyBank;
  readonly BoxIcon = Box;
  readonly UsersIcon = Users;
  readonly ImageIcon = Image;
  readonly FileTextIcon = FileText;
  readonly EyeIcon = Eye;
  readonly UploadIcon = Upload;
  readonly ChevronDownIcon = ChevronDown;
  readonly PackageIcon = Package;
  readonly BanknoteIcon = Banknote;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  readonly typesActifOptions = TYPES_ACTIF;
  readonly typesProprieteOptions = TYPES_PROPRIETE;
  readonly typesVehiculeOptions = TYPES_VEHICULE;
  readonly typesProPersoOptions = TYPES_PRO_PERSO;
  readonly ouiNonOptions = OUI_NON;
  readonly jutifsOptions = JUSTIFS_OPTIONS;
  // readonly typesCompteDepositOptions = TYPES_COMPTE_DEPOSIT; // DEPOSIT — code mort legacy

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly actifs = signal<ActifGarantie[]>([]);
  readonly cautions = signal<CautionSolidaire[]>([]);
  readonly stocks = signal<CreditActifCirculantStock[]>([]);

  readonly totalStocks = computed(() =>
    this.stocks().reduce((s, item) => s + (item.cout ?? 0), 0),
  );

  readonly totalStocksGaranties = computed(() =>
    this.stocks()
      .filter((item) => String(item.garantie ?? '') === '1')
      .reduce((s, item) => s + (item.cout ?? 0), 0),
  );

  readonly PROPRIETAIRE_OPTIONS: SelectOption[] = [
    { value: 'D', label: 'Demandeur' },
    { value: 'C', label: 'Caution' },
  ];

  readonly cautionOptions = computed<SelectOption[]>(() =>
    this.cautions().map((c) => ({
      value: String(c.id),
      label: `${c.nom ?? ''} ${c.prenom ?? ''}`.trim() || `Caution #${c.id}`,
    })),
  );

  readonly isProprietaireCaution = signal(false);
  readonly isSocieteCr = signal(false);

  readonly immobiliers = computed(() => this.actifs().filter((a) => a.type === 'IMMOBILIER'));
  readonly vehicules = computed(() => this.actifs().filter((a) => a.type === 'VEHICULE'));
  readonly equipements = computed(() => this.actifs().filter((a) => a.type === 'EQUIPEMENT'));
  readonly dats = computed(() => this.actifs().filter((a) => a.type === 'DAT'));
  readonly biensMobiliers = computed(() => this.actifs().filter((a) => a.type === 'BIEN_MOBILIER'));
  // readonly deposits = computed(() => this.actifs().filter((a) => a.type === 'DEPOSIT')); // DEPOSIT — code mort legacy
  readonly autres = computed(() => this.actifs().filter((a) => a.type === 'AUTRE'));

  readonly totalValeur = computed(() =>
    this.actifs().reduce((s, a) => s + (a.valeurEstimee ?? 0), 0),
  );

  // Parité legacy: IMMOBILIER + EQUIPEMENT + VEHICULE + BIEN_MOBILIER + STOCK.
  readonly totalGarantiesFixes = computed(() => {
    const totalActifsLegacy = this.actifs()
      .filter((a) => !!a.type && LEGACY_TOTAL_GARANTIE_TYPES.includes(a.type))
      .reduce((s, a) => s + (a.valeurEstimee ?? 0), 0);

    return totalActifsLegacy + this.totalStocks();
  });

  readonly totalGarantiesProposees = computed(() => {
    const totalActifsLegacyProposes = this.actifs()
      .filter(
        (a) =>
          !!a.type &&
          LEGACY_TOTAL_GARANTIE_TYPES.includes(a.type) &&
          String(a.garantie ?? '') === '1',
      )
      .reduce((s, a) => s + (a.valeurEstimee ?? 0), 0);

    return totalActifsLegacyProposes + this.totalStocksGaranties();
  });

  // Drawer
  actifDrawerOpen = false;
  selectedType = signal<TypeActif | null>(null);
  nouvelleAcquisition = signal<number | null>(null);
  readonly isSaving = signal(false);
  readonly editingActifId = signal<number | null>(null);

  // Delete actif
  deleteDialogOpen = false;
  actifToDelete: ActifGarantie | null = null;
  readonly isDeleting = signal(false);

  // Stock actif circulant
  stockDrawerOpen = false;
  readonly isSavingStock = signal(false);
  readonly editingStockId = signal<number | null>(null);
  stockToDelete: CreditActifCirculantStock | null = null;
  stockDeleteDialogOpen = false;
  readonly isDeletingStock = signal(false);

  readonly stockForm = this.fb.group({
    description: ['', Validators.required],
    quantite: [null as number | null, Validators.required],
    prix: [null as number | null, Validators.required],
    assurStock: ['', Validators.required],
    garantie: ['', Validators.required],
  });

  // Médias (images/documents par actif)
  readonly expandedImages = signal<number[]>([]);
  readonly expandedDocuments = signal<number[]>([]);
  readonly isUploadingMedia = signal(false);
  mediaTarget: { actifId: number; type: 'image' | 'doc'; libelle: string } | null = null;
  mediaDeleteTarget: { type: 'image' | 'doc'; id: number; label: string } | null = null;
  mediaDeleteDialogOpen = false;
  readonly isDeletingMedia = signal(false);
  imageDrawerOpen = false;
  readonly imageUploadActifId = signal<number | null>(null);
  readonly imageUploadLabel = signal('');
  imageUploadFile: File | null = null;
  mediaDrawerOpen = false;
  readonly mediaDrawerActifId = signal<number | null>(null);
  readonly mediaDrawerType = signal<'image' | 'doc'>('image');
  readonly mediaDrawerLabel = signal('');
  mediaDrawerFile: File | null = null;

  // Lightbox
  lightboxOpen = false;
  lightboxImages: LightboxImage[] = [];
  lightboxIndex = 0;

  // Types de docs/images par actif (calculés à la volée)
  getImageTypes(type: string): DocumentType[] {
    return getGarantieImageTypes(type);
  }
  getDocumentTypes(type: string): DocumentType[] {
    return getGarantieDocumentTypes(type);
  }

  private hasMediaByLabel(media: { libelle?: string }[] | undefined, label: string): boolean {
    const normalized = label.trim().toLowerCase();
    return (media ?? []).some((m) => (m.libelle ?? '').trim().toLowerCase() === normalized);
  }

  imageUploadItems(actif: ActifGarantie): DropdownItem[] {
    return this.getImageTypes(actif.type ?? '').map((t) => ({ label: t.libelle }));
  }

  defaultImageUploadLabel(actif: ActifGarantie): string {
    return this.imageUploadItems(actif)[0]?.label ?? 'Image';
  }

  defaultDocumentUploadLabel(actif: ActifGarantie): string {
    return this.getDocumentTypes(actif.type ?? '')[0]?.libelle ?? 'Document';
  }

  documentUploadItems(actif: ActifGarantie): DropdownItem[] {
    return this.getDocumentTypes(actif.type ?? '').map((t) => ({
      label: t.libelle,
      required: t.obligation,
      disabled: this.hasMediaByLabel(actif.documents, t.libelle),
    }));
  }

  immobilierTypeLabel(value: string | number | undefined): string {
    const normalized = value != null ? String(value) : '';
    if (normalized === '1') return 'Local';
    if (normalized === '2') return 'Terrain';
    return '—';
  }

  oneAsYes(value: string | number | undefined): string {
    return String(value ?? '') === '1' ? 'Oui' : 'Non';
  }

  private asSelectValue(value: string | number | undefined | null): string {
    return value == null ? '' : String(value);
  }

  totalActifByType(type: TypeActif): number {
    return this.actifs()
      .filter((a) => a.type === type)
      .reduce((s, a) => s + (a.valeurEstimee ?? 0), 0);
  }

  totalActifByTypeGaranties(type: TypeActif): number {
    return this.actifs()
      .filter((a) => a.type === type && String(a.garantie ?? '') === '1')
      .reduce((s, a) => s + (a.valeurEstimee ?? 0), 0);
  }

  // ── Form ───────────────────────────────────────────────────────────────
  readonly actifForm = this.fb.group({
    type: ['' as TypeActif | '', Validators.required],
    valeurEstimee: [null as number | null, Validators.required],
    // Commun à plusieurs types
    proprietaire: [''],
    garantie: [''],
    // Immobilier
    localisation: [''],
    superficie: [null as number | null],
    typePropriete: [''],
    adressDescr: [''],
    titreFoncier: [''],
    lot: [''],
    ilot: [''],
    justifs: [''],
    // Véhicule
    marque: [''],
    immatriculation: [''],
    couleur: [''],
    typeVehicule: [''],
    dateMiseEnCirculation: [''],
    nbrePlace: [null as number | null],
    typeCommercial: [''],
    typeTechnique: [''],
    evaluation: [''],
    vehiculeVu: [''],
    typeProPerso: [''],
    nouvelleAcquisition: [null as number | null],
    miniComm: [''],
    societeCr: [''],
    societe: [''],
    // DAT
    banque: [''],
    echeance: [''],
    dureeDat: [null as number | null],
    dateEffetDat: [''],
    dateEcheanceDat: [''],
    numeroPerfectDat: [''],
    // Équipement
    designation: [''],
    // Biens mobiliers famille
    quantite: [null as number | null],
    valeurAchat: [null as number | null],
    dateAcquisition: [''],
    // DEPOSIT — code mort legacy
    // especeBanque: [null as number | null],
    // typeCompte: [''],
    // Propriétaire (D = Demandeur, sinon id caution)
    idCaution: [null as number | null],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadData();
    // Réagir au changement de type pour afficher les champs dynamiques
    this.actifForm.get('type')?.valueChanges.subscribe((v) => {
      this.selectedType.set((v as TypeActif) || null);
    });
    this.actifForm.get('proprietaire')?.valueChanges.subscribe((v) => {
      this.isProprietaireCaution.set(v === 'C');
      if (v !== 'C') this.actifForm.patchValue({ idCaution: null }, { emitEvent: false });
    });
    this.actifForm.get('societeCr')?.valueChanges.subscribe((v) => {
      this.isSocieteCr.set(v === '1');
      if (v !== '1') this.actifForm.patchValue({ societe: '' }, { emitEvent: false });
    });
  }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    this.creditService.getGarantiesDemande(this.ref()).subscribe({
      next: (data) => {
        if (!data) {
          this.error.set('Données du dossier introuvables.');
          this.isLoading.set(false);
          return;
        }
        this.cautions.set(data.crCaution ?? []);
        this.stocks.set(data.actifCirculantStock ?? []);
        const actifsFromGaranties = this.flattenTypeGaranties(data.typeGaranties ?? []);
        this.actifs.set(actifsFromGaranties.map((a) => this.normalizeActif(a)));
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les données du dossier.');
        this.isLoading.set(false);
      },
    });
  }

  private flattenTypeGaranties(typeGaranties: GarantieType[]): ActifGarantie[] {
    return typeGaranties.flatMap((group) =>
      (group.garanties ?? []).map((g) => {
        const raw = g as unknown as Record<string, unknown>;
        return {
          ...(raw as ActifGarantie),
          type: GARANTIE_TYPE_SECTION_TO_ACTIF[group.id],
          typeActifGarantie: group.id,
        } as ActifGarantie;
      }),
    );
  }

  private normalizeActif(actif: ActifGarantie): ActifGarantie {
    const raw = actif as ActifGarantie & {
      typeActifGarantie?: number | string;
      valeurEstime?: number;
      crActifGarantie?: number;
    };

    const normalizedType = this.resolveType(raw.type, raw.typeActifGarantie);
    const valeurEstimee = raw.valeurEstimee ?? raw.valeurEstime;
    const id = raw.id ?? raw.crActifGarantie;

    return {
      ...actif,
      id,
      type: normalizedType,
      valeurEstimee,
    };
  }

  private resolveType(
    type: TypeActif | string | undefined,
    typeActifGarantie: number | string | undefined,
  ): TypeActif | undefined {
    if (type && Object.prototype.hasOwnProperty.call(LEGACY_TYPE_ACTIF_GARANTIE_MAP, type)) {
      return type as TypeActif;
    }
    const numericType =
      typeof typeActifGarantie === 'number'
        ? typeActifGarantie
        : Number(typeActifGarantie ?? NaN);
    return LEGACY_TYPE_ACTIF_GARANTIE_REVERSE_MAP[numericType];
  }

  formatMontant(n: number | undefined): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  typeLabel(type: TypeActif | undefined): string {
    return TYPES_ACTIF.find((t) => t.value === type)?.label ?? type ?? '—';
  }

  isView(id: Exclude<GarantiesViewId, 'all'>): boolean {
    const currentView = this.view();
    return currentView === 'all' || currentView === id;
  }

  // ── CRUD ───────────────────────────────────────────────────────────────
  openAdd(preselect?: TypeActif, nouvelleAcquisition?: number) {
    this.editingActifId.set(null);
    this.actifForm.reset({
      type: preselect ?? '',
      valeurEstimee: null,
      // Commun
      proprietaire: '',
      garantie: '',
      // Immobilier
      localisation: '',
      superficie: null,
      typePropriete: '',
      adressDescr: '',
      titreFoncier: '',
      lot: '',
      ilot: '',
      justifs: '',
      // Véhicule
      marque: '',
      immatriculation: '',
      couleur: '',
      typeVehicule: '',
      dateMiseEnCirculation: '',
      nbrePlace: null,
      typeCommercial: '',
      typeTechnique: '',
      evaluation: '',
      vehiculeVu: '',
      typeProPerso: '',
      nouvelleAcquisition: nouvelleAcquisition ?? null,  // set programmatically, not via select
      miniComm: '',
      societeCr: '',
      societe: '',
      // DAT
      banque: '',
      echeance: '',
      dureeDat: null,
      dateEffetDat: '',
      dateEcheanceDat: '',
      numeroPerfectDat: '',
      // Équipement
      designation: '',
      // Biens mobiliers
      quantite: null,
      valeurAchat: null,
      dateAcquisition: '',
      // DEPOSIT — code mort legacy
      // especeBanque: null,
      // typeCompte: '',
      // Propriétaire
      idCaution: null,
    });
    this.selectedType.set(preselect ?? null);
    this.nouvelleAcquisition.set(nouvelleAcquisition ?? null);
    this.isProprietaireCaution.set(false);
    this.isSocieteCr.set(false);
    this.actifDrawerOpen = true;
  }

  openEditActif(a: ActifGarantie) {
    this.editingActifId.set(a.id ?? null);
    const proprietaire = a.proprietaire === 'D' ? 'D' : (a.idCaution ? 'C' : '');
    this.actifForm.patchValue({
      type: a.type ?? '',
      valeurEstimee: a.valeurEstimee ?? null,
      proprietaire,
      garantie: this.asSelectValue(a.garantie),
      localisation: a.localisation ?? '',
      superficie: a.superficie ?? null,
      typePropriete: this.asSelectValue(a.typePropriete),
      adressDescr: a.adressDescr ?? '',
      titreFoncier: a.titreFoncier ?? '',
      lot: a.lot ?? '',
      ilot: a.ilot ?? '',
      justifs: a.justifs ?? '',
      marque: a.marque ?? '',
      immatriculation: a.immatriculation ?? '',
      couleur: a.couleur ?? '',
      typeVehicule: a.typeVehicule ?? '',
      dateMiseEnCirculation: a.dateMiseEnCirculation ? String(a.dateMiseEnCirculation).substring(0, 10) : '',
      nbrePlace: a.nbrePlace ?? null,
      typeCommercial: a.typeCommercial ?? '',
      typeTechnique: a.typeTechnique ?? '',
      evaluation: a.evaluation ?? '',
      vehiculeVu: this.asSelectValue(a.vehiculeVu),
      typeProPerso: a.typeProPerso ?? '',
      nouvelleAcquisition: a.nouvelleAcquisition ?? null,
      miniComm: this.asSelectValue(a.miniComm),
      societeCr: this.asSelectValue(a.societeCr),
      societe: a.societe ?? '',
      banque: a.banque ?? '',
      echeance: a.echeance ?? '',
      dureeDat: a.dureeDat ?? null,
      dateEffetDat: a.dateEffetDat ? String(a.dateEffetDat).substring(0, 10) : '',
      dateEcheanceDat: a.dateEcheanceDat ? String(a.dateEcheanceDat).substring(0, 10) : '',
      numeroPerfectDat: a.numeroPerfectDat ?? '',
      designation: a.designation ?? '',
      quantite: a.quantite ?? null,
      valeurAchat: a.valeurAchat ?? null,
      dateAcquisition: a.dateAcquisition ? String(a.dateAcquisition).substring(0, 10) : '',
      idCaution: a.idCaution ?? null,
    });
    this.selectedType.set(a.type ?? null);
    this.isProprietaireCaution.set(proprietaire === 'C');
    this.isSocieteCr.set(this.asSelectValue(a.societeCr) === '1');
    this.nouvelleAcquisition.set(a.nouvelleAcquisition ?? null);
    this.actifDrawerOpen = true;
  }

  save() {
    if (this.actifForm.invalid) {
      this.actifForm.markAllAsTouched();
      return;
    }
    const val = this.actifForm.value;
    const editId = this.editingActifId();
    const idCaution = val.idCaution != null ? Number(val.idCaution) : null;
    const typeActifGarantie = val.type ? (LEGACY_TYPE_ACTIF_GARANTIE_MAP[val.type] ?? null) : null;
    const valeurEstime = val.valeurEstimee;
    // Legacy parity: DAT is always stored with owner "D" (demandeur).
    const proprietaire = val.type === 'DAT' ? 'D' : (val.proprietaire || null);
    const payload = {
      // Legacy canonical keys
      crActifGarantie: editId ?? '',
      typeActifGarantie,
      valeurEstime,
      user: proprietaire === 'C' ? idCaution : '',
      // Compatibility aliases already consumed in new code paths
      actifGarantie: editId ?? undefined,
      type: val.type,
      valeurEstimee: val.valeurEstimee,
      // Commun
      proprietaire,
      garantie: val.garantie ? Number(val.garantie) : null,
      // Immobilier
      localisation: val.localisation || null,
      superficie: val.superficie,
      typePropriete: val.typePropriete || null,
      adressDescr: val.adressDescr || null,
      titreFoncier: val.titreFoncier || null,
      lot: val.lot || null,
      ilot: val.ilot || null,
      justifs: val.justifs || null,
      // Véhicule
      marque: val.marque || null,
      immatriculation: val.immatriculation || null,
      couleur: val.couleur || null,
      typeVehicule: val.typeVehicule || null,
      dateMiseEnCirculation: val.dateMiseEnCirculation || null,
      nbrePlace: val.nbrePlace,
      typeCommercial: val.typeCommercial || null,
      typeTechnique: val.typeTechnique || null,
      evaluation: val.evaluation || null,
      vehiculeVu: val.vehiculeVu || null,
      typeProPerso: val.typeProPerso || null,
      nouvelleAcquisition: val.nouvelleAcquisition != null ? Number(val.nouvelleAcquisition) : null,
      miniComm: val.miniComm ? Number(val.miniComm) : null,
      societeCr: val.societeCr || null,
      societe: val.societe || null,
      // DAT
      banque: val.banque || null,
      echeance: val.echeance || null,
      dureeDat: val.dureeDat,
      dateEffetDat: val.dateEffetDat || null,
      dateEcheanceDat: val.dateEcheanceDat || null,
      numeroPerfectDat: val.numeroPerfectDat || null,
      // Équipement
      designation: val.designation || null,
      // Biens mobiliers
      quantite: val.quantite,
      valeurAchat: val.valeurAchat,
      dateAcquisition: val.dateAcquisition || null,
      // DEPOSIT — code mort legacy
      // especeBanque: val.especeBanque,
      // typeCompte: val.typeCompte || null,
      // Propriétaire
      idCaution,
      refDemande: this.ref(),
    };
    this.isSaving.set(true);
    this.creditService
      .saveActifGarantie(payload)
      .subscribe({
        next: () => {
          this.toast.success(editId ? 'Actif modifié.' : 'Actif enregistré.');
          this.actifDrawerOpen = false;
          this.isSaving.set(false);
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
          this.isSaving.set(false);
        },
      });
  }

  openDelete(actif: ActifGarantie) {
    this.actifToDelete = actif;
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.actifToDelete?.id) return;
    this.deleteDialogOpen = false;
    this.isDeleting.set(true);
    this.creditService.deleteActifGarantie(this.actifToDelete.id).subscribe({
      next: () => {
        this.toast.success('Actif supprimé.');
        this.isDeleting.set(false);
        this.actifToDelete = null;
        this.loadData();
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression.');
        this.isDeleting.set(false);
      },
    });
  }

  // ── Médias (images / documents par actif) ────────────────────────────────
  toggleImages(actifId: number) {
    const cur = this.expandedImages();
    this.expandedImages.set(
      cur.includes(actifId) ? cur.filter((i) => i !== actifId) : [...cur, actifId],
    );
  }

  toggleDocuments(actifId: number) {
    const cur = this.expandedDocuments();
    this.expandedDocuments.set(
      cur.includes(actifId) ? cur.filter((i) => i !== actifId) : [...cur, actifId],
    );
  }

  triggerMediaUpload(
    actifId: number,
    type: 'image' | 'doc',
    libelle: string,
    input: HTMLInputElement,
  ) {
    this.mediaTarget = { actifId, type, libelle };
    input.click();
  }

  openImageUploadDrawer(actifId: number): void {
    this.imageUploadActifId.set(actifId);
    this.imageUploadLabel.set('');
    this.imageUploadFile = null;
    this.imageDrawerOpen = true;
  }

  onImageUploadFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageUploadFile = input.files?.[0] ?? null;
  }

  closeImageUploadDrawer(): void {
    this.imageDrawerOpen = false;
    this.imageUploadActifId.set(null);
    this.imageUploadLabel.set('');
    this.imageUploadFile = null;
  }

  submitImageUploadDrawer(): void {
    const actifId = this.imageUploadActifId();
    const libelle = this.imageUploadLabel().trim();
    const file = this.imageUploadFile;

    if (!actifId || !file || !libelle) {
      this.toast.error('Veuillez renseigner le libellé et sélectionner une image.');
      return;
    }

    const fd = new FormData();
    fd.append('type', 'GARANTIE');
    fd.append('element', String(actifId));
    fd.append('libelle', libelle);
    fd.append('description', '');
    fd.append('photo', file);

    this.isUploadingMedia.set(true);
    this.creditService.uploadImageGarantie(fd).subscribe({
      next: () => {
        this.toast.success('Image ajoutée.');
        this.isUploadingMedia.set(false);
        this.closeImageUploadDrawer();
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'upload.");
        this.isUploadingMedia.set(false);
      },
    });
  }

  openMediaUploadDrawer(actifId: number, type: 'image' | 'doc'): void {
    this.mediaDrawerActifId.set(actifId);
    this.mediaDrawerType.set(type);
    this.mediaDrawerLabel.set('');
    this.mediaDrawerFile = null;
    this.mediaDrawerOpen = true;
  }

  onMediaUploadDrawerFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.mediaDrawerFile = input.files?.[0] ?? null;
  }

  closeMediaUploadDrawer(): void {
    this.mediaDrawerOpen = false;
    this.mediaDrawerActifId.set(null);
    this.mediaDrawerLabel.set('');
    this.mediaDrawerFile = null;
  }

  submitMediaUploadDrawer(): void {
    const actifId = this.mediaDrawerActifId();
    const type = this.mediaDrawerType();
    const libelle = this.mediaDrawerLabel().trim();
    const file = this.mediaDrawerFile;

    if (!actifId || !file || !libelle) {
      this.toast.error('Veuillez renseigner le libellé et sélectionner un fichier.');
      return;
    }

    const fd = new FormData();
    fd.append('type', 'GARANTIE');
    fd.append('element', String(actifId));
    fd.append('libelle', libelle);
    fd.append('description', '');

    this.isUploadingMedia.set(true);
    if (type === 'image') {
      fd.append('photo', file);
      this.creditService.uploadImageGarantie(fd).subscribe({
        next: () => {
          this.toast.success('Image ajoutée.');
          this.isUploadingMedia.set(false);
          this.closeMediaUploadDrawer();
          this.loadData();
        },
        error: () => {
          this.toast.error("Erreur lors de l'upload.");
          this.isUploadingMedia.set(false);
        },
      });
      return;
    }

    fd.append('file', file);
    this.creditService.uploadDocumentGarantie(fd).subscribe({
      next: () => {
        this.toast.success('Document ajouté.');
        this.isUploadingMedia.set(false);
        this.closeMediaUploadDrawer();
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'upload.");
        this.isUploadingMedia.set(false);
      },
    });
  }

  onMediaFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.mediaTarget) return;
    const { actifId, type, libelle } = this.mediaTarget;

    const fd = new FormData();
    fd.append('type', 'GARANTIE');
    fd.append('element', String(actifId));
    fd.append('libelle', libelle);
    fd.append('description', '');

    this.isUploadingMedia.set(true);
    if (type === 'image') {
      fd.append('photo', file);
      this.creditService.uploadImageGarantie(fd).subscribe({
        next: () => {
          this.toast.success('Image ajoutée.');
          this.isUploadingMedia.set(false);
          this.loadData();
        },
        error: () => {
          this.toast.error("Erreur lors de l'upload.");
          this.isUploadingMedia.set(false);
        },
      });
    } else {
      fd.append('file', file);
      this.creditService.uploadDocumentGarantie(fd).subscribe({
        next: () => {
          this.toast.success('Document ajouté.');
          this.isUploadingMedia.set(false);
          this.loadData();
        },
        error: () => {
          this.toast.error("Erreur lors de l'upload.");
          this.isUploadingMedia.set(false);
        },
      });
    }
    input.value = '';
    this.mediaTarget = null;
  }

  openMediaDelete(type: 'image' | 'doc', id: number, label: string) {
    this.mediaDeleteTarget = { type, id, label };
    this.mediaDeleteDialogOpen = true;
  }

  confirmMediaDelete() {
    if (!this.mediaDeleteTarget) return;
    const { type, id } = this.mediaDeleteTarget;
    this.mediaDeleteDialogOpen = false;
    this.isDeletingMedia.set(true);

    const obs$ =
      type === 'image'
        ? this.creditService.deleteImageCaution(id)
        : this.creditService.deleteDocumentCaution(id);

    obs$.subscribe({
      next: () => {
        this.toast.success('Supprimé avec succès.');
        this.isDeletingMedia.set(false);
        this.mediaDeleteTarget = null;
        this.loadData();
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression.');
        this.isDeletingMedia.set(false);
      },
    });
  }

  openLightbox(images: { lien?: string; libelle?: string }[], index: number) {
    this.lightboxImages = images.map((img) => ({
      url: DOC_BASE_URL + (img.lien ?? ''),
      label: img.libelle,
    }));
    this.lightboxIndex = index;
    this.lightboxOpen = true;
  }

  mediaUrl(lien: string): string {
    return DOC_BASE_URL + lien;
  }

  // ── Actifs circulants (Stocks) ─────────────────────────────────────────
  openAddStock() {
    this.editingStockId.set(null);
    this.stockForm.reset({ description: '', quantite: null, prix: null, assurStock: '', garantie: '' });
    this.stockDrawerOpen = true;
  }

  openEditStock(s: CreditActifCirculantStock) {
    this.editingStockId.set(s.id ?? null);
    this.stockForm.patchValue({
      description: s.description ?? '',
      quantite: s.quantite ?? null,
      prix: s.prix ?? null,
      assurStock: s.assurStock != null ? String(s.assurStock) : '',
      garantie: s.garantie != null ? String(s.garantie) : '',
    });
    this.stockDrawerOpen = true;
  }

  saveStock() {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }
    const val = this.stockForm.value;
    const quantite = val.quantite ?? 0;
    const prix = val.prix ?? 0;
    const editId = this.editingStockId();
    this.isSavingStock.set(true);
    this.creditService.saveActifCirculantStock({
      actifCirculantStock: editId ?? undefined,
      description: val.description,
      quantite,
      prix,
      cout: quantite * prix,
      assurStock: val.assurStock != null ? Number(val.assurStock) : null,
      garantie: val.garantie != null ? Number(val.garantie) : null,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success(editId ? 'Stock modifié.' : 'Stock enregistré.');
        this.stockDrawerOpen = false;
        this.isSavingStock.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingStock.set(false);
      },
    });
  }

  openDeleteStock(stock: CreditActifCirculantStock) {
    this.stockToDelete = stock;
    this.stockDeleteDialogOpen = true;
  }

  confirmDeleteStock() {
    if (!this.stockToDelete?.id) return;
    this.stockDeleteDialogOpen = false;
    this.isDeletingStock.set(true);
    this.creditService.deleteActifCirculantStock(this.stockToDelete.id).subscribe({
      next: () => {
        this.toast.success('Stock supprimé.');
        this.isDeletingStock.set(false);
        this.stockToDelete = null;
        this.loadData();
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression.');
        this.isDeletingStock.set(false);
      },
    });
  }
}
