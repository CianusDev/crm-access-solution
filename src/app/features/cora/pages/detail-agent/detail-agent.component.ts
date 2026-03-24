import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { TabsComponent } from '@/shared/components/tabs/tabs.component';
import { TabComponent } from '@/shared/components/tabs/tab.component';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogContentComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { HasRolePipe } from '@/shared/pipes/has-role/has-role.pipe';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ArrowLeft,
  MapPin,
  Phone,
  FileText,
  Image,
  Map,
  ClipboardList,
  CheckCircle,
  LucideAngularModule,
  ExternalLink,
  CheckIcon,
  Send,
  Lock,
  KeyRound,
  Gavel,
} from 'lucide-angular';
import {
  AgentCoraDetail,
  Decision,
  Evaluation,
  FileCoraModel,
} from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { getInitiales } from '@/shared/pipes/initiales.pipe';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { StripHtmlPipe } from '@/shared/pipes/strip-html.pipe';
import { UserRole } from '@/core/models/user.model';

const STATUT_LABEL: Record<number, string> = {
  1: 'Rejeté',
  2: "En attente d'évaluation",
  3: 'En attente de validation',
  4: "En attente d'approbation",
  5: 'En attente de création des accès',
  6: 'En attente de clôture',
  7: 'Clôturé',
};

const STATUT_VARIANT: Record<number, BadgeVariant> = {
  1: 'destructive',
  2: 'warning',
  3: 'warning',
  4: 'warning',
  5: 'secondary',
  6: 'secondary',
  7: 'success',
};

const DECISION_LABEL: Record<number, string> = {
  1: 'Refusée',
  2: 'Acceptée',
  3: 'Ajournée',
};

const DECISION_VARIANT: Record<number, BadgeVariant> = {
  1: 'default',
  2: 'success',
  3: 'warning',
};

const DISTANCE_LABEL: Record<number, string> = {
  0: 'Moins de 500m',
  1: '500m à 1km',
  2: "Plus d'un (01) km",
};

const FORCES = [
  'Cadre approprié',
  'Bonne situation géographique',
  "Forte concentration d'activités",
  'Bonne expérience dans le domaine (mobile money)',
  'Cadre sécurisé',
];

const FAIBLESSES = ['Insuffisance de fdr', 'Cadre non sécuriser', 'Besoin de diversification'];

const DOC_TYPES = [
  "Pièce d'identité",
  "Carton d'Ouverture",
  'DFE',
  'BIC',
  'RCCM',
  'Contrat de bail',
  'Facture',
];

const FILE_BASE_URL = 'https://crm-fichiers.creditaccess.ci/crm/panier-de-fichiers-ca/';

const IMG_TYPES = ['Mandataire Social', 'Façade', 'Ruelle', 'Espace client', 'Photo Caisse'];

@Component({
  selector: 'app-detail-agent',
  templateUrl: './detail-agent.component.html',
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    BadgeComponent,
    ButtonDirective,
    TabsComponent,
    TabComponent,
    GoogleMap,
    MapMarker,
    LucideAngularModule,
    DatePipe,
    UpperCasePipe,
    Avatar,
    StripHtmlPipe,
    HasRolePipe,
    ReactiveFormsModule,
    FormInput,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogContentComponent,
    DialogFooterComponent,
  ],
})
export class DetailAgentComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly MapPinIcon = MapPin;
  readonly PhoneIcon = Phone;
  readonly FileTextIcon = FileText;
  readonly ImageIcon = Image;
  readonly MapIcon = Map;
  readonly ClipboardListIcon = ClipboardList;
  readonly CheckIcon = CheckIcon;
  readonly ExternalLinkIcon = ExternalLink;
  readonly SendIcon = Send;
  readonly LockIcon = Lock;
  readonly KeyRoundIcon = KeyRound;
  readonly GavelIcon = Gavel;

  readonly DOC_TYPES = DOC_TYPES;
  readonly IMG_TYPES = IMG_TYPES;
  readonly FORCES = FORCES;
  readonly FAIBLESSES = FAIBLESSES;

  // Rôles
  readonly GestionCoraRole = UserRole.GestionCora;
  readonly AgentBORole = UserRole.AgentBO;
  readonly ChargeCoraRole = UserRole.ChargeCora;
  readonly DGARole = UserRole.DirecteurGeneralAdjoint;
  readonly DirectriceExploitationRole = UserRole.DirectriceExploitation;

  private readonly router = inject(Router);
  private readonly coraService = inject(CoraService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly agent = input<AgentCoraDetail>();

  readonly isSubmitting = signal(false);

  // ── Dialogs ───────────────────────────────────────────────────────────────
  readonly decisionDialogOpen = signal(false);
  readonly decisionLoading = signal(false);
  readonly decisionForm = this.fb.group({
    agentId: [0],
    decision: ['', Validators.required],
    observation: ['', Validators.required],
  });

  readonly identifiantPrincipalDialogOpen = signal(false);
  readonly identifiantPrincipalLoading = signal(false);
  readonly identifiantPrincipalForm = this.fb.group({
    agentId: [0],
    perfectNumber: ['', Validators.required],
    pmobileNumber: ['', Validators.required],
  });

  readonly identifiantSousAgentDialogOpen = signal(false);
  readonly identifiantSousAgentLoading = signal(false);
  readonly identifiantSousAgentForm = this.fb.group({
    agentId: [0],
    pmobileNumber: ['', Validators.required],
  });

  readonly actionLoading = signal(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly initiales = computed(() => getInitiales(this.agent()?.cora?.designation));

  readonly mapCenter = computed((): google.maps.LatLngLiteral | null => {
    const a = this.agent();
    const lat = Number(a?.latitude);
    const lng = Number(a?.longitude);
    return lat && lng ? { lat, lng } : null;
  });

  readonly mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  };

  readonly forces = computed<string[]>(() => {
    try {
      return JSON.parse(this.agent()?.evaluation?.force ?? '[]');
    } catch {
      return [];
    }
  });

  readonly faiblesses = computed<string[]>(() => {
    try {
      return JSON.parse(this.agent()?.evaluation?.faiblesse ?? '[]');
    } catch {
      return [];
    }
  });

  readonly documentsByType = computed(() => {
    const docs = this.agent()?.documents ?? [];
    return DOC_TYPES.reduce(
      (acc, type) => {
        acc[type] = docs.filter((d) => d.libelle === type);
        return acc;
      },
      {} as Record<string, FileCoraModel[]>,
    );
  });

  readonly imagesByType = computed(() => {
    const imgs = this.agent()?.images ?? [];
    return IMG_TYPES.reduce(
      (acc, type) => {
        acc[type] = imgs.filter((i) => i.libelle === type);
        return acc;
      },
      {} as Record<string, FileCoraModel[]>,
    );
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  statutLabel(statut?: number) {
    return STATUT_LABEL[statut ?? 0] ?? '—';
  }
  statutVariant(statut?: number): BadgeVariant {
    return STATUT_VARIANT[statut ?? 0] ?? 'secondary';
  }
  decisionLabel(d?: number) {
    return DECISION_LABEL[d ?? 0] ?? '—';
  }
  decisionVariant(d?: number): BadgeVariant {
    return DECISION_VARIANT[d ?? 0] ?? 'secondary';
  }
  distanceLabel(d?: number) {
    return DISTANCE_LABEL[d ?? 0] ?? '—';
  }
  typeLabel(t?: number) {
    return t === 1 ? 'Agent principal' : 'Sous-agent';
  }
  typeBadgeVariant(t?: number): BadgeVariant {
    return t === 1 ? 'default' : 'secondary';
  }
  hasForce(f: string) {
    return this.forces().includes(f);
  }
  hasFaiblesse(f: string) {
    return this.faiblesses().includes(f);
  }

  fileUrl(lien?: string) {
    return lien ? FILE_BASE_URL + lien : null;
  }

  openDocument(lien?: string) {
    const url = this.fileUrl(lien);
    if (url) window.open(url, '_blank');
  }

  openMap() {
    const c = this.mapCenter();
    if (c) window.open(`https://www.google.com/maps?q=${c.lat},${c.lng}`, '_blank');
  }

  goBack() {
    this.router.navigate(['/app/cora/pending']);
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  sendForValidation() {
    const id = this.agent()?.id;
    if (!id) return;
    this.actionLoading.set(true);
    this.coraService.sendAgentForValidation(id).subscribe({
      next: () => {
        this.toast.success('Agent envoyé pour validation.');
        this.actionLoading.set(false);
        this.goBack();
      },
      error: (err) => {
        this.toast.error(err.message ?? 'Erreur lors de l\'envoi.');
        this.actionLoading.set(false);
      },
    });
  }

  closeAgentAction() {
    const id = this.agent()?.id;
    if (!id) return;
    this.actionLoading.set(true);
    this.coraService.closeAgent(id).subscribe({
      next: () => {
        this.toast.success('Agent clôturé avec succès.');
        this.actionLoading.set(false);
        this.goBack();
      },
      error: (err) => {
        this.toast.error(err.message ?? 'Erreur lors de la clôture.');
        this.actionLoading.set(false);
      },
    });
  }

  // ── Dialog décision ───────────────────────────────────────────────────────
  openDecisionDialog() {
    const id = this.agent()?.id;
    this.decisionForm.reset({ agentId: id ?? 0, decision: '', observation: '' });
    this.decisionDialogOpen.set(true);
  }

  saveDecision() {
    if (this.decisionForm.invalid) return;
    const { agentId, decision, observation } = this.decisionForm.getRawValue();
    this.decisionLoading.set(true);
    this.coraService
      .saveDecision({ agent: agentId!, decision: Number(decision), observation: observation! })
      .subscribe({
        next: () => {
          this.toast.success('Décision enregistrée.');
          this.decisionDialogOpen.set(false);
          this.decisionLoading.set(false);
          this.goBack();
        },
        error: (err) => {
          this.toast.error(err.message ?? 'Erreur lors de l\'enregistrement.');
          this.decisionLoading.set(false);
        },
      });
  }

  // ── Dialog identifiant agent principal ────────────────────────────────────
  openIdentifiantPrincipalDialog() {
    const id = this.agent()?.id;
    this.identifiantPrincipalForm.reset({ agentId: id ?? 0, perfectNumber: '', pmobileNumber: '' });
    this.identifiantPrincipalDialogOpen.set(true);
  }

  saveIdentifiantPrincipal() {
    if (this.identifiantPrincipalForm.invalid) return;
    const { agentId, perfectNumber, pmobileNumber } = this.identifiantPrincipalForm.getRawValue();
    this.identifiantPrincipalLoading.set(true);
    this.coraService
      .savePerfectNumber({ agent: agentId!, perfectNumber: perfectNumber!, pmobileNumber: pmobileNumber! })
      .subscribe({
        next: () => {
          this.toast.success('Identifiants enregistrés.');
          this.identifiantPrincipalDialogOpen.set(false);
          this.identifiantPrincipalLoading.set(false);
          this.goBack();
        },
        error: (err) => {
          this.toast.error(err.message ?? 'Erreur lors de l\'enregistrement.');
          this.identifiantPrincipalLoading.set(false);
        },
      });
  }

  // ── Dialog identifiant sous-agent ─────────────────────────────────────────
  openIdentifiantSousAgentDialog() {
    const id = this.agent()?.id;
    this.identifiantSousAgentForm.reset({ agentId: id ?? 0, pmobileNumber: '' });
    this.identifiantSousAgentDialogOpen.set(true);
  }

  saveIdentifiantSousAgent() {
    if (this.identifiantSousAgentForm.invalid) return;
    const { agentId, pmobileNumber } = this.identifiantSousAgentForm.getRawValue();
    this.identifiantSousAgentLoading.set(true);
    this.coraService
      .savePerfectNumber({ agent: agentId!, pmobileNumber: pmobileNumber! })
      .subscribe({
        next: () => {
          this.toast.success('Numéro P-Mobile enregistré.');
          this.identifiantSousAgentDialogOpen.set(false);
          this.identifiantSousAgentLoading.set(false);
          this.goBack();
        },
        error: (err) => {
          this.toast.error(err.message ?? 'Erreur lors de l\'enregistrement.');
          this.identifiantSousAgentLoading.set(false);
        },
      });
  }
}
