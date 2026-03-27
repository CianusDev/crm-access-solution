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
import {
  DrawerComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
  DrawerContentComponent,
  DrawerFooterComponent,
} from '@/shared/components/drawer/drawer.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect } from '@/shared/components/form-select/form-select.component';
import { FormRichTextarea } from '@/shared/components/form-rich-textarea/form-rich-textarea.component';
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
  Pencil,
  Plus,
  Upload,
  Trash2,
} from 'lucide-angular';
import { LightboxComponent, LightboxImage } from '@/shared/components/lightbox/lightbox.component';
import {
  AgentCoraDetail,
  Decision,
  Evaluation,
  FileCoraModel,
} from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { ParametresService } from '@/features/parametres/services/parametres.service';
import { SelectOption } from '@/shared/components/form-select/form-select.component';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { getInitiales } from '@/shared/pipes/initailes/initiales.pipe';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { StripHtmlPipe } from '@/shared/pipes/strip-html/strip-html.pipe';
import { UserRole } from '@/core/models/user.model';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';

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
    FormTextarea,
    FormSelect,
    FormRichTextarea,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogContentComponent,
    DialogFooterComponent,
    DrawerComponent,
    DrawerHeaderComponent,
    DrawerTitleComponent,
    DrawerContentComponent,
    DrawerFooterComponent,
    LightboxComponent,
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
  readonly PencilIcon = Pencil;
  readonly PlusIcon = Plus;
  readonly UploadIcon = Upload;
  readonly Trash2Icon = Trash2;
  // ── Lightbox ──────────────────────────────────────────────────────────────
  readonly lightboxOpen = signal(false);
  readonly lightboxImages = signal<LightboxImage[]>([]);
  readonly lightboxIndex = signal(0);

  openLightbox(type: string, startIndex: number) {
    const imgs = (this.imagesByType()[type] ?? []).map((img) => ({
      url: this.fileUrl(img.lien) ?? '',
      label: img.libelle ?? '',
    }));
    if (!imgs.length) return;
    this.lightboxImages.set(imgs);
    this.lightboxIndex.set(startIndex);
    this.lightboxOpen.set(true);
  }

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
  private readonly parametresService = inject(ParametresService);

  readonly agent = input<AgentCoraDetail>();

  // ── Données locales (rafraîchissables après upload) ───────────────────────
  private readonly agentOverride = signal<AgentCoraDetail | undefined>(undefined);
  readonly agentData = computed(() => this.agentOverride() ?? this.agent());

  // ── Upload / delete states ─────────────────────────────────────────────────
  readonly uploadingDoc = signal<string | null>(null);
  readonly uploadingImg = signal<string | null>(null);
  readonly deletingDoc = signal<string | null>(null);
  readonly deletingImg = signal<string | null>(null);

  // Libelle courant pour le file input partagé
  private currentDocType = '';
  private currentImgType = '';

  readonly isSubmitting = signal(false);

  // ── Dialogs ───────────────────────────────────────────────────────────────
  readonly confirmValidationDialogOpen = signal(false);
  readonly confirmClotureDialogOpen = signal(false);
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

  // ── Dialog évaluation ─────────────────────────────────────────────────────
  readonly evaluationDialogOpen = signal(false);
  readonly evaluationLoading = signal(false);
  readonly evaluationMode = signal<'ajout' | 'modif'>('ajout');
  readonly evaluationForces = signal<string[]>([]);
  readonly evaluationFaiblesses = signal<string[]>([]);
  readonly agenceOptions = signal<SelectOption[]>([]);
  readonly evaluationForm = this.fb.group({
    agentId: [0],
    historique: ['', Validators.required],
    agenceProche: ['', Validators.required],
    distanceAgence: [0, Validators.required],
    securite: ['', Validators.required],
    commentaire: ['', Validators.required],
  });

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly initiales = computed(() => getInitiales(this.agentData()?.cora?.designation));

  readonly mapCenter = computed((): google.maps.LatLngLiteral | null => {
    const a = this.agentData();
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
      return JSON.parse(this.agentData()?.evaluation?.force ?? '[]');
    } catch {
      return [];
    }
  });

  readonly faiblesses = computed<string[]>(() => {
    try {
      return JSON.parse(this.agentData()?.evaluation?.faiblesse ?? '[]');
    } catch {
      return [];
    }
  });

  readonly documentsByType = computed(() => {
    const docs = this.agentData()?.documents ?? [];
    return DOC_TYPES.reduce(
      (acc, type) => {
        acc[type] = docs.filter((d) => d.libelle === type);
        return acc;
      },
      {} as Record<string, FileCoraModel[]>,
    );
  });

  readonly imagesByType = computed(() => {
    const imgs = this.agentData()?.images ?? [];
    return IMG_TYPES.reduce(
      (acc, type) => {
        acc[type] = imgs.filter((i) => i.libelle === type);
        return acc;
      },
      {} as Record<string, FileCoraModel[]>,
    );
  });

  // ── Refresh ───────────────────────────────────────────────────────────────
  private refreshAgent() {
    const id = this.agentData()?.id;
    if (!id) return;
    this.coraService.getAgentById(id).subscribe({
      next: (data) => this.agentOverride.set(data),
      error: () => {},
    });
  }

  // ── Upload documents ──────────────────────────────────────────────────────
  triggerDocUpload(libelle: string, input: HTMLInputElement) {
    this.currentDocType = libelle;
    input.value = '';
    input.click();
  }

  onDocFilesSelected(event: Event, input: HTMLInputElement) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;
    const agentId = this.agentData()?.id;
    if (!agentId) return;
    this.uploadingDoc.set(this.currentDocType);
    const call =
      files.length === 1
        ? this.coraService.uploadDocument(agentId, this.currentDocType, files[0])
        : this.coraService.uploadDocuments(agentId, this.currentDocType, files);
    call.subscribe({
      next: () => {
        this.toast.success('Document(s) chargé(s) avec succès.');
        this.uploadingDoc.set(null);
        this.refreshAgent();
      },
      error: (err: { message?: string }) => {
        this.toast.error(err?.message ?? 'Erreur lors du chargement.');
        this.uploadingDoc.set(null);
      },
    });
    input.value = '';
  }

  deleteDocsByType(libelle: string) {
    const agentId = this.agentData()?.id;
    if (!agentId) return;
    this.deletingDoc.set(libelle);
    this.coraService.deleteDocumentsByType(agentId, libelle).subscribe({
      next: () => {
        this.toast.success('Documents supprimés.');
        this.deletingDoc.set(null);
        this.refreshAgent();
      },
      error: (err: { message?: string }) => {
        this.toast.error(err?.message ?? 'Erreur lors de la suppression.');
        this.deletingDoc.set(null);
      },
    });
  }

  // ── Upload images ─────────────────────────────────────────────────────────
  triggerImgUpload(libelle: string, input: HTMLInputElement) {
    this.currentImgType = libelle;
    input.value = '';
    input.click();
  }

  onImgFilesSelected(event: Event, input: HTMLInputElement) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;
    const agentId = this.agentData()?.id;
    if (!agentId) return;
    this.uploadingImg.set(this.currentImgType);
    this.coraService.uploadImages(agentId, this.currentImgType, files).subscribe({
      next: () => {
        this.toast.success('Image(s) chargée(s) avec succès.');
        this.uploadingImg.set(null);
        this.refreshAgent();
      },
      error: (err: { message?: string }) => {
        this.toast.error(err?.message ?? 'Erreur lors du chargement.');
        this.uploadingImg.set(null);
      },
    });
    input.value = '';
  }

  deleteImgsByType(libelle: string) {
    const agentId = this.agentData()?.id;
    if (!agentId) return;
    this.deletingImg.set(libelle);
    this.coraService.deleteImagesByType(agentId, libelle).subscribe({
      next: () => {
        this.toast.success('Images supprimées.');
        this.deletingImg.set(null);
        this.refreshAgent();
      },
      error: (err: { message?: string }) => {
        this.toast.error(err?.message ?? 'Erreur lors de la suppression.');
        this.deletingImg.set(null);
      },
    });
  }

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

  goEditAgent() {
    const a = this.agent();
    if (!a) return;
    if (a.typeUser === 1) {
      this.router.navigate(['/app/cora/create'], { queryParams: { coraId: a.cora?.id } });
    } else {
      this.router.navigate(['/app/cora/agent/create'], { queryParams: { agentId: a.id } });
    }
  }

  // ── Dialog évaluation ─────────────────────────────────────────────────────
  openEvaluationDialog(mode: 'ajout' | 'modif') {
    const a = this.agentData();
    this.evaluationMode.set(mode);
    if (this.agenceOptions().length === 0) {
      this.parametresService.getAgences().subscribe({
        next: (agences) =>
          this.agenceOptions.set(agences.map((ag) => ({ value: ag.libelle, label: ag.libelle }))),
        error: () => {},
      });
    }
    if (mode === 'modif' && a?.evaluation) {
      this.evaluationForm.reset({
        agentId: a.id,
        historique: a.evaluation.historique ?? '',
        agenceProche: a.evaluation.agenceProche ?? '',
        distanceAgence: a.evaluation.distanceAgence ?? 0,
        securite: a.evaluation.securite ?? '',
        commentaire: a.evaluation.commentaire ?? '',
      });
      try {
        this.evaluationForces.set(JSON.parse(a.evaluation.force ?? '[]'));
      } catch {
        this.evaluationForces.set([]);
      }
      try {
        this.evaluationFaiblesses.set(JSON.parse(a.evaluation.faiblesse ?? '[]'));
      } catch {
        this.evaluationFaiblesses.set([]);
      }
    } else {
      this.evaluationForm.reset({
        agentId: a?.id ?? 0,
        historique: '',
        agenceProche: '',
        distanceAgence: 0,
        securite: '',
        commentaire: '',
      });
      this.evaluationForces.set([]);
      this.evaluationFaiblesses.set([]);
    }
    this.evaluationDialogOpen.set(true);
  }

  toggleForce(f: string) {
    const current = this.evaluationForces();
    this.evaluationForces.set(
      current.includes(f) ? current.filter((x) => x !== f) : [...current, f],
    );
  }

  toggleFaiblesse(f: string) {
    const current = this.evaluationFaiblesses();
    this.evaluationFaiblesses.set(
      current.includes(f) ? current.filter((x) => x !== f) : [...current, f],
    );
  }

  saveEvaluation() {
    if (this.evaluationForm.invalid) return;
    const v = this.evaluationForm.getRawValue();
    const payload = {
      agent: v.agentId!,
      historique: v.historique!,
      agenceProche: v.agenceProche!,
      distanceAgence: Number(v.distanceAgence),
      securite: v.securite!,
      forces: this.evaluationForces(),
      faibesses: this.evaluationFaiblesses(),
      commentaire: v.commentaire!,
    };
    this.evaluationLoading.set(true);
    const call =
      this.evaluationMode() === 'ajout'
        ? this.coraService.saveEvaluation(payload)
        : this.coraService.updateEvaluation(payload);
    call.subscribe({
      next: () => {
        this.toast.success(
          this.evaluationMode() === 'ajout' ? 'Évaluation enregistrée.' : 'Évaluation mise à jour.',
        );
        this.evaluationDialogOpen.set(false);
        this.evaluationLoading.set(false);
        this.goBack();
      },
      error: (err) => {
        this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
        this.evaluationLoading.set(false);
      },
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  sendForValidation() {
    const a = this.agentData();
    if (!a?.id) return;

    const docs = this.documentsByType();
    const imgs = this.imagesByType();
    const hasGeo = !!a.latitude && !!a.longitude;

    const isPrincipal = a.typeUser === 1;
    const valid = isPrincipal
      ? docs["Pièce d'identité"]?.length > 0 &&
        docs['BIC']?.length > 0 &&
        docs['RCCM']?.length > 0 &&
        docs['Contrat de bail']?.length > 0 &&
        docs['Facture']?.length > 0 &&
        imgs['Mandataire Social']?.length > 0 &&
        imgs['Façade']?.length > 0 &&
        imgs['Ruelle']?.length > 0 &&
        imgs['Espace client']?.length > 0 &&
        imgs['Photo Caisse']?.length > 0 &&
        hasGeo
      : docs['Contrat de bail']?.length > 0 &&
        imgs['Façade']?.length > 0 &&
        imgs['Ruelle']?.length > 0 &&
        imgs['Espace client']?.length > 0 &&
        imgs['Photo Caisse']?.length > 0 &&
        hasGeo;

    if (!valid) {
      const manquants: string[] = [];
      if (isPrincipal) {
        if (!docs["Pièce d'identité"]?.length) manquants.push("Doc: Pièce d'identité");
        if (!docs['BIC']?.length) manquants.push('Doc: BIC');
        if (!docs['RCCM']?.length) manquants.push('Doc: RCCM');
        if (!docs['Contrat de bail']?.length) manquants.push('Doc: Contrat de bail');
        if (!docs['Facture']?.length) manquants.push('Doc: Facture');
        if (!imgs['Mandataire Social']?.length) manquants.push('Img: Mandataire Social');
      } else {
        if (!docs['Contrat de bail']?.length) manquants.push('Doc: Contrat de bail');
      }
      if (!imgs['Façade']?.length) manquants.push('Img: Façade');
      if (!imgs['Ruelle']?.length) manquants.push('Img: Ruelle');
      if (!imgs['Espace client']?.length) manquants.push('Img: Espace client');
      if (!imgs['Photo Caisse']?.length) manquants.push('Img: Photo Caisse');
      if (!hasGeo) manquants.push('Géolocalisation');
      console.warn('[sendForValidation] manquants:', manquants, {
        docs,
        imgs,
        lat: a.latitude,
        lng: a.longitude,
      });
      this.toast.error('Manquant : ' + manquants.join(', '));
      return;
    }

    this.confirmValidationDialogOpen.set(true);
  }

  confirmSendForValidation() {
    const id = this.agentData()?.id;
    if (!id) return;
    this.confirmValidationDialogOpen.set(false);
    this.actionLoading.set(true);
    this.coraService.sendAgentForValidation(id).subscribe({
      next: () => {
        this.toast.success('Agent envoyé pour validation.');
        this.actionLoading.set(false);
        this.goBack();
      },
      error: (err) => {
        this.toast.error(err.message ?? "Erreur lors de l'envoi.");
        this.actionLoading.set(false);
      },
    });
  }

  closeAgentAction() {
    this.confirmClotureDialogOpen.set(true);
  }

  confirmCloture() {
    const id = this.agent()?.id;
    if (!id) return;
    this.confirmClotureDialogOpen.set(false);
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
          this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
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
      .savePerfectNumber({
        agent: agentId!,
        perfectNumber: perfectNumber!,
        pmobileNumber: pmobileNumber!,
      })
      .subscribe({
        next: () => {
          this.toast.success('Identifiants enregistrés.');
          this.identifiantPrincipalDialogOpen.set(false);
          this.identifiantPrincipalLoading.set(false);
          this.goBack();
        },
        error: (err) => {
          this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
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
          this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
          this.identifiantSousAgentLoading.set(false);
        },
      });
  }
}
