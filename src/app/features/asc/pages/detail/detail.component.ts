import { Component, computed, effect, inject, input, signal } from '@angular/core';
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
  Download,
  Pencil,
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
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';
import { AscDemande } from '../../interfaces/asc.interface';
import { AscService } from '../../services/asc/asc.service';
import { PermissionService } from '@/core/services/permission/permission.service';
import { UserRole } from '@/core/models/user.model';
import { ToastService } from '@/core/services/toast/toast.service';
import { PdfExportService } from '@/core/services/export/pdf-export.service';
import { LogoBase64 } from '@/features/credit/enumeration/logo_base64.enum';
import { AuthService } from '@/core/services/auth/auth.service';
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
    ReactiveFormsModule,
    FormsModule,
    FormInput,
    FormTextarea,
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
  readonly DownloadIcon = Download;
  readonly PencilIcon = Pencil;

  private readonly router = inject(Router);
  private readonly ascService = inject(AscService);
  private readonly toast = inject(ToastService);
  private readonly pdfService = inject(PdfExportService);
  private readonly permissions = inject(PermissionService);
  private readonly authService = inject(AuthService);

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
  readonly montantAccordeDialogOpen = signal(false);
  readonly numDemandeDialogOpen = signal(false);
  readonly isLoading = signal(false);
  readonly isExporting = signal(false);

  readonly pendingAction = signal<{ decision: number; title: string; requireObs: boolean; showObs: boolean } | null>(
    null,
  );

  actionForm = new FormGroup({
    observation: new FormControl(''),
    password: new FormControl('', Validators.required),
    dateDecaissement: new FormControl(''),
  });

  montantAccordeForm = new FormGroup({
    montantAccorde: new FormControl<number | null>(null, Validators.required),
  });

  numDemandeForm = new FormGroup({
    numDemandeAsc: new FormControl('', Validators.required),
  });

  // Editable checklist state (8 items, index 0 = item 1)
  readonly editableChecklist = signal<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  // Désactivation du bouton Dérogation si aucun item coché (à statut 2)
  readonly derogationDisabled = computed(
    () => this.demande()?.statut === 2 && !this.editableChecklist().some(Boolean),
  );

  constructor() {
    // Initialise la checklist éditable depuis les données du demande dès le chargement
    effect(() => {
      const raw = this.demande()?.cheque?.checkliste;
      let checked: number[] = [];
      try {
        if (raw && raw !== 'null') checked = JSON.parse(raw);
      } catch { /* */ }
      this.editableChecklist.set([1, 2, 3, 4, 5, 6, 7, 8].map((i) => checked.includes(i)));
    });
  }

  deleteForm = new FormGroup({
    password: new FormControl('', Validators.required),
  });

  openAction(decision: number, title: string, requireObs = true, showObs = true) {
    this.pendingAction.set({ decision, title, requireObs, showObs });
    this.actionForm.reset({ observation: '', password: '', dateDecaissement: '' });

    if (requireObs) {
      this.actionForm.controls.observation.setValidators(Validators.required);
    } else {
      this.actionForm.controls.observation.setValidators(null);
    }
    this.actionForm.controls.observation.updateValueAndValidity();


    this.dialogOpen.set(true);
  }

  get obsInvalid(): boolean {
    return this.actionForm.controls.observation.invalid;
  }

  get passwordInvalid(): boolean {
    return this.actionForm.controls.password.invalid;
  }

  openDeleteDialog() {
    this.deleteForm.reset({ password: '' });
    this.deleteDialogOpen.set(true);
  }

  confirmAction() {
    const action = this.pendingAction();
    const d = this.demande();
    if (!action || !d) return;

    this.actionForm.markAllAsTouched();
    if (this.actionForm.invalid) return;

    this.isLoading.set(true);
    const password = this.actionForm.value.password?.trim() || '';
    this.authService.verifyPassword(password).subscribe({
      next: (res) => {
        if (res.statut === 500) {
          this.toast.error(res.message || 'Mot de passe incorrect.');
          this.isLoading.set(false);
          return;
        }

        if (res.statut === 200) {
          const obs = this.actionForm.value.observation?.trim() || 'Avis favorable';

          // Include checklist when ASSC_PME approves at statut 2
          let checkliste: number[] | undefined;
          if (d.statut === 2 && action.decision === 1) {
            checkliste = this.editableChecklist()
              .map((checked, i) => (checked ? i + 1 : null))
              .filter((v): v is number => v !== null);
          }

          // Include dateDecaissement for autoriser/confirmer at statut 4/5
          const dateDecaissement = this.actionForm.value.dateDecaissement?.trim() || undefined;

          this.ascService
            .sendDecision({
              idAsc: d.id,
              decision: action.decision,
              observation: obs,
              checkliste,
              dateDecaissement,
            })
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
        } else {
          this.toast.error('Vérification du mot de passe a échoué.');
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.toast.error('Erreur lors de la vérification du mot de passe.');
        this.isLoading.set(false);
      },
    });
  }

  confirmDelete() {
    const d = this.demande();
    if (!d) return;

    this.deleteForm.markAllAsTouched();
    if (this.deleteForm.invalid) return;

    this.isLoading.set(true);
    const password = this.deleteForm.value.password || '';
    this.authService.verifyPassword(password).subscribe({
      next: (res) => {
        if (res.statut === 500) {
          this.toast.error(res.message || 'Mot de passe incorrect.');
          this.isLoading.set(false);
          return;
        }

        if (res.statut === 200) {
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
        } else {
          this.toast.error('Vérification du mot de passe a échoué.');
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.toast.error('Erreur lors de la vérification du mot de passe.');
        this.isLoading.set(false);
      },
    });
  }

  // ── Montant accordé ────────────────────────────────────────────────────
  readonly showMontantAccordeBtn = computed(() => {
    const s = this.demande()?.statut ?? -1;
    if (s === 3)
      return this.permissions.hasRole(
        UserRole.ResponsableExploitation,
        UserRole.DirectriceExploitation,
        UserRole.DirecteurRisque,
        UserRole.DGA,
        UserRole.Admin,
      );
    if (s === 2 || s === 9)
      return this.permissions.hasRole(UserRole.assistanteClientelePME, UserRole.Admin);
    return false;
  });

  // ── N° demande Perfect (statut 10, même agence) ───────────────────────
  readonly showNumDemandeBtn = computed(
    () =>
      this.demande()?.statut === 10 &&
      this.memeAgence() &&
      this.permissions.hasRole(
        UserRole.conseilClientele,
        UserRole.responsableClient,
        UserRole.Admin,
      ),
  );

  // ── Checklist éditable (ASSC_PME approuver statut 2) ──────────────────
  readonly checklistEditMode = computed(
    () =>
      this.demande()?.statut === 2 &&
      this.permissions.hasRole(UserRole.assistanteClientelePME, UserRole.Admin),
  );

  openMontantAccordeDialog() {
    const d = this.demande();
    this.montantAccordeForm.reset({
      montantAccorde: d?.montantAccorde ?? d?.montantSollicite ?? null,
    });
    this.montantAccordeDialogOpen.set(true);
  }

  openNumDemandeDialog() {
    const d = this.demande();
    this.numDemandeForm.reset({ numDemandeAsc: d?.numDemandeAsc ?? '' });
    this.numDemandeDialogOpen.set(true);
  }

  toggleChecklistItem(index: number) {
    this.editableChecklist.update((list) => {
      const copy = [...list];
      copy[index] = !copy[index];
      return copy;
    });
  }

  saveMontantAccorde() {
    const d = this.demande();
    if (!d) return;
    this.montantAccordeForm.markAllAsTouched();
    if (this.montantAccordeForm.invalid) return;

    const montantAccorde = this.montantAccordeForm.value.montantAccorde!;
    const montantSollicite = d.montantSollicite ?? 0;
    const montantCheque = d.cheque?.montantCheque ?? Infinity;

    if (montantAccorde > montantSollicite) {
      this.toast.error('Le montant accordé ne peut pas dépasser le montant sollicité.');
      return;
    }
    if (montantAccorde > montantCheque) {
      this.toast.error('Le montant accordé ne peut pas dépasser le montant du chèque.');
      return;
    }
    const isPME =
      this.permissions.hasRole(UserRole.assistanteClientelePME) &&
      !this.permissions.hasRole(UserRole.Admin);
    if (isPME && montantAccorde >= montantCheque * 0.8) {
      this.toast.error('Le montant accordé doit être inférieur à 80 % du montant du chèque.');
      return;
    }

    this.isLoading.set(true);
    this.ascService
      .updateSousDemande(d.id, { montantAccorde, numDemandeAsc: d.numDemandeAsc ?? '' })
      .subscribe({
        next: () => {
          this.toast.success('Montant accordé enregistré avec succès.');
          this.isLoading.set(false);
          this.montantAccordeDialogOpen.set(false);
          this.router.navigate(['/app/asc/pending']);
        },
        error: () => {
          this.toast.error("Erreur lors de l'enregistrement.");
          this.isLoading.set(false);
        },
      });
  }

  saveNumDemande() {
    const d = this.demande();
    if (!d) return;
    this.numDemandeForm.markAllAsTouched();
    if (this.numDemandeForm.invalid) return;

    this.isLoading.set(true);
    this.ascService
      .updateSousDemande(d.id, { numDemandeAsc: this.numDemandeForm.value.numDemandeAsc ?? '' })
      .subscribe({
        next: () => {
          this.toast.success('Numéro de demande Perfect enregistré.');
          this.isLoading.set(false);
          this.numDemandeDialogOpen.set(false);
        },
        error: () => {
          this.toast.error("Erreur lors de l'enregistrement.");
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

  // ── Visibilité boutons (statut + rôle — conforme old frontend) ────────

  // Même agence : user et client doivent appartenir à la même agence (statut 10)
  readonly memeAgence = computed(() => {
    const userAgenceCode = this.authService.currentUser()?.agence?.code;
    const clientAgenceCode = this.demande()?.client?.agence?.code;
    if (!userAgenceCode || !clientAgenceCode) return false;
    return userAgenceCode === clientAgenceCode;
  });

  // Statut 1/8 : RC ou CC soumet directement
  // Statut 10  : RC ou CC soumet UNIQUEMENT si même agence ET numDemandeAsc renseigné
  readonly showSoumettre = computed(() => {
    const d = this.demande();
    const s = d?.statut ?? -1;
    if (![1, 8, 10].includes(s)) return false;
    if (!this.permissions.hasRole(UserRole.conseilClientele, UserRole.responsableClient, UserRole.Admin)) return false;
    if (s === 10) return this.memeAgence() && !!d?.numDemandeAsc;
    if (s === 8) return this.memeAgence();
    return true;
  });

  // Rejet selon statut :
  //   Statut 2  → ASSC_PME
  //   Statut 3  → RESPO_EXPL, D_EXPL, DR, DGA
  //   Statut 9  → RESPO_EXPL, RESPO_CLT_PME, D_EXPL, DR
  readonly showRejeter = computed(() => {
    const s = this.demande()?.statut ?? -1;
    if (s === 2) return this.permissions.hasRole(UserRole.assistanteClientelePME, UserRole.Admin);
    if (s === 3)
      return this.permissions.hasRole(
        UserRole.ResponsableExploitation,
        UserRole.DirectriceExploitation,
        UserRole.DirecteurRisque,
        UserRole.DGA,
        UserRole.Admin,
      );
    if (s === 9)
      return this.permissions.hasRole(
        UserRole.ResponsableExploitation,
        UserRole.ResponsableClientelePME,
        UserRole.DirectriceExploitation,
        UserRole.DirecteurRisque,
        UserRole.Admin,
      );
    return false;
  });

  // Ajournement selon statut :
  //   Statut 2  → AGENT_ACC, ASSC_PME
  //   Statut 3  → RESPO_EXPL, D_EXPL, DR, DGA
  //   Statut 4  → Admin, RESPO_FO
  //   Statut 8  → RC, CC (même agence — guard simplifié)
  //   Statut 9  → RESPO_EXPL, RESPO_CLT_PME, D_EXPL, DR
  readonly showAjourner = computed(() => {
    const s = this.demande()?.statut ?? -1;
    if (s === 2)
      return this.permissions.hasRole(
        UserRole.agentAccueil,
        UserRole.assistanteClientelePME,
        UserRole.Admin,
      );
    if (s === 3)
      return this.permissions.hasRole(
        UserRole.ResponsableExploitation,
        UserRole.DirectriceExploitation,
        UserRole.DirecteurRisque,
        UserRole.DGA,
        UserRole.Admin,
      );
    if (s === 4) return this.permissions.hasRole(UserRole.ResponsableFrontOffice, UserRole.Admin);
    if (s === 8)
      return (
        this.permissions.hasRole(UserRole.Admin) ||
        (this.permissions.hasRole(UserRole.responsableClient, UserRole.conseilClientele) && this.memeAgence())
      );
    if (s === 9)
      return this.permissions.hasRole(
        UserRole.ResponsableExploitation,
        UserRole.ResponsableClientelePME,
        UserRole.DirectriceExploitation,
        UserRole.DirecteurRisque,
        UserRole.Admin,
      );
    return false;
  });

  // Dérogation (decision: 1) — escalade ou approbation paiement :
  //   Statut 2  → ASSC_PME (label "Dérogation", envoie vers R. Exploitation)
  //   Statut 3  → RESPO_EXPL, D_EXPL, DR, DGA (label "Approuver le paiement")
  //   Statut 9  → RESPO_EXPL, RESPO_CLT_PME, D_EXPL, DR (label "Dérogation")
  readonly showApprouver = computed(() => {
    const s = this.demande()?.statut ?? -1;
    if (s === 2)
      return this.permissions.hasRole(UserRole.agentAccueil, UserRole.assistanteClientelePME, UserRole.Admin);
    if (s === 3)
      return this.permissions.hasRole(
        UserRole.ResponsableExploitation,
        UserRole.DirectriceExploitation,
        UserRole.DirecteurRisque,
        UserRole.DGA,
        UserRole.Admin,
      );
    if (s === 9)
      return this.permissions.hasRole(
        UserRole.ResponsableExploitation,
        UserRole.ResponsableClientelePME,
        UserRole.DirectriceExploitation,
        UserRole.DirecteurRisque,
        UserRole.Admin,
      );
    return false;
  });

  // Approbation directe (decision: 3) :
  //   Statut 2  → ASSC_PME, quand montantSollicite ≤ 80% du chèque OU montantAccorde défini
  //   Statut 9  → RESPO_EXPL, D_EXPL, DR, quand montantSollicite ≤ 80% du chèque
  readonly showApprouverDirectement = computed(() => {
    const d = this.demande();
    const s = d?.statut ?? -1;
    const montantSollicite = d?.montantSollicite ?? 0;
    const montantCheque = d?.cheque?.montantCheque ?? 0;
    const dans80pct = montantCheque > 0 && montantSollicite <= montantCheque * 0.8;
    const montantAccordeDefini = !!(d?.montantAccorde);

    if (s === 2 && this.permissions.hasRole(UserRole.assistanteClientelePME, UserRole.Admin)) {
      return dans80pct || montantAccordeDefini;
    }
    if (
      s === 9 &&
      this.permissions.hasRole(
        UserRole.ResponsableExploitation,
        UserRole.DirectriceExploitation,
        UserRole.DirecteurRisque,
        UserRole.Admin,
      )
    ) {
      return dans80pct;
    }
    return false;
  });

  // Statut 4 : Admin ou RESPO_FO autorise le décaissement
  readonly showAutoriser = computed(
    () =>
      this.demande()?.statut === 4 &&
      this.permissions.hasRole(UserRole.ResponsableFrontOffice, UserRole.Admin),
  );

  // Statut 5 : Admin toujours, RC/CC uniquement si même agence
  readonly showConfirmer = computed(() => {
    if (this.demande()?.statut !== 5) return false;
    if (this.permissions.hasRole(UserRole.Admin)) return true;
    return (
      this.permissions.hasRole(UserRole.conseilClientele, UserRole.responsableClient) &&
      this.memeAgence()
    );
  });

  // Statut 5 : Admin toujours, RC/CC uniquement si même agence
  readonly showAnnuler = computed(() => {
    if (this.demande()?.statut !== 5) return false;
    if (this.permissions.hasRole(UserRole.Admin)) return true;
    return (
      this.permissions.hasRole(UserRole.conseilClientele, UserRole.responsableClient) &&
      this.memeAgence()
    );
  });

  // Suppression : Admin uniquement (non clôturé / non abouti)
  readonly showDelete = computed(
    () =>
      ![6, 11].includes(this.demande()?.statut ?? -1) && this.permissions.hasRole(UserRole.Admin),
  );
  readonly hasActions = computed(
    () =>
      this.showSoumettre() ||
      this.showRejeter() ||
      this.showAjourner() ||
      this.showApprouver() ||
      this.showApprouverDirectement() ||
      this.showAutoriser() ||
      this.showConfirmer() ||
      this.showAnnuler() ||
      this.showDelete() ||
      this.showMontantAccordeBtn() ||
      this.showNumDemandeBtn(),
  );

  // ── Export PDF ─────────────────────────────────────────────────────────
  async exportPdf() {
    const d = this.demande();
    if (!d || this.isExporting()) return;
    this.isExporting.set(true);

    const currentUser = this.authService.currentUser();
    const client = d.client;
    const cheque = d.cheque;

    const fmtMontant = (v?: number | null) =>
      v != null ? v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '—';
    const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString('fr-FR') : '—');
    const fmtDateTime = (s?: string | null) => {
      if (!s) return '—';
      const dt = new Date(s);
      return (
        dt.toLocaleDateString('fr-FR') +
        ', ' +
        dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      );
    };

    const montantSollicite = fmtMontant(d.montantSollicite) + ' FCFA';
    const montantAccorde = fmtMontant(d.montantAccorde ?? d.montantSollicite) + ' FCFA';
    const montantCheque = fmtMontant(cheque?.montantCheque) + ' FCFA';

    const docDefinition: any = {
      pageSize: 'A4',
      content: [
        // ── 1. En-tête logo + titre ──────────────────────────────────────
        {
          columns: [
            { image: LogoBase64.logoVertical, width: 65, height: 60 },
            [
              {
                style: 'entete',
                table: {
                  body: [[{ text: "FICHE DE DEMANDE D'AVANCE SUR CHEQUE", style: 'enteteText' }]],
                },
              },
            ],
          ],
          margin: [0, 0, 0, 20],
        },
        // ── 2. Téléphone + Imprimé le/par ───────────────────────────────
        {
          columns: [
            {
              text: [
                { text: 'Tel : ', style: 'styleCle' },
                { text: '+225 21 22 21 50 / +225 05 94 27 67 05', style: 'styleValeur' },
              ],
            },
            {
              margin: [45, 0, 0, 0],
              text: [
                { text: 'Imprimé le : ', style: 'styleCle' },
                { text: new Date().toLocaleString('fr-FR'), style: 'styleValeur' },
                { text: '\n\nImprimé par : ', style: 'styleCle' },
                {
                  text: currentUser ? `${currentUser.nom} ${currentUser.prenom}` : '—',
                  style: 'styleValeur',
                },
              ],
            },
          ],
          margin: [0, 0, 0, 25],
        },
        // ── 3. N° demande / Date / Débourser le ─────────────────────────
        {
          alignment: 'center',
          margin: [0, 0, 0, 10],
          columns: [
            {
              text: [
                { text: 'Numéro de la demande:\n', style: 'styleCle' },
                { text: d.numDemandeAsc ?? '—', style: 'styleValeur' },
              ],
            },
            {
              text: [
                { text: 'Date de la demande:\n', style: 'styleCle' },
                { text: fmtDate(d.dateDemande ?? d.datedemande), style: 'styleValeur' },
              ],
            },
            d.dateDecaissement
              ? {
                  text: [
                    { text: 'Débourser le:\n', style: 'styleCle' },
                    { text: fmtDate(d.dateDecaissement), style: 'styleValeur' },
                  ],
                }
              : '',
          ],
        },
        // ── 4. Montants sollicité / accordé ─────────────────────────────
        {
          margin: [30, 0, 0, 10],
          columns: [
            {
              text: [
                { text: 'Montant sollicité : ', style: 'styleCle' },
                { text: montantSollicite, bold: true, fontSize: 12 },
              ],
            },
            {
              text: [
                { text: 'Montant accordé : ', style: 'styleCle' },
                { text: montantAccorde, bold: true, fontSize: 12 },
              ],
            },
          ],
        },
        // ── 5. Tableau client | chèque ───────────────────────────────────
        {
          table: {
            widths: [200, 300],
            body: [
              [
                {
                  border: [false, true, false, true],
                  /* fillColor: '#eeeeee', */
                  margin: [0, 5, 0, 20],
                  stack: [
                    {
                      text: [
                        { text: 'Raison sociale ou Désignation\n ', style: 'styleCle' },
                        { text: (client?.nomPrenom ?? '—') + '\n\n', style: 'styleValeur' },
                        ...(client?.typeAgent === 'SC'
                          ? [
                              { text: 'Gérant\n ', style: 'styleCle' },
                              {
                                text: (client.gerant?.nomDirigeant ?? '—') + '\n\n',
                                style: 'styleValeur',
                              },
                            ]
                          : []),
                        { text: 'Agence\n ', style: 'styleCle' },
                        {
                          text: 'Agence ' + (client?.agence?.libelle ?? '—') + '\n\n',
                          style: 'styleValeur',
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          text: [
                            { text: 'Code client\n ', style: 'styleCle' },
                            { text: (client?.codeClient ?? '—') + '\n\n', style: 'styleValeur' },
                          ],
                        },
                        {
                          alignment: 'right',
                          text: [
                            { text: 'Type compte\n ', style: 'styleCle' },
                            {
                              text:
                                (client?.typeAgent === 'SC'
                                  ? 'Personne morale'
                                  : 'Personne physique') + '\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      text: [
                        { text: 'Nombre de chèques remisés\n ', style: 'styleCle' },
                        {
                          text: String(client?.nbreChequeRemise ?? 0) + '\n\n',
                          style: 'styleValeur',
                        },
                        { text: 'Incidents de paiement\n ', style: 'styleCle' },
                        { text: String(client?.nbreIncidentPaie ?? 0), style: 'styleValeur' },
                      ],
                    },
                  ],
                },
                {
                  border: [false, true, false, true],
                  margin: [0, 5, 0, 20],
                  stack: [
                    {
                      text: [
                        { text: 'Tireur\n ', style: 'styleCle' },
                        { text: (cheque?.tireur ?? '—') + '\n\n', style: 'styleValeur' },
                        { text: 'Banque du Tireur\n', style: 'styleCle' },
                        { text: (cheque?.banque ?? '—') + '\n\n', style: 'styleValeur' },
                      ],
                    },
                    {
                      columns: [
                        {
                          text: [
                            { text: 'Nature de la Prestation\n ', style: 'styleCle' },
                            {
                              text:
                                (cheque?.naturePrestation?.libelle ??
                                  d.natureObjetReglement ??
                                  '—') + '\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                        {
                          alignment: 'right',
                          text: [
                            { text: 'Date du chèque\n ', style: 'styleCle' },
                            { text: fmtDate(cheque?.dateCheque) + '\n\n', style: 'styleValeur' },
                          ],
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          text: [
                            { text: 'N° Chèque\n ', style: 'styleCle' },
                            { text: (cheque?.numcheque ?? '—') + '\n\n', style: 'styleValeur' },
                          ],
                        },
                        {
                          alignment: 'right',
                          text: [
                            { text: 'N° Chèque PERFECT\n ', style: 'styleCle' },
                            {
                              text: (cheque?.numTransaction ?? '—') + '\n\n',
                              style: 'styleValeur',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      text: [
                        { text: 'Montant du chèque : ', style: 'styleCle' },
                        { text: '  ' + montantCheque, bold: true, fontSize: 12 },
                      ],
                    },
                  ],
                },
              ],
            ],
          },
        },
        // ── 6. Titre observations ────────────────────────────────────────
        {
          text: 'LISTE DES OBSERVATIONS DES UTILISATEURS',
          fontSize: 16,
          marginTop: 25,
          marginBottom: 20,
          alignment: 'center',
          decoration: 'underline',
          bold: true,
        },
        // ── 7. Tableau des observations ──────────────────────────────────
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto'],
            body: [
              [
                { text: 'Utilisateur', style: 'enteteTableau' },
                { text: 'Agence', style: 'enteteTableau' },
                { text: 'Poste', style: 'enteteTableau' },
                { text: 'Action menée', style: 'enteteTableau' },
                { text: 'Commentaire', style: 'enteteTableau' },
                { text: 'Date & Heure', style: 'enteteTableau' },
              ],
              ...((d.observation ?? []).length > 0
                ? (d.observation ?? []).map((obs) => [
                    {
                      text: obs.user ? `${obs.user.nom} ${obs.user.prenom}` : '—',
                      style: 'valeurTableau',
                    },
                    { text: obs.user?.libelleAgence ?? '—', style: 'valeurTableau' },
                    { text: obs.user?.profil ?? '—', style: 'valeurTableau' },
                    { text: obs.decision ?? '—', style: 'valeurTableau' },
                    { text: obs.observation ?? '—', style: 'valeurTableau' },
                    { text: fmtDateTime(obs.date), style: 'valeurTableau' },
                  ])
                : [
                    [
                      {
                        text: 'Aucune observation',
                        colSpan: 6,
                        alignment: 'center',
                        style: 'valeurTableau',
                      },
                      '',
                      '',
                      '',
                      '',
                      '',
                    ],
                  ]),
            ],
          },
        },
      ],
      styles: {
        entete: { alignment: 'center', margin: [0, 0, 0, 0] },
        enteteText: { margin: [15, 15, 15, 15], fontSize: 16, bold: true },
        enteteTableau: { bold: true, alignment: 'center', fontSize: 8 },
        valeurTableau: { fontSize: 9 },
        styleCle: { fontSize: 9 },
        styleValeur: { bold: true, fontSize: 10 },
      },
      defaultStyle: { font: 'Montserrat' },
    };

    try {
      await this.pdfService.open(docDefinition);
    } catch (err) {
      console.error('[exportPdf]', err);
      this.toast.error('Erreur lors de la génération du PDF.');
    } finally {
      this.isExporting.set(false);
    }
  }

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
