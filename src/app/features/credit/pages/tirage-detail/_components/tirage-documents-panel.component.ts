import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, FileText, Trash2, Upload, ExternalLink, FilePlus } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../services/credit/credit.service';
import { CreditDocumentAnnexe } from '../../../interfaces/credit.interface';

const FILE_BASE = 'https://crm-fichiers.creditaccess.ci/crm/credit/';

@Component({
  selector: 'app-tirage-documents-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tirage-documents-panel.component.html',
  imports: [
    DatePipe,
    FormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogFooterComponent,
    ButtonDirective,
  ],
})
export class TirageDocumentsPanelComponent {
  readonly FileTextIcon = FileText;
  readonly Trash2Icon = Trash2;
  readonly UploadIcon = Upload;
  readonly ExternalLinkIcon = ExternalLink;
  readonly FilePlusIcon = FilePlus;

  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  readonly ref = input.required<string>();
  readonly documents = signal<CreditDocumentAnnexe[]>([]);
  readonly canManage = input<boolean>(true);
  readonly currentUserId = input<number | null>(null);

  // Initialise depuis l'input parent via setter
  readonly documentsIn = input<CreditDocumentAnnexe[]>([]);
  readonly documentsChanged = output<CreditDocumentAnnexe[]>();

  constructor() {
    // Sync signal interne depuis l'input au démarrage
    // (une vraie sync réactive nécessiterait effect, mais
    //  ici on recharge depuis l'API après chaque mutation)
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  isUploading = false;
  uploadLibelle = '';
  selectedFile: File | null = null;
  showUploadForm = false;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    if (this.selectedFile && !this.uploadLibelle) {
      this.uploadLibelle = this.selectedFile.name.replace(/\.[^.]+$/, '');
    }
  }

  upload() {
    if (!this.canManage()) return;
    if (!this.selectedFile || !this.uploadLibelle.trim() || this.isUploading) return;

    const formData = new FormData();
    formData.append('refDemande', this.ref());
    formData.append('libelle', this.uploadLibelle.trim());
    formData.append('description', '');
    formData.append('document', this.selectedFile);

    this.isUploading = true;
    this.creditService.uploadDocument(formData).subscribe({
      next: () => {
        this.toast.success('Document ajouté avec succès.');
        this.showUploadForm = false;
        this.uploadLibelle = '';
        this.selectedFile = null;
        this.isUploading = false;
        this.reloadDocuments();
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'Erreur lors de l\'ajout du document.');
        this.isUploading = false;
      },
    });
  }

  cancelUpload() {
    this.showUploadForm = false;
    this.uploadLibelle = '';
    this.selectedFile = null;
  }

  // ── Suppression ───────────────────────────────────────────────────────────
  deleteDialogOpen = false;
  docToDelete: CreditDocumentAnnexe | null = null;
  isDeleting = false;

  confirmDelete(doc: CreditDocumentAnnexe) {
    if (!this.canDeleteDocument(doc)) return;
    this.docToDelete = doc;
    this.deleteDialogOpen = true;
  }

  executeDelete() {
    if (!this.docToDelete || !this.canDeleteDocument(this.docToDelete)) return;
    if (!this.docToDelete || this.isDeleting) return;
    this.isDeleting = true;
    this.creditService.deleteDocument(this.docToDelete.id).subscribe({
      next: () => {
        this.toast.success('Document supprimé.');
        this.deleteDialogOpen = false;
        this.docToDelete = null;
        this.isDeleting = false;
        this.reloadDocuments();
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'Erreur lors de la suppression.');
        this.isDeleting = false;
      },
    });
  }

  // ── Ouvrir document ───────────────────────────────────────────────────────
  openDoc(url: string) {
    window.open(FILE_BASE + url, '_blank');
  }

  // ── Rechargement ──────────────────────────────────────────────────────────
  private reloadDocuments() {
    this.creditService.getDocuments(this.ref()).subscribe({
      next: (docs) => {
        this.documents.set(docs);
        this.documentsChanged.emit(docs);
      },
    });
  }

  canDeleteDocument(doc: CreditDocumentAnnexe): boolean {
    const currentUserId = this.currentUserId();
    if (!currentUserId || !doc.userId) return false;
    return currentUserId === doc.userId;
  }

  // Exposer une méthode pour que le parent puisse initialiser
  setDocuments(docs: CreditDocumentAnnexe[]) {
    this.documents.set(docs);
  }
}
