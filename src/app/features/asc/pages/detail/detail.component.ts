import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import {
  LucideAngularModule,
  ArrowLeft,
  ExternalLink,
  User,
  FileText,
  CheckSquare,
  Square,
  AlertCircle,
  MessageSquare,
  Send,
  CornerUpLeft,
  X,
  CheckCircle,
  XCircle,
  Trash2,
  Loader,
  History,
  Search,
} from 'lucide-angular';
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
  DialogContentComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { FormsModule } from '@angular/forms';
import { AscDemande } from '../../interfaces/asc.interface';
import { AscService } from '../../services/asc/asc.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import {
  DrawerComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
  DrawerContentComponent,
} from '@/shared/components/drawer/drawer.component';

const STATUTS: Record<number, { label: string; class: string }> = {
  1: {
    label: 'En cours de création (CC / RC)',
    class: 'bg-gray-100 text-gray-700 border border-gray-300',
  },
  2: {
    label: 'En attente de Validation (Accueil / Clientèle PME)',
    class: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  },
  3: {
    label: "En attente d'Approbation (R. Exploitation)",
    class: 'bg-orange-100 text-orange-700 border border-orange-300',
  },
  4: {
    label: 'Suivi du décaissement (R. Front-Office)',
    class: 'bg-blue-100 text-blue-700 border border-blue-300',
  },
  5: {
    label: 'En attente de Décaissement (CC / RC)',
    class: 'bg-purple-100 text-purple-700 border border-purple-300',
  },
  6: { label: 'Clôturé', class: 'bg-green-100 text-green-700 border border-green-300' },
  7: { label: 'Rejeté', class: 'bg-red-100 text-red-700 border border-red-300' },
  8: {
    label: 'Transfert inter-agence (CC / RC)',
    class: 'bg-pink-100 text-pink-700 border border-pink-300',
  },
  9: {
    label: 'En attente de Validation (R. Clientèle PME)',
    class: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  },
  10: {
    label: 'Création de la demande dans Perfect (CC / RC)',
    class: 'bg-blue-100 text-blue-700 border border-blue-300',
  },
  11: { label: 'Demande non aboutie', class: 'bg-red-100 text-red-700 border border-red-300' },
};

const CHECKLIST_LABELS: Record<number, string> = {
  1: 'Type de client',
  2: 'Ancienneté du client',
  3: 'Fréquence des remises',
  4: "Fréquence des demandes d'avances",
  5: 'Quantité de chèques remisés',
  6: 'Quantité de chèques par tireur',
  7: 'Crédit en cours',
  8: 'Justificatif',
};

const FILE_BASE = 'https://crm-fichiers.creditaccess.ci/crm/avance-sur-cheque/';

@Component({
  selector: 'app-detail-demande',
  templateUrl: './detail.component.html',
  imports: [
    DecimalPipe,
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
    DialogContentComponent,
    DialogFooterComponent,
    PaginationComponent,
    ButtonDirective,
    Avatar,
    DrawerComponent,
    DrawerHeaderComponent,
    DrawerTitleComponent,
    DrawerContentComponent,
  ],
})
export class DetailComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ExternalLinkIcon = ExternalLink;
  readonly UserIcon = User;
  readonly FileTextIcon = FileText;
  readonly CheckSquareIcon = CheckSquare;
  readonly SquareIcon = Square;
  readonly AlertCircleIcon = AlertCircle;
  readonly MessageSquareIcon = MessageSquare;
  readonly SendIcon = Send;
  readonly AjournerIcon = CornerUpLeft;
  readonly XIcon = X;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly Trash2Icon = Trash2;
  readonly LoaderIcon = Loader;
  readonly HistoryIcon = History;
  readonly SearchIcon = Search;

  private readonly router = inject(Router);
  private readonly ascService = inject(AscService);
  private readonly toast = inject(ToastService);

  readonly demande = input<AscDemande | null>(null);

  // Pagination observations
  readonly obsPage = signal(1);
  readonly obsPageSize = 5;

  readonly pagedObs = computed(() => {
    const obs = this.demande()?.observation ?? [];
    const start = (this.obsPage() - 1) * this.obsPageSize;
    return obs.slice(start, start + this.obsPageSize);
  });

  // ── Historique dialog ──────────────────────────────────────────────────
  readonly histQuery = signal('');
  readonly histPage = signal(1);
  readonly histPageSize = 5;

  readonly filteredHist = computed(() => {
    const items = this.demande()?.client?.historiqueAvCheque ?? [];
    const q = this.histQuery().toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (h) =>
        h.numDemandeAsc?.toLowerCase().includes(q) ||
        h.cheque?.numTransaction?.toLowerCase().includes(q) ||
        h.cheque?.tireur?.toLowerCase().includes(q) ||
        h.cheque?.banque?.toLowerCase().includes(q),
    );
  });

  readonly pagedHist = computed(() => {
    const items = this.filteredHist();
    const start = (this.histPage() - 1) * this.histPageSize;
    return items.slice(start, start + this.histPageSize);
  });

  // ── Observations drawer ────────────────────────────────────────────────
  readonly obsDrawerOpen = signal(false);

  // ── Dialogs ────────────────────────────────────────────────────────────
  readonly dialogOpen = signal(false);
  readonly deleteDialogOpen = signal(false);
  readonly isLoading = signal(false);

  // Pending action: { decision: number, title: string, requireObs: boolean }
  readonly pendingAction = signal<{ decision: number; title: string; requireObs: boolean } | null>(
    null,
  );
  observation = '';

  openAction(decision: number, title: string, requireObs = true) {
    this.pendingAction.set({ decision, title, requireObs });
    this.observation = '';
    this.dialogOpen.set(true);
  }

  get obsInvalid(): boolean {
    return !!(this.pendingAction()?.requireObs && !this.observation?.trim());
  }

  confirmAction() {
    const action = this.pendingAction();
    const d = this.demande();
    if (!action || !d) return;

    if (action.requireObs && !this.observation?.trim()) return;

    const obs = this.observation?.trim() || 'Avis favorable';
    this.isLoading.set(true);
    this.ascService
      .sendDecision({ idAsc: d.id, decision: action.decision, observation: obs })
      .subscribe({
        next: () => {
          this.toast.success('Action effectuée avec succès.');
          this.isLoading.set(false);
          this.dialogOpen.set(false);
          this.router.navigate(['/app/asc/pending']);
        },
        error: () => {
          this.toast.error('Une erreur est survenue. Veuillez réessayer.');
          this.isLoading.set(false);
        },
      });
  }

  confirmDelete() {
    const d = this.demande();
    if (!d) return;
    this.isLoading.set(true);
    this.ascService.deleteDemandeAsc(d.id).subscribe({
      next: () => {
        this.toast.success('Demande supprimée avec succès.');
        this.isLoading.set(false);
        this.deleteDialogOpen.set(false);
        this.router.navigate(['/app/asc/list']);
      },
      error: () => {
        this.toast.error('Échec de la suppression.');
        this.isLoading.set(false);
      },
    });
  }

  // ── Computed ───────────────────────────────────────────────────────────
  readonly statut = computed(() => {
    const s = this.demande()?.statut;
    return s !== undefined
      ? (STATUTS[s] ?? {
          label: String(s),
          class: 'bg-muted text-muted-foreground border border-border',
        })
      : null;
  });

  readonly clientInitials = computed(() => {
    const nom = this.demande()?.client?.nomPrenom ?? '';
    return nom
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  });

  readonly checklist = computed<{ label: string; checked: boolean }[]>(() => {
    const raw = this.demande()?.cheque?.checkliste;
    let checked: number[] = [];
    try {
      if (raw && raw !== 'null') checked = JSON.parse(raw);
    } catch {
      /* */
    }
    return Object.entries(CHECKLIST_LABELS).map(([k, label]) => ({
      label,
      checked: checked.includes(Number(k)),
    }));
  });

  readonly hasChecklist = computed(() => {
    const raw = this.demande()?.cheque?.checkliste;
    if (!raw || raw === 'null') return false;
    try {
      return (JSON.parse(raw) as number[]).length > 0;
    } catch {
      return false;
    }
  });

  // ── Visibilité boutons (basée sur statut) ──────────────────────────────
  readonly showSoumettre = computed(() => [1, 8, 10].includes(this.demande()?.statut ?? -1));
  readonly showRejeter = computed(() => [2, 3, 9].includes(this.demande()?.statut ?? -1));
  readonly showAjourner = computed(() => [2, 3, 4, 9].includes(this.demande()?.statut ?? -1));
  readonly showApprouver = computed(() => [2, 3, 9].includes(this.demande()?.statut ?? -1));
  readonly showAutoriser = computed(() => this.demande()?.statut === 4);
  readonly showConfirmer = computed(() => this.demande()?.statut === 5);
  readonly showAnnuler = computed(() => this.demande()?.statut === 5);
  readonly showDelete = computed(() => ![6, 11].includes(this.demande()?.statut ?? -1));
  readonly hasActions = computed(
    () =>
      this.showSoumettre() ||
      this.showRejeter() ||
      this.showAjourner() ||
      this.showApprouver() ||
      this.showAutoriser() ||
      this.showConfirmer() ||
      this.showAnnuler() ||
      this.showDelete(),
  );

  // ── Helpers ────────────────────────────────────────────────────────────
  fileUrl(lien?: string) {
    return lien ? FILE_BASE + lien : null;
  }
  openFile(lien?: string) {
    const u = this.fileUrl(lien);
    if (u) window.open(u, '_blank');
  }
  goBack() {
    history.back();
  }
}
