import { Component, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  FileText,
  MessageSquare,
} from 'lucide-angular';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';
import { FormSelect } from '@/shared/components/form-select/form-select.component';
import { CreditService } from '../../services/credit/credit.service';
import {
  AnalyseCreditFlowService,
  AnalyseFlowPasswordException,
} from './analyse-credit-flow.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { CREDIT_STATUTS, CreditFicheDemandeDetail } from '../../interfaces/credit.interface';
import { AnalyseCreditResolvedData } from './analyse-credit.resolver';
import { ActiviteSectionComponent } from './sections/activite/activite-section.component';
import { AchatsSectionComponent } from './sections/achats/achats-section.component';
import { TresorerieSectionComponent } from './sections/tresorerie/tresorerie-section.component';
import { FamilialSectionComponent } from './sections/familial/familial-section.component';
import { GarantiesSectionComponent } from './sections/garanties/garanties-section.component';
import { CautionsSectionComponent } from './sections/cautions/cautions-section.component';
import { SwotSectionComponent } from './sections/swot/swot-section.component';
import { EnvoiSectionComponent } from './sections/envoi/envoi-section.component';
import { GeolocalisationSectionComponent } from './sections/geolocalisation/geolocalisation-section.component';
import { DemandeSectionComponent } from './sections/demande/demande-section.component';
import { AnalyseHeaderCardComponent } from './_components/analyse-header-card.component';
import { DocAnalyseUploadComponent } from './_components/doc-analyse-upload.component';
import { PermissionService } from '@/core/services/permission/permission.service';
import { UserRole } from '@/core/models/user.model';
import {
  RequiredDoc,
  getRequiredDocsForGP,
  getRequiredDocsForAR,
  REQUIRED_DOCS_SPME_VISITE,
} from '../../constants/required-documents';
import {
  canSendDossierFromState,
  canFaireResumeFromState,
  resumeAccessBlockedMessage,
} from '../../validation/analyse-send-eligibility';
import {
  filterAnalyseTabsByRole,
  filterAnalyseTabsByWorkflowStatut,
  GP_ROLES,
  RC_CC_ROLES,
  CA_CAA_ROLES,
  type AnalyseTabId,
} from './analyse-credit.tabs';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import {
  DrawerComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
  DrawerContentComponent,
} from '@/shared/components/drawer/drawer.component';
import { DatePipe } from '@angular/common';
import { StripHtmlPipe } from '@/shared/pipes/strip-html/strip-html.pipe';

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
    SwotSectionComponent,
    GeolocalisationSectionComponent,
    EnvoiSectionComponent,
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

  constructor() {
    effect(() => {
      const data = this.data();
      if (!data) return;
      this.demandeDetailsOverride.set(null);
      this.fiche.set(data.fiche);
      this.ficheHeader.set(data.fiche.demande);
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
    });
  }

  readonly statuts = CREDIT_STATUTS;

  // ── Role-based tab filtering ───────────────────────────────────────────
  readonly isGP = computed(() => this.permissionService.hasRole(...GP_ROLES));
  readonly isRCCC = computed(() => this.permissionService.hasRole(...RC_CC_ROLES));
  readonly isCACaa = computed(() => this.permissionService.hasRole(...CA_CAA_ROLES));
  readonly isAR = computed(() => this.permissionService.hasRole(UserRole.AnalysteRisque));
  readonly isSuperviseurPME = computed(() => this.permissionService.hasRole(UserRole.SuperviseurPME));
  readonly isSuperviseurRisqueZone = computed(() =>
    this.permissionService.hasRole(UserRole.SuperviseurRisqueZone),
  );
  /** Legacy : CA / CAA / Admin sur le bandeau « Affecter à un AR » (statut 4). */
  readonly isChefAgenceWorkflow = computed(() =>
    this.permissionService.hasRole(
      UserRole.ChefAgence,
      UserRole.ChefAgenceAdjoint,
      UserRole.Admin,
    ),
  );
  /** AR ou Admin sur dossier en analyse financière (statut 5) — mêmes actions bandeau que legacy. */
  readonly showAnalysteBandeau = computed(() => {
    const h = this.ficheHeader();
    if (!h || h.statut !== 5) return false;
    return this.isAR() || this.permissionService.hasRole(UserRole.Admin);
  });
  readonly enforceAnalysteResumeDocs = computed(() => {
    const h = this.ficheHeader();
    if (this.isAR()) return true;
    return !!(h && this.permissionService.hasRole(UserRole.Admin) && h.statut === 5);
  });
  readonly isPaused = computed(() => this.ficheHeader()?.pause === 1);

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
  readonly demande = signal<CreditFicheDemandeDetail | null>(null);
  readonly observations = signal<import('../../interfaces/credit.interface').CreditObservation[]>(
    [],
  );
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<AnalyseTabId>('demande');
  readonly pendingDocLibelle = signal<{ libelle: string; version: number } | null>(null);
  private pendingDocVersion = 0;

  /**
   * Détail `getDetailsDemande` après un refresh manuel (`loadHeader`).
   * Sinon on utilise `data().details` du resolver.
   */
  readonly demandeDetailsOverride = signal<CreditFicheDemandeDetail | null>(null);

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
      this.isAR() ||
      (this.permissionService.hasRole(UserRole.Admin) && h.statut === 5);
    if (bandeauAnalyste) {
      return getRequiredDocsForAR(code);
    }
    if (this.isGP()) {
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
    }),
  );

  // ── RC/CC specific state ──────────────────────────────────────────────
  readonly confirmationFrais = signal(false);

  // ── Drawer observations ───────────────────────────────────────────────
  readonly obsDrawerOpen = signal(false);

  // ── Dialog envoi dossier ──────────────────────────────────────────────
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
  affecterARDialogOpen = false;
  readonly affecterARLoading = signal(false);
  readonly affecterARError = signal<string | null>(null);
  readonly zonesLoading = signal(false);
  readonly arsLoading = signal(false);
  readonly zones = signal<{ id: number; libelle: string }[]>([]);
  readonly ars = signal<{ id: number; codeAr: string; nom: string; prenom: string; libelle?: string }[]>([]);

  readonly affecterARForm = this.fb.group({
    zone: ['', Validators.required],
    ar: ['', Validators.required],
    password: ['', Validators.required],
    observation: [''],
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
      next: (docs) => this.uploadedDocLibelles.set(docs.map((d) => d.libelle ?? '')),
      error: () => {},
    });
  }

  switchTab(id: AnalyseTabId) {
    this.pendingDocLibelle.set(null);
    this.activeTab.set(id);
  }

  onChargerDocuments(libelle: string | null) {
    this.switchTab('documents');
    if (libelle) {
      this.pendingDocLibelle.set({ libelle, version: ++this.pendingDocVersion });
    }
  }

  onDocsChanged() {
    this.loadUploadedDocs();
  }

  openEnvoiDialog() {
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

    this.analyseFlow
      .envoyerDossierChefAgence(this.ref(), password!, observation || '')
      .subscribe({
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
    this.affecterARForm.reset();
    this.affecterARError.set(null);
    this.ars.set([]);
    this.affecterARDialogOpen = true;
    
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
    const { zone, ar, password, observation } = this.affecterARForm.value;
    this.affecterARLoading.set(true);
    this.affecterARError.set(null);

    this.analyseFlow
      .affecterAnalysteRisque(
        this.ref(),
        Number(zone),
        ar!,
        password!,
        observation || '',
      )
      .subscribe({
        next: (data) => {
          this.affecterARLoading.set(false);
          if (data.status === 200) {
            this.toast.success("Dossier affecté avec succès à l'AR.");
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

  // ── AR : Faire le résumé ────────────────────────────────────────────
  readonly arAlert = signal<string | null>(null);

  goResume() {
    if (!this.canFaireResume()) {
      this.arAlert.set(resumeAccessBlockedMessage(this.ficheHeader()));
      return;
    }

    this.arAlert.set(null);
    this.router.navigate(['/app/credit/resume', this.ref()]);
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
