import { Component, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  FileText,
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
import { PermissionService } from '@/core/services/permission/permission.service';
import { UserRole } from '@/core/models/user.model';
import {
  RequiredDoc,
  getRequiredDocsForGP,
  allRequiredDocsUploaded,
} from '../../constants/required-documents';

type TabId = 'demande' | 'activite' | 'achats' | 'tresorerie' | 'familial' | 'garanties' | 'cautions' | 'swot' | 'geolocalisation' | 'envoi';

interface Tab {
  id: TabId;
  label: string;
  /** Rôles autorisés. Vide = tous les rôles. */
  roles?: UserRole[];
}

const GP_ROLES: UserRole[] = [UserRole.GestionnairePortefeuilles, UserRole.GestionnairePortefeuillesJunior];

const ALL_TABS: Tab[] = [
  { id: 'demande',        label: 'Demande de crédit' },
  { id: 'activite',       label: 'Profil Activité',       roles: [] },
  { id: 'achats',         label: 'Achats & Charges',      roles: [] },
  { id: 'tresorerie',     label: 'Trésorerie',            roles: [] },
  { id: 'familial',       label: 'Profil Familial',       roles: [] },
  { id: 'garanties',      label: 'Actifs & Garanties',    roles: [] },
  { id: 'cautions',       label: 'Documents',             roles: [] },
  { id: 'swot',           label: 'SWOT & Comités',        roles: [] },
  { id: 'geolocalisation',label: 'Géolocalisation' },
  { id: 'envoi',          label: 'Envoi & Validation' },
];

// Onglets visibles pour le GP / GPJ
const GP_TAB_IDS: TabId[] = ['demande', 'cautions', 'geolocalisation'];

@Component({
  selector: 'app-analyse-credit',
  templateUrl: './analyse-credit.component.html',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    BadgeComponent,
    ButtonDirective,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogFooterComponent,
    FormInput,
    FormTextarea,
    AnalyseHeaderCardComponent,
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
  ],
})
export class AnalyseCreditComponent implements OnInit {
  readonly ChevronLeftIcon  = ChevronLeft;
  readonly RefreshIcon      = RefreshCw;
  readonly AlertCircleIcon  = AlertCircle;
  readonly FileTextIcon     = FileText;

  private readonly route             = inject(ActivatedRoute);
  private readonly router            = inject(Router);
  private readonly fb                = inject(FormBuilder);
  private readonly creditService     = inject(CreditService);
  private readonly authService       = inject(AuthService);
  private readonly toast             = inject(ToastService);
  private readonly permissionService = inject(PermissionService);

  readonly data = input<AnalyseCreditResolvedData>();

  constructor() {
    effect(() => {
      const data = this.data();
      if (!data) return;
      this.fiche.set(data.fiche);
      this.ficheHeader.set(data.fiche.demande);
      console.log('[AnalyseCredit] typeCredit:', data.fiche.demande?.typeCredit, 'statutJuridique:', data.fiche.demande?.client?.entreprise?.statutJuridique);
      if (data.analyse?.demande) {
        this.demande.set(data.analyse.demande as CreditFicheDemandeDetail);
      }
      this.isLoading.set(false);

      // Charger les documents pour vérifier la complétude (GP)
      if (this.isGP()) {
        this.loadUploadedDocs();
      }
    });
  }

  readonly statuts = CREDIT_STATUTS;

  // ── Role-based tab filtering ───────────────────────────────────────────
  readonly isGP = computed(() => this.permissionService.hasRole(...GP_ROLES));

  readonly tabs = computed<Tab[]>(() => {
    if (this.isGP()) {
      return ALL_TABS.filter(t => GP_TAB_IDS.includes(t.id));
    }
    return ALL_TABS;
  });

  // ── State ──────────────────────────────────────────────────────────────
  readonly ref        = signal('');
  readonly isLoading  = signal(false);
  readonly ficheHeader = signal<CreditFicheDemandeDetail | null>(null);
  readonly fiche       = signal<import('../../interfaces/credit.interface').CreditFiche | null>(null);
  readonly demande    = signal<CreditFicheDemandeDetail | null>(null);
  readonly error      = signal<string | null>(null);
  readonly activeTab  = signal<TabId>('demande');
  readonly pendingDocLibelle = signal<{ libelle: string; version: number } | null>(null);
  private pendingDocVersion = 0;

  // ── Documents GP — pour validation "Envoyer le dossier" ────────────────
  readonly uploadedDocLibelles = signal<string[]>([]);

  readonly requiredDocs = computed<RequiredDoc[]>(() => {
    const h = this.ficheHeader();
    if (!h || !this.isGP()) return [];
    const code = h.typeCredit?.code;
    const statutJur = h.client?.entreprise?.statutJuridique;
    return getRequiredDocsForGP(code, statutJur);
  });

  readonly canSendDossier = computed(() => {
    if (!this.isGP()) return true;
    const required = this.requiredDocs();
    if (required.length === 0) return true;
    return allRequiredDocsUploaded(required, this.uploadedDocLibelles());
  });

  // ── Dialog envoi dossier ────────────────────────────────────────────────
  envoiDialogOpen = false;
  readonly envoiLoading = signal(false);
  readonly envoiError   = signal<string | null>(null);

  readonly envoiForm = this.fb.group({
    password:    ['', Validators.required],
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

    this.creditService.getFicheCredit(this.ref()).subscribe({
      next: (fiche) => { this.fiche.set(fiche); this.ficheHeader.set(fiche.demande); },
      error: () => {},
    });

    this.creditService.getAnalyseFinanciere(this.ref()).subscribe({
      next: (data) => {
        if (!data?.demande) {
          this.error.set('Données du dossier introuvables.');
          this.isLoading.set(false);
          return;
        }
        this.demande.set(data.demande as CreditFicheDemandeDetail);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les données du dossier.');
        this.isLoading.set(false);
      },
    });

    if (this.isGP()) {
      this.loadUploadedDocs();
    }
  }

  loadUploadedDocs() {
    const r = this.ref();
    if (!r) return;
    this.creditService.getDocuments(r).subscribe({
      next: (docs) => this.uploadedDocLibelles.set(docs.map(d => d.libelle ?? '')),
      error: () => {},
    });
  }

  switchTab(id: TabId) {
    this.activeTab.set(id);
  }

  onChargerDocuments(libelle: string | null) {
    this.switchTab('cautions');
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
        this.creditService.saveCrdObservation({
          refDemande: this.ref(),
          decision: 1,
          observation: observation || '',
          password: password ?? '',
        }).subscribe({
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
