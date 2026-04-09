import { Component, OnInit, inject, input, output, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  AlertCircle,
  UserCheck,
  FileText,
  Upload,
  Search,
  Edit,
  Image,
  FilePlus,
  Camera,
  Eye,
  Download,
  UserIcon,
  ChevronDown,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
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
import { Dropdown } from '@/shared/components/dropdown/dropdown.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect } from '@/shared/components/form-select/form-select.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../../services/credit/credit.service';
import { CautionSolidaire } from '../../../../interfaces/credit.interface';
import { DatePipe } from '@angular/common';
import { CAUTION_IMAGE_TYPES, CAUTION_DOCUMENT_TYPES } from '../../../../constants/caution-documents';
import { LightboxComponent, LightboxImage } from '@/shared/components/lightbox/lightbox.component';
import { DropdownItem } from '@/shared/components/dropdown/dropdown.interface';

const DOC_BASE_URL = 'https://crm-fichiers.creditaccess.ci/crm/credit-ca/';

type DocRow = {
  id?: number;
  libelle?: string;
  document?: string;
  createdAt?: string;
  user?: { nomPrenom?: string };
};

@Component({
  selector: 'app-cautions-section',
  templateUrl: './cautions-section.component.html',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
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
    Dropdown,
    FormInput,
    FormSelect,
    DatePipe,
    LightboxComponent,
  ],
})
export class CautionsSectionComponent implements OnInit {
  ref          = input<string>('');
  isGP         = input<boolean>(false);
  canAddOrUpload = input<boolean>(false);
  canEditDelete = input<boolean>(false);
  canEditPhoto = input<boolean>(false);
  view         = input<'cautions' | 'documents' | 'both'>('both');
  prefilledDoc = input<{ libelle: string; version: number } | null>(null);
  readonly docsChanged = output<void>();

  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
  readonly AlertCircleIcon = AlertCircle;
  readonly UserIcon = UserIcon;
  readonly FileTextIcon = FileText;
  readonly UploadIcon = Upload;
  readonly SearchIcon = Search;
  readonly EditIcon = Edit;
  readonly ImageIcon = Image;
  readonly FilePlusIcon = FilePlus;
  readonly CameraIcon = Camera;
  readonly EyeIcon = Eye;
  readonly DownloadIcon = Download;
  readonly UserCheckIcon = UserCheck;
  readonly ChevronDownIcon = ChevronDown;

  // Types de documents
  readonly imageTypes = CAUTION_IMAGE_TYPES;
  readonly documentTypes = CAUTION_DOCUMENT_TYPES;
  
  // Dropdown items (pre-computed to avoid .map() in template)
  readonly imageTypesDropdown = CAUTION_IMAGE_TYPES.map(t => ({ 
    label: t.libelle, 
    required: t.obligation 
  }));

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly cautions = signal<CautionSolidaire[]>([]);
  readonly documents = signal<DocRow[]>([]);
  readonly documentsFiltered = signal<DocRow[]>([]);
  readonly searchQuery = signal('');
  readonly expandedImages = signal<number[]>([]); // Indices des cautions avec images visibles
  readonly expandedDocuments = signal<number[]>([]); // Indices des cautions avec documents visibles

  // Caution drawer
  cautionDrawerOpen = false;
  readonly isSavingCaution = signal(false);
  editingCautionId: number | null = null; // Pour différencier ajout vs modification

  // Document upload drawer
  docDrawerOpen = false;
  readonly isUploadingDoc = signal(false);
  selectedFile: File | null = null;
  readonly docLibelle = signal('');

  // Delete
  deleteDialogOpen = false;
  deleteTarget: {
    type: 'caution' | 'image' | 'doc';
    id: number;
    label: string;
  } | null = null;
  readonly isDeleting = signal(false);

  // ── Référentiels ────────────────────────────────────────────────────────
  readonly paysListe = signal<{ id: number; nationalite: string }[]>([]);
  readonly villesListe = signal<{ id: number; libelle: string }[]>([]);
  readonly communesListe = signal<{ id: number; libelle: string }[]>([]);

  // ── Options statiques ──────────────────────────────────────────────────
  readonly SITUATION_MATRI: Record<string | number, string> = {
    1: 'Célibataire', 2: 'Concubinage', 3: 'Marié(e)', 4: 'Divorcé', 5: 'Veuf / Veuve',
  };

  readonly TYPE_PIECE: Record<string | number, string> = {
    1: 'CNI', 2: 'PASSEPORT', 3: 'CARTE CONSULAIRE',
    4: 'PERMIS DE CONDUIRE', 5: "ATTESTATION D'IDENTITÉ", 6: 'CARTE DE RÉSIDENT',
  };

  readonly genreOptions = [
    { value: 'Feminin', label: 'Féminin' },
    { value: 'Masculin', label: 'Masculin' },
  ];

  readonly situationMatriOptions = Object.entries(this.SITUATION_MATRI).map(([value, label]) => ({ value, label }));

  readonly typePieceOptions = Object.entries(this.TYPE_PIECE).map(([value, label]) => ({ value, label }));

  situationMatriLabel(val: string | number | undefined): string {
    if (val == null) return '—';
    return this.SITUATION_MATRI[val] ?? String(val);
  }

  typePieceLabel(val: string | number | undefined): string {
    if (val == null) return '—';
    return this.TYPE_PIECE[val] ?? String(val);
  }

  // ── Lightbox ────────────────────────────────────────────────────────────
  lightboxOpen = false;
  lightboxImages: LightboxImage[] = [];
  lightboxIndex = 0;

  openLightbox(images: { lien?: string; libelle?: string }[], index: number) {
    this.lightboxImages = images.map(img => ({
      url: this.getMediaUrl(img.lien ?? ''),
      label: img.libelle,
    }));
    this.lightboxIndex = index;
    this.lightboxOpen = true;
  }

  // ── Upload media caution (image/document) ─────────────────────────────
  /** Caution dont on est en train d'uploader un média */
  mediaCautionTarget: { id: number; type: 'image' | 'doc'; libelle?: string } | null = null;
  readonly isUploadingMedia = signal(false);

  // ── Forms ──────────────────────────────────────────────────────────────
  readonly cautionForm = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    dateNaissance: ['', Validators.required],
    lieuNaissance: ['', Validators.required],
    genre: [null as string | null, Validators.required],
    situationMatri: [null as string | null],
    contact: ['', Validators.required],
    typePiece: [null as string | null, Validators.required],
    numPiece: ['', Validators.required],
    revenu: [null as number | null, Validators.required],
    justif: ['', Validators.required],
    nationalite: [null as number | null, Validators.required],
    profession: ['', Validators.required],
    ville: [null as number | null, Validators.required],
    commune: [null as number | null, Validators.required],
    quartier: ['', Validators.required],
    rue: [''],
  });

  // ── Constructor ────────────────────────────────────────────────────────
  constructor() {
    effect(() => {
      const d = this.prefilledDoc();
      if (d) this.openUploadDoc(d.libelle);
    });
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadData();
    this.loadReferentiels();
  }

  private loadReferentiels() {
    this.creditService.getPaysCommuneData().subscribe({
      next: (data) => {
        this.paysListe.set(data.pays ?? []);
        this.villesListe.set(data.villes ?? []);
        this.communesListe.set(data.communes ?? []);
      },
    });
  }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);

    if (this.isGP()) {
      // GP : Charger seulement les documents
      this.creditService.getDocuments(this.ref()).subscribe({
        next: (docs) => {
          this.documents.set(docs);
          this.documentsFiltered.set(docs);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Impossible de charger les documents.');
          this.isLoading.set(false);
        },
      });
    } else {
      // Non-GP : Charger cautions + documents depuis getGarantiesDemande
      this.creditService.getGarantiesDemande(this.ref()).subscribe({
        next: (data) => {
          if (!data) {
            this.error.set('Données du dossier introuvables.');
            this.isLoading.set(false);
            return;
          }
          this.cautions.set(data.crCaution ?? []);

          // Charger les documents annexes séparément
          this.creditService.getDocuments(this.ref()).subscribe({
            next: (docs) => {
              this.documents.set(docs);
              this.documentsFiltered.set(docs);
              this.isLoading.set(false);
            },
            error: () => {
              // Pas grave si les documents ne chargent pas, on a au moins les cautions
              this.isLoading.set(false);
            },
          });
        },
        error: (err) => {
          console.error('❌ Erreur chargement garanties:', err);
          this.error.set('Impossible de charger les données du dossier.');
          this.isLoading.set(false);
        },
      });
    }
  }

  filterDocuments(query: string) {
    this.searchQuery.set(query);
    const q = query.toLowerCase().trim();
    if (!q) {
      this.documentsFiltered.set(this.documents());
    } else {
      this.documentsFiltered.set(
        this.documents().filter((doc) => doc.libelle?.toLowerCase().includes(q)),
      );
    }
  }

  formatMontant(n: number | undefined): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  }

  // ── Cautions ───────────────────────────────────────────────────────────
  openAddCaution() {
    this.editingCautionId = null;
    this.cautionForm.reset();
    this.cautionDrawerOpen = true;
  }

  openEditCaution(caution: CautionSolidaire) {
    const dateNaissance = caution.dateNaissance
      ? String(caution.dateNaissance).substring(0, 10)
      : '';
    this.editingCautionId = caution.id!;
    this.cautionForm.patchValue({
      nom: caution.nom,
      prenom: caution.prenom,
      dateNaissance,
      lieuNaissance: caution.lieuNaissance,
      genre: caution.genre,
      situationMatri: caution.situationMatri?.toString(),
      contact: caution.contact || caution.telephone,
      typePiece: caution.typePiece?.toString(),
      numPiece: caution.numPiece,
      revenu: caution.revenu,
      justif: caution.justif,
      nationalite:
        typeof caution.nationalite === 'object' ? caution.nationalite?.id : caution.nationalite,
      profession: caution.profession,
      ville: typeof caution.ville === 'object' ? caution.ville?.id : caution.ville,
      commune: typeof caution.commune === 'object' ? caution.commune?.id : caution.commune,
      quartier: caution.quartier,
      rue: caution.rue,
    });
    this.cautionDrawerOpen = true;
  }

  drawerTitle(): string {
    return this.editingCautionId ? 'Modifier une caution solidaire' : 'Ajouter une caution solidaire';
  }

  getPhotoUrl(photoProfil: string): string {
    return DOC_BASE_URL + photoProfil;
  }

  getMediaUrl(path: string): string {
    return DOC_BASE_URL + path;
  }

  toggleImages(index: number) {
    const current = this.expandedImages();
    if (current.includes(index)) {
      this.expandedImages.set(current.filter((i) => i !== index));
    } else {
      this.expandedImages.set([...current, index]);
    }
  }

  toggleDocuments(index: number) {
    const current = this.expandedDocuments();
    if (current.includes(index)) {
      this.expandedDocuments.set(current.filter((i) => i !== index));
    } else {
      this.expandedDocuments.set([...current, index]);
    }
  }

  onPhotoChange(event: Event, cautionId: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('refDemande', this.ref());
    fd.append('crCaution', String(cautionId));
    fd.append('photoProfil', file);
    this.creditService.uploadPhotoCaution(fd).subscribe({
      next: () => { this.toast.success('Photo mise à jour.'); this.loadData(); },
      error: () => this.toast.error('Erreur lors de la mise à jour de la photo.'),
    });
  }

  triggerImageUpload(cautionId: number, libelle: string, inputEl: HTMLInputElement) {
    this.mediaCautionTarget = { id: cautionId, type: 'image', libelle };
    inputEl.click();
  }

  triggerDocUpload(cautionId: number, libelle: string, inputEl: HTMLInputElement) {
    this.mediaCautionTarget = { id: cautionId, type: 'doc', libelle };
    inputEl.click();
  }

  private hasMediaByLibelle(
    media: { libelle?: string }[] | undefined,
    libelle: string,
  ): boolean {
    const normalized = libelle.trim().toLowerCase();
    return (media ?? []).some((m) => (m.libelle ?? '').trim().toLowerCase() === normalized);
  }

  cautionDocumentItems(caution: CautionSolidaire): DropdownItem[] {
    return this.documentTypes.map((t) => ({
      label: t.libelle,
      required: t.obligation,
      disabled: this.hasMediaByLibelle(caution.documents, t.libelle),
    }));
  }

  onMediaFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.mediaCautionTarget) return;
    const { id, type, libelle } = this.mediaCautionTarget;
    const fd = new FormData();
    fd.append('type', 'CAUTION');
    fd.append('element', String(id));
    fd.append('libelle', libelle || file.name.replace(/\.[^/.]+$/, ''));
    fd.append('description', '');
    if (type === 'image') {
      fd.append('photo', file);
      this.isUploadingMedia.set(true);
      this.creditService.uploadImageGarantie(fd).subscribe({
        next: () => { this.toast.success('Image ajoutée.'); this.isUploadingMedia.set(false); this.loadData(); },
        error: () => { this.toast.error("Erreur lors de l'upload."); this.isUploadingMedia.set(false); },
      });
    } else {
      fd.append('file', file);
      this.isUploadingMedia.set(true);
      this.creditService.uploadDocumentGarantie(fd).subscribe({
        next: () => { this.toast.success('Document ajouté.'); this.isUploadingMedia.set(false); this.loadData(); },
        error: () => { this.toast.error("Erreur lors de l'upload."); this.isUploadingMedia.set(false); },
      });
    }
    input.value = '';
    this.mediaCautionTarget = null;
  }

  saveCaution() {
    if (this.cautionForm.invalid) {
      this.cautionForm.markAllAsTouched();
      this.toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const val = this.cautionForm.value;
    this.isSavingCaution.set(true);
    this.creditService
      .saveCautionSolidaire({
        refDemande: this.ref(),
        crCaution: this.editingCautionId ?? null,
        nom: val.nom,
        prenom: val.prenom,
        dateNaissance: val.dateNaissance,
        lieuNaissance: val.lieuNaissance,
        genre: val.genre,
        situationMatri: val.situationMatri || null,
        contact: val.contact,
        typePiece: val.typePiece,
        numPiece: val.numPiece,
        revenu: val.revenu,
        justif: val.justif,
        nationalite: val.nationalite,
        profession: val.profession,
        ville: val.ville,
        commune: val.commune,
        quartier: val.quartier,
        rue: val.rue || null,
      })
      .subscribe({
        next: () => {
          this.toast.success('Caution enregistrée.');
          this.cautionDrawerOpen = false;
          this.isSavingCaution.set(false);
          this.loadData();
        },
        error: () => {
          this.toast.error("Erreur lors de l'enregistrement.");
          this.isSavingCaution.set(false);
        },
      });
  }

  // ── Documents ──────────────────────────────────────────────────────────
  openUploadDoc(libelle = '') {
    this.docLibelle.set(libelle);
    this.selectedFile = null;
    this.docDrawerOpen = true;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadDocument() {
    if (!this.selectedFile || !this.docLibelle().trim()) return;
    const fd = new FormData();
    fd.append('refDemande', this.ref());
    fd.append('libelle', this.docLibelle().trim());
    fd.append('document', this.selectedFile);
    this.isUploadingDoc.set(true);

    const upload$ = this.isGP()
      ? this.creditService.uploadDocument(fd)
      : this.creditService.uploadDocumentAnalyse(fd);

    upload$.subscribe({
      next: () => {
        this.toast.success('Document ajouté.');
        this.docDrawerOpen = false;
        this.isUploadingDoc.set(false);
        this.selectedFile = null;
        this.docsChanged.emit();
        this.docLibelle.set('');
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'upload.");
        this.isUploadingDoc.set(false);
      },
    });
  }

  downloadDocument(filename: string, libelle: string) {
    const a = document.createElement('a');
    a.href = DOC_BASE_URL + filename;
    a.target = '_blank';
    a.download = libelle;
    a.click();
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  openDelete(type: 'caution' | 'image' | 'doc', id: number, label: string) {
    this.deleteTarget = { type, id, label };
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    const { type, id } = this.deleteTarget;
    this.deleteDialogOpen = false;
    this.isDeleting.set(true);

    let obs$;
    if (type === 'caution') {
      obs$ = this.creditService.deleteCautionSolidaire(id);
    } else if (type === 'image') {
      obs$ = this.creditService.deleteImageCaution(id);
    } else {
      // 'doc' → document lié à une caution
      obs$ = this.creditService.deleteDocumentCaution(id);
    }

    obs$.subscribe({
      next: () => {
        this.toast.success('Supprimé avec succès.');
        this.isDeleting.set(false);
        this.deleteTarget = null;
        this.docsChanged.emit();
        this.loadData();
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression.');
        this.isDeleting.set(false);
      },
    });
  }
}
