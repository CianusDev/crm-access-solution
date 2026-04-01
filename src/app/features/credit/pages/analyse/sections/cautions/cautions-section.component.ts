import { Component, OnInit, inject, input, output, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  AlertCircle,
  UserCheck,
  FileText,
  Upload,
  Search,
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
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../../services/credit/credit.service';
import { CautionSolidaire } from '../../../../interfaces/credit.interface';

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
    DatePipe,
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
  ],
})
export class CautionsSectionComponent implements OnInit {
  ref       = input<string>('');
  isGP      = input<boolean>(false);
  prefilledDoc = input<{ libelle: string; version: number } | null>(null);
  readonly docsChanged = output<void>();

  readonly PlusIcon        = Plus;
  readonly Trash2Icon      = Trash2;
  readonly AlertCircleIcon = AlertCircle;
  readonly UserCheckIcon   = UserCheck;
  readonly FileTextIcon    = FileText;
  readonly UploadIcon      = Upload;
  readonly SearchIcon      = Search;

  private readonly fb            = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast         = inject(ToastService);

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error     = signal<string | null>(null);
  readonly cautions  = signal<CautionSolidaire[]>([]);
  readonly documents = signal<DocRow[]>([]);
  readonly documentsFiltered = signal<DocRow[]>([]);
  readonly searchQuery = signal('');

  // Caution drawer
  cautionDrawerOpen = false;
  readonly isSavingCaution = signal(false);

  // Document upload drawer
  docDrawerOpen = false;
  readonly isUploadingDoc = signal(false);
  selectedFile: File | null = null;
  readonly docLibelle = signal('');

  // Delete
  deleteDialogOpen = false;
  deleteTarget: { type: 'caution' | 'doc'; id: number; label: string } | null = null;
  readonly isDeleting = signal(false);

  // ── Forms ──────────────────────────────────────────────────────────────
  readonly cautionForm = this.fb.group({
    nom:            ['', Validators.required],
    prenom:         ['', Validators.required],
    telephone:      [''],
    profession:     [''],
    adresse:        [''],
    montantCaution: [null as number | null],
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
  }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);

    if (this.isGP()) {
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
      this.creditService.getAnalyseFinanciere(this.ref()).subscribe({
        next: (data) => {
          if (!data?.demande) {
            this.error.set('Données du dossier introuvables.');
            this.isLoading.set(false);
            return;
          }
          this.cautions.set(data.demande.cautionsSolidaires ?? []);
          this.documents.set(data.demande.documentsAnalyse ?? []);
          this.documentsFiltered.set(data.demande.documentsAnalyse ?? []);
          this.isLoading.set(false);
        },
        error: () => {
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
        this.documents().filter(doc => doc.libelle?.toLowerCase().includes(q))
      );
    }
  }

  formatMontant(n: number | undefined): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  }

  // ── Cautions ───────────────────────────────────────────────────────────
  openAddCaution() {
    this.cautionForm.reset({ nom: '', prenom: '', telephone: '', profession: '', adresse: '', montantCaution: null });
    this.cautionDrawerOpen = true;
  }

  saveCaution() {
    if (this.cautionForm.invalid) { this.cautionForm.markAllAsTouched(); return; }
    const val = this.cautionForm.value;
    this.isSavingCaution.set(true);
    this.creditService.saveCautionSolidaire({
      nom:            val.nom,
      prenom:         val.prenom,
      telephone:      val.telephone || null,
      profession:     val.profession || null,
      adresse:        val.adresse || null,
      montantCaution: val.montantCaution,
      refDemande:     this.ref(),
    }).subscribe({
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
  openDelete(type: 'caution' | 'doc', id: number, label: string) {
    this.deleteTarget = { type, id, label };
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    const { type, id } = this.deleteTarget;
    this.deleteDialogOpen = false;
    this.isDeleting.set(true);

    const obs$ = type === 'caution'
      ? this.creditService.deleteCautionSolidaire(id)
      : this.isGP()
        ? this.creditService.deleteDocument(id)
        : this.creditService.deleteDocumentAnalyse(id);

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
