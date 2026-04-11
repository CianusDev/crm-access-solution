import { AuthService } from '@/core/services/auth/auth.service';
import { ToastService } from '@/core/services/toast/toast.service';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import {
  DialogComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
} from '@/shared/components/dialog/dialog.component';
import {
  DrawerComponent,
  DrawerContentComponent,
  DrawerFooterComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
} from '@/shared/components/drawer/drawer.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Download,
  Eye,
  FileText,
  LucideAngularModule,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-angular';
import { CreditDocumentAnnexe } from '../../../../interfaces/credit.interface';
import { CreditService } from '../../../../services/credit/credit.service';

const DOC_BASE_URL = 'https://crm-fichiers.creditaccess.ci/crm/credit-ca/';

// Types de documents disponibles
const DOCUMENT_TYPES = [
  { libelle: 'Contrat de prêt', obligation: true },
  { libelle: 'Attestation de domicile', obligation: false },
  { libelle: 'Facture proforma', obligation: false },
  { libelle: 'Relevé bancaire', obligation: false },
  { libelle: 'Autre document', obligation: false },
];

@Component({
  selector: 'app-documents-section',
  templateUrl: './documents-section.component.html',
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
  ],
})
export class DocumentsSectionComponent implements OnInit {
  ref = input<string>('');
  canManage = input<boolean>(true);
  readonly docsChanged = output<void>();

  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
  readonly FileTextIcon = FileText;
  readonly UploadIcon = Upload;
  readonly SearchIcon = Search;
  readonly DownloadIcon = Download;
  readonly EyeIcon = Eye;

  readonly documentTypes = DOCUMENT_TYPES;
  readonly documentTypesDropdown = DOCUMENT_TYPES.map((t) => ({
    label: t.libelle,
    required: t.obligation,
  }));

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly documents = signal<CreditDocumentAnnexe[]>([]);
  readonly documentsFiltered = signal<CreditDocumentAnnexe[]>([]);
  readonly searchQuery = signal('');

  readonly isOwner = (userId?: number) => {
    const user = this.authService.currentUser();
    return user && user.id === userId;
  };
  // Document upload drawer
  docDrawerOpen = false;
  readonly isUploadingDoc = signal(false);
  selectedFile: File | null = null;
  readonly docLibelle = signal('');

  // Delete
  deleteDialogOpen = false;
  deleteTarget: { id: number; label: string } | null = null;
  readonly isDeleting = signal(false);

  // Form
  docForm = this.fb.group({
    libelle: ['', Validators.required],
    description: [''],
  });

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.isLoading.set(true);
    this.error.set(null);

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
  }

  // ── Search ─────────────────────────────────────────────────────────────
  onSearchChange(query: string) {
    this.searchQuery.set(query);
    const q = query.toLowerCase().trim();
    if (!q) {
      this.documentsFiltered.set(this.documents());
      return;
    }
    this.documentsFiltered.set(
      this.documents().filter(
        (d) =>
          d.libelle?.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.user?.nomPrenom?.toLowerCase().includes(q),
      ),
    );
  }

  // ── Upload Document ────────────────────────────────────────────────────
  openAddDocument(libelle?: string) {
    if (!this.canManage()) return;
    this.docForm.reset();
    if (libelle) {
      this.docForm.patchValue({ libelle });
      this.docLibelle.set(libelle);
    } else {
      this.docLibelle.set('');
    }
    this.selectedFile = null;
    this.docDrawerOpen = true;
  }

  onDocFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.toast.error('Seuls les fichiers PDF sont autorisés.');
        return;
      }
      this.selectedFile = file;
    }
  }

  uploadDocument() {
    if (!this.canManage()) return;
    if (!this.docForm.valid || !this.selectedFile) {
      this.toast.error('Veuillez remplir tous les champs requis et sélectionner un fichier.');
      return;
    }

    this.isUploadingDoc.set(true);

    const formData = new FormData();
    formData.append('refDemande', this.ref());
    formData.append('libelle', this.docForm.value.libelle!);
    formData.append('description', this.docForm.value.description || '');
    formData.append('document', this.selectedFile);

    this.creditService.uploadDocument(formData).subscribe({
      next: () => {
        this.toast.success('Document ajouté avec succès.');
        this.docDrawerOpen = false;
        this.loadDocuments();
        this.docsChanged.emit();
        this.isUploadingDoc.set(false);
      },
      error: () => {
        this.toast.error("Erreur lors de l'ajout du document.");
        this.isUploadingDoc.set(false);
      },
    });
  }

  // ── Delete Document ────────────────────────────────────────────────────
  openDeleteDocument(id: number, libelle: string) {
    if (!this.canManage()) return;
    this.deleteTarget = { id, label: libelle };
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.canManage()) return;
    if (!this.deleteTarget) return;

    this.isDeleting.set(true);
    this.creditService.deleteDocument(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Document supprimé avec succès.');
        this.deleteDialogOpen = false;
        this.deleteTarget = null;
        this.loadDocuments();
        this.docsChanged.emit();
        this.isDeleting.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression du document.');
        this.isDeleting.set(false);
      },
    });
  }

  // ── Utilities ──────────────────────────────────────────────────────────
  getDocumentUrl(doc: CreditDocumentAnnexe): string {
    return DOC_BASE_URL + doc.document;
  }

  downloadDocument(doc: CreditDocumentAnnexe) {
    const url = this.getDocumentUrl(doc);
    window.open(url, '_blank');
  }

  viewDocument(doc: CreditDocumentAnnexe) {
    const url = this.getDocumentUrl(doc);
    window.open(url, '_blank');
  }
}
