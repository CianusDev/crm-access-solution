import { Component, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, KeyValuePipe, NgTemplateOutlet } from '@angular/common';
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
  User,
  Building2,
  FileText,
  Clock,
  BarChart3,
  Send,
  ThumbsUp,
  ThumbsDown,
  PauseCircle,
  Download,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { PermissionService } from '@/core/services/permission/permission.service';
import { UserRole } from '@/core/models/user.model';
import { CreditService } from '../../services/credit/credit.service';
import {
  CREDIT_STATUTS,
  AuditLog,
  CreditDocumentAnnexe,
  CreditResume,
  CreditComiteDecision,
  CreditSWOT,
  CreditGarantieDecisionItem,
} from '../../interfaces/credit.interface';

type TabId =
  | 'synthese'
  | 'swot'
  | 'garanties'
  | 'proposition'
  | 'contre-eval'
  | 'rapport-contre-eval'
  | 'comites'
  | 'decision'
  | 'documents'
  | 'historique';

type AuditTabId = 'documents' | 'modifications' | 'ajouts';

/** Profils autorisés à agir selon le statut */
const ACTIONS_PAR_STATUT: Record<number, UserRole[]> = {
  5: [UserRole.AnalysteRisque, UserRole.Admin],
  6: [UserRole.SuperviseurRisqueZone, UserRole.Admin],
  7: [UserRole.ChargeDuComite, UserRole.Admin],
  8: [UserRole.ResponsableRegional, UserRole.Admin],
  9: [
    UserRole.DirecteurRisque,
    UserRole.DirecteurGeneralAdjoint,
    UserRole.Chargedepartementcredit,
    UserRole.Admin,
  ],
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
    KeyValuePipe,
    NgTemplateOutlet,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    BadgeComponent,
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
  readonly UserIcon = User;
  readonly Building2Icon = Building2;
  readonly FileTextIcon = FileText;
  readonly ClockIcon = Clock;
  readonly BarChart3Icon = BarChart3;
  readonly SendIcon = Send;
  readonly ThumbsUpIcon = ThumbsUp;
  readonly ThumbsDownIcon = ThumbsDown;
  readonly PauseCircleIcon = PauseCircle;
  readonly DownloadIcon = Download;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly permissions = inject(PermissionService);

  readonly data = input<CreditResume>();

  constructor() {
    effect(
      () => {
        const data = this.data();
        if (!data) return;
        this.resume.set(data);
        this.isLoading.set(false);
      },
      { allowSignalWrites: true },
    );
  }

  // ── State ──────────────────────────────────────────────────────────────
  readonly ref = signal('');
  readonly activeTab = signal<TabId>('synthese');
  readonly isLoading = signal(false);
  readonly resume = signal<CreditResume | null>(null);
  readonly error = signal<string | null>(null);

  // Documents (chargés séparément, comme l'ancien frontend)
  readonly documents = signal<CreditDocumentAnnexe[]>([]);

  // Garanties sous-onglets
  garantiesSousOnglet: 'pdf' | 'calcul' = 'pdf';

  // Audit logs (Historique tab)
  readonly auditLogsDocuments = signal<AuditLog[]>([]);
  readonly auditLogsModifications = signal<AuditLog[]>([]);
  readonly auditLogsAjouts = signal<AuditLog[]>([]);
  readonly auditLogsLoading = signal(false);
  readonly activeAuditTab = signal<AuditTabId>('documents');
  readonly showHistoriqueTab = signal(false);
  private auditLogsLoaded = false;

  // ── Computed ───────────────────────────────────────────────────────────
  readonly demande = computed(() => this.resume()?.demande ?? null);
  readonly statut = computed(() => this.demande()?.statut ?? 0);
  readonly statuts = CREDIT_STATUTS;

  /** Regroupe les items SWOT plats (typeAnalyse 1-4) en un objet catégorisé */
  readonly swot = computed<CreditSWOT>(() => {
    const items = this.resume()?.aSwots ?? [];
    return {
      forces: items.filter(i => i.typeAnalyse === 1).map(i => i.description ?? '').filter(Boolean),
      faiblesses: items.filter(i => i.typeAnalyse === 2).map(i => i.description ?? '').filter(Boolean),
      opportunites: items.filter(i => i.typeAnalyse === 3).map(i => i.description ?? '').filter(Boolean),
      menaces: items.filter(i => i.typeAnalyse === 4).map(i => i.description ?? '').filter(Boolean),
    };
  });

  /** L'utilisateur connecté peut agir sur ce dossier */
  readonly canAct = computed(() => {
    const s = this.statut();
    const allowed = ACTIONS_PAR_STATUT[s] ?? [];
    return allowed.length > 0 && this.permissions.hasRole(...allowed);
  });

  readonly isDossierEnPause = computed(() => this.demande()?.pause === 1);

  /** Document PDF "résumé dossier" (libelle == "RESUME DOSSIER CREDIT") */
  readonly resumeDocument = computed(() =>
    this.documents().find(d => d.libelle === 'RESUME DOSSIER CREDIT') ?? null
  );

  /** Document PDF "Actifs garanties" */
  readonly actifGarantiesDocument = computed(() =>
    this.documents().find(d => d.libelle === 'Actifs garanties') ?? null
  );

  /** Document PDF "RAPPORT DE CONTRE-ÉVALUATION" */
  readonly rapportContreEvalDocument = computed(() =>
    this.documents().find(d => d.libelle === 'RAPPORT DE CONTRE-ÉVALUATION') ?? null
  );

  readonly tabs = computed<{ id: TabId; label: string; show: boolean }[]>(() => {
    const r = this.resume();
    const d = r?.demande;
    const garantiesShow = !!(r?.garantieProposes || r?.garantieDecision?.garanties?.length);
    // Rapport contre-éval : visible si statut != 5 et typeCredit.code != '033' ni '016'
    const showRapportCE = !!(
      d &&
      d.statut !== 5 &&
      d.typeCredit?.code !== '033' &&
      d.typeCredit?.code !== '016'
    );
    return [
      { id: 'synthese', label: 'Synthèse', show: true },
      { id: 'swot', label: 'SWOT', show: !!r?.aSwots?.length },
      { id: 'garanties', label: 'Garanties', show: garantiesShow },
      { id: 'proposition', label: 'Proposition AR', show: !!r?.proposition },
      { id: 'contre-eval', label: 'Contre-éval.', show: !!r?.contreEvaluation },
      { id: 'rapport-contre-eval', label: 'Rapport contre-éval.', show: showRapportCE },
      { id: 'comites', label: 'Comités', show: !!(r?.precomites?.length || r?.comites?.length) },
      { id: 'decision', label: 'Décision finale', show: !!r?.decision },
      { id: 'documents', label: 'Documents', show: this.documents().length > 0 },
      { id: 'historique', label: 'Historique', show: this.showHistoriqueTab() },
    ];
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    const ref = this.route.snapshot.paramMap.get('ref') ?? '';
    this.ref.set(ref);
    this.loadDocuments();
    // Vérification de l'onglet historique au chargement (comme l'ancien frontend)
    this.checkHistoriqueVisibility();
  }

  // ── Actions ────────────────────────────────────────────────────────────
  refresh() {
    this.load();
  }

  switchTab(tab: TabId) {
    this.activeTab.set(tab);
    if (tab === 'historique' && !this.auditLogsLoaded) {
      this.loadAuditLogs();
    }
  }

  switchAuditTab(tab: AuditTabId) {
    this.activeAuditTab.set(tab);
    const ref = this.ref();
    if (!ref) return;
    this.auditLogsLoading.set(true);
    this.creditService.getLogs(ref, tab).subscribe({
      next: (res) => {
        if (tab === 'documents') this.auditLogsDocuments.set(res.data ?? []);
        else if (tab === 'modifications') this.auditLogsModifications.set(res.data ?? []);
        else if (tab === 'ajouts') this.auditLogsAjouts.set(res.data ?? []);
        this.auditLogsLoading.set(false);
      },
      error: () => this.auditLogsLoading.set(false),
    });
  }

  goToFiche() {
    this.router.navigate(['/app/credit', this.ref()]);
  }

  private checkHistoriqueVisibility() {
    const ref = this.ref();
    if (!ref) return;
    this.creditService.getLogs(ref, 'documents').subscribe({
      next: (res) => {
        this.showHistoriqueTab.set(res.statut === true);
        this.auditLogsDocuments.set(res.data ?? []);
        this.auditLogsLoaded = true;
      },
      error: () => { /* silent */ },
    });
  }

  private loadAuditLogs() {
    const ref = this.ref();
    if (!ref) return;
    this.auditLogsLoading.set(true);
    this.auditLogsLoaded = true;
    this.creditService.getLogs(ref, 'modifications').subscribe({
      next: (res) => {
        this.auditLogsModifications.set(res.data ?? []);
        this.auditLogsLoading.set(false);
      },
      error: () => this.auditLogsLoading.set(false),
    });
  }

  private loadDocuments() {
    const ref = this.ref();
    if (!ref) return;
    this.creditService.getDocuments(ref).subscribe({
      next: (docs) => this.documents.set(docs),
      error: () => { /* silent */ },
    });
  }

  private load() {
    this.isLoading.set(true);
    this.error.set(null);
    this.creditService.getResumeAnalyse(this.ref()).subscribe({
      next: (data) => {
        this.resume.set(data);
        this.isLoading.set(false);
        this.loadDocuments();
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

  getStatutJuridiqueLabel(statut: string | number | undefined): string {
    if (!statut) return '—';
    const numStatut = typeof statut === 'string' ? parseInt(statut, 10) : statut;
    const labels: Record<number, string> = {
      1: 'ENTREPRISE INDIVIDUELLE',
      2: 'SARL',
      3: 'SA',
      4: 'SASU',
      5: 'ASSOCIATION',
      6: 'COOPERATIVE',
      7: 'SAS',
      8: 'INFORMEL',
      9: 'SARLU',
      10: 'SCOOPS',
      11: 'COOP-CA',
    };
    return labels[numStatut] ?? '—';
  }

  /**
   * Calcule le montant du déposit pour une proposition/comité/décision donnée.
   * deposit (%) × montantEmprunte / 100
   */
  calculMontantDeposit(deposit: number | undefined, montantEmprunte: number | undefined): number {
    if (!deposit || !montantEmprunte) return 0;
    return (deposit * montantEmprunte) / 100;
  }

  isVehiculeGarantie(item: CreditGarantieDecisionItem): boolean {
    return item.refTypeGarantie === 'VEHI';
  }

  /** Parse la checkliste (peut être un JSON string, un tableau, ou null) */
  parseCheckliste(checkliste: unknown): string[] {
    if (!checkliste) return [];
    if (Array.isArray(checkliste)) {
      return (checkliste as unknown[]).filter((v): v is string => !!v && v !== null);
    }
    if (typeof checkliste === 'string') {
      try {
        const parsed = JSON.parse(checkliste) as unknown[];
        if (Array.isArray(parsed)) {
          return parsed.filter((v): v is string => !!v && v !== null);
        }
      } catch { /* ignore */ }
    }
    return [];
  }

  downloadDocument(url: string, libelle: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = libelle;
    a.target = '_blank';
    a.click();
  }

  safeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getObjetCreditLabel(objetCredit: string | number | undefined): string {
    if (!objetCredit) return '—';
    const numObjet = typeof objetCredit === 'string' ? parseInt(objetCredit, 10) : objetCredit;
    const labels: Record<number, string> = {
      1: 'Fonds de roulement',
      2: 'Investissement',
      3: 'Fonds de roulement et Investissement',
      4: 'Financement du pas-de-porte',
      5: 'Avance sur trésorerie',
    };
    return labels[numObjet] ?? '—';
  }
}
