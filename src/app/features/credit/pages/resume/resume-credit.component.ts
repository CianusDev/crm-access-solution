import { Component, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe, KeyValuePipe, NgTemplateOutlet } from '@angular/common';
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
  Pencil,
  CreditCard,
} from 'lucide-angular';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import {
  DrawerComponent,
  DrawerContentComponent,
  DrawerFooterComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
} from '@/shared/components/drawer/drawer.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { PermissionService } from '@/core/services/permission/permission.service';
import { UserRole } from '@/core/models/user.model';
import { AuthService } from '@/core/services/auth/auth.service';
import { CreditService } from '../../services/credit/credit.service';
import {
  CREDIT_STATUTS,
  AuditLog,
  CreditDocumentAnnexe,
  CreditResume,
  CreditComiteDecision,
  CreditSWOT,
  CreditSWOTItem,
  CreditCompteResultat,
  CreditCompteResultatActivite,
  CreditCompteResultatCreditAnterieurActivite,
  CreditCompteResultatMontantCreditAnterieur,
  CreditGarantieDecisionItem,
  CreditSaveComite,
} from '../../interfaces/credit.interface';
import { Avatar } from '@/shared/components/avatar/avatar.component';

type TabId =
  | 'synthese'
  | 'compte-resultats'
  | 'swot'
  | 'garanties'
  | 'proposition'
  | 'contre-eval'
  | 'rapport-contre-eval'
  | 'pre-comite'
  | 'comite'
  | 'decision'
  | 'recap-decisions'
  | 'documents'
  | 'historique';

type AuditTabId = 'documents' | 'modifications' | 'ajouts';
type CreditAnterieurType = 'VENTE' | 'ACHAT' | 'CHARGEEXPL' | 'AUTREREVENU' | 'CHARGEFAMIL';
type DecisionHistoryUser = {
  nomPrenom?: string;
  nom?: string;
  prenom?: string;
  agence?: { libelle?: string };
  profil?: { name?: string; libelle?: string } | string;
};
type DecisionHistorySource = {
  id?: number;
  dateDemande?: string | Date;
  dateDecision?: string | Date;
  createdAt?: string | Date;
  montantPropose?: number;
  montantEmprunte?: number;
  fraisDossier?: number;
  mensualite?: number;
  duree?: number;
  commentaire?: string;
  motivation?: string;
  argumentaire?: unknown;
  user?: DecisionHistoryUser;
  decideur?: DecisionHistoryUser;
};
type DecisionHistoryTimelineItem = {
  id: string;
  decision: string;
  date: string | Date | null;
  observation: string;
  durationBetweenSteps: string | null;
  userName: string;
  userRole: string;
};

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

const SWOT_DESCRIPTION_OPTIONS: Record<number, string[]> = {
  1: [
    'Ancienneté',
    'Vente importante',
    'Forte demande locale',
    'Activité génératrice de revenus réguliers',
    'Mobilité accrue des personnes et des biens',
    "Grande flexibilité dans l'offre de produits",
    'Proximité avec les clients locaux',
    'Génération de revenus rapides',
    'Capacité à répondre aux besoins spécifiques des clients',
    'Coûts de démarrage généralement bas',
    'Possibilité de développer un réseau de clients fidèles',
    'Contrôle sur la qualité des produits',
    'Possibilité de créer des marques locales',
    "Potentiel d'exportation vers d'autres régions",
    'Autres',
  ],
  2: [
    'Nouvelle activité',
    'Méconnaissance du marché',
    'Abscence de promotteur',
    'Sensibilité aux fluctuations du prix du carburant',
    'Manque de qualification ou compétences',
    'Difficultés de gestion des stocks',
    'Dépendance à la demande locale',
    'Manque de diversification des produits/services',
    'Difficile à standardiser',
    'Sensibilité aux fluctuations de la demande',
    'Manque de mécanisation',
    'Coûts de production élevés',
    "Problèmes d'approvisionnement en matières premières",
    "Coûts d'entretien élevés",
    'Autres',
  ],
  3: [
    'Bon de commande',
    'Marché à exécuter',
    'Développement des infrastructures',
    'Croissance du commerce interurbain',
    'Augmentation de la demande',
    'Digitalisation des ventes (e-commerce)',
    'Élargissement de la gamme de produits/services',
    "Partenariats avec d'autres entreprises",
    'Expansion vers de nouveaux marchés',
    'Offrir des services complémentaires',
    'Utilisation des nouvelles technologies',
    'Innovations pour réduire les coûts de production',
    'Autres',
  ],
  4: [
    'Fortes concurrence',
    'Activité ephémère',
    "Risque d'accidents ou de litiges",
    'Concurrence intense',
    'Fluctuation des prix des marchandises ou matières premières',
    'Risque de faillite en période de crise',
    'Concurrence accrue dans certains secteurs',
    "Barrières à l'entrée sur certains marchés",
    "Risque d'obsolescence de certaines compétences ou technologies",
    'Autres',
  ],
};

@Component({
  selector: 'app-resume-credit',
  templateUrl: './resume-credit.component.html',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    KeyValuePipe,
    NgTemplateOutlet,
    LucideAngularModule,
    BadgeComponent,
    DrawerComponent,
    DrawerHeaderComponent,
    DrawerTitleComponent,
    DrawerContentComponent,
    DrawerFooterComponent,
    Avatar,
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
  readonly PencilIcon = Pencil;
  readonly CreditCardIcon = CreditCard;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly auth = inject(AuthService);
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
  readonly documentSearch = signal('');
  readonly isUploadingDocument = signal(false);
  readonly deletingDocumentId = signal<number | null>(null);
  readonly selectedDocumentFile = signal<File | null>(null);
  readonly documentDrawerOpen = signal(false);
  readonly documentForm = this.fb.group({
    libelle: ['', Validators.required],
    description: [''],
  });

  // Garanties sous-onglets
  garantiesSousOnglet: 'pdf' | 'calcul' = 'pdf';

  // Audit logs (Historique tab)
  readonly auditLogsDocuments = signal<AuditLog[]>([]);
  readonly auditLogsModifications = signal<AuditLog[]>([]);
  readonly auditLogsAjouts = signal<AuditLog[]>([]);
  readonly auditLogsLoading = signal(false);
  readonly activeAuditTab = signal<AuditTabId>('documents');
  readonly showHistoriqueTab = signal(false);
  readonly decisionHistoryDrawerOpen = signal(false);
  private auditLogsLoaded = false;

  // Proposition AR (édition legacy)
  readonly propositionEditorOpen = signal(false);
  readonly isSavingProposition = signal(false);
  readonly isCalculatingPropositionFrais = signal(false);
  readonly isUploadingResumeDocument = signal(false);
  readonly propositionMontantActeNotarie = signal(0);
  readonly propositionFraisDossier = signal(0);
  readonly propositionForm = this.fb.group({
    montantPropose: [null as number | null, Validators.required],
    hypotheque: [null as number | null, Validators.required], // 1=Oui, 2=Non
    duree: [null as number | null, Validators.required],
    mensualite: [null as number | null, Validators.required],
    dateEcheanceSouhaite: ['', Validators.required],
    periodeGrace: [2 as number | null, Validators.required], // 1=Oui, 2=Non
    nbreMoisGrace: [0 as number | null, Validators.required],
    acteNotarie: [0 as number | null, Validators.required], // 1=Oui, 0=Non
    assurMultiRisk: [0 as number | null, Validators.required], // 1=Oui, 0=Non
    argumentaire: ['', Validators.required],
  });
  readonly swotEditorOpen = signal(false);
  readonly swotIsEditing = signal(false);
  readonly isSavingSwot = signal(false);
  readonly swotEditorTitle = signal("Enregistrement Force (Analyse SWOT)");
  readonly swotForm = this.fb.group({
    aSwot: [''],
    typeAnalyse: [1 as number | null, Validators.required],
    description: ['', Validators.required],
    libelle: [''],
  });
  readonly contreEvaluationEditorOpen = signal(false);
  readonly isSavingContreEvaluation = signal(false);
  readonly isCalculatingContreEvaluationFrais = signal(false);
  readonly contreEvaluationMontantActeNotarie = signal(0);
  readonly contreEvaluationFraisDossier = signal(0);
  readonly contreEvaluationForm = this.fb.group({
    montantPropose: [null as number | null, Validators.required],
    hypotheque: [null as number | null, Validators.required], // 1=Oui, 2=Non
    duree: [null as number | null, Validators.required],
    mensualite: [null as number | null, Validators.required],
    dateEcheanceSouhaite: ['', Validators.required],
    periodeGrace: [2 as number | null, Validators.required], // 1=Oui, 2=Non
    nbreMoisGrace: [0 as number | null, Validators.required],
    acteNotarie: [0 as number | null, Validators.required], // 1=Oui, 0=Non
    assurMultiRisk: [0 as number | null, Validators.required], // 1=Oui, 0=Non
    argumentaire: ['', Validators.required],
  });
  readonly comiteEditorOpen = signal(false);
  readonly comiteEditorMode = signal<'pre-comite' | 'comite'>('pre-comite');
  readonly isSavingComite = signal(false);
  readonly isCalculatingComiteFrais = signal(false);
  readonly comiteMontantActeNotarie = signal(0);
  readonly comiteFraisDossier = signal(0);
  readonly comiteCommissionDeboursement = signal(0);
  readonly comiteAssurDecesInvalidite = signal(0);
  readonly comiteMontantEmprunte = signal(0);
  readonly comiteChecklist = signal<string[]>([]);
  readonly editingPreComiteId = signal<number | null>(null);
  readonly editingComiteId = signal<number | null>(null);
  readonly comiteForm = this.fb.group({
    montantPropose: [null as number | null, Validators.required],
    hypotheque: [2 as number | null, Validators.required],
    duree: [null as number | null, Validators.required],
    mensualite: [null as number | null, Validators.required],
    dateEcheanceSouhaite: [null as number | null, Validators.required],
    periodeGrace: [2 as number | null, Validators.required],
    nbreMoisGrace: [0 as number | null, Validators.required],
    acteNotarie: [0 as number | null, Validators.required],
    assurMultiRisk: [0 as number | null, Validators.required],
    deposit: [null as number | null, Validators.required],
    argumentaire: ['', Validators.required],
  });
  readonly decisionFinaleEditorOpen = signal(false);
  readonly isSavingDecisionFinale = signal(false);
  readonly isCalculatingDecisionFinaleFrais = signal(false);
  readonly decisionFinaleMontantActeNotarie = signal(0);
  readonly decisionFinaleFraisDossier = signal(0);
  readonly decisionFinaleCommissionDeboursement = signal(0);
  readonly decisionFinaleAssurDecesInvalidite = signal(0);
  readonly decisionFinaleMontantEmprunte = signal(0);
  readonly decisionFinaleChecklist = signal<string[]>([]);
  readonly decisionFinaleForm = this.fb.group({
    montantPropose: [null as number | null, Validators.required],
    hypotheque: [2 as number | null, Validators.required],
    duree: [null as number | null, Validators.required],
    mensualite: [null as number | null, Validators.required],
    dateEcheanceSouhaite: [null as number | null, Validators.required],
    periodeGrace: [2 as number | null, Validators.required],
    nbreMoisGrace: [0 as number | null, Validators.required],
    acteNotarie: [0 as number | null, Validators.required],
    assurMultiRisk: [0 as number | null, Validators.required],
    deposit: [null as number | null, Validators.required],
    commentaire: ['', Validators.required],
  });
  readonly editingCreditAnterieurType = signal<CreditAnterieurType | null>(null);
  readonly isSavingCreditAnterieur = signal(false);
  readonly creditAnterieurForm = this.fb.group({
    type: ['' as CreditAnterieurType | '', Validators.required],
    montant: [null as number | null, Validators.required],
    activite: [null as number | null],
  });

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
  readonly compteResultat = computed<CreditCompteResultat | null>(
    () => this.normalizeCompteResultat(this.resume()),
  );
  readonly canViewCompteResultats = computed(() => {
    if (this.permissions.hasRole(UserRole.AnalysteRisque)) return false;
    return !!this.compteResultat() || this.permissions.hasRole(UserRole.Admin);
  });
  readonly canEditCreditAnterieur = computed(
    () => this.statut() === 5 && this.permissions.hasRole(UserRole.AnalysteRisque, UserRole.Admin),
  );
  readonly canEditPropositionAR = computed(
    () => this.statut() === 5 && this.permissions.hasRole(UserRole.AnalysteRisque),
  );
  readonly canUploadResumeDocument = computed(
    () =>
      (this.statut() === 5 || this.isDossierEnPause()) &&
      this.permissions.hasRole(UserRole.AnalysteRisque, UserRole.Admin),
  );
  readonly canManageDocumentAnnexe = computed(() => {
    const blockedStatuts = new Set([13, 14, 16, 17, 18, 21, 30]);
    return !blockedStatuts.has(this.statut());
  });
  readonly filteredDocuments = computed(() => {
    const query = this.documentSearch().trim().toLowerCase();
    if (!query) return this.documents();
    return this.documents().filter((doc) => {
      const libelle = doc.libelle?.toLowerCase() ?? '';
      const description = doc.description?.toLowerCase() ?? '';
      return libelle.includes(query) || description.includes(query);
    });
  });
  readonly canEditResumeDocument = computed(
    () => this.statut() === 5 && this.permissions.hasRole(UserRole.AnalysteRisque, UserRole.Admin),
  );
  readonly canEditSwotAR = computed(
    () => this.statut() === 5 && this.permissions.hasRole(UserRole.AnalysteRisque, UserRole.Admin),
  );
  readonly canEditContreEvaluation = computed(
    () =>
      this.statut() === 6 &&
      this.permissions.hasRole(UserRole.SuperviseurRisqueZone, UserRole.Admin),
  );
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly canCreatePreComiteDecision = computed(() => {
    if (this.statut() !== 7) return false;
    if (!this.permissions.hasRole(UserRole.ChargeDuComite, UserRole.Admin)) return false;
    if ((this.resume()?.precomites?.length ?? 0) > 0) return false;
    return !!(this.resume()?.proposition || this.resume()?.contreEvaluation);
  });
  readonly canCreateComiteDecision = computed(() => {
    if (![8, 9, 10, 11].includes(this.statut())) return false;
    if (!this.canAct()) return false;
    if ((this.resume()?.comites?.length ?? 0) > 0) return false;
    return (this.resume()?.precomites?.length ?? 0) > 0;
  });
  readonly canCreateDecisionFinale = computed(() => {
    if (![8, 9, 10, 11, 12, 28].includes(this.statut())) return false;
    if (!this.canAct()) return false;
    if (this.resume()?.decision) return false;
    const code = this.demande()?.typeCredit?.code;
    if (code === '002') {
      return !!((this.resume()?.precomites?.length ?? 0) || this.resume()?.proposition);
    }
    return !!(
      (this.resume()?.comites?.length ?? 0) ||
      (this.resume()?.precomites?.length ?? 0) ||
      this.resume()?.proposition
    );
  });
  readonly canEditDecisionFinale = computed(() => {
    const decisionUserId = this.toNumber(this.resume()?.decision?.user?.id);
    const currentUserId = this.currentUserId();
    if (!decisionUserId || !currentUserId) return false;
    return decisionUserId === currentUserId;
  });
  readonly hasDecisionHistory = computed(() => {
    const r = this.resume();
    if (!r) return false;
    return !!(
      r.proposition ||
      r.contreEvaluation ||
      (r.precomites?.length ?? 0) > 0 ||
      (r.comites?.length ?? 0) > 0 ||
      r.decision
    );
  });
  readonly garantieProposeeTotal = computed(() => {
    const garanties = this.resume()?.garantieProposes;
    if (!garanties) return 0;

    const legacyTotal = this.toFiniteNumber(garanties.total);
    if (legacyTotal != null) return legacyTotal;

    const montantTotal = this.toFiniteNumber(garanties.montantTotal);
    if (montantTotal != null) return montantTotal;

    return (garanties.garanties ?? []).reduce((sum, item) => sum + this.toNumber(item.montant), 0);
  });
  readonly garantieDecisionTotalLegacy = computed(() => {
    const garanties = this.resume()?.garantieDecision?.garanties ?? [];
    if (garanties.length > 0) {
      return garanties.reduce((sum, garantie) => {
        const montantDecision = this.toNumber(garantie.montantDecision);
        const montant = this.toNumber(garantie.montant);
        // Parité legacy: si montantDecision vaut 0/null, on retombe sur montant.
        return sum + (montantDecision || montant);
      }, 0);
    }

    return this.toNumber(this.resume()?.garantieDecision?.total);
  });
  readonly garantieDecisionTotalDisplayLegacy = computed(() => {
    const backendTotal = this.toFiniteNumber(this.resume()?.garantieDecision?.total);
    if (backendTotal != null) return backendTotal;
    return this.garantieDecisionTotalLegacy();
  });
  readonly decisionHistoryTimelineItems = computed<DecisionHistoryTimelineItem[]>(() => {
    const observations = this.resume()?.observations ?? [];
    return observations.map((observation, index) => {
      const actor: DecisionHistoryUser | undefined = observation.user
        ? {
            nomPrenom: observation.user.nomPrenom,
            nom: observation.user.nom,
            prenom: observation.user.prenom,
            profil: observation.user.profil,
            agence: observation.user.libelleAgence
              ? { libelle: observation.user.libelleAgence }
              : undefined,
          }
        : undefined;

      return {
        id: observation.id != null ? `obs-${observation.id}` : `obs-${index}`,
        decision: (observation.decision ?? observation.libelle ?? '—').trim() || '—',
        observation: observation.observation ?? '',
        date: observation.date ?? observation.createdAt ?? null,
        durationBetweenSteps: this.observationDurationBetweenSteps(index, observations),
        userName: this.resolveDecisionUserName(actor),
        userRole: this.resolveDecisionUserRole(actor),
      };
    });
  });

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
    // Rapport contre-éval : visible si statut != 5 et typeCredit.code != '033' ni '016'
    const showRapportCE = !!(
      d &&
      d.statut !== 5 &&
      d.typeCredit?.code !== '033' &&
      d.typeCredit?.code !== '016'
    );
    return [
      { id: 'synthese', label: "RESUME DE L'ANALYSE", show: true },
      { id: 'compte-resultats', label: 'COMPTE DE RESULTATS', show: this.canViewCompteResultats() },
      { id: 'garanties', label: 'GARANTIES PROPOSEES', show: true },
      { id: 'swot', label: 'ANALYSE SWOT', show: true },
      { id: 'proposition', label: "PROPOSITION DE L'AR", show: !!r?.proposition },
      {
        id: 'contre-eval',
        label: 'CONTRE-EVALUATION',
        show:
          !!r?.contreEvaluation ||
          (d?.statut === 6 &&
            this.permissions.hasRole(UserRole.SuperviseurRisqueZone, UserRole.Admin)),
      },
      { id: 'rapport-contre-eval', label: 'RAPPORT CONTRE-EV...', show: showRapportCE },
      {
        id: 'pre-comite',
        label: 'PRE-COMITE',
        show: !!r?.precomites?.length || this.canCreatePreComiteDecision(),
      },
      { id: 'comite', label: 'COMITE', show: !!r?.comites?.length || this.canCreateComiteDecision() },
      { id: 'decision', label: 'DECISION FINALE', show: !!r?.decision || this.canCreateDecisionFinale() },
      { id: 'recap-decisions', label: 'RECAP. DECISIONS', show: this.hasDecisionHistory() },
      { id: 'documents', label: 'DOCUMENTS', show: true },
      { id: 'historique', label: 'HISTORIQUE', show: this.showHistoriqueTab() },
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
    if (tab !== 'compte-resultats') this.cancelCreditAnterieurEdit();
    if (tab === 'historique' && !this.auditLogsLoaded) {
      this.loadAuditLogs();
    }
  }

  openCreditAnterieurEdit(
    type: CreditAnterieurType,
    montant: number | undefined,
    activiteId?: number,
  ) {
    if (!this.canEditCreditAnterieur()) return;
    this.creditAnterieurForm.patchValue({
      type,
      montant: this.toNumber(montant),
      activite: activiteId ?? null,
    });
    this.editingCreditAnterieurType.set(type);
  }

  isEditingCreditAnterieur(type: CreditAnterieurType): boolean {
    return this.editingCreditAnterieurType() === type;
  }

  cancelCreditAnterieurEdit() {
    this.editingCreditAnterieurType.set(null);
    this.creditAnterieurForm.patchValue({
      type: '',
      montant: null,
      activite: null,
    });
  }

  saveCreditAnterieurEdit() {
    if (this.creditAnterieurForm.invalid || !this.ref()) {
      this.creditAnterieurForm.markAllAsTouched();
      return;
    }

    const raw = this.creditAnterieurForm.getRawValue();
    const type = raw.type as CreditAnterieurType | '';
    if (!type) return;

    const payload: Record<string, unknown> = {
      refDemande: this.ref(),
      montant: this.toNumber(raw.montant),
      type,
    };

    const activiteId = this.toNumber(raw.activite);
    const request$ =
      activiteId > 0
        ? this.creditService.saveCreditAnterieurActivite({ ...payload, activite: activiteId })
        : this.creditService.saveCreditAnterieur(payload);

    this.isSavingCreditAnterieur.set(true);
    request$.subscribe({
      next: (res) => {
        if (res?.status && res.status !== 200) {
          this.toast.error(res.message ?? "Échec d'enregistrement du crédit antérieur.");
          this.isSavingCreditAnterieur.set(false);
          return;
        }
        this.toast.success('Crédit antérieur mis à jour avec succès.');
        this.isSavingCreditAnterieur.set(false);
        this.cancelCreditAnterieurEdit();
        this.refresh();
      },
      error: () => {
        this.toast.error("Impossible d'enregistrer le crédit antérieur.");
        this.isSavingCreditAnterieur.set(false);
      },
    });
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

  openSwotEditor(typeAnalyse: number) {
    this.swotIsEditing.set(false);
    this.swotEditorTitle.set(this.swotEditorText(typeAnalyse, false));
    this.swotForm.patchValue({
      aSwot: '',
      typeAnalyse,
      description: '',
      libelle: '',
    });
    this.swotEditorOpen.set(true);
  }

  openSwotEditEditor(item: CreditSWOTItem) {
    this.swotIsEditing.set(true);
    const typeAnalyse = this.toNumber(item.typeAnalyse) || 1;
    this.swotEditorTitle.set(this.swotEditorText(typeAnalyse, true));
    this.swotForm.patchValue({
      aSwot: item.id != null ? String(item.id) : '',
      typeAnalyse,
      description: item.description ?? '',
      libelle: '',
    });
    this.swotEditorOpen.set(true);
  }

  closeSwotEditor() {
    this.swotEditorOpen.set(false);
    this.swotIsEditing.set(false);
    this.swotForm.patchValue({
      aSwot: '',
      typeAnalyse: 1,
      description: '',
      libelle: '',
    });
  }

  onSwotDrawerOpenChange(open: boolean) {
    if (open) {
      this.swotEditorOpen.set(true);
      return;
    }
    this.closeSwotEditor();
  }

  saveSwotFromResume() {
    if (this.swotForm.invalid || !this.ref()) {
      this.swotForm.markAllAsTouched();
      return;
    }
    const raw = this.swotForm.getRawValue();
    const description = (raw.description ?? '').trim();
    const libelle = (raw.libelle ?? '').trim();
    if (description === 'Autres' && !libelle) {
      this.toast.error('Veuillez renseigner le champ Autres.');
      return;
    }
    const payload = {
      aSwot: raw.aSwot ? this.toNumber(raw.aSwot) : '',
      refDemande: this.ref(),
      typeAnalyse: this.toNumber(raw.typeAnalyse),
      description: description === 'Autres' ? libelle : description,
    };
    this.isSavingSwot.set(true);
    this.creditService.saveSWOT(payload).subscribe({
      next: (res) => {
        if (res?.status && res.status !== 200) {
          this.toast.error(res.message ?? "Échec de l'enregistrement SWOT.");
          this.isSavingSwot.set(false);
          return;
        }
        this.toast.success('Analyse SWOT enregistrée.');
        this.isSavingSwot.set(false);
        this.closeSwotEditor();
        this.refresh();
      },
      error: () => {
        this.toast.error("Impossible d'enregistrer l'analyse SWOT.");
        this.isSavingSwot.set(false);
      },
    });
  }

  openPropositionEditor() {
    const p = this.resume()?.proposition;
    if (p) {
      this.propositionForm.patchValue({
        montantPropose: this.toNumber(p.montantPropose),
        hypotheque: this.toNumber(p.hypotheque) || 2,
        duree: this.toNumber(p.duree),
        mensualite: this.toNumber(p.mensualite),
        dateEcheanceSouhaite: p.dateEcheanceSouhaite != null ? String(p.dateEcheanceSouhaite) : '',
        periodeGrace: this.toNumber(p.periodeGrace) || 2,
        nbreMoisGrace: this.toNumber(p.nbreMoisGrace),
        acteNotarie: this.toNumber(p.acteNotarie),
        assurMultiRisk: this.toNumber(p.assurMultiRisk),
        argumentaire: p.argumentaire ?? p.motivation ?? p.commentaire ?? '',
      });
      this.propositionMontantActeNotarie.set(this.toNumber(p.montantActeNotarie));
      this.propositionFraisDossier.set(this.toNumber(p.fraisDossier));
    } else {
      this.propositionForm.reset({
        montantPropose: null,
        hypotheque: null,
        duree: null,
        mensualite: null,
        dateEcheanceSouhaite: '',
        periodeGrace: 2,
        nbreMoisGrace: 0,
        acteNotarie: 0,
        assurMultiRisk: 0,
        argumentaire: '',
      });
      this.propositionMontantActeNotarie.set(0);
      this.propositionFraisDossier.set(0);
    }
    this.propositionEditorOpen.set(true);
  }

  closePropositionEditor() {
    this.propositionEditorOpen.set(false);
  }

  recalculatePropositionFrais() {
    const hypotheque = this.toNumber(this.propositionForm.get('hypotheque')?.value);
    const montant = this.toNumber(this.propositionForm.get('montantPropose')?.value);
    const duree = this.toNumber(this.propositionForm.get('duree')?.value);
    if (!hypotheque || !montant || !duree || !this.ref()) return;
    this.isCalculatingPropositionFrais.set(true);
    this.creditService
      .calculateFraisDossier({
        refDemande: this.ref(),
        hypotheque,
        montant,
        duree,
      })
      .subscribe({
        next: (res) => {
          const payload = res as Record<string, unknown>;
          const status = this.toNumber(payload['status']);
          if (status && status !== 200) {
            this.toast.error('Impossible de calculer les frais.');
            this.isCalculatingPropositionFrais.set(false);
            return;
          }
          this.propositionMontantActeNotarie.set(
            this.toNumber(payload['montantActeNotaire'] ?? payload['montantActeNotarie']),
          );
          this.propositionFraisDossier.set(this.toNumber(payload['taxe'] ?? payload['fraisDossier']));
          this.isCalculatingPropositionFrais.set(false);
        },
        error: () => {
          this.toast.error('Impossible de calculer les frais.');
          this.isCalculatingPropositionFrais.set(false);
        },
      });
  }

  savePropositionARFromResume() {
    if (this.propositionForm.invalid || !this.ref()) {
      this.propositionForm.markAllAsTouched();
      return;
    }
    const raw = this.propositionForm.getRawValue();
    const montantPropose = this.toNumber(raw.montantPropose);
    const fraisDossier = this.propositionFraisDossier();
    const payload = {
      refDemande: this.ref(),
      proposition: this.resume()?.proposition?.id,
      montantPropose,
      fraisDossier,
      montantActeNotarie: this.propositionMontantActeNotarie(),
      montantEmprunte: montantPropose + fraisDossier,
      duree: this.toNumber(raw.duree),
      mensualite: this.toNumber(raw.mensualite),
      dateEcheanceSouhaite: raw.dateEcheanceSouhaite ?? '',
      periodeGrace: this.toNumber(raw.periodeGrace),
      nbreMoisGrace: this.toNumber(raw.periodeGrace) === 1 ? this.toNumber(raw.nbreMoisGrace) : 0,
      hypotheque: this.toNumber(raw.hypotheque),
      acteNotarie: this.toNumber(raw.acteNotarie),
      assurMultiRisk: this.toNumber(raw.assurMultiRisk),
      argumentaire: raw.argumentaire ?? '',
      motivation: '',
      checkliste: this.parseCheckliste(this.resume()?.proposition?.checkliste),
    };
    this.isSavingProposition.set(true);
    this.creditService.savePropositionAR(payload).subscribe({
      next: (res) => {
        if (res?.status && res.status !== 200) {
          this.toast.error(res.message ?? 'Échec de l’enregistrement de la proposition.');
          this.isSavingProposition.set(false);
          return;
        }
        this.toast.success('Proposition enregistrée avec succès.');
        this.isSavingProposition.set(false);
        this.closePropositionEditor();
        this.refresh();
      },
      error: () => {
        this.toast.error('Impossible d’enregistrer la proposition.');
        this.isSavingProposition.set(false);
      },
    });
  }

  onResumeDocumentSelected(event: Event, replace: boolean) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.ref()) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      this.toast.error('Veuillez sélectionner un fichier PDF.');
      input.value = '';
      return;
    }

    this.isUploadingResumeDocument.set(true);

    const upload = () => {
      const formData = new FormData();
      formData.append('refDemande', this.ref());
      formData.append('libelle', 'RESUME DOSSIER CREDIT');
      formData.append('description', 'RESUME DOSSIER CREDIT');
      formData.append('document', file);

      this.creditService.uploadDocument(formData).subscribe({
        next: (res) => {
          if (res?.status && res.status !== 200) {
            this.toast.error(res.message ?? "Échec de l'upload du résumé.");
            this.isUploadingResumeDocument.set(false);
            input.value = '';
            return;
          }
          this.toast.success('Résumé de l’analyse chargé avec succès.');
          this.isUploadingResumeDocument.set(false);
          input.value = '';
          this.loadDocuments();
        },
        error: () => {
          this.toast.error("Impossible d'uploader le résumé.");
          this.isUploadingResumeDocument.set(false);
          input.value = '';
        },
      });
    };

    const currentResumeDoc = this.resumeDocument();
    if (replace && currentResumeDoc?.id) {
      this.creditService.deleteDocument(currentResumeDoc.id).subscribe({
        next: () => upload(),
        error: () => {
          this.toast.error('Impossible de remplacer le document résumé.');
          this.isUploadingResumeDocument.set(false);
          input.value = '';
        },
      });
      return;
    }

    upload();
  }

  openContreEvaluationEditor() {
    const ce = this.resume()?.contreEvaluation;
    const source = ce ?? this.resume()?.proposition;
    if (source) {
      this.contreEvaluationForm.patchValue({
        montantPropose: this.toNumber(source.montantPropose),
        hypotheque: this.toNumber(source.hypotheque) || 2,
        duree: this.toNumber(source.duree),
        mensualite: this.toNumber(source.mensualite),
        dateEcheanceSouhaite:
          source.dateEcheanceSouhaite != null ? String(source.dateEcheanceSouhaite) : '',
        periodeGrace: this.toNumber(source.periodeGrace) || 2,
        nbreMoisGrace: this.toNumber(source.nbreMoisGrace),
        acteNotarie: this.toNumber(source.acteNotarie),
        assurMultiRisk: this.toNumber(source.assurMultiRisk),
        argumentaire: source.argumentaire ?? source.motivation ?? source.commentaire ?? '',
      });
      this.contreEvaluationMontantActeNotarie.set(this.toNumber(source.montantActeNotarie));
      this.contreEvaluationFraisDossier.set(this.toNumber(source.fraisDossier));
    } else {
      this.contreEvaluationForm.reset({
        montantPropose: null,
        hypotheque: null,
        duree: null,
        mensualite: null,
        dateEcheanceSouhaite: '',
        periodeGrace: 2,
        nbreMoisGrace: 0,
        acteNotarie: 0,
        assurMultiRisk: 0,
        argumentaire: '',
      });
      this.contreEvaluationMontantActeNotarie.set(0);
      this.contreEvaluationFraisDossier.set(0);
    }
    this.contreEvaluationEditorOpen.set(true);
  }

  closeContreEvaluationEditor() {
    this.contreEvaluationEditorOpen.set(false);
  }

  recalculateContreEvaluationFrais() {
    const hypotheque = this.toNumber(this.contreEvaluationForm.get('hypotheque')?.value);
    const montant = this.toNumber(this.contreEvaluationForm.get('montantPropose')?.value);
    const duree = this.toNumber(this.contreEvaluationForm.get('duree')?.value);
    if (!hypotheque || !montant || !duree || !this.ref()) return;
    this.isCalculatingContreEvaluationFrais.set(true);
    this.creditService
      .calculateFraisDossier({
        refDemande: this.ref(),
        hypotheque,
        montant,
        duree,
      })
      .subscribe({
        next: (res) => {
          const payload = res as Record<string, unknown>;
          const status = this.toNumber(payload['status']);
          if (status && status !== 200) {
            this.toast.error('Impossible de calculer les frais.');
            this.isCalculatingContreEvaluationFrais.set(false);
            return;
          }
          this.contreEvaluationMontantActeNotarie.set(
            this.toNumber(payload['montantActeNotaire'] ?? payload['montantActeNotarie']),
          );
          this.contreEvaluationFraisDossier.set(
            this.toNumber(payload['taxe'] ?? payload['fraisDossier']),
          );
          this.isCalculatingContreEvaluationFrais.set(false);
        },
        error: () => {
          this.toast.error('Impossible de calculer les frais.');
          this.isCalculatingContreEvaluationFrais.set(false);
        },
      });
  }

  saveContreEvaluationFromResume() {
    if (this.contreEvaluationForm.invalid || !this.ref()) {
      this.contreEvaluationForm.markAllAsTouched();
      return;
    }
    const raw = this.contreEvaluationForm.getRawValue();
    const montantPropose = this.toNumber(raw.montantPropose);
    const fraisDossier = this.contreEvaluationFraisDossier();
    const payload = {
      refDemande: this.ref(),
      contreEvaluation: this.resume()?.contreEvaluation?.id,
      montantPropose,
      fraisDossier,
      montantActeNotarie: this.contreEvaluationMontantActeNotarie(),
      montantEmprunte: montantPropose + fraisDossier,
      duree: this.toNumber(raw.duree),
      mensualite: this.toNumber(raw.mensualite),
      dateEcheanceSouhaite: raw.dateEcheanceSouhaite ?? '',
      periodeGrace: this.toNumber(raw.periodeGrace),
      nbreMoisGrace: this.toNumber(raw.periodeGrace) === 1 ? this.toNumber(raw.nbreMoisGrace) : 0,
      hypotheque: this.toNumber(raw.hypotheque),
      acteNotarie: this.toNumber(raw.acteNotarie),
      assurMultiRisk: this.toNumber(raw.assurMultiRisk),
      argumentaire: raw.argumentaire ?? '',
      motivation: '',
      checkliste: this.parseCheckliste(
        this.resume()?.contreEvaluation?.checkliste ?? this.resume()?.proposition?.checkliste,
      ),
    };
    this.isSavingContreEvaluation.set(true);
    this.creditService.saveContreEvaluation(payload).subscribe({
      next: (res) => {
        if (res?.status && res.status !== 200) {
          this.toast.error(res.message ?? 'Échec de l’enregistrement de la contre-évaluation.');
          this.isSavingContreEvaluation.set(false);
          return;
        }
        this.toast.success('Contre-évaluation enregistrée avec succès.');
        this.isSavingContreEvaluation.set(false);
        this.closeContreEvaluationEditor();
        this.refresh();
      },
      error: () => {
        this.toast.error('Impossible d’enregistrer la contre-évaluation.');
        this.isSavingContreEvaluation.set(false);
      },
    });
  }

  openPreComiteEditor() {
    this.openComiteDecisionEditor('pre-comite');
  }

  openComiteEditor() {
    this.openComiteDecisionEditor('comite');
  }

  openPreComiteEditEditor(decision: CreditComiteDecision) {
    this.openComiteDecisionEditor('pre-comite', decision);
  }

  openComiteEditEditor(decision: CreditComiteDecision) {
    this.openComiteDecisionEditor('comite', decision);
  }

  closeComiteEditor() {
    this.comiteEditorOpen.set(false);
    this.editingPreComiteId.set(null);
    this.editingComiteId.set(null);
    this.comiteChecklist.set([]);
  }

  canEditDecisionCard(decision: CreditComiteDecision): boolean {
    const currentUserId = this.currentUserId();
    if (!currentUserId) return false;
    return this.toNumber(decision.user?.id) === currentUserId;
  }

  private openComiteDecisionEditor(
    mode: 'pre-comite' | 'comite',
    existing?: CreditComiteDecision,
  ) {
    const source = existing ?? this.seedComiteDecisionSource(mode);
    if (!source) {
      this.toast.error('Aucune base de décision disponible.');
      return;
    }

    this.comiteEditorMode.set(mode);
    this.editingPreComiteId.set(
      mode === 'pre-comite' && existing ? this.toNumber(source.id) || null : null,
    );
    this.editingComiteId.set(mode === 'comite' && existing ? this.toNumber(source.id) || null : null);
    this.comiteChecklist.set(this.parseCheckliste(source.checkliste));

    this.comiteForm.patchValue({
      montantPropose: this.toNumber(source.montantPropose),
      hypotheque: this.toNumber(source.hypotheque) || 2,
      duree: this.toNumber(source.duree),
      mensualite: this.toNumber(source.mensualite),
      dateEcheanceSouhaite: this.toNumber(source.dateEcheanceSouhaite),
      periodeGrace: this.toNumber(source.periodeGrace) || 2,
      nbreMoisGrace: this.toNumber(source.nbreMoisGrace),
      acteNotarie: this.toNumber(source.acteNotarie),
      assurMultiRisk: this.toNumber(source.assurMultiRisk),
      deposit: this.toNumber(source.deposit),
      argumentaire: source.argumentaire ?? source.motivation ?? source.commentaire ?? '',
    });

    this.comiteMontantActeNotarie.set(this.toNumber(source.montantActeNotarie));
    this.comiteFraisDossier.set(this.toNumber(source.fraisDossier));
    this.comiteCommissionDeboursement.set(this.toNumber(source.commissionDeboursement));
    this.comiteAssurDecesInvalidite.set(this.toNumber(source.assurDecesInvalidite));
    this.comiteMontantEmprunte.set(
      this.toNumber(source.montantEmprunte) ||
        this.toNumber(source.montantPropose) + this.toNumber(source.fraisDossier),
    );

    this.comiteEditorOpen.set(true);
  }

  private seedComiteDecisionSource(mode: 'pre-comite' | 'comite'): CreditComiteDecision | null {
    const r = this.resume();
    if (!r) return null;
    if (mode === 'pre-comite') {
      const pre = r.precomites?.[0];
      if (pre) return pre;
      return r.contreEvaluation ?? r.proposition ?? null;
    }
    return r.comites?.[0] ?? r.precomites?.[0] ?? null;
  }

  recalculateComiteFrais() {
    const hypotheque = this.toNumber(this.comiteForm.get('hypotheque')?.value);
    const duree = this.toNumber(this.comiteForm.get('duree')?.value);
    const montant = this.toNumber(this.demande()?.montantSollicite) || this.toNumber(this.comiteForm.get('montantPropose')?.value);
    if (!this.ref() || !hypotheque || !duree || !montant) return;

    this.isCalculatingComiteFrais.set(true);
    this.creditService
      .calculateFraisDossier({
        refDemande: this.ref(),
        hypotheque,
        montant,
        duree,
      })
      .subscribe({
        next: (res) => {
          const payload = res as Record<string, unknown>;
          const status = this.toNumber(payload['status']);
          if (status && status !== 200) {
            this.toast.error('Impossible de calculer les frais.');
            this.isCalculatingComiteFrais.set(false);
            return;
          }

          this.comiteMontantActeNotarie.set(
            this.toNumber(payload['montantActeNotaire'] ?? payload['montantActeNotarie']),
          );
          this.comiteFraisDossier.set(this.toNumber(payload['taxe'] ?? payload['fraisDossier']));
          this.comiteCommissionDeboursement.set(
            this.toNumber(payload['commissionDeboursemt'] ?? payload['commissionDeboursement']),
          );
          this.comiteAssurDecesInvalidite.set(
            this.toNumber(payload['mtAssurDecesInvalidite'] ?? payload['assurDecesInvalidite']),
          );
          const montantEmprunte =
            this.toNumber(payload['montantADebloquer'] ?? payload['montantEmprunte']) ||
            this.toNumber(this.comiteForm.get('montantPropose')?.value) + this.comiteFraisDossier();
          this.comiteMontantEmprunte.set(montantEmprunte);
          this.isCalculatingComiteFrais.set(false);
        },
        error: () => {
          this.toast.error('Impossible de calculer les frais.');
          this.isCalculatingComiteFrais.set(false);
        },
      });
  }

  calculateComiteMontantDeposit(): number {
    const montant = this.toNumber(this.comiteForm.get('montantPropose')?.value);
    const deposit = this.toNumber(this.comiteForm.get('deposit')?.value);
    if (!montant || !deposit) return 0;
    return (deposit / 100) * montant;
  }

  calculateComiteTauxCouverture(): number {
    const montant = this.toNumber(this.comiteForm.get('montantPropose')?.value);
    if (!montant) return 0;
    const totalGaranties = this.garantieDecisionTotalLegacy();
    const taux = ((totalGaranties + this.calculateComiteMontantDeposit()) / montant) * 100;
    return Number.isFinite(taux) ? taux : 0;
  }

  saveComiteDecisionFromResume() {
    if (this.comiteForm.invalid || !this.ref()) {
      this.comiteForm.markAllAsTouched();
      return;
    }

    const raw = this.comiteForm.getRawValue();
    const payload: CreditSaveComite = {
      refDemande: this.ref(),
      decision: 1,
      montantPropose: this.toNumber(raw.montantPropose),
      montantEmprunte:
        this.comiteMontantEmprunte() ||
        this.toNumber(raw.montantPropose) + this.comiteFraisDossier(),
      mensualite: this.toNumber(raw.mensualite),
      duree: this.toNumber(raw.duree),
      fraisDossier: this.comiteFraisDossier(),
      commissionDeboursement: this.comiteCommissionDeboursement(),
      assurDecesInvalidite: this.comiteAssurDecesInvalidite(),
      assurMultiRisk: this.toNumber(raw.assurMultiRisk),
      acteNotarie: this.toNumber(raw.acteNotarie),
      montantActeNotarie: this.comiteMontantActeNotarie(),
      authGage: 0,
      hypotheque: this.toNumber(raw.hypotheque),
      tauxCouverture: this.calculateComiteTauxCouverture(),
      periodeGrace: this.toNumber(raw.periodeGrace),
      nbreMoisGrace: this.toNumber(raw.periodeGrace) === 1 ? this.toNumber(raw.nbreMoisGrace) : 0,
      deposit: this.toNumber(raw.deposit),
      dateEcheanceSouhaite: String(raw.dateEcheanceSouhaite ?? ''),
      argumentaire: raw.argumentaire ?? '',
      motivation: '',
      checkliste: this.comiteChecklist(),
    };

    const mode = this.comiteEditorMode();
    if (mode === 'pre-comite' && this.editingPreComiteId()) {
      payload.precomite = this.editingPreComiteId()!;
    }
    if (mode === 'comite' && this.editingComiteId()) {
      payload.comite = this.editingComiteId()!;
      payload.comiteClt = this.editingComiteId()!;
    }

    this.isSavingComite.set(true);
    const request$ =
      mode === 'pre-comite'
        ? this.creditService.savePreComiteDecision(payload)
        : this.creditService.saveComiteDecision(payload);

    request$.subscribe({
      next: (res) => {
        if (res?.status && res.status !== 200) {
          this.toast.error(res.message ?? 'Échec de l’enregistrement de la décision.');
          this.isSavingComite.set(false);
          return;
        }
        this.toast.success(
          mode === 'pre-comite'
            ? 'Décision pré-comité enregistrée avec succès.'
            : 'Décision comité enregistrée avec succès.',
        );
        this.isSavingComite.set(false);
        this.closeComiteEditor();
        this.refresh();
      },
      error: () => {
        this.toast.error('Impossible d’enregistrer la décision.');
        this.isSavingComite.set(false);
      },
    });
  }

  openDecisionFinaleEditor() {
    const source = this.seedDecisionFinaleSource();
    if (!source) {
      this.toast.error('Aucune base de décision disponible.');
      return;
    }

    this.decisionFinaleChecklist.set(this.parseCheckliste(source.checkliste));
    this.decisionFinaleForm.patchValue({
      montantPropose: this.toNumber(source.montantPropose),
      hypotheque: this.toNumber(source.hypotheque) || 2,
      duree: this.toNumber(source.duree),
      mensualite: this.toNumber(source.mensualite),
      dateEcheanceSouhaite: this.toNumber(source.dateEcheanceSouhaite),
      periodeGrace: this.toNumber(source.periodeGrace) || 2,
      nbreMoisGrace: this.toNumber(source.nbreMoisGrace),
      acteNotarie: this.toNumber(source.acteNotarie),
      assurMultiRisk: this.toNumber(source.assurMultiRisk),
      deposit: this.toNumber(source.deposit),
      commentaire: source.commentaire ?? source.argumentaire ?? source.motivation ?? '',
    });

    this.decisionFinaleMontantActeNotarie.set(this.toNumber(source.montantActeNotarie));
    this.decisionFinaleFraisDossier.set(this.toNumber(source.fraisDossier));
    this.decisionFinaleCommissionDeboursement.set(this.toNumber(source.commissionDeboursement));
    this.decisionFinaleAssurDecesInvalidite.set(this.toNumber(source.assurDecesInvalidite));
    this.decisionFinaleMontantEmprunte.set(
      this.toNumber(source.montantEmprunte) ||
        this.toNumber(source.montantPropose) + this.toNumber(source.fraisDossier),
    );
    this.decisionFinaleEditorOpen.set(true);
  }

  closeDecisionFinaleEditor() {
    this.decisionFinaleEditorOpen.set(false);
    this.decisionFinaleChecklist.set([]);
  }

  private seedDecisionFinaleSource():
    | CreditComiteDecision
    | NonNullable<CreditResume['decision']>
    | CreditResume['proposition']
    | CreditResume['contreEvaluation']
    | null {
    const r = this.resume();
    if (!r) return null;
    if (r.decision) return r.decision;

    const code = this.demande()?.typeCredit?.code;
    if (code === '002') {
      return r.precomites?.[0] ?? r.proposition ?? null;
    }
    return r.comites?.[0] ?? r.precomites?.[0] ?? r.proposition ?? null;
  }

  recalculateDecisionFinaleFrais() {
    const hypotheque = this.toNumber(this.decisionFinaleForm.get('hypotheque')?.value);
    const duree = this.toNumber(this.decisionFinaleForm.get('duree')?.value);
    const montant =
      this.toNumber(this.demande()?.montantSollicite) ||
      this.toNumber(this.decisionFinaleForm.get('montantPropose')?.value);
    if (!this.ref() || !hypotheque || !duree || !montant) return;

    this.isCalculatingDecisionFinaleFrais.set(true);
    this.creditService
      .calculateFraisDossier({
        refDemande: this.ref(),
        hypotheque,
        montant,
        duree,
      })
      .subscribe({
        next: (res) => {
          const payload = res as Record<string, unknown>;
          const status = this.toNumber(payload['status']);
          if (status && status !== 200) {
            this.toast.error('Impossible de calculer les frais.');
            this.isCalculatingDecisionFinaleFrais.set(false);
            return;
          }
          this.decisionFinaleMontantActeNotarie.set(
            this.toNumber(payload['montantActeNotaire'] ?? payload['montantActeNotarie']),
          );
          this.decisionFinaleFraisDossier.set(
            this.toNumber(payload['taxe'] ?? payload['fraisDossier']),
          );
          this.decisionFinaleCommissionDeboursement.set(
            this.toNumber(payload['commissionDeboursemt'] ?? payload['commissionDeboursement']),
          );
          this.decisionFinaleAssurDecesInvalidite.set(
            this.toNumber(payload['mtAssurDecesInvalidite'] ?? payload['assurDecesInvalidite']),
          );
          const montantEmprunte =
            this.toNumber(payload['montantADebloquer'] ?? payload['montantEmprunte']) ||
            this.toNumber(this.decisionFinaleForm.get('montantPropose')?.value) +
              this.decisionFinaleFraisDossier();
          this.decisionFinaleMontantEmprunte.set(montantEmprunte);
          this.isCalculatingDecisionFinaleFrais.set(false);
        },
        error: () => {
          this.toast.error('Impossible de calculer les frais.');
          this.isCalculatingDecisionFinaleFrais.set(false);
        },
      });
  }

  calculateDecisionFinaleMontantDeposit(): number {
    const montant = this.toNumber(this.decisionFinaleForm.get('montantPropose')?.value);
    const deposit = this.toNumber(this.decisionFinaleForm.get('deposit')?.value);
    if (!montant || !deposit) return 0;
    return (deposit / 100) * montant;
  }

  calculateDecisionFinaleTauxCouverture(): number {
    const montant = this.toNumber(this.decisionFinaleForm.get('montantPropose')?.value);
    if (!montant) return 0;
    const totalGaranties = this.garantieDecisionTotalLegacy();
    const taux = ((totalGaranties + this.calculateDecisionFinaleMontantDeposit()) / montant) * 100;
    return Number.isFinite(taux) ? taux : 0;
  }

  saveDecisionFinaleFromResume() {
    if (this.decisionFinaleForm.invalid || !this.ref()) {
      this.decisionFinaleForm.markAllAsTouched();
      return;
    }

    const raw = this.decisionFinaleForm.getRawValue();
    const payload = {
      refDemande: this.ref(),
      montantPropose: this.toNumber(raw.montantPropose),
      montantEmprunte:
        this.decisionFinaleMontantEmprunte() ||
        this.toNumber(raw.montantPropose) + this.decisionFinaleFraisDossier(),
      mensualite: this.toNumber(raw.mensualite),
      duree: this.toNumber(raw.duree),
      fraisDossier: this.decisionFinaleFraisDossier(),
      commissionDeboursement: this.decisionFinaleCommissionDeboursement(),
      assurDecesInvalidite: this.decisionFinaleAssurDecesInvalidite(),
      assurMultiRisk: this.toNumber(raw.assurMultiRisk),
      acteNotarie: this.toNumber(raw.acteNotarie),
      montantActeNotarie: this.decisionFinaleMontantActeNotarie(),
      authGage: 0,
      hypotheque: this.toNumber(raw.hypotheque),
      tauxCouverture: this.calculateDecisionFinaleTauxCouverture(),
      periodeGrace: this.toNumber(raw.periodeGrace),
      nbreMoisGrace:
        this.toNumber(raw.periodeGrace) === 1 ? this.toNumber(raw.nbreMoisGrace) : 0,
      deposit: this.toNumber(raw.deposit),
      dateEcheanceSouhaite: String(raw.dateEcheanceSouhaite ?? ''),
      commentaire: raw.commentaire ?? '',
      checkliste: this.decisionFinaleChecklist(),
    };

    this.isSavingDecisionFinale.set(true);
    this.creditService.saveDecisionFinale(payload).subscribe({
      next: (res) => {
        if (res?.status && res.status !== 200) {
          this.toast.error(res.message ?? 'Échec de l’enregistrement de la décision finale.');
          this.isSavingDecisionFinale.set(false);
          return;
        }
        this.toast.success('Décision finale enregistrée avec succès.');
        this.isSavingDecisionFinale.set(false);
        this.closeDecisionFinaleEditor();
        this.refresh();
      },
      error: () => {
        this.toast.error('Impossible d’enregistrer la décision finale.');
        this.isSavingDecisionFinale.set(false);
      },
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

  onDocumentSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    this.selectedDocumentFile.set(file);
  }

  openDocumentDrawer() {
    this.resetDocumentForm();
    this.documentDrawerOpen.set(true);
  }

  closeDocumentDrawer() {
    this.documentDrawerOpen.set(false);
    this.resetDocumentForm();
  }

  resetDocumentForm() {
    this.documentForm.reset({ libelle: '', description: '' });
    this.selectedDocumentFile.set(null);
  }

  uploadDocumentAnnexe() {
    if (!this.canManageDocumentAnnexe()) return;
    if (this.documentForm.invalid || !this.ref()) {
      this.documentForm.markAllAsTouched();
      return;
    }
    const file = this.selectedDocumentFile();
    if (!file) {
      this.toast.error('Veuillez sélectionner un fichier PDF.');
      return;
    }

    const raw = this.documentForm.getRawValue();
    const formData = new FormData();
    formData.append('refDemande', this.ref());
    formData.append('libelle', raw.libelle?.trim() ?? '');
    formData.append('description', raw.description?.trim() || raw.libelle?.trim() || '');
    formData.append('document', file);

    this.isUploadingDocument.set(true);
    this.creditService.uploadDocument(formData).subscribe({
      next: (res) => {
        if (res?.status && res.status !== 200) {
          this.toast.error(res.message ?? "Échec de l'ajout du document.");
          this.isUploadingDocument.set(false);
          return;
        }
        this.toast.success('Document ajouté avec succès.');
        this.isUploadingDocument.set(false);
        this.closeDocumentDrawer();
        this.loadDocuments();
      },
      error: () => {
        this.toast.error("Impossible d'ajouter le document.");
        this.isUploadingDocument.set(false);
      },
    });
  }

  canDeleteDocument(doc: CreditDocumentAnnexe): boolean {
    const currentUserId = this.currentUserId();
    const docUserId = this.toNumber(doc.userId);
    return !!currentUserId && !!docUserId && currentUserId === docUserId;
  }

  deleteDocumentAnnexe(doc: CreditDocumentAnnexe) {
    if (!this.canDeleteDocument(doc)) return;
    this.deletingDocumentId.set(doc.id);
    this.creditService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.toast.success('Document supprimé avec succès.');
        this.deletingDocumentId.set(null);
        this.loadDocuments();
      },
      error: () => {
        this.toast.error('Impossible de supprimer le document.');
        this.deletingDocumentId.set(null);
      },
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

  private toNumber(value: unknown): number {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const parsed = Number(String(value).replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private normalizeCompteResultat(resume: CreditResume | null): CreditCompteResultat | null {
    const resumeObject = this.toPlainObject(resume);
    if (!resumeObject) return null;

    const compteResultatObject = this.toPlainObject(
      this.readFirstValue(resumeObject, [
        'compteResultat',
        'compte_resultat',
        'compteResultats',
        'compte_resultats',
      ]),
    );
    if (!compteResultatObject) return null;

    const principal = this.normalizeCompteResultatActivite(
      this.readFirstValue(compteResultatObject, [
        'activitePrincipal',
        'activitePrincipale',
        'activite_principal',
        'activite_principale',
      ]),
    );

    const autresRaw = this.readFirstValue(compteResultatObject, [
      'autresActivite',
      'autresActivites',
      'autres_activite',
      'autres_activites',
    ]);
    const autresActivite = (Array.isArray(autresRaw) ? autresRaw : [])
      .map((item) => this.normalizeCompteResultatActivite(item))
      .filter((item): item is CreditCompteResultatActivite => !!item)
      .map((item) => ({
        id: item.id,
        libelle: item.libelle,
        resultNet: item.resultNet,
      }));

    const autreRevenuFamille = this.normalizeCompteResultatMontant(
      this.readFirstValue(compteResultatObject, [
        'autreRevenuFamille',
        'autresRevenusFamille',
        'autre_revenu_famille',
      ]),
    );
    const chargeFamilliale = this.normalizeCompteResultatMontant(
      this.readFirstValue(compteResultatObject, [
        'chargeFamilliale',
        'chargeFamiliale',
        'chargesFamiliales',
        'charge_familiale',
      ]),
    );
    const soldeFamille = this.normalizeCompteResultatMontant(
      this.readFirstValue(compteResultatObject, ['soldeFamille', 'soldeFamilial', 'solde_famille']),
    );
    const capaciteRemb = this.normalizeCompteResultatMontant(
      this.readFirstValue(compteResultatObject, [
        'capaciteRemb',
        'capaciteRemboursement',
        'capacite_remboursement',
      ]),
    );

    const hasData =
      !!principal ||
      autresActivite.length > 0 ||
      !!autreRevenuFamille ||
      !!chargeFamilliale ||
      !!soldeFamille ||
      !!capaciteRemb;
    if (!hasData) return null;

    return {
      activitePrincipal: principal ?? {},
      autresActivite,
      autreRevenuFamille,
      chargeFamilliale,
      soldeFamille,
      capaciteRemb,
    };
  }

  private normalizeCompteResultatActivite(value: unknown): CreditCompteResultatActivite | undefined {
    const obj = this.toPlainObject(value);
    if (!obj) return undefined;

    const id = this.toFiniteNumber(this.readFirstValue(obj, ['id']));
    const libelleValue = this.readFirstValue(obj, ['libelle', 'label', 'designation']);
    const libelle = typeof libelleValue === 'string' ? libelleValue : undefined;
    const ventes = this.toFiniteNumber(this.readFirstValue(obj, ['ventes', 'vente']));
    const achats = this.toFiniteNumber(this.readFirstValue(obj, ['achats', 'achat']));
    const margeCom = this.toFiniteNumber(
      this.readFirstValue(obj, ['margeCom', 'margeComm', 'margeCommerciale']),
    );
    const chargeExpl = this.toFiniteNumber(
      this.readFirstValue(obj, ['chargeExpl', 'chargeExplo', 'chargeExploitation']),
    );
    const resultNet = this.toFiniteNumber(this.readFirstValue(obj, ['resultNet', 'resultatNet', 'resultat']));
    const creditAnt = this.normalizeCompteResultatCreditAnterieur(
      this.readFirstValue(obj, ['creditAnt', 'creditAnterieur', 'credit_anterieur']),
    );

    const hasData =
      id != null ||
      !!libelle ||
      ventes != null ||
      achats != null ||
      margeCom != null ||
      chargeExpl != null ||
      resultNet != null ||
      !!creditAnt;
    if (!hasData) return undefined;

    return {
      id,
      libelle,
      ventes,
      achats,
      margeCom,
      chargeExpl,
      resultNet,
      creditAnt,
    };
  }

  private normalizeCompteResultatCreditAnterieur(
    value: unknown,
  ): CreditCompteResultatCreditAnterieurActivite | undefined {
    const obj = this.toPlainObject(value);
    if (!obj) return undefined;

    const vente = this.toFiniteNumber(this.readFirstValue(obj, ['vente', 'ventes']));
    const achat = this.toFiniteNumber(this.readFirstValue(obj, ['achat', 'achats']));
    const margeComm = this.toFiniteNumber(this.readFirstValue(obj, ['margeComm', 'margeCom']));
    const chargeExplo = this.toFiniteNumber(this.readFirstValue(obj, ['chargeExplo', 'chargeExpl']));

    if (vente == null && achat == null && margeComm == null && chargeExplo == null) return undefined;

    return {
      vente,
      achat,
      margeComm,
      chargeExplo,
    };
  }

  private normalizeCompteResultatMontant(
    value: unknown,
  ): CreditCompteResultatMontantCreditAnterieur | undefined {
    if (value == null || value === '') return undefined;

    const scalar = this.toFiniteNumber(value);
    if (scalar != null) {
      return { total: scalar };
    }

    const obj = this.toPlainObject(value);
    if (!obj) return undefined;

    const total = this.toFiniteNumber(this.readFirstValue(obj, ['total', 'montant']));
    const creditAnt = this.toFiniteNumber(
      this.readFirstValue(obj, ['creditAnt', 'creditAnterieur', 'credit_anterieur']),
    );

    if (total == null && creditAnt == null) return undefined;

    return {
      total,
      creditAnt,
    };
  }

  private toPlainObject(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  }

  private readFirstValue(source: Record<string, unknown>, keys: string[]): unknown {
    for (const key of keys) {
      const value = source[key];
      if (value !== undefined && value !== null) return value;
    }
    return undefined;
  }

  private toFiniteNumber(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    const parsed = Number(String(value).replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  swotItems(typeAnalyse: number): CreditSWOTItem[] {
    return (this.resume()?.aSwots ?? []).filter((i) => this.toNumber(i.typeAnalyse) === typeAnalyse);
  }

  swotDescriptionOptions(): string[] {
    return SWOT_DESCRIPTION_OPTIONS[this.toNumber(this.swotForm.get('typeAnalyse')?.value)] ?? [];
  }

  isSwotDescriptionAutres(): boolean {
    return this.swotForm.get('description')?.value === 'Autres';
  }

  private swotEditorText(typeAnalyse: number, isEdit: boolean): string {
    const action = isEdit ? 'Modification' : 'Enregistrement';
    if (typeAnalyse === 1) return `${action} Force (Analyse SWOT)`;
    if (typeAnalyse === 2) return `${action} Faiblesse (Analyse SWOT)`;
    if (typeAnalyse === 3) return `${action} Opportunité (Analyse SWOT)`;
    if (typeAnalyse === 4) return `${action} Menace (Analyse SWOT)`;
    return `${action} Analyse SWOT`;
  }

  comiteLabel(decision: CreditComiteDecision): string {
    const user = this.comiteActorName(decision.user);
    const profil = this.comiteActorProfil(decision.user);
    return profil !== '—' ? `${user} — ${profil}` : user;
  }

  comiteActorName(user?: CreditComiteDecision['user']): string {
    if (!user) return '—';
    const nomPrenom = user.nomPrenom?.trim();
    if (nomPrenom) return nomPrenom;
    const fullName = [user.nom?.trim(), user.prenom?.trim()].filter(Boolean).join(' ').trim();
    return fullName || '—';
  }

  comiteActorProfil(user?: CreditComiteDecision['user']): string {
    if (!user) return '—';
    const profil = user.profil as unknown;
    if (typeof profil === 'string') return profil.trim() || '—';
    if (profil && typeof profil === 'object') {
      const profilObj = profil as { libelle?: string; name?: string };
      const libelle = profilObj.libelle?.trim();
      if (libelle) return libelle;
      const name = profilObj.name?.trim();
      if (name) return name;
    }
    return this.comiteActorAgence(user) ?? '—';
  }

  comiteActorAgence(user?: CreditComiteDecision['user']): string | null {
    if (!user) return null;
    const agence = user.agence as unknown;
    if (typeof agence === 'string') return agence.trim() || null;
    if (agence && typeof agence === 'object') {
      const libelle = (agence as { libelle?: string }).libelle?.trim();
      return libelle || null;
    }
    return null;
  }

  decisionActorName(user?: DecisionHistoryUser): string {
    return this.resolveDecisionUserName(user);
  }

  decisionActorProfil(user?: DecisionHistoryUser): string {
    if (!user) return '—';
    if (typeof user.profil === 'string') return user.profil || '—';
    return user.profil?.libelle ?? user.profil?.name ?? '—';
  }

  decisionMontantEmprunte(source: DecisionHistorySource): number | undefined {
    const montantEmprunte = this.toFiniteNumber(source.montantEmprunte);
    if (montantEmprunte != null) return montantEmprunte;

    const montantPropose = this.toFiniteNumber(source.montantPropose);
    const fraisDossier = this.toFiniteNumber(source.fraisDossier);
    if (montantPropose != null && fraisDossier != null) return montantPropose + fraisDossier;
    return montantPropose;
  }

  propositionMontantEmprunte(proposition: CreditResume['proposition']): number | undefined {
    if (!proposition) return undefined;
    return this.decisionMontantEmprunte({
      montantEmprunte: proposition.montantEmprunte,
      montantPropose: proposition.montantPropose,
      fraisDossier: proposition.fraisDossier,
    });
  }

  decisionFinaleMontantEmprunteDisplay(decision: CreditResume['decision']): number | undefined {
    if (!decision) return undefined;
    return this.decisionMontantEmprunte({
      montantEmprunte: decision.montantEmprunte,
      montantPropose: decision.montantPropose,
      fraisDossier: decision.fraisDossier,
    });
  }

  private observationDurationBetweenSteps(
    index: number,
    observations: NonNullable<CreditResume['observations']>,
  ): string | null {
    if (index + 1 >= observations.length) return null;

    const currentDateRaw = observations[index]?.date ?? observations[index]?.createdAt;
    const previousDateRaw = observations[index + 1]?.date ?? observations[index + 1]?.createdAt;
    if (!currentDateRaw || !previousDateRaw) return null;

    const currentDate = new Date(currentDateRaw);
    const previousDate = new Date(previousDateRaw);
    const diffInMs = currentDate.getTime() - previousDate.getTime();
    if (!Number.isFinite(diffInMs) || diffInMs < 0) return null;

    const diffInSec = Math.floor(diffInMs / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHrs = Math.floor(diffInMin / 60);
    const diffInDays = Math.floor(diffInHrs / 24);

    const remainingHrs = diffInHrs % 24;
    const remainingMin = diffInMin % 60;
    const remainingSec = diffInSec % 60;

    let result = '';
    result = diffInDays !== 0 ? `${diffInDays} Jour - ` : '';
    result += remainingHrs !== 0 ? `${remainingHrs}h: ` : '';
    result += remainingMin !== 0 ? `${remainingMin}min: ` : '';
    result += `${remainingSec}s`;
    return result;
  }

  private resolveDecisionUserName(user?: DecisionHistoryUser): string {
    if (!user) return '—';
    const nomPrenom = user.nomPrenom?.trim();
    if (nomPrenom) return nomPrenom;
    const fullName = [user.nom?.trim(), user.prenom?.trim()].filter(Boolean).join(' ').trim();
    return fullName || '—';
  }

  private resolveDecisionUserRole(user?: DecisionHistoryUser): string {
    if (!user) return '—';
    if (typeof user.profil === 'string') return user.profil || user.agence?.libelle || '—';
    return user.profil?.libelle ?? user.profil?.name ?? user.agence?.libelle ?? '—';
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
   * deposit (%) × montantPropose / 100 (parité legacy)
   */
  calculMontantDeposit(deposit: number | undefined, montantPropose: number | undefined): number {
    if (!deposit || !montantPropose) return 0;
    return (deposit * montantPropose) / 100;
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

  private readonly DOC_BASE_URL = 'https://crm-fichiers.creditaccess.ci/crm/credit-ca/';

  downloadDocument(filename: string, libelle: string): void {
    const a = document.createElement('a');
    a.href = this.DOC_BASE_URL + filename;
    a.download = libelle;
    a.target = '_blank';
    a.click();
  }

  safeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.DOC_BASE_URL + url);
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
