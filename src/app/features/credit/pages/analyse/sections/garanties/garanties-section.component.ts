import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Trash2,
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
  TypeActif,
} from '../../../../interfaces/credit.interface';
import { LightboxComponent, LightboxImage } from '@/shared/components/lightbox/lightbox.component';
import { DocumentType } from '../../../../constants/caution-documents';
import {
  getGarantieImageTypes,
  getGarantieDocumentTypes,
} from '../../../../constants/garantie-documents';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';

const DOC_BASE_URL = 'https://crm-fichiers.creditaccess.ci/crm/credit-ca/';

const TYPES_ACTIF: SelectOption[] = [
  { value: 'IMMOBILIER', label: 'Bien immobilier' },
  { value: 'VEHICULE', label: 'Véhicule' },
  { value: 'EQUIPEMENT', label: 'Équipement / Matériel' },
  { value: 'DAT', label: 'Dépôt à terme (DAT)' },
  { value: 'BIEN_MOBILIER', label: 'Biens mobiliers famille' },
  { value: 'AUTRE', label: 'Autre actif' },
];

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
    LightboxComponent,
  ],
})
export class GarantiesSectionComponent implements OnInit {
  ref = input<string>('');

  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
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

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  readonly typesActifOptions = TYPES_ACTIF;
  readonly typesProprieteOptions = TYPES_PROPRIETE;
  readonly typesVehiculeOptions = TYPES_VEHICULE;
  readonly typesProPersoOptions = TYPES_PRO_PERSO;
  readonly ouiNonOptions = OUI_NON;
  readonly jutifsOptions = JUSTIFS_OPTIONS;

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly actifs = signal<ActifGarantie[]>([]);
  readonly cautions = signal<CautionSolidaire[]>([]);
  readonly stocks = signal<CreditActifCirculantStock[]>([]);

  readonly totalStocks = computed(() =>
    this.stocks().reduce((s, item) => s + (item.cout ?? 0), 0),
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
  readonly autres = computed(() => this.actifs().filter((a) => a.type === 'AUTRE'));

  readonly totalValeur = computed(() =>
    this.actifs().reduce((s, a) => s + (a.valeurEstimee ?? 0), 0),
  );

  // Drawer
  actifDrawerOpen = false;
  selectedType = signal<TypeActif | null>(null);
  nouvelleAcquisition = signal<number | null>(null);
  readonly isSaving = signal(false);

  // Delete actif
  deleteDialogOpen = false;
  actifToDelete: ActifGarantie | null = null;
  readonly isDeleting = signal(false);

  // Stock actif circulant
  stockDrawerOpen = false;
  readonly isSavingStock = signal(false);
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

  // ── Form ───────────────────────────────────────────────────────────────
  readonly actifForm = this.fb.group({
    type: ['' as TypeActif | '', Validators.required],
    valeurEstimee: [null as number | null, Validators.required],
    // Commun à plusieurs types
    proprietaire: [''],
    garantie: [null as number | null],
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
    miniComm: [null as number | null],
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
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les données du dossier.');
        this.isLoading.set(false);
      },
    });
    this.creditService.getAnalyseFinanciere(this.ref()).subscribe({
      next: (data) => {
        if (!data?.demande) return;
        this.actifs.set(data.demande.actifsGaranties ?? []);
      },
      error: () => {},
    });
  }

  formatMontant(n: number | undefined): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  typeLabel(type: TypeActif | undefined): string {
    return TYPES_ACTIF.find((t) => t.value === type)?.label ?? type ?? '—';
  }

  // ── CRUD ───────────────────────────────────────────────────────────────
  openAdd(preselect?: TypeActif, nouvelleAcquisition?: number) {
    this.actifForm.reset({
      type: preselect ?? '',
      valeurEstimee: null,
      // Commun
      proprietaire: '',
      garantie: null,
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
      miniComm: null,
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
      // Propriétaire
      idCaution: null,
    });
    this.selectedType.set(preselect ?? null);
    this.nouvelleAcquisition.set(nouvelleAcquisition ?? null);
    this.isProprietaireCaution.set(false);
    this.isSocieteCr.set(false);
    this.actifDrawerOpen = true;
  }

  save() {
    if (this.actifForm.invalid) {
      this.actifForm.markAllAsTouched();
      return;
    }
    const val = this.actifForm.value;
    this.isSaving.set(true);
    this.creditService
      .saveActifGarantie({
        type: val.type,
        valeurEstimee: val.valeurEstimee,
        // Commun
        proprietaire: val.proprietaire || null,
        garantie: val.garantie != null ? Number(val.garantie) : null,
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
        miniComm: val.miniComm != null ? Number(val.miniComm) : null,
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
        // Propriétaire
        idCaution: val.idCaution != null ? Number(val.idCaution) : null,
        refDemande: this.ref(),
      })
      .subscribe({
        next: () => {
          this.toast.success('Actif enregistré.');
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
    this.stockForm.reset({ description: '', quantite: null, prix: null, assurStock: '', garantie: '' });
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
    this.isSavingStock.set(true);
    this.creditService.saveActifCirculantStock({
      description: val.description,
      quantite,
      prix,
      cout: quantite * prix,
      assurStock: val.assurStock != null ? Number(val.assurStock) : null,
      garantie: val.garantie != null ? Number(val.garantie) : null,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Stock enregistré.');
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
