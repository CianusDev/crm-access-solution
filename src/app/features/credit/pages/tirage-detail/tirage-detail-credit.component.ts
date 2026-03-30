import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  ChevronLeft,
  Clock,
  MessageSquare,
  Send,
  X,
  RotateCcw,
  CircleCheck,
  Award,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { TabsComponent } from '@/shared/components/tabs/tabs.component';
import { TabComponent } from '@/shared/components/tabs/tab.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { PermissionService } from '@/core/services/permission/permission.service';
import { AuthService } from '@/core/services/auth/auth.service';
import { UserRole } from '@/core/models/user.model';
import { CreditService } from '../../services/credit/credit.service';
import {
  CREDIT_STATUTS,
  CreditActionPayload,
  CreditDocumentAnnexe,
  CreditFiche,
  CreditObservation,
  CreditResume,
} from '../../interfaces/credit.interface';
import { TirageDetailResolvedData } from './tirage-detail-credit.resolver';
import { TirageDecouvertCardComponent } from './_components/tirage-decouvert-card.component';
import { TirageDossierCardComponent } from './_components/tirage-dossier-card.component';
import { TirageComiteDialogComponent } from './_components/tirage-comite-dialog.component';
import { TirageDecisionDialogComponent } from './_components/tirage-decision-dialog.component';
import { TirageDocumentsPanelComponent } from './_components/tirage-documents-panel.component';

interface SimpleAction {
  decision: number;
  title: string;
}

@Component({
  selector: 'app-tirage-detail-credit',
  templateUrl: './tirage-detail-credit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogFooterComponent,
    TabsComponent,
    TabComponent,
    TirageDecouvertCardComponent,
    TirageDossierCardComponent,
    TirageComiteDialogComponent,
    TirageDecisionDialogComponent,
    TirageDocumentsPanelComponent,
  ],
})
export class TirageDetailCreditComponent implements OnInit {
  // ── Icônes ────────────────────────────────────────────────────────────────
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ClockIcon = Clock;
  readonly MessageSquareIcon = MessageSquare;
  readonly SendIcon = Send;
  readonly XIcon = X;
  readonly RotateCcwIcon = RotateCcw;
  readonly CircleCheckIcon = CircleCheck;
  readonly AwardIcon = Award;

  // ── Services ──────────────────────────────────────────────────────────────
  private readonly creditService = inject(CreditService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  readonly permissions = inject(PermissionService);

  // ── Input resolver ────────────────────────────────────────────────────────
  readonly data = input<TirageDetailResolvedData>();

  constructor() {
    effect(() => {
      const data = this.data();
      if (!data) return;
      this.fiche.set(data.fiche);
      this.resume.set(data.resume);
      this.ficheDecouvert.set(data.ficheDecouvert);
      this.observations.set(data.observations);
      this.documents.set(data.documents);
      this.isLoading.set(false);
    }, { allowSignalWrites: true });
  }

  // ── État principal ────────────────────────────────────────────────────────
  readonly isLoading = signal(true);
  readonly fiche = signal<CreditFiche | null>(null);
  readonly resume = signal<CreditResume | null>(null);
  readonly ficheDecouvert = signal<CreditFiche | null>(null);
  readonly observations = signal<CreditObservation[]>([]);
  readonly documents = signal<CreditDocumentAnnexe[]>([]);
  readonly ref = signal('');
  readonly refDecouvert = signal('');

  // ── Dérivés ───────────────────────────────────────────────────────────────
  readonly demande = computed(() => this.fiche()?.demande ?? null);

  readonly statutInfo = computed(() => {
    const s = this.demande()?.statut ?? 0;
    return CREDIT_STATUTS[s] ?? { label: `Statut ${s}`, variant: 'default' as const };
  });

  /** L'utilisateur connecté a-t-il déjà voté au comité ? */
  readonly hasAlreadyVotedComite = computed(() => {
    const uid = this.auth.currentUser()?.id;
    if (!uid) return false;
    return this.resume()?.comites?.some((c) => c.user?.id === uid) ?? false;
  });

  // ── Visibilité des boutons ────────────────────────────────────────────────

  /** Statut 1 + GP/Admin → Envoyer le dossier */
  readonly showEnvoyer = computed(() => {
    if (this.demande()?.statut !== 1) return false;
    return this.permissions.hasRole(
      UserRole.GestionnairePortefeuilles,
      UserRole.Admin,
      UserRole.ChefEquipe,
      UserRole.AgentCommercialJunior,
    );
  });

  /** Statuts 28/10/11 + CDCR/D_EXPL/DR/DGA/Admin → actions comité */
  readonly showActionsComite = computed(() => {
    const s = this.demande()?.statut;
    if (![28, 10, 11].includes(s ?? -1)) return false;
    return this.permissions.hasRole(
      UserRole.Chargedepartementcredit,
      UserRole.DirectriceExploitation,
      UserRole.DirecteurRisque,
      UserRole.DGA,
      UserRole.Admin,
    );
  });

  /** Statut 12 + DG/Admin → validation finale */
  readonly showActionsDG = computed(() => {
    if (this.demande()?.statut !== 12) return false;
    return this.permissions.hasRole(UserRole.DG, UserRole.Admin);
  });

  // ── Dialog action simple (rejeter / ajourner / envoyer) ───────────────────
  actionDialogOpen = false;
  currentAction: SimpleAction | null = null;
  readonly actionObs = signal('');
  readonly actionPwd = signal('');
  readonly isSubmittingAction = signal(false);

  // ── Dialog comité ─────────────────────────────────────────────────────────
  comiteDialogOpen = false;

  // ── Dialog décision finale ────────────────────────────────────────────────
  decisionDialogOpen = false;

  // ── Cycle de vie ──────────────────────────────────────────────────────────
  ngOnInit() {
    const ref = this.route.snapshot.paramMap.get('ref') ?? '';
    const refDecouvert = this.route.snapshot.queryParamMap.get('refDecouvert') ?? '';
    this.ref.set(ref);
    this.refDecouvert.set(refDecouvert);
    if (!ref) this.router.navigate(['/app/credit/list']);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  goBack() {
    if (this.refDecouvert()) {
      this.router.navigate(['/app/credit/tirage/list'], {
        queryParams: { ref: this.refDecouvert() },
      });
    } else {
      this.router.navigate(['/app/credit/list']);
    }
  }

  // ── Actions simples (password + obs) ─────────────────────────────────────
  openAction(decision: number, title: string) {
    this.currentAction = { decision, title };
    this.actionObs.set('');
    this.actionPwd.set('');
    this.actionDialogOpen = true;
  }

  submitAction() {
    if (!this.currentAction || !this.actionPwd().trim()) return;
    const payload: CreditActionPayload = {
      refDemande: this.ref(),
      observation: this.actionObs(),
      password: this.actionPwd(),
      decision: this.currentAction.decision,
    };
    this.isSubmittingAction.set(true);
    this.creditService.saveCrdObservation(payload).subscribe({
      next: () => {
        this.toast.success('Action effectuée avec succès.');
        this.actionDialogOpen = false;
        this.isSubmittingAction.set(false);
        this.reloadAll();
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? "Erreur lors de l'opération.");
        this.isSubmittingAction.set(false);
      },
    });
  }

  // ── Rechargement complet ──────────────────────────────────────────────────
  reloadAll() {
    const ref = this.ref();
    if (!ref) return;
    this.isLoading.set(true);
    this.creditService.getFicheCredit(ref).subscribe({
      next: (f) => { this.fiche.set(f); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
    this.creditService.getResumeAnalyse(ref).subscribe({
      next: (r) => this.resume.set(r),
    });
    this.creditService.getObservations(ref).subscribe({
      next: (o) => this.observations.set(o),
    });
    this.creditService.getDocuments(ref).subscribe({
      next: (d) => this.documents.set(d),
    });
  }
}
