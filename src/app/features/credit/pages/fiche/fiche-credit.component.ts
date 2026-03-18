import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
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
  MessageSquare,
  Search,
  FolderOpen,
  ClipboardList,
  CheckCircle2,
  DollarSign,
  Hash,
  Edit3,
  Shield,
  Truck,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import {
  DrawerComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
  DrawerContentComponent,
} from '@/shared/components/drawer/drawer.component';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { PermissionService } from '@/core/services/permission/permission.service';
import { UserRole } from '@/core/models/user.model';
import { CreditService } from '../../services/credit/credit.service';
import { CreditPDFService } from '../../services/pdf/credit-pdf.service';
import {
  LogoBase64,
  LogoPersonneMorale,
  SignatureDirecteurGeneralBase64,
} from '../../enumeration/logo_base64.enum';
import {
  CreditActionPayload,
  CREDIT_STATUTS,
  CreditDocumentAnnexe,
  CreditFiche,
  CreditObservation,
  GARANTIE_TYPE_IDS,
  GarantiesData,
  GarantieDAT,
  GarantieImmobilisation,
  GarantieMateriel,
  GarantieVehicule,
} from '../../interfaces/credit.interface';

type TabId = 'details' | 'documents' | 'checklist' | 'garanties';

interface ActionConfig {
  title: string;
  endpoint: 'observation' | 'cloture' | 'juridique' | 'annulation' | 'derogation';
  decision?: number;
  hasLeveeCondition?: boolean;
}

interface DocCheckItem {
  id: number;
  libelle: string;
  obligation: boolean;
  done: boolean;
}

interface LeveeConditionItem {
  libelle: string;
  done: boolean;
}

@Component({
  selector: 'app-fiche-credit',
  templateUrl: './fiche-credit.component.html',
  providers: [DatePipe],
  imports: [
    FormsModule,
    DatePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    Avatar,
    ButtonDirective,
    DrawerComponent,
    DrawerHeaderComponent,
    DrawerTitleComponent,
    DrawerContentComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogFooterComponent,
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
  readonly MessageSquareIcon = MessageSquare;
  readonly SearchIcon = Search;
  readonly FolderOpenIcon = FolderOpen;
  readonly ClipboardListIcon = ClipboardList;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly DollarSignIcon = DollarSign;
  readonly HashIcon = Hash;
  readonly Edit3Icon = Edit3;
  readonly ShieldIcon = Shield;
  readonly TruckIcon = Truck;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly creditService = inject(CreditService);
  private readonly pdfService = inject(CreditPDFService);
  readonly datePipe = inject(DatePipe);
  private readonly toast = inject(ToastService);
  readonly permissions = inject(PermissionService);

  readonly GARANTIE_IDS = GARANTIE_TYPE_IDS;

  // ── State ──────────────────────────────────────────────────────────────
  readonly ref = signal('');
  readonly activeTab = signal<TabId>('details');
  readonly obsDrawerOpen = signal(false);

  readonly isLoading = signal(false);
  readonly fiche = signal<CreditFiche | null>(null);
  readonly error = signal<string | null>(null);

  readonly isLoadingDocs = signal(false);
  readonly documents = signal<CreditDocumentAnnexe[]>([]);

  readonly isLoadingObs = signal(false);
  readonly observations = signal<CreditObservation[]>([]);

  // ── Garanties ──────────────────────────────────────────────────────────
  readonly isLoadingGaranties = signal(false);
  readonly garanties = signal<GarantiesData | null>(null);
  readonly activeGarantiesSection = signal<number>(GARANTIE_TYPE_IDS.VEHICULE);

  readonly isUploadingDoc = signal(false);
  readonly deletingDocId = signal<number | null>(null);

  // Dialog confirmation suppression
  deleteDialogOpen = false;
  readonly docToDelete = signal<CreditDocumentAnnexe | null>(null);

  // Upload form
  readonly docLibelle = signal('');
  readonly docDescription = signal('');
  selectedFile: File | null = null;

  // Recherche documents
  readonly docSearch = signal('');

  // ── Computed ───────────────────────────────────────────────────────────
  readonly filteredDocs = computed(() => {
    const q = this.docSearch().trim().toLowerCase();
    if (!q) return this.documents();
    return this.documents().filter(
      (d) =>
        d.libelle.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.user?.nomPrenom?.toLowerCase().includes(q),
    );
  });

  readonly demande = computed(() => this.fiche()?.demande ?? null);
  readonly decision = computed(() => this.fiche()?.decision ?? null);
  readonly pret = computed(() => this.fiche()?.pret ?? null);
  readonly isPersonneMorale = computed(() => this.demande()?.client?.typeAgent !== 'PP');
  readonly statuts = CREDIT_STATUTS;

  // ── Action workflow ─────────────────────────────────────────────────────
  protected readonly UserRole = UserRole;
  actionDialogOpen = false;
  currentAction: ActionConfig | null = null;
  readonly actionObs = signal('');
  readonly actionPwd = signal('');
  readonly isSubmittingAction = signal(false);
  readonly leveeConditions = signal<LeveeConditionItem[]>([]);

  // ── Document necessity checklist ────────────────────────────────────────
  readonly docChecklistItems = signal<DocCheckItem[]>([]);
  readonly docChecklistDoneCount = computed(
    () => this.docChecklistItems().filter((i) => i.done).length,
  );

  // ── AVSF (Avance sur fonds) ─────────────────────────────────────────────
  avsfDialogOpen = false;
  avsfMtDepositExige = '';
  avsfMtAvsfSollicite = '';
  avsfMotif = '';
  avsfNumPerfect = '';
  readonly isSavingAvsf = signal(false);

  // ── NumPret / NumContrat ─────────────────────────────────────────────────
  numPretDialogOpen = false;
  numPretValue = '';
  numContratValue = '';
  readonly isSavingNumPret = signal(false);

  // ── Modifier montant emprunté ────────────────────────────────────────────
  modifMontantDialogOpen = false;
  modifMontantEmprunte = '';
  modifMensualite = '';
  modifMontantCaution = '';
  readonly isSavingModifMontant = signal(false);

  readonly showActionsBar = computed(() => {
    const s = this.demande()?.statut;
    if (!s) return false;
    const p = this.permissions;
    if (p.hasRole(UserRole.Admin)) return [13, 14, 16, 17, 18, 22, 23, 26, 27].includes(s);
    return (
      (s === 13 &&
        p.hasRole(
          UserRole.responsableClient,
          UserRole.conseilClientele,
          UserRole.ResponsableJuridique,
          UserRole.ResponsableAssurance,
        )) ||
      (s === 14 && p.hasRole(UserRole.ResponsableFrontOffice)) ||
      (s === 16 && p.hasRole(UserRole.responsableClient, UserRole.conseilClientele)) ||
      (s === 17 && p.hasRole(UserRole.responsableClient, UserRole.conseilClientele)) ||
      (s === 18 && p.hasRole(UserRole.assistanteClientelePME)) ||
      (s === 22 &&
        p.hasRole(
          UserRole.ChefAgence,
          UserRole.ChefAgenceAdjoint,
          UserRole.responsableClient,
          UserRole.conseilClientele,
        )) ||
      (s === 23 && p.hasRole(UserRole.ResponsableFrontOffice)) ||
      (s === 26 &&
        p.hasRole(
          UserRole.DirecteurRisque,
          UserRole.DirecteurGeneralAdjoint,
          UserRole.DirectriceExploitation,
          UserRole.Chargedepartementcredit,
        )) ||
      (s === 27 && p.hasRole(UserRole.ResponsableFrontOffice))
    );
  });

  // ── Garanties computed ──────────────────────────────────────────────────
  readonly garantieVehicules = computed(() => {
    const g = this.garanties();
    if (!g) return [];
    const t = g.typeGaranties?.find((t) => t.id === GARANTIE_TYPE_IDS.VEHICULE);
    return (t?.garanties ?? []) as GarantieVehicule[];
  });

  readonly garantieImmobilisations = computed(() => {
    const g = this.garanties();
    if (!g) return [] as GarantieImmobilisation[];
    return (g.typeGaranties?.find((t) => t.id === GARANTIE_TYPE_IDS.IMMOBILISATION)?.garanties ?? []) as GarantieImmobilisation[];
  });

  readonly garantieMateriels = computed(() => {
    const g = this.garanties();
    if (!g) return [] as GarantieMateriel[];
    return (g.typeGaranties?.find((t) => t.id === GARANTIE_TYPE_IDS.MATERIEL_PRO)?.garanties ?? []) as GarantieMateriel[];
  });

  readonly garantieBiensMobiliers = computed(() => {
    const g = this.garanties();
    if (!g) return [] as GarantieMateriel[];
    return (g.typeGaranties?.find((t) => t.id === GARANTIE_TYPE_IDS.BIEN_MOBILIER_FAMILLE)?.garanties ?? []) as GarantieMateriel[];
  });

  readonly garantieDats = computed(() => {
    const g = this.garanties();
    if (!g) return [] as GarantieDAT[];
    return (g.typeGaranties?.find((t) => t.id === GARANTIE_TYPE_IDS.DAT)?.garanties ?? []) as GarantieDAT[];
  });

  readonly totalGarantiesFixe = computed(() => {
    return this.garanties()?.typeGaranties?.reduce((sum, t) => sum + (t.total ?? 0), 0) ?? 0;
  });

  readonly totalGarantiesPrime = computed(() => {
    return this.garanties()?.typeGaranties?.reduce((sum, t) => sum + (t.total_prime ?? 0), 0) ?? 0;
  });

  readonly garantieSectionItems = computed(() => {
    const g = this.garanties();
    if (!g) return [];
    return [
      { id: 0, label: 'Totaux', count: null },
      { id: GARANTIE_TYPE_IDS.VEHICULE, label: 'Véhicules', count: this.garantieVehicules().length },
      { id: GARANTIE_TYPE_IDS.IMMOBILISATION, label: 'Immobilisations', count: this.garantieImmobilisations().length },
      { id: GARANTIE_TYPE_IDS.DAT, label: 'DAT', count: this.garantieDats().length },
      { id: GARANTIE_TYPE_IDS.MATERIEL_PRO, label: 'Matériels professionnels', count: this.garantieMateriels().length },
      { id: GARANTIE_TYPE_IDS.BIEN_MOBILIER_FAMILLE, label: 'Biens mobiliers famille', count: this.garantieBiensMobiliers().length },
      { id: -1, label: 'Cautions solidaires', count: g.crCaution?.length ?? 0 },
    ];
  });

  // ── Computed helpers ────────────────────────────────────────────────────
  readonly showLeveeCondition = computed(() => {
    const code = this.demande()?.typeCredit?.code ?? '';
    return ['002', '035', '011', '004', '019', '021', '015', '032', '033', '016'].includes(code);
  });

  readonly showAvsfButton = computed(() => {
    const s = this.demande()?.statut;
    const avsf = this.demande()?.avsFond;
    const p = this.permissions;
    return (
      s === 13 &&
      (!avsf || avsf.statut !== 3) &&
      p.hasRole(UserRole.responsableClient, UserRole.conseilClientele, UserRole.Admin)
    );
  });

  readonly showNumPretButton = computed(() => {
    const s = this.demande()?.statut;
    const p = this.permissions;
    return (
      s != null &&
      s >= 14 &&
      !this.pret()?.numPret &&
      p.hasRole(
        UserRole.responsableClient,
        UserRole.conseilClientele,
        UserRole.ResponsableFrontOffice,
        UserRole.Admin,
      )
    );
  });

  readonly showModifMontantButton = computed(() => {
    const s = this.demande()?.statut;
    const p = this.permissions;
    return (
      s != null &&
      [14, 15, 16].includes(s) &&
      !!this.decision()?.montantEmprunte &&
      p.hasRole(
        UserRole.responsableClient,
        UserRole.conseilClientele,
        UserRole.ResponsableFrontOffice,
        UserRole.Admin,
      )
    );
  });

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
        this.populateDocChecklist();
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
    if (tab === 'garanties' && !this.garanties() && !this.isLoadingGaranties()) {
      this.loadGaranties();
    }
  }

  private loadGaranties() {
    this.isLoadingGaranties.set(true);
    this.creditService.getGarantiesDemande(this.ref()).subscribe({
      next: (data) => {
        this.garanties.set(data);
        this.isLoadingGaranties.set(false);
        // Default to vehicules if present, else totaux
        if (data.typeGaranties?.find((t) => t.id === GARANTIE_TYPE_IDS.VEHICULE)?.garanties?.length) {
          this.activeGarantiesSection.set(GARANTIE_TYPE_IDS.VEHICULE);
        } else {
          this.activeGarantiesSection.set(0);
        }
      },
      error: () => {
        this.isLoadingGaranties.set(false);
        this.toast.error('Impossible de charger les actifs et garanties.');
      },
    });
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
      error: (error) => {
        console.error('Erreur API:', error);
        this.toast.error("Erreur lors de l'ajout du document.");
        this.isUploadingDoc.set(false);
      },
    });
  }

  deleteDocument(doc: CreditDocumentAnnexe) {
    this.docToDelete.set(doc);
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    const doc = this.docToDelete();
    if (!doc) return;
    this.deleteDialogOpen = false;
    this.deletingDocId.set(doc.id);
    this.creditService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.toast.success('Document supprimé.');
        this.deletingDocId.set(null);
        this.docToDelete.set(null);
        this.loadDocuments();
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression.');
        this.deletingDocId.set(null);
      },
    });
  }

  private readonly DOC_BASE_URL = 'https://crm-fichiers.creditaccess.ci/crm/credit-ca/';

  downloadDocument(filename: string, libelle: string) {
    const a = document.createElement('a');
    a.href = this.DOC_BASE_URL + filename;
    a.target = '_blank';
    a.download = libelle;
    a.click();
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  goAnalyse() {
    this.router.navigate(['/app/credit/analyse', this.ref()]);
  }

  goResume() {
    this.router.navigate(['/app/credit/resume', this.ref()]);
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

  objetCreditLabel(o: string | number | undefined): string {
    const map: Record<number, string> = {
      1: 'Fonds de roulement',
      2: 'Investissement',
      3: 'Fonds de roulement et Investissement',
      4: 'Financement du pas-de-porte',
      5: 'Avance sur trésorerie',
    };
    if (o == null) return '—';
    const n = Number(o);
    return map[n] ?? String(o);
  }

  statutJuridiqueLabel(s: string | number | undefined): string {
    const map: Record<number, string> = {
      1: 'ENTREPRISE INDIVIDUELLE',
      2: 'SARL',
      3: 'SA',
      4: 'SASU',
      5: 'ASSOCIATION',
      6: 'COOPÉRATIVE',
      7: 'SAS',
      8: 'INFORMEL',
      9: 'SARLU',
      10: 'SCOOPS',
      11: 'COOP-CA',
    };
    if (s == null) return '—';
    const n = Number(s);
    return map[n] ?? String(s);
  }

  totalDepositCalc(): number {
    const d = this.decision();
    if (!d?.deposit || !d?.montantEmprunte) return 0;
    return (d.deposit / 100) * d.montantEmprunte;
  }

  dosserAge(): string {
    const d = this.demande()?.dateDemande;
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days < 30) return `${days} jour${days !== 1 ? 's' : ''}`;
    const months = Math.floor(days / 30);
    return `${months} mois`;
  }

  // ── Actions workflow ────────────────────────────────────────────────────
  openAction(config: ActionConfig) {
    this.currentAction = config;
    this.actionObs.set('');
    this.actionPwd.set('');
    if (config.hasLeveeCondition && this.showLeveeCondition()) {
      this.leveeConditions.set([
        { libelle: 'Prélèvement du déposit', done: false },
        { libelle: "Récupération de la prime d'assurances", done: false },
        { libelle: 'Prélèvement des frais de demandes', done: false },
      ]);
    } else {
      this.leveeConditions.set([]);
    }
    this.actionDialogOpen = true;
  }

  toggleLeveeCondition(index: number) {
    this.leveeConditions.update((items) => {
      const updated = [...items];
      updated[index] = { ...updated[index], done: !updated[index].done };
      return updated;
    });
  }

  get allLeveeConditionsDone(): boolean {
    const items = this.leveeConditions();
    return items.length === 0 || items.every((i) => i.done);
  }

  submitAction() {
    if (!this.currentAction || !this.actionPwd().trim()) return;
    const payload: CreditActionPayload = {
      refDemande: this.ref(),
      observation: this.actionObs(),
      password: this.actionPwd(),
      ...(this.currentAction.decision != null ? { decision: this.currentAction.decision } : {}),
      ...(this.leveeConditions().length > 0 ? { checkliste: this.leveeConditions().map((i) => i.libelle) } : {}),
    };
    this.isSubmittingAction.set(true);
    const obs$ =
      this.currentAction.endpoint === 'cloture'
        ? this.creditService.clotureDemande(payload)
        : this.currentAction.endpoint === 'juridique'
          ? this.creditService.checkActeOrVisite(payload)
          : this.currentAction.endpoint === 'annulation'
            ? this.creditService.annulerDecaissement(payload)
            : this.currentAction.endpoint === 'derogation'
              ? this.creditService.workByDerogation(payload)
              : this.creditService.saveCrdObservation(payload);

    obs$.subscribe({
      next: () => {
        this.toast.success('Action effectuée avec succès.');
        this.actionDialogOpen = false;
        this.isSubmittingAction.set(false);
        this.loadFiche();
        this.loadObservations();
      },
      error: (err) => {
        const msg = err?.error?.message ?? "Erreur lors de l'opération.";
        this.toast.error(msg);
        this.isSubmittingAction.set(false);
      },
    });
  }

  // ── AVSF ────────────────────────────────────────────────────────────────
  openAvsf() {
    this.avsfMtDepositExige = '';
    this.avsfMtAvsfSollicite = '';
    this.avsfMotif = '';
    this.avsfNumPerfect = '';
    this.avsfDialogOpen = true;
  }

  submitAvsf() {
    if (
      !this.avsfMtDepositExige ||
      !this.avsfMtAvsfSollicite ||
      !this.avsfMotif.trim() ||
      !this.avsfNumPerfect.trim()
    ) {
      this.toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    this.isSavingAvsf.set(true);
    this.creditService
      .saveAvsf({
        refDemande: this.ref(),
        mtDepositExige: Number(this.avsfMtDepositExige),
        mtAvsfSollicite: Number(this.avsfMtAvsfSollicite),
        motif: this.avsfMotif,
        numPerfect: this.avsfNumPerfect,
      })
      .subscribe({
        next: () => {
          this.toast.success("Demande d'avance sur fonds enregistrée.");
          this.avsfDialogOpen = false;
          this.isSavingAvsf.set(false);
          this.loadFiche();
        },
        error: (err) => {
          const msg = err?.error?.message ?? "Erreur lors de l'enregistrement.";
          this.toast.error(msg);
          this.isSavingAvsf.set(false);
        },
      });
  }

  // ── NumPret ──────────────────────────────────────────────────────────────
  openNumPret() {
    this.numPretValue = this.pret()?.numPret ?? '';
    this.numContratValue = this.pret()?.numContrat ?? '';
    this.numPretDialogOpen = true;
  }

  submitNumPret() {
    if (!this.numPretValue.trim() || !this.numContratValue.trim()) {
      this.toast.error('Veuillez saisir le N° prêt et le N° contrat.');
      return;
    }
    this.isSavingNumPret.set(true);
    this.creditService
      .saveDecaissement({
        refDemande: this.ref(),
        numPret: this.numPretValue,
        numContrat: this.numContratValue,
      })
      .subscribe({
        next: () => {
          this.toast.success('N° prêt enregistré.');
          this.numPretDialogOpen = false;
          this.isSavingNumPret.set(false);
          this.loadFiche();
        },
        error: (err) => {
          const msg = err?.error?.message ?? "Erreur lors de l'enregistrement.";
          this.toast.error(msg);
          this.isSavingNumPret.set(false);
        },
      });
  }

  // ── Modifier montant ─────────────────────────────────────────────────────
  openModifMontant() {
    this.modifMontantEmprunte = String(this.decision()?.montantEmprunte ?? '');
    this.modifMensualite = String(this.decision()?.mensualite ?? '');
    this.modifMontantCaution = String(this.decision()?.montantCaution ?? '');
    this.modifMontantDialogOpen = true;
  }

  submitModifMontant() {
    if (!this.modifMontantEmprunte || !this.modifMensualite) {
      this.toast.error('Veuillez saisir le montant et la mensualité.');
      return;
    }
    this.isSavingModifMontant.set(true);
    this.creditService
      .updateMontantEmprunte({
        refDemande: this.ref(),
        montantEmprunte: Number(this.modifMontantEmprunte),
        mensualite: Number(this.modifMensualite),
        montantCaution: Number(this.modifMontantCaution) || 0,
      })
      .subscribe({
        next: () => {
          this.toast.success('Montant mis à jour.');
          this.modifMontantDialogOpen = false;
          this.isSavingModifMontant.set(false);
          this.loadFiche();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Erreur lors de la mise à jour.';
          this.toast.error(msg);
          this.isSavingModifMontant.set(false);
        },
      });
  }

  // ── Document necessity checklist ────────────────────────────────────────
  toggleDocCheckItem(index: number) {
    this.docChecklistItems.update((items) => {
      const updated = [...items];
      updated[index] = { ...updated[index], done: !updated[index].done };
      return updated;
    });
  }

  private populateDocChecklist() {
    const code = this.demande()?.typeCredit?.code ?? '';
    const list = this.getDocListForCode(code);
    this.docChecklistItems.set(list.map((d) => ({ ...d, done: false })));
  }

  private getDocListForCode(code: string): Omit<DocCheckItem, 'done'>[] {
    if (['004', '011', '019', '021'].includes(code)) {
      return [
        { id: 1, libelle: 'Courrier de demande de prêt', obligation: true },
        { id: 2, libelle: 'Fiche de consentement BIC', obligation: true },
        {
          id: 3,
          libelle: "Fiche d'autorisation de prélèvement des frais de demande",
          obligation: true,
        },
        { id: 4, libelle: 'RCCM', obligation: true },
        { id: 5, libelle: 'CNI du client', obligation: true },
        { id: 6, libelle: 'Certificat de résidence ou quittance CIE / SODECI', obligation: true },
      ];
    }
    if (code === '015') {
      return [
        { id: 1, libelle: 'Courrier de demande de prêt', obligation: true },
        { id: 2, libelle: 'Fiche de consentement BIC', obligation: true },
        { id: 3, libelle: 'RCCM', obligation: true },
        { id: 4, libelle: 'CNI du client', obligation: true },
        { id: 5, libelle: 'Certificat de résidence ou quittance CIE / SODECI', obligation: true },
      ];
    }
    if (code === '016') {
      return [
        { id: 1, libelle: 'La traite', obligation: true },
        { id: 2, libelle: 'Ordre irrévocable de domiciliation', obligation: true },
        { id: 3, libelle: 'Facture', obligation: true },
        { id: 4, libelle: 'Bon de commande', obligation: true },
        { id: 5, libelle: 'Contrat lié à la traite', obligation: true },
        { id: 6, libelle: "Demande physique d'avance sur traite", obligation: true },
        { id: 7, libelle: 'Autorisation de prélèvement des frais', obligation: true },
      ];
    }
    if (code === '033') {
      return [
        { id: 1, libelle: 'Facture', obligation: true },
        { id: 2, libelle: 'RCCM', obligation: true },
        { id: 3, libelle: 'DFE', obligation: true },
        { id: 4, libelle: 'Contrat de bail', obligation: true },
        { id: 5, libelle: 'Certificat de résidence ou quittance CIE / SODECI', obligation: true },
        { id: 6, libelle: 'CNI du client', obligation: true },
        { id: 7, libelle: "Demande physique d'avance sur facture", obligation: true },
        { id: 8, libelle: 'Fiche de prélèvement des frais', obligation: true },
      ];
    }
    if (code === '032') {
      return [
        { id: 1, libelle: 'Bon de commande', obligation: true },
        { id: 2, libelle: 'RCCM', obligation: true },
        { id: 3, libelle: 'DFE', obligation: true },
        { id: 4, libelle: 'Statut', obligation: false },
        { id: 5, libelle: 'Contrat de bail', obligation: true },
        { id: 6, libelle: 'Certificat de résidence ou quittance CIE / SODECI', obligation: true },
        { id: 7, libelle: 'CNI du client', obligation: true },
        { id: 8, libelle: "Demande physique d'avance sur bon de commande", obligation: true },
        { id: 9, libelle: 'Fiche de prélèvement des frais', obligation: true },
      ];
    }
    if (code === '035') {
      return [
        { id: 1, libelle: 'Courrier de demande de prêt signé par le mandataire', obligation: true },
        { id: 2, libelle: "Statuts / PV de l'AG donnant quitus au mandataire", obligation: true },
        {
          id: 3,
          libelle: "Fiche d'autorisation de prélèvement des frais de demande",
          obligation: true,
        },
        { id: 4, libelle: 'RCCM', obligation: true },
        { id: 5, libelle: 'Contrat de bail', obligation: true },
        { id: 6, libelle: 'Certificat de résidence ou quittance CIE / SODECI', obligation: true },
        { id: 7, libelle: 'CNI du client', obligation: true },
        { id: 8, libelle: 'Quittance de loyer', obligation: true },
        {
          id: 9,
          libelle: 'Relevés des comptes bancaires sur les 6 derniers mois',
          obligation: true,
        },
        { id: 10, libelle: "Preuves d'existence d'activités sur 12 mois", obligation: true },
      ];
    }
    if (['002', '036'].includes(code)) {
      return [
        { id: 1, libelle: 'Demande de prêt', obligation: true },
        { id: 2, libelle: "L'autorisation de prélèvement des frais de demande", obligation: true },
        { id: 3, libelle: 'Formulaire de titre de consentement (BIC)', obligation: true },
        { id: 4, libelle: "Pièce d'identité du client", obligation: true },
        { id: 5, libelle: 'Certificat de résidence', obligation: true },
      ];
    }
    if (['001', '008', '014'].includes(code)) {
      return [
        { id: 1, libelle: 'Courrier de demande de prêt signé par le salarié', obligation: true },
        { id: 2, libelle: 'PV de comité signé par le CA/CAA', obligation: true },
        { id: 3, libelle: 'PV de comité renseigné', obligation: true },
        { id: 4, libelle: 'Ordre irrévocable de salaire', obligation: true },
        { id: 5, libelle: 'CNI', obligation: true },
        { id: 6, libelle: '1er bulletin salaire', obligation: true },
        { id: 7, libelle: '2ème bulletin salaire', obligation: true },
        { id: 8, libelle: '3ème bulletin salaire', obligation: true },
        { id: 9, libelle: 'Facture CIE/SODECI ou certificat de résidence', obligation: true },
        { id: 10, libelle: 'Situation du compte', obligation: true },
        { id: 11, libelle: 'Simulation du taux de charge', obligation: true },
        { id: 12, libelle: 'Attestation de travail', obligation: true },
      ];
    }
    return [];
  }

  // ── PDF helpers ─────────────────────────────────────────────────────────

  private get isCooperative(): boolean {
    const sj = this.fiche()?.demande?.client?.entreprise?.statutJuridique;
    return ['5', '6', '10', '11'].includes(String(sj ?? ''));
  }

  private get isPMForPdf(): boolean {
    return this.fiche()?.demande?.client?.typeAgent !== 'PP';
  }

  private get isCreditAuto(): boolean {
    const code = this.fiche()?.demande?.typeCredit?.code ?? '';
    return ['004', '011', '019', '021'].includes(code);
  }

  private get isRelaisBusiness(): boolean {
    return (this.fiche()?.demande?.typeCredit?.code ?? '') === '035';
  }

  imprimerContratDePret(): void {
    const f = this.fiche();
    if (!f) return;
    const logo = LogoBase64.logoVertical;
    const sig = SignatureDirecteurGeneralBase64.signature;
    if (this.isPMForPdf) {
      if (this.isCooperative) {
        this.pdfService.contratDePretPersonneMoralePourSocieteCooperative(logo, sig, f);
      } else {
        this.pdfService.contratDePretPersonneMorale(logo, sig, f);
      }
    } else {
      this.pdfService.contratDePretPersonnePhysique(logo, sig, f);
    }
  }

  imprimerConventionCreditAuto(): void {
    const f = this.fiche();
    if (!f) return;
    const logo = LogoBase64.logoVertical;
    const sig = SignatureDirecteurGeneralBase64.signature;
    if (this.isPMForPdf) {
      if (this.isCooperative) {
        this.pdfService.conventionCreditAutoPersonneMoraleSocieteCooperativePDF(logo, sig, f);
      } else {
        this.pdfService.conventionCreditAutoPersonneMoralePDF(logo, sig, f);
      }
    } else {
      this.pdfService.conventionCreditAutoPersonnePhysiquePDF(logo, sig, f);
    }
  }

  imprimerContratRelaisBusiness(): void {
    const f = this.fiche();
    if (!f) return;
    this.pdfService.contartPretRelaisBusinessMagasinPersonneMorale(
      LogoBase64.logoVertical,
      SignatureDirecteurGeneralBase64.signature,
      f,
    );
  }

  imprimerEngagementRelaisBusiness(): void {
    const f = this.fiche();
    if (!f) return;
    this.pdfService.contartEngagementReglementPretRelaisBusinessMagasinPersonneMorale(
      LogoBase64.logoVertical,
      SignatureDirecteurGeneralBase64.signature,
      f,
    );
  }

  imprimerFicheResume(): void {
    const f = this.fiche();
    if (!f) return;
    this.pdfService.ficheResumeDossierCredit(
      LogoBase64.logoVertical,
      LogoPersonneMorale.logo,
      f,
      this.datePipe,
    );
  }

  imprimerConventionCautionnement(caution: unknown): void {
    const f = this.fiche();
    if (!f || (f.decision?.montantCaution ?? 0) === 0) {
      this.toast.error('Aucun montant caution défini sur ce dossier.');
      return;
    }
    const logo = LogoBase64.logoVertical;
    const sig = SignatureDirecteurGeneralBase64.signature;
    if (this.isPMForPdf) {
      if (this.isCooperative) {
        this.pdfService.conventionDeCautionnementPersonneMoraleSocieteCooperative(
          logo,
          sig,
          f,
          caution,
        );
      } else {
        this.pdfService.conventionDeCautionnementPersonneMorale(logo, sig, f, caution);
      }
    } else {
      this.pdfService.conventionDeCautionnementPersonnePhysique(logo, sig, f, caution);
    }
  }

  imprimerGageVehicule(dataVehicule: unknown): void {
    const f = this.fiche();
    if (!f) return;
    const logo = LogoBase64.logoVertical;
    const sig = SignatureDirecteurGeneralBase64.signature;
    const v = dataVehicule as { type?: string };
    if (this.isPMForPdf) {
      if (this.isCooperative) {
        this.pdfService.contratDeGageDeVehiculePersonneMoralePourSocieteCooperative(
          logo,
          sig,
          v.type ?? '',
          dataVehicule,
          f,
        );
      } else {
        this.pdfService.contratDeGageDeVehiculePersonneMorale(
          logo,
          sig,
          v.type ?? '',
          dataVehicule,
          f,
        );
      }
    } else {
      this.pdfService.contratDeGageDeVehiculePersonnePhysique(
        logo,
        sig,
        v.type ?? '',
        dataVehicule,
        f,
      );
    }
  }

  // Computed helpers for PDF button visibility
  readonly showContratPretButton = computed(() => {
    const s = this.fiche()?.demande?.statut;
    return !!s && s >= 16 && !this.isCreditAuto && !this.isRelaisBusiness;
  });

  readonly showConventionAutoButton = computed(() => {
    const s = this.fiche()?.demande?.statut;
    return !!s && s >= 16 && this.isCreditAuto;
  });

  readonly showRelaisBusinessPDFButton = computed(() => {
    const s = this.fiche()?.demande?.statut;
    return !!s && s >= 16 && this.isRelaisBusiness;
  });

  readonly showFicheResumeButton = computed(() => {
    const s = this.fiche()?.demande?.statut;
    return !!s && s >= 13;
  });
}
