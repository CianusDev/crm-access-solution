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
import { AuthService } from '@/core/services/auth/auth.service';
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
  allRequiredDocsUploaded,
} from '../../constants/required-documents';
import {
  cacaaRapportVisiteComplete,
  gpClientProfileCompleteForSend,
  gpTypeAttachmentCompleteForSend,
} from '../../validation/send-dossier.validation';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import {
  DrawerComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
  DrawerContentComponent,
} from '@/shared/components/drawer/drawer.component';
import { DatePipe } from '@angular/common';
import { StripHtmlPipe } from '@/shared/pipes/strip-html/strip-html.pipe';

type TabId =
  | 'demande'
  | 'activite'
  | 'achats'
  | 'tresorerie'
  | 'familial'
  | 'garanties'
  | 'cautions'
  | 'documents'
  | 'swot'
  | 'geolocalisation'
  | 'envoi';

interface Tab {
  id: TabId;
  label: string;
  /** Rôles autorisés. Vide = tous les rôles. */
  roles?: UserRole[];
}

const GP_ROLES: UserRole[] = [
  UserRole.GestionnairePortefeuilles,
  UserRole.GestionnairePortefeuillesJunior,
];
const RC_CC_ROLES: UserRole[] = [UserRole.responsableClient, UserRole.conseilClientele];
const CA_CAA_ROLES: UserRole[] = [UserRole.ChefAgence, UserRole.ChefAgenceAdjoint];

const ALL_TABS: Tab[] = [
  { id: 'demande',       label: 'Demande de crédit' },
  { id: 'activite',      label: 'Profil Activité',    roles: [] },
  { id: 'achats',        label: 'Achats & Charges',   roles: [] },
  { id: 'tresorerie',    label: 'Trésorerie',          roles: [] },
  { id: 'familial',      label: 'Profil Familial',     roles: [] },
  { id: 'garanties',     label: 'Actifs & Garanties',  roles: [] },
  { id: 'cautions',      label: 'Cautions solidaires', roles: [] },
  { id: 'documents',     label: 'Documents annexes',   roles: [] },
  { id: 'swot',          label: 'SWOT & Comités',      roles: [] },
  { id: 'geolocalisation', label: 'Géolocalisation' },
  { id: 'envoi',         label: 'Envoi & Validation' },
];

const GP_TAB_IDS: TabId[]     = ['demande', 'documents', 'geolocalisation'];
const RC_CC_TAB_IDS: TabId[]  = ['demande', 'documents', 'geolocalisation'];
const CA_CAA_TAB_IDS: TabId[] = ['demande', 'documents', 'geolocalisation'];

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
  private readonly authService = inject(AuthService);
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
      if (this.isGP() || this.isRCCC() || this.isCACaa() || this.isAR()) {
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
  readonly isPaused = computed(() => this.ficheHeader()?.pause === 1);

  readonly tabs = computed<Tab[]>(() => {
    if (this.isGP()) {
      return ALL_TABS.filter((t) => GP_TAB_IDS.includes(t.id));
    }
    if (this.isRCCC()) {
      return ALL_TABS.filter((t) => RC_CC_TAB_IDS.includes(t.id));
    }
    if (this.isCACaa()) {
      return ALL_TABS.filter((t) => CA_CAA_TAB_IDS.includes(t.id));
    }
    return ALL_TABS;
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
  readonly activeTab = signal<TabId>('demande');
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
    if (this.isGP()) {
      return getRequiredDocsForGP(code, h.client?.entreprise?.statutJuridique);
    }
    if (this.isAR()) {
      return getRequiredDocsForAR(code);
    }
    return [];
  });

  readonly canSendDossier = computed(() => {
    const h = this.ficheHeader();
    const f = this.fiche();
    const detail = this.effectiveDemandeDetails();
    if (!h) return false;

    if (this.isGP()) {
      const required = this.requiredDocs();
      const docsOk =
        required.length === 0 || allRequiredDocsUploaded(required, this.uploadedDocLibelles());
      if (!docsOk) return false;
      if (!gpClientProfileCompleteForSend(h.client)) return false;
      const isPM = h.client?.typeAgent !== 'PP';
      if (!gpTypeAttachmentCompleteForSend(h.typeCredit?.code, isPM, f, detail)) return false;
      return true;
    }

    if (this.isAR()) {
      const required = getRequiredDocsForAR(h.typeCredit?.code);
      if (required.length === 0) return true;
      return allRequiredDocsUploaded(required, this.uploadedDocLibelles());
    }

    if (this.isRCCC()) {
      if (!h.numTransaction) return false;
      if (h.typeCredit?.code === '015') return true;
      return this.confirmationFrais();
    }

    if (this.isCACaa()) {
      if (!cacaaRapportVisiteComplete(h.statut, h.typeCredit?.code, this.uploadedDocLibelles())) {
        return false;
      }
      return true;
    }

    return true;
  });

  /** AR : mêmes contrôles docs que pour « Faire le résumé » (legacy `existenceDocumentACharger`). */
  readonly canFaireResume = computed(() => {
    if (!this.isAR()) return true;
    const h = this.ficheHeader();
    if (!h) return false;
    const required = getRequiredDocsForAR(h.typeCredit?.code);
    if (required.length > 0) {
      return allRequiredDocsUploaded(required, this.uploadedDocLibelles());
    }
    if (h.statut === 5) {
      const uploaded = this.uploadedDocLibelles().map((l) => l.trim().toLowerCase());
      const hasAnalyse = uploaded.some(
        (u) => u.includes('analyse financière') || u.includes('analyse financiere'),
      );
      const hasActifs = uploaded.some((u) => u.includes('actif') && u.includes('garantie'));
      return hasAnalyse && hasActifs;
    }
    return true;
  });

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
        if (this.isGP() || this.isRCCC() || this.isCACaa() || this.isAR()) {
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

  switchTab(id: TabId) {
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

    this.authService.verifyPassword(password!).subscribe({
      next: (res) => {
        if (res.statut === 500) {
          this.envoiError.set(res.message || 'Mot de passe incorrect.');
          this.envoiLoading.set(false);
          return;
        }
        this.creditService
          .saveCrdObservation({
            refDemande: this.ref(),
            decision: 1,
            observation: observation || '',
            password: password ?? '',
          })
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
            error: () => {
              this.envoiLoading.set(false);
              this.toast.error("Erreur lors de l'envoi du dossier.");
            },
          });
      },
      error: () => {
        this.envoiError.set('Mot de passe incorrect.');
        this.envoiLoading.set(false);
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
    this.creditService
      .updateDemandeCredit({
        refDemande: this.ref(),
        numTransaction: this.perfectForm.value.numTransaction!,
      } as never)
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

    this.authService.verifyPassword(password!).subscribe({
      next: (res) => {
        if (res.statut === 500) {
          this.ajournerError.set(res.message || 'Mot de passe incorrect.');
          this.ajournerLoading.set(false);
          return;
        }
        this.creditService
          .saveCrdObservation({
            refDemande: this.ref(),
            decision: 2,
            observation: observation || '',
            password: password ?? '',
          })
          .subscribe({
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
            error: () => {
              this.ajournerLoading.set(false);
              this.toast.error("Erreur lors de l'ajournement.");
            },
          });
      },
      error: () => {
        this.ajournerError.set('Mot de passe incorrect.');
        this.ajournerLoading.set(false);
      },
    });
  }

  // ── Affecter AR ───────────────────────────────────────────────────────
  openAffecterARDialog() {
    this.affecterARForm.reset();
    this.affecterARError.set(null);
    this.ars.set([]);
    this.affecterARDialogOpen = true;
    
    // Charger les zones
    this.zonesLoading.set(true);
    this.creditService.getZones().subscribe({
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

    this.creditService.getARsByZone(zoneId).subscribe({
      next: (ars) => {
        // Construire le libellé "nom prenom" pour l'affichage
        const arsWithLabel = ars.map(ar => ({
          ...ar,
          libelle: `${ar.nom} ${ar.prenom}`
        }));
        this.ars.set(arsWithLabel);
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

    // Vérifier le mot de passe
    this.authService.verifyPassword(password!).subscribe({
      next: (res) => {
        if (res.statut === 500) {
          this.affecterARError.set(res.message || 'Mot de passe incorrect.');
          this.affecterARLoading.set(false);
          return;
        }
        // Mot de passe correct, envoyer l'affectation
        const payload = {
          refDemande: this.ref(),
          decision: 1,
          zone: Number(zone),
          codeAr: ar!,
          password: password!,
          observation: observation || '',
        };

        this.creditService.affecterDemandeAR(payload).subscribe({
          next: (data) => {
            this.affecterARLoading.set(false);
            if (data.status === 200) {
              this.toast.success('Dossier affecté avec succès à l\'AR.');
              this.affecterARDialogOpen = false;
              this.router.navigate(['/app/credit/list']);
            } else {
              this.toast.error(data.message ?? "Échec de l'affectation.");
            }
          },
          error: () => {
            this.affecterARLoading.set(false);
            this.toast.error("Erreur lors de l'affectation.");
          },
        });
      },
      error: () => {
        this.affecterARError.set('Mot de passe incorrect.');
        this.affecterARLoading.set(false);
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

    this.authService.verifyPassword(password!).subscribe({
      next: (res) => {
        if (res.statut === 500) {
          this.avisDefavorableError.set(res.message || 'Mot de passe incorrect.');
          this.avisDefavorableLoading.set(false);
          return;
        }
        this.creditService
          .saveCrdObservation({
            refDemande: this.ref(),
            decision: 4, // 4 = Avis défavorable
            observation: observation || '',
            password: password ?? '',
          })
          .subscribe({
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
            error: () => {
              this.avisDefavorableLoading.set(false);
              this.toast.error("Erreur lors de l'enregistrement.");
            },
          });
      },
      error: () => {
        this.avisDefavorableError.set('Mot de passe incorrect.');
        this.avisDefavorableLoading.set(false);
      },
    });
  }

  // ── AR : Faire le résumé ────────────────────────────────────────────
  readonly arAlert = signal<string | null>(null);

  goResume() {
    if (!this.canFaireResume()) {
      const h = this.ficheHeader();
      const required = getRequiredDocsForAR(h?.typeCredit?.code);
      if (required.length > 0) {
        this.arAlert.set(
          "Merci de charger tous les documents obligatoires (liste dans l'en-tête) avant d'accéder au résumé.",
        );
      } else if (h?.statut === 5) {
        this.arAlert.set(
          "Merci de charger l'analyse financière et le document actifs et garanties avant le résumé.",
        );
      } else {
        this.arAlert.set("Documents manquants pour accéder au résumé.");
      }
      return;
    }

    this.arAlert.set(null);
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
