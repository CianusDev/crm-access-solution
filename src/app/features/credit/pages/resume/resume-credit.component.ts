import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  LucideAngularModule,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Shield,
  Users,
  FileText,
  Clock,
  BarChart3,
  Send,
  ThumbsUp,
  ThumbsDown,
  PauseCircle,
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
import { UserRole } from '@/core/models/user.model';
import { CreditService } from '../../services/credit/credit.service';
import {
  CREDIT_STATUTS,
  CreditResume,
  CreditComiteDecision,
} from '../../interfaces/credit.interface';

type TabId = 'synthese' | 'swot' | 'garanties' | 'proposition' | 'contre-eval' | 'comites' | 'decision' | 'historique';

/** Profils autorisés à agir selon le statut */
const ACTIONS_PAR_STATUT: Record<number, UserRole[]> = {
  5:  [UserRole.AnalysteRisque, UserRole.Admin],
  6:  [UserRole.SuperviseurRisqueZone, UserRole.Admin],
  7:  [UserRole.ChargeDuComite, UserRole.Admin],
  8:  [UserRole.ResponsableRegional, UserRole.Admin],
  9:  [UserRole.DirecteurRisque, UserRole.DirecteurGeneralAdjoint, UserRole.Chargedepartementcredit, UserRole.Admin],
  10: [UserRole.DirecteurRisque, UserRole.DirecteurGeneralAdjoint, UserRole.Admin],
  11: [UserRole.DirecteurGeneralAdjoint, UserRole.DirectriceExploitation, UserRole.Admin],
  12: [UserRole.DG, UserRole.Admin],
  28: [UserRole.DirectriceExploitation, UserRole.Admin],
};

@Component({
  selector: 'app-resume-credit',
  templateUrl: './resume-credit.component.html',
  imports: [
    DatePipe,
    NgTemplateOutlet,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    ButtonDirective,
  ],
})
export class ResumeCreditComponent implements OnInit {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly RefreshIcon = RefreshCw;
  readonly AlertCircleIcon = AlertCircle;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly TrendingUpIcon = TrendingUp;
  readonly ShieldIcon = Shield;
  readonly UsersIcon = Users;
  readonly FileTextIcon = FileText;
  readonly ClockIcon = Clock;
  readonly BarChart3Icon = BarChart3;
  readonly SendIcon = Send;
  readonly ThumbsUpIcon = ThumbsUp;
  readonly ThumbsDownIcon = ThumbsDown;
  readonly PauseCircleIcon = PauseCircle;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);
  readonly permissions = inject(PermissionService);

  // ── State ──────────────────────────────────────────────────────────────
  readonly ref = signal('');
  readonly activeTab = signal<TabId>('synthese');
  readonly isLoading = signal(false);
  readonly resume = signal<CreditResume | null>(null);
  readonly error = signal<string | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────
  readonly demande = computed(() => this.resume()?.demande ?? null);
  readonly statut = computed(() => this.demande()?.statut ?? 0);
  readonly statuts = CREDIT_STATUTS;

  /** L'utilisateur connecté peut agir sur ce dossier */
  readonly canAct = computed(() => {
    const s = this.statut();
    const allowed = ACTIONS_PAR_STATUT[s] ?? [];
    return allowed.length > 0 && this.permissions.hasRole(...allowed);
  });

  readonly tabs = computed<{ id: TabId; label: string; show: boolean }[]>(() => {
    const r = this.resume();
    return [
      { id: 'synthese',    label: 'Synthèse',         show: true },
      { id: 'swot',        label: 'SWOT',             show: !!(r?.aSwots?.length) },
      { id: 'garanties',   label: 'Garanties',        show: !!r?.garantieProposes },
      { id: 'proposition', label: 'Proposition AR',   show: !!r?.proposition },
      { id: 'contre-eval', label: 'Contre-éval.',     show: !!r?.contreEvaluation },
      { id: 'comites',     label: 'Comités',          show: !!(r?.precomites?.length || r?.comites?.length) },
      { id: 'decision',    label: 'Décision finale',  show: !!r?.decision },
      { id: 'historique',  label: 'Historique',       show: true },
    ];
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    const ref = this.route.snapshot.paramMap.get('ref') ?? '';
    this.ref.set(ref);
    this.load();
  }

  // ── Actions ────────────────────────────────────────────────────────────
  goBack() {
    this.router.navigate(['/app/credit/list']);
  }

  refresh() {
    this.load();
  }

  switchTab(tab: TabId) {
    this.activeTab.set(tab);
  }

  goToFiche() {
    this.router.navigate(['/app/credit', this.ref()]);
  }

  private load() {
    this.isLoading.set(true);
    this.error.set(null);
    this.creditService.getResumeAnalyse(this.ref()).subscribe({
      next: (data) => {
        this.resume.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le résumé du dossier.');
        this.isLoading.set(false);
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  statutLabel(statut: number): string {
    return this.statuts[statut]?.label ?? `Statut ${statut}`;
  }

  statutVariant(statut: number) {
    return this.statuts[statut]?.variant ?? 'default';
  }

  formatMontant(n: number | undefined): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  }

  comiteLabel(decision: CreditComiteDecision): string {
    const user = decision.user?.nomPrenom ?? 'Inconnu';
    const profil = decision.user?.profil?.libelle ?? '';
    return profil ? `${user} — ${profil}` : user;
  }
}
