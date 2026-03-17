import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  ChevronLeft,
  User,
  Building2,
  FileText,
  Clock,
  Paperclip,
  Upload,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Calendar,
  TrendingUp,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { ToastService } from '@/core/services/toast/toast.service';
import { PermissionService } from '@/core/services/permission/permission.service';
import { CreditService } from '../../services/credit/credit.service';
import {
  CREDIT_STATUTS,
  CreditDocumentAnnexe,
  CreditFiche,
  CreditObservation,
} from '../../interfaces/credit.interface';

type TabId = 'details' | 'documents' | 'historique';

@Component({
  selector: 'app-fiche-credit',
  templateUrl: './fiche-credit.component.html',
  imports: [
    FormsModule,
    DatePipe,
    DecimalPipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    ButtonDirective,
  ],
})
export class FicheCreditComponent implements OnInit {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly UserIcon = User;
  readonly Building2Icon = Building2;
  readonly FileTextIcon = FileText;
  readonly ClockIcon = Clock;
  readonly PaperclipIcon = Paperclip;
  readonly UploadIcon = Upload;
  readonly Trash2Icon = Trash2;
  readonly DownloadIcon = Download;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly RefreshIcon = RefreshCw;
  readonly CreditCardIcon = CreditCard;
  readonly CalendarIcon = Calendar;
  readonly TrendingUpIcon = TrendingUp;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);
  readonly permissions = inject(PermissionService);

  // ── State ──────────────────────────────────────────────────────────────
  readonly ref = signal('');
  readonly activeTab = signal<TabId>('details');

  readonly isLoading = signal(false);
  readonly fiche = signal<CreditFiche | null>(null);
  readonly error = signal<string | null>(null);

  readonly isLoadingDocs = signal(false);
  readonly documents = signal<CreditDocumentAnnexe[]>([]);

  readonly isLoadingObs = signal(false);
  readonly observations = signal<CreditObservation[]>([]);

  readonly isUploadingDoc = signal(false);
  readonly deletingDocId = signal<number | null>(null);

  // Upload form
  readonly docLibelle = signal('');
  readonly docDescription = signal('');
  selectedFile: File | null = null;

  // ── Computed ───────────────────────────────────────────────────────────
  readonly demande = computed(() => this.fiche()?.demande ?? null);
  readonly decision = computed(() => this.fiche()?.decision ?? null);
  readonly pret = computed(() => this.fiche()?.pret ?? null);
  readonly isPersonneMorale = computed(() => this.demande()?.client?.typeAgent !== 'PP');
  readonly statuts = CREDIT_STATUTS;

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    const ref = this.route.snapshot.paramMap.get('ref') ?? '';
    this.ref.set(ref);
    this.loadFiche();
    this.loadDocuments();
    this.loadObservations();
  }

  // ── Chargements ────────────────────────────────────────────────────────
  private loadFiche() {
    this.isLoading.set(true);
    this.error.set(null);
    this.creditService.getFicheCredit(this.ref()).subscribe({
      next: (data) => {
        this.fiche.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le dossier.');
        this.isLoading.set(false);
      },
    });
  }

  private loadDocuments() {
    this.isLoadingDocs.set(true);
    this.creditService.getDocuments(this.ref()).subscribe({
      next: (docs) => {
        this.documents.set(docs);
        this.isLoadingDocs.set(false);
      },
      error: () => this.isLoadingDocs.set(false),
    });
  }

  private loadObservations() {
    this.isLoadingObs.set(true);
    this.creditService.getObservations(this.ref()).subscribe({
      next: (obs) => {
        this.observations.set(obs);
        this.isLoadingObs.set(false);
      },
      error: () => this.isLoadingObs.set(false),
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────
  goBack() {
    this.router.navigate(['/app/credit/list']);
  }

  refresh() {
    this.loadFiche();
    this.loadDocuments();
    this.loadObservations();
  }

  switchTab(tab: string) {
    this.activeTab.set(tab as TabId);
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
    fd.append('description', this.docDescription().trim());
    fd.append('document', this.selectedFile);

    this.isUploadingDoc.set(true);
    this.creditService.uploadDocument(fd).subscribe({
      next: () => {
        this.toast.success('Document ajouté avec succès.');
        this.docLibelle.set('');
        this.docDescription.set('');
        this.selectedFile = null;
        this.isUploadingDoc.set(false);
        this.loadDocuments();
      },
      error: () => {
        this.toast.error("Erreur lors de l'ajout du document.");
        this.isUploadingDoc.set(false);
      },
    });
  }

  deleteDocument(doc: CreditDocumentAnnexe) {
    this.deletingDocId.set(doc.id);
    this.creditService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.toast.success('Document supprimé.');
        this.deletingDocId.set(null);
        this.loadDocuments();
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression.');
        this.deletingDocId.set(null);
      },
    });
  }

  downloadDocument(url: string, libelle: string) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = libelle;
    a.click();
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  statutLabel(statut: number): string {
    return this.statuts[statut]?.label ?? `Statut ${statut}`;
  }

  statutVariant(statut: number) {
    return this.statuts[statut]?.variant ?? 'default';
  }

  initiales(nom: string): string {
    return nom
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  formatMontant(n: number | undefined): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  }
}
