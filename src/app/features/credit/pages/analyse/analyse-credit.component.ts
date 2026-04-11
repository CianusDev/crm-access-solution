import { UserRole } from '@/core/models/user.model';
import { PermissionService } from '@/core/services/permission/permission.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import {
  DialogComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
} from '@/shared/components/dialog/dialog.component';
import {
  DrawerComponent,
  DrawerContentComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
} from '@/shared/components/drawer/drawer.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect } from '@/shared/components/form-select/form-select.component';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { StripHtmlPipe } from '@/shared/pipes/strip-html/strip-html.pipe';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertCircle,
  ChevronLeft,
  FileText,
  LucideAngularModule,
  MessageSquare,
  RefreshCw,
} from 'lucide-angular';
import { forkJoin } from 'rxjs';
import {
  getRequiredDocsForAR,
  getRequiredDocsForGP,
  REQUIRED_DOCS_SPME_VISITE,
  RequiredDoc,
} from '../../constants/required-documents';
import {
  CREDIT_STATUTS,
  CreditAnalyseDemandeDetail,
  CreditFicheDemandeDetail,
  GarantiesData,
  CreditSuperviseurPmeAffectation,
} from '../../interfaces/credit.interface';
import { CreditService } from '../../services/credit/credit.service';
import {
  canFaireResumeFromState,
  canSendDossierFromState,
  resumeAccessBlockedMessage,
  sendDossierBlockedMessage,
} from '../../validation/analyse-send-eligibility';
import { AnalyseHeaderCardComponent } from './_components/analyse-header-card.component';
import { DocAnalyseUploadComponent } from './_components/doc-analyse-upload.component';
import {
  AnalyseCreditFlowService,
  AnalyseFlowPasswordException,
} from './analyse-credit-flow.service';
import { AnalyseCreditResolvedData } from './analyse-credit.resolver';
import {
  ANALYSE_SECTIONS,
  CA_CAA_ROLES,
  filterAnalyseTabsByRole,
  filterAnalyseTabsByWorkflowStatut,
  GARANTIES_SECTIONS,
  GP_ROLES,
  RC_CC_ROLES,
  type AnalyseSectionId,
  type AnalyseTabId,
  type GarantiesSectionId,
} from './analyse-credit.tabs';
import { AchatsSectionComponent } from './sections/achats/achats-section.component';
import { ActiviteSectionComponent } from './sections/activite/activite-section.component';
import { CautionsSectionComponent } from './sections/cautions/cautions-section.component';
import { DemandeSectionComponent } from './sections/demande/demande-section.component';
import { DocumentsSectionComponent } from './sections/documents/documents-section.component';
import { FamilialSectionComponent } from './sections/familial/familial-section.component';
import { GarantiesSectionComponent } from './sections/garanties/garanties-section.component';
import { GeolocalisationSectionComponent } from './sections/geolocalisation/geolocalisation-section.component';
import { TresorerieSectionComponent } from './sections/tresorerie/tresorerie-section.component';

@Component({
  selector: 'app-analyse-credit',
  templateUrl: './analyse-credit.component.html',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    DatePipe,
    BadgeComponent,
    ButtonDirective,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogFooterComponent,
    FormInput,
    FormTextarea,
    FormSelect,
    AnalyseHeaderCardComponent,
    DocAnalyseUploadComponent,
    ActiviteSectionComponent,
    AchatsSectionComponent,
    TresorerieSectionComponent,
    FamilialSectionComponent,
    GarantiesSectionComponent,
    CautionsSectionComponent,
    DocumentsSectionComponent,
    GeolocalisationSectionComponent,
    DemandeSectionComponent,
    Avatar,
    DrawerComponent,
    DrawerHeaderComponent,
    DrawerTitleComponent,
    DrawerContentComponent,
    StripHtmlPipe,
  ],
})
export class AnalyseCreditComponent implements OnInit {
  readonly ChevronLeftIcon = ChevronLeft;
  readonly RefreshIcon = RefreshCw;
  readonly AlertCircleIcon = AlertCircle;
  readonly FileTextIcon = FileText;
  readonly MessageSquareIcon = MessageSquare;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly analyseFlow = inject(AnalyseCreditFlowService);
  private readonly toast = inject(ToastService);
  private readonly permissionService = inject(PermissionService);

  readonly data = input<AnalyseCreditResolvedData>();

  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      const data = this.data();
      if (!data) return;
      this.demandeDetailsOverride.set(null);
      this.fiche.set(data.fiche);
      this.ficheHeader.set(data.fiche.demande);
      this.garantiesData.set(this.extractGarantiesDataFromDemande(data.fiche.demande));
      if (data.analyse?.demande) {
        this.demande.set(data.analyse.demande as CreditFicheDemandeDetail);
      }
      this.isLoading.set(false);

      // Charger les observations
      const ref = data.fiche.demande?.refDemande;
      if (ref) {
        this.loadObservations(ref);
      }

      // Charger les documents pour vérifier la complétude (GP / RC/CC / CA/CAA)
      if (
        this.isGP() ||
        this.isRCCC() ||
        this.isCACaa() ||
        this.isAR() ||
        this.isSuperviseurPME() ||
        this.enforceAnalysteResumeDocs()
      ) {
        this.loadUploadedDocs();
      }
      if (this.enforceAnalysteResumeDocs()) {
        this.loadGarantiesForResumeChecks();
      }
    });
  }

  readonly statuts = CREDIT_STATUTS;

  // ── Role-based tab filtering ───────────────────────────────────────────
  readonly isGP = computed(() => this.permissionService.hasRole(...GP_ROLES));
  readonly isRCCC = computed(() => this.permissionService.hasRole(...RC_CC_ROLES));
  readonly isCACaa = computed(() => this.permissionService.hasRole(...CA_CAA_ROLES));
  readonly isAR = computed(() => this.permissionService.hasRole(UserRole.AnalysteRisque));
  readonly isSuperviseurPME = computed(() =>
    this.permissionService.hasRole(UserRole.SuperviseurPME),
  );
  readonly isSuperviseurRisqueZone = computed(() =>
    this.permissionService.hasRole(UserRole.SuperviseurRisqueZone),
  );
  readonly isAdmin = computed(() => this.permissionService.hasRole(UserRole.Admin));
  /** Legacy : CA / CAA / Admin sur le bandeau « Affecter à un AR » (statut 4). */
  readonly isChefAgenceWorkflow = computed(() =>
    this.permissionService.hasRole(UserRole.ChefAgence, UserRole.ChefAgenceAdjoint, UserRole.Admin),
  );
  /** AR ou Admin sur dossier en analyse financière (statut 5) — mêmes actions bandeau que legacy. */
  readonly showAnalysteBandeau = computed(() => {
    const h = this.ficheHeader();
    if (!h || h.statut !== 5) return false;
    return this.isAR() || this.permissionService.hasRole(UserRole.Admin);
  });
  readonly enforceAnalysteResumeDocs = computed(() => {
    const h = this.ficheHeader();
    return !!(
      h &&
      h.statut === 5 &&
      (this.isAR() || this.permissionService.hasRole(UserRole.Admin))
    );
  });
  readonly isPaused = computed(() => this.ficheHeader()?.pause === 1);
  readonly isDossierCloture = computed(() => this.ficheHeader()?.statut === 30);
  readonly canEditFinancialSections = computed(
    () => !this.isDossierCloture() && this.showAnalysteBandeau(),
  );
  readonly canAddOrUploadGaranties = computed(
    () => !this.isDossierCloture() && (this.showAnalysteBandeau() || (this.isAR() && this.isPaused())),
  );
  readonly canEditGaranties = computed(
    () => !this.isDossierCloture() && this.showAnalysteBandeau(),
  );
  readonly canEditCautionPhoto = computed(
    () =>
      !this.isDossierCloture() &&
      this.isAR() &&
      (this.showAnalysteBandeau() || this.isPaused()),
  );
  readonly canManageDocumentsAnnexes = computed(() => !this.isDossierCloture());

  /** Legacy : « Voir le résumé » hors phases 1–5 et 19, dossier non en pause. */
  readonly showVoirResume = computed(() => {
    const h = this.ficheHeader();
    if (!h || this.isPaused()) return false;
    const s = h.statut;
    return ![1, 2, 3, 4, 5, 19].includes(s);
  });

  readonly tabs = computed(() => {
    const byRole = filterAnalyseTabsByRole(this.isGP(), this.isRCCC(), this.isCACaa());
    return filterAnalyseTabsByWorkflowStatut(byRole, this.ficheHeader()?.statut);
  });

  /** Onglet affiché : si la liste d’onglets change (ex. statut), évite un @switch sur un id absent. */
  readonly safeActiveTab = computed(() => {
    const ids = this.tabs().map((t) => t.id);
    const cur = this.activeTab();
    if (ids.includes(cur)) {
      return cur;
    }
    return (ids[0] as AnalyseTabId) ?? 'demande';
  });

  // ── State ──────────────────────────────────────────────────────────────
  readonly ref = signal('');
  readonly isLoading = signal(false);
  readonly ficheHeader = signal<CreditFicheDemandeDetail | null>(null);
  readonly fiche = signal<import('../../interfaces/credit.interface').CreditFiche | null>(null);
  readonly demande = signal<CreditAnalyseDemandeDetail | null>(null);
  readonly observations = signal<import('../../interfaces/credit.interface').CreditObservation[]>(
    [],
  );
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<AnalyseTabId>('demande');
  readonly activeAnalyseSection = signal<AnalyseSectionId>('activite'); // Section active dans "Analyse financière"
  readonly activeGarantiesSection = signal<GarantiesSectionId>('actifs-totaux'); // Section active dans "Actifs & Garanties"
  readonly pendingDocLibelle = signal<{ libelle: string; version: number } | null>(null);
  // private pendingDocVersion = 0;

  readonly analyseSections = signal(ANALYSE_SECTIONS);
  readonly garantiesSections = signal(GARANTIES_SECTIONS);

  /**
   * Détail `getDetailsDemande` après un refresh manuel (`loadHeader`).
   * Sinon on utilise `data().details` du resolver.
   */
  readonly demandeDetailsOverride = signal<CreditFicheDemandeDetail | null>(null);
  readonly garantiesData = signal<GarantiesData | null>(null);

  readonly effectiveDemandeDetails = computed(
    () => this.demandeDetailsOverride() ?? this.data()?.details ?? null,
  );

  // ── Documents GP — pour validation "Envoyer le dossier" ────────────────
  readonly uploadedDocLibelles = signal<string[]>([]);

  readonly requiredDocs = computed<RequiredDoc[]>(() => {
    const h = this.ficheHeader();
    if (!h) return [];
    const code = h.typeCredit?.code;
    if (this.isSuperviseurPME() && h.statut === 19) {
      return REQUIRED_DOCS_SPME_VISITE;
    }
    const bandeauAnalyste =
      this.isAR() || (this.permissionService.hasRole(UserRole.Admin) && h.statut === 5);
    if (bandeauAnalyste) {
      return getRequiredDocsForAR(code);
    }
    // Legacy: GP charge ses documents requis uniquement à l'étape d'enregistrement (statut 1).
    if (this.isGP() && h.statut === 1) {
      return getRequiredDocsForGP(code, h.client?.entreprise?.statutJuridique);
    }
    return [];
  });

  readonly canSendDossier = computed(() =>
    canSendDossierFromState({
      ficheHeader: this.ficheHeader(),
      fiche: this.fiche(),
      demandeDetail: this.effectiveDemandeDetails(),
      uploadedDocLibelles: this.uploadedDocLibelles(),
      confirmationFrais: this.confirmationFrais(),
      isGP: this.isGP(),
      isAR: this.isAR(),
      isRCCC: this.isRCCC(),
      isCACaa: this.isCACaa(),
      isSuperviseurPME: this.isSuperviseurPME(),
      requiredDocs: this.requiredDocs(),
    }),
  );

  /** AR / Admin (statut 5) : mêmes contrôles docs que pour « Faire le résumé » (legacy `existenceDocumentACharger`). */
  readonly canFaireResume = computed(() =>
    canFaireResumeFromState({
      enforceAnalysteDocRules: this.enforceAnalysteResumeDocs(),
      ficheHeader: this.ficheHeader(),
      uploadedDocLibelles: this.uploadedDocLibelles(),
      analyseDemande: this.demande(),
      garantiesData: this.garantiesData(),
    }),
  );

  // ── RC/CC specific state ──────────────────────────────────────────────
  readonly confirmationFrais = signal(false);

  // ── Drawer observations ───────────────────────────────────────────────
  readonly obsDrawerOpen = signal(false);

  // ── Dialog envoi dossier ──────────────────────────────────────────────
  readonly envoiAlert = signal<string | null>(null);
  envoiDialogOpen = false;
  readonly envoiLoading = signal(false);
  readonly envoiError = signal<string | null>(null);

  readonly envoiForm = this.fb.group({
    password: ['', Validators.required],
    observation: [''],
  });

  // ── Dialog N° demande Perfect ─────────────────────────────────────────
  perfectDialogOpen = false;
  readonly perfectLoading = signal(false);

  readonly perfectForm = this.fb.group({
    numTransaction: ['', Validators.required],
  });

  // ── Dialog Ajourner ───────────────────────────────────────────────────
  ajournerDialogOpen = false;
  readonly ajournerLoading = signal(false);
  readonly ajournerError = signal<string | null>(null);

  readonly ajournerForm = this.fb.group({
    password: ['', Validators.required],
    observation: [''],
  });

  // ── Dialog Affecter AR ────────────────────────────────────────────────
  readonly affectationTargetMode = signal<'ar' | 'sup-pme'>('ar');
  readonly isAffectationSuperviseurMode = computed(
    () => this.affectationTargetMode() === 'sup-pme',
  );
  affecterARDialogOpen = false;
  readonly affecterARLoading = signal(false);
  readonly affecterARError = signal<string | null>(null);
  readonly zonesLoading = signal(false);
  readonly arsLoading = signal(false);
  readonly superviseursPmeLoading = signal(false);
  readonly zones = signal<{ id: number; libelle: string }[]>([]);
  readonly ars = signal<
    { id: number; codeAr: string; nom: string; prenom: string; libelle?: string }[]
  >([]);
  readonly superviseursPme = signal<CreditSuperviseurPmeAffectation[]>([]);

  readonly affecterARForm = this.fb.group({
    zone: [''],
    ar: [''],
    supOpSen: [null as number | null],
    password: ['', Validators.required],
    observation: [''],
  });

  readonly canConfirmAffectation = computed(() => {
    if (this.affecterARLoading()) return false;
    if (this.isAffectationSuperviseurMode()) {
      return !!this.affecterARForm.get('supOpSen')?.value;
    }
    return !!this.affecterARForm.get('ar')?.value;
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    const ref = this.route.snapshot.paramMap.get('ref') ?? '';
    this.ref.set(ref);
  }

  // ── Data loading ───────────────────────────────────────────────────────
  loadHeader() {
    this.isLoading.set(true);
    this.error.set(null);
    const r = this.ref();

    forkJoin({
      fiche: this.creditService.getFicheCredit(r),
      analyse: this.creditService.getAnalyseFinanciere(r),
      details: this.creditService.getDetailsDemande(r),
    }).subscribe({
      next: ({ fiche, analyse, details }) => {
        this.fiche.set(fiche);
        this.ficheHeader.set(fiche.demande);
        this.garantiesData.set(this.extractGarantiesDataFromDemande(fiche.demande));
        this.demandeDetailsOverride.set(details);
        if (!analyse?.demande) {
          this.error.set('Données du dossier introuvables.');
        } else {
          this.demande.set(analyse.demande as CreditFicheDemandeDetail);
        }
        this.isLoading.set(false);
        if (
          this.isGP() ||
          this.isRCCC() ||
          this.isCACaa() ||
          this.isAR() ||
          this.isSuperviseurPME() ||
          this.enforceAnalysteResumeDocs()
        ) {
          this.loadUploadedDocs();
        }
        if (this.enforceAnalysteResumeDocs()) {
          this.loadGarantiesForResumeChecks();
        }
      },
      error: () => {
        this.error.set('Impossible de charger les données du dossier.');
        this.isLoading.set(false);
      },
    });
  }

  loadObservations(ref: string) {
    this.creditService.getObservations(ref).subscribe({
      next: (obs) => this.observations.set(obs),
      error: () => this.observations.set([]),
    });
  }

  loadUploadedDocs() {
    const r = this.ref();
    if (!r) return;
    this.creditService.getDocuments(r).subscribe({
      next: (docs) => {
        const libelles = docs.map((d) => d.libelle ?? '');
        console.log('docs chargés:', libelles);
        console.log(
          'docs requis:',
          this.requiredDocs().map((d) => d.libelle),
        );
        console.log('typeCredit code:', this.ficheHeader()?.typeCredit?.code);
        console.log('isGP:', this.isGP());
        console.log('requiredDocs:', this.requiredDocs());
        console.log(
          'raw docs API:',
          docs.map((d) => ({
            libelle: d.libelle,
            chars: [...d.libelle].map((c) => c.charCodeAt(0)),
          })),
        );
        this.uploadedDocLibelles.set(docs.map((d) => d.libelle ?? ''));
        console.log('uploadedDocLibelles après set:', this.uploadedDocLibelles());
      },
      error: () => {},
    });
  }

  private loadGarantiesForResumeChecks() {
    const r = this.ref();
    if (!r) return;
    this.creditService.getGarantiesDemande(r).subscribe({
      next: (data) => {
        if (data) {
          this.garantiesData.set(data);
        }
      },
      error: () => {},
    });
  }

  private extractGarantiesDataFromDemande(
    demande: CreditFicheDemandeDetail | null | undefined,
  ): GarantiesData | null {
    if (!demande) return null;
    const raw = demande as unknown as Partial<GarantiesData>;
    const hasTypeGaranties = Array.isArray(raw.typeGaranties);
    const hasCautions = Array.isArray(raw.crCaution);
    const hasStocks = Array.isArray(raw.actifCirculantStock);
    if (!hasTypeGaranties && !hasCautions && !hasStocks) {
      return null;
    }
    return {
      typeGaranties: hasTypeGaranties ? (raw.typeGaranties as GarantiesData['typeGaranties']) : [],
      crCaution: hasCautions ? (raw.crCaution as GarantiesData['crCaution']) : [],
      actifCirculantStock: hasStocks
        ? (raw.actifCirculantStock as GarantiesData['actifCirculantStock'])
        : [],
    };
  }

  switchTab(id: AnalyseTabId) {
    this.pendingDocLibelle.set(null);
    this.activeTab.set(id);
  }

  switchAnalyseSection(id: AnalyseSectionId) {
    this.activeAnalyseSection.set(id);
  }

  switchGarantiesSection(id: GarantiesSectionId) {
    this.activeGarantiesSection.set(id);
  }

  // ── Upload natif direct (sans dialog intermédiaire) ───────────────────
  readonly uploadingDocLibelle = signal<string | null>(null);

  onChargerDocuments(libelle: string | null) {
    if (!libelle) {
      this.switchTab('documents');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      if (!file) return;
      this._uploadDoc(libelle, file);
    });

    input.click();
  }

  private _uploadDoc(libelle: string, file: File) {
    this.uploadingDocLibelle.set(libelle);

    this.creditService.getDocuments(this.ref()).subscribe({
      next: (docs) => {
        const existing = docs.find(
          (d) => d.libelle?.trim().toLowerCase() === libelle.trim().toLowerCase(),
        );

        const doUpload = () => {
          const formData = new FormData();
          formData.append('refDemande', this.ref());
          formData.append('libelle', libelle);
          formData.append('description', libelle);
          formData.append('document', file);

          this.creditService.uploadDocument(formData).subscribe({
            next: () => {
              this.uploadingDocLibelle.set(null);
              this.toast.success(`"${libelle}" chargé avec succès.`);

              const current = this.uploadedDocLibelles();
              if (!current.some((l) => l.trim().toLowerCase() === libelle.trim().toLowerCase())) {
                this.uploadedDocLibelles.set([...current, libelle]);
              }

              this.cdr.markForCheck(); // ← force la réévaluation

              setTimeout(() => this.loadUploadedDocs(), 1000);
            },
            error: () => {
              this.uploadingDocLibelle.set(null);
              this.toast.error(`Erreur lors du chargement de "${libelle}".`);
            },
          });
        };

        if (existing?.id != null) {
          this.creditService.deleteDocument(existing.id).subscribe({
            next: () => doUpload(),
            error: () => {
              this.uploadingDocLibelle.set(null);
              this.toast.error(`Erreur lors de la suppression de l'ancien document.`);
            },
          });
        } else {
          doUpload();
        }
      },
      error: () => {
        this.uploadingDocLibelle.set(null);
        this.toast.error('Erreur lors de la vérification des documents existants.');
      },
    });
  }

  onDocsChanged() {
    this.loadUploadedDocs();
  }

  openEnvoiDialog() {
    const blockedMessage = sendDossierBlockedMessage({
      ficheHeader: this.ficheHeader(),
      fiche: this.fiche(),
      demandeDetail: this.effectiveDemandeDetails(),
      uploadedDocLibelles: this.uploadedDocLibelles(),
      confirmationFrais: this.confirmationFrais(),
      isGP: this.isGP(),
      isAR: this.isAR(),
      isRCCC: this.isRCCC(),
      isCACaa: this.isCACaa(),
      isSuperviseurPME: this.isSuperviseurPME(),
      requiredDocs: this.requiredDocs(),
    });
    if (blockedMessage) {
      this.envoiAlert.set(blockedMessage);
      return;
    }

    this.envoiAlert.set(null);
    this.envoiForm.reset();
    this.envoiError.set(null);
    this.envoiDialogOpen = true;
  }

  confirmEnvoi() {
    if (this.envoiForm.invalid) {
      this.envoiForm.markAllAsTouched();
      return;
    }
    const { password, observation } = this.envoiForm.value;
    this.envoiLoading.set(true);
    this.envoiError.set(null);

    this.analyseFlow.envoyerDossierChefAgence(this.ref(), password!, observation || '').subscribe({
      next: (data) => {
        this.envoiLoading.set(false);
        this.envoiDialogOpen = false;
        if (data.status === 200) {
          this.toast.success('Le dossier a été envoyé avec succès.');
          this.router.navigate(['/app/credit/list']);
        } else {
          this.toast.error(data.message ?? "Échec de l'envoi du dossier.");
        }
      },
      error: (err: unknown) => {
        this.envoiLoading.set(false);
        if (err instanceof AnalyseFlowPasswordException) {
          this.envoiError.set(err.message);
          return;
        }
        this.toast.error("Erreur lors de l'envoi du dossier.");
      },
    });
  }

  // ── N° Perfect ─────────────────────────────────────────────────────────
  openPerfectDialog() {
    const h = this.ficheHeader();
    this.perfectForm.reset({ numTransaction: h?.numTransaction ?? '' });
    this.perfectDialogOpen = true;
  }

  savePerfect() {
    if (this.perfectForm.invalid) {
      this.perfectForm.markAllAsTouched();
      return;
    }
    this.perfectLoading.set(true);
    this.analyseFlow
      .saveNumeroPerfect(this.ref(), this.perfectForm.value.numTransaction!)
      .subscribe({
        next: () => {
          this.perfectLoading.set(false);
          this.perfectDialogOpen = false;
          this.toast.success('N° demande Perfect enregistré.');
          this.loadHeader();
        },
        error: () => {
          this.perfectLoading.set(false);
          this.toast.error("Erreur lors de l'enregistrement.");
        },
      });
  }

  // ── Ajourner ──────────────────────────────────────────────────────────
  openAjournerDialog() {
    this.ajournerForm.reset();
    this.ajournerError.set(null);
    this.ajournerDialogOpen = true;
  }

  confirmAjourner() {
    if (this.ajournerForm.invalid) {
      this.ajournerForm.markAllAsTouched();
      return;
    }
    const { password, observation } = this.ajournerForm.value;
    this.ajournerLoading.set(true);
    this.ajournerError.set(null);

    this.analyseFlow.ajournerDossier(this.ref(), password!, observation || '').subscribe({
      next: (data) => {
        this.ajournerLoading.set(false);
        this.ajournerDialogOpen = false;
        if (data.status === 200) {
          this.toast.success('Le dossier a été ajourné.');
          this.router.navigate(['/app/credit/list']);
        } else {
          this.toast.error(data.message ?? "Échec de l'ajournement.");
        }
      },
      error: (err: unknown) => {
        this.ajournerLoading.set(false);
        if (err instanceof AnalyseFlowPasswordException) {
          this.ajournerError.set(err.message);
          return;
        }
        this.toast.error("Erreur lors de l'ajournement.");
      },
    });
  }

  // ── Affecter AR ───────────────────────────────────────────────────────
  openAffecterARDialog() {
    const h = this.ficheHeader();
    const shouldAffecterSuperviseurPme =
      !!h &&
      h.statut === 4 &&
      (h.typeCredit?.code === '032' || h.typeCredit?.code === '033') &&
      this.isCACaa();

    this.affectationTargetMode.set(shouldAffecterSuperviseurPme ? 'sup-pme' : 'ar');
    this.configureAffecterFormValidators(this.affectationTargetMode());

    this.affecterARForm.reset({
      zone: '',
      ar: '',
      supOpSen: null,
      password: '',
      observation: '',
    });
    this.affecterARError.set(null);
    this.zonesLoading.set(false);
    this.arsLoading.set(false);
    this.superviseursPmeLoading.set(false);
    this.zones.set([]);
    this.ars.set([]);
    this.superviseursPme.set([]);
    this.affecterARDialogOpen = true;

    if (this.isAffectationSuperviseurMode()) {
      this.superviseursPmeLoading.set(true);
      this.analyseFlow.loadSuperviseursPmeForAffectation().subscribe({
        next: (users) => {
          this.superviseursPme.set(users);
          this.superviseursPmeLoading.set(false);
        },
        error: () => {
          this.toast.error('Erreur lors du chargement de la liste des superviseurs PME.');
          this.superviseursPmeLoading.set(false);
          this.superviseursPme.set([]);
        },
      });
      return;
    }

    this.zonesLoading.set(true);
    this.analyseFlow.loadZones().subscribe({
      next: (zones) => {
        this.zones.set(zones);
        this.zonesLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors du chargement des zones.');
        this.zonesLoading.set(false);
        this.zones.set([]);
      },
    });
  }

  onZoneChange(zoneId: number) {
    if (this.isAffectationSuperviseurMode()) {
      return;
    }
    if (!zoneId) {
      this.ars.set([]);
      this.affecterARForm.patchValue({ ar: '' });
      return;
    }

    this.arsLoading.set(true);
    this.ars.set([]);
    this.affecterARForm.patchValue({ ar: '' });

    this.analyseFlow.loadAnalystesRisqueForZone(zoneId).subscribe({
      next: (ars) => {
        this.ars.set(ars);
        this.arsLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors du chargement des analystes risque.');
        this.arsLoading.set(false);
        this.ars.set([]);
      },
    });
  }

  confirmAffecterAR() {
    if (this.affecterARForm.invalid) {
      this.affecterARForm.markAllAsTouched();
      return;
    }
    const { zone, ar, supOpSen, password, observation } = this.affecterARForm.value;
    this.affecterARLoading.set(true);
    this.affecterARError.set(null);

    const request$ = this.isAffectationSuperviseurMode()
      ? this.analyseFlow.affecterSuperviseurPme(
          this.ref(),
          Number(supOpSen),
          password!,
          observation || '',
        )
      : this.analyseFlow.affecterAnalysteRisque(
          this.ref(),
          Number(zone),
          ar!,
          password!,
          observation || '',
        );

    request$.subscribe({
        next: (data) => {
          this.affecterARLoading.set(false);
          if (data.status === 200) {
            if (this.isAffectationSuperviseurMode()) {
              this.toast.success('Dossier affecté avec succès au superviseur PME.');
            } else {
              this.toast.success("Dossier affecté avec succès à l'AR.");
            }
            this.affecterARDialogOpen = false;
            this.router.navigate(['/app/credit/list']);
          } else {
            this.toast.error(data.message ?? "Échec de l'affectation.");
          }
        },
        error: (err: unknown) => {
          this.affecterARLoading.set(false);
          if (err instanceof AnalyseFlowPasswordException) {
            this.affecterARError.set(err.message);
            return;
          }
          this.toast.error("Erreur lors de l'affectation.");
        },
      });
  }

  private configureAffecterFormValidators(mode: 'ar' | 'sup-pme') {
    const zoneControl = this.affecterARForm.get('zone');
    const arControl = this.affecterARForm.get('ar');
    const supControl = this.affecterARForm.get('supOpSen');

    if (mode === 'sup-pme') {
      zoneControl?.clearValidators();
      arControl?.clearValidators();
      supControl?.setValidators([Validators.required]);
    } else {
      zoneControl?.setValidators([Validators.required]);
      arControl?.setValidators([Validators.required]);
      supControl?.clearValidators();
    }

    zoneControl?.updateValueAndValidity({ emitEvent: false });
    arControl?.updateValueAndValidity({ emitEvent: false });
    supControl?.updateValueAndValidity({ emitEvent: false });
  }

  // ── AR : Avis défavorable ──────────────────────────────────────────
  avisDefavorableDialogOpen = false;
  readonly avisDefavorableLoading = signal(false);
  readonly avisDefavorableError = signal<string | null>(null);

  readonly avisDefavorableForm = this.fb.group({
    password: ['', Validators.required],
    observation: [''],
  });

  openAvisDefavorableDialog() {
    this.avisDefavorableForm.reset();
    this.avisDefavorableError.set(null);
    this.avisDefavorableDialogOpen = true;
  }

  confirmAvisDefavorable() {
    if (this.avisDefavorableForm.invalid) {
      this.avisDefavorableForm.markAllAsTouched();
      return;
    }
    const { password, observation } = this.avisDefavorableForm.value;
    this.avisDefavorableLoading.set(true);
    this.avisDefavorableError.set(null);

    this.analyseFlow.avisDefavorable(this.ref(), password!, observation || '').subscribe({
      next: (data) => {
        this.avisDefavorableLoading.set(false);
        this.avisDefavorableDialogOpen = false;
        if (data.status === 200) {
          this.toast.success('Avis défavorable enregistré.');
          this.router.navigate(['/app/credit/list']);
        } else {
          this.toast.error(data.message ?? "Échec de l'enregistrement.");
        }
      },
      error: (err: unknown) => {
        this.avisDefavorableLoading.set(false);
        if (err instanceof AnalyseFlowPasswordException) {
          this.avisDefavorableError.set(err.message);
          return;
        }
        this.toast.error("Erreur lors de l'enregistrement.");
      },
    });
  }

  // ── Superviseur risque zone : confirmation du rejet ─────────────────
  confirmRejetDialogOpen = false;
  readonly confirmRejetLoading = signal(false);
  readonly confirmRejetError = signal<string | null>(null);
  readonly confirmRejetForm = this.fb.group({
    password: ['', Validators.required],
    observation: [''],
  });

  openConfirmRejetDialog() {
    this.confirmRejetForm.reset();
    this.confirmRejetError.set(null);
    this.confirmRejetDialogOpen = true;
  }

  confirmRejetSuperviseur() {
    if (this.confirmRejetForm.invalid) {
      this.confirmRejetForm.markAllAsTouched();
      return;
    }
    const { password, observation } = this.confirmRejetForm.value;
    this.confirmRejetLoading.set(true);
    this.confirmRejetError.set(null);

    this.analyseFlow.confirmerRejetDossier(this.ref(), password!, observation || '').subscribe({
      next: (data) => {
        this.confirmRejetLoading.set(false);
        this.confirmRejetDialogOpen = false;
        if (data.status === 200) {
          this.toast.success('Dossier rejeté.');
          this.router.navigate(['/app/credit/list']);
        } else {
          this.toast.error(data.message ?? 'Échec du rejet.');
        }
      },
      error: (err: unknown) => {
        this.confirmRejetLoading.set(false);
        if (err instanceof AnalyseFlowPasswordException) {
          this.confirmRejetError.set(err.message);
          return;
        }
        this.toast.error('Erreur lors du rejet du dossier.');
      },
    });
  }

  // ── RC/CC statut 3 : Validation dossiers OUF/Scolaire/Avance ────────
  validerRCCCDialogOpen = false;
  readonly validerRCCCLoading = signal(false);
  readonly validerRCCCError = signal<string | null>(null);
  readonly validerRCCCForm = this.fb.group({
    password: ['', Validators.required],
    observation: [''],
  });

  openValiderDossierRCCCDialog() {
    this.validerRCCCForm.reset();
    this.validerRCCCError.set(null);
    this.validerRCCCDialogOpen = true;
  }

  confirmValiderRCCC() {
    if (this.validerRCCCForm.invalid) {
      this.validerRCCCForm.markAllAsTouched();
      return;
    }
    const { password, observation } = this.validerRCCCForm.value;
    this.validerRCCCLoading.set(true);
    this.validerRCCCError.set(null);

    this.analyseFlow.validerDossierRCCC(this.ref(), password!, observation || '').subscribe({
      next: (data) => {
        this.validerRCCCLoading.set(false);
        this.validerRCCCDialogOpen = false;
        if (data.status === 200) {
          this.toast.success('Dossier validé avec succès.');
          this.router.navigate(['/app/credit/list']);
        } else {
          this.toast.error(data.message ?? 'Échec de la validation.');
        }
      },
      error: (err: unknown) => {
        this.validerRCCCLoading.set(false);
        if (err instanceof AnalyseFlowPasswordException) {
          this.validerRCCCError.set(err.message);
          return;
        }
        this.toast.error('Erreur lors de la validation du dossier.');
      },
    });
  }

  // ── Admin statut 21 : Remettre dans le circuit ───────────────────────
  remettreCircuitDialogOpen = false;
  readonly remettreCircuitLoading = signal(false);
  readonly remettreCircuitError = signal<string | null>(null);
  readonly remettreCircuitForm = this.fb.group({
    password: ['', Validators.required],
    observation: [''],
  });

  openRemettreEnCircuitDialog() {
    this.remettreCircuitForm.reset();
    this.remettreCircuitError.set(null);
    this.remettreCircuitDialogOpen = true;
  }

  confirmRemettreEnCircuit() {
    if (this.remettreCircuitForm.invalid) {
      this.remettreCircuitForm.markAllAsTouched();
      return;
    }
    const { password, observation } = this.remettreCircuitForm.value;
    this.remettreCircuitLoading.set(true);
    this.remettreCircuitError.set(null);

    this.analyseFlow.remettreEnCircuit(this.ref(), password!, observation || '').subscribe({
      next: (data) => {
        this.remettreCircuitLoading.set(false);
        this.remettreCircuitDialogOpen = false;
        if (data.status === 200) {
          this.toast.success('Dossier remis dans le circuit.');
          this.router.navigate(['/app/credit/list']);
        } else {
          this.toast.error(data.message ?? 'Échec de la remise en circuit.');
        }
      },
      error: (err: unknown) => {
        this.remettreCircuitLoading.set(false);
        if (err instanceof AnalyseFlowPasswordException) {
          this.remettreCircuitError.set(err.message);
          return;
        }
        this.toast.error('Erreur lors de la remise en circuit.');
      },
    });
  }

  // ── AR : Faire le résumé ────────────────────────────────────────────
  readonly arAlert = signal<string | null>(null);

  goResume() {
    const evaluateResumeAccess = (garantiesData: GarantiesData | null) => {
      const blockedMessage = resumeAccessBlockedMessage({
        enforceAnalysteDocRules: this.enforceAnalysteResumeDocs(),
        ficheHeader: this.ficheHeader(),
        uploadedDocLibelles: this.uploadedDocLibelles(),
        analyseDemande: this.demande(),
        garantiesData,
      });

      if (blockedMessage) {
        this.arAlert.set(blockedMessage);
        return;
      }

      this.arAlert.set(null);
      this.router.navigate(['/app/credit/resume', this.ref()]);
    };

    if (this.enforceAnalysteResumeDocs()) {
      const r = this.ref();
      if (r) {
        this.creditService.getGarantiesDemande(r).subscribe({
          next: (data) => {
            if (data) {
              this.garantiesData.set(data);
            }
            evaluateResumeAccess(data ?? this.garantiesData());
          },
          error: () => evaluateResumeAccess(this.garantiesData()),
        });
        return;
      }
    }

    evaluateResumeAccess(this.garantiesData());
  }

  /** Legacy « Voir le résumé » — navigation sans contrôle doc (étapes post-analyse). */
  goVoirResume() {
    this.router.navigate(['/app/credit/resume', this.ref()]);
  }

  goBack() {
    this.router.navigate(['/app/credit/list']);
  }

  goFiche() {
    this.router.navigate(['/app/credit', this.ref()]);
  }

  statutLabel(statut: number): string {
    return this.statuts[statut]?.label ?? `Statut ${statut}`;
  }

  statutVariant(statut: number) {
    return this.statuts[statut]?.variant ?? 'default';
  }
}
