import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  ShoppingBag,
  TrendingUp,
  Calendar,
  MapPin,
  BarChart2,
  ChevronDown,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import {
  DrawerComponent,
  DrawerHeaderComponent,
  DrawerTitleComponent,
  DrawerContentComponent,
  DrawerFooterComponent,
} from '@/shared/components/drawer/drawer.component';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect, SelectOption } from '@/shared/components/form-select/form-select.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../../services/credit/credit.service';
import {
  ActiviteCredit,
  ActiviteVenteMensuelle,
  ActiviteVenteJournaliere,
  MargeCommerciale,
  CreditTypeActivite,
  CreditCommune,
} from '../../../../interfaces/credit.interface';

const MOIS: SelectOption[] = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
].map((m) => ({ value: m, label: m }));

const JOURS: SelectOption[] = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
].map((j) => ({ value: j, label: j }));

const TYPE_ANALYSE: SelectOption[] = [
  { value: 'Jour', label: 'Jour' },
  { value: 'Semaine', label: 'Semaine' },
];

const STATUTS_MOIS: SelectOption[] = [
  { value: '1', label: 'Mois bon' },
  { value: '2', label: 'Mois faible' },
];

@Component({
  selector: 'app-activite-section',
  templateUrl: './activite-section.component.html',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    ButtonDirective,
    DrawerComponent,
    DrawerHeaderComponent,
    DrawerTitleComponent,
    DrawerContentComponent,
    DrawerFooterComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogFooterComponent,
    FormInput,
    FormSelect,
  ],
})
export class ActiviteSectionComponent implements OnInit {
  ref = input<string>('');

  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly Trash2Icon = Trash2;
  readonly AlertCircleIcon = AlertCircle;
  readonly ShoppingBagIcon = ShoppingBag;
  readonly TrendingUpIcon = TrendingUp;
  readonly CalendarIcon = Calendar;
  readonly MapPinIcon = MapPin;
  readonly BarChart2Icon = BarChart2;
  readonly ChevronDownIcon = ChevronDown;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  // ── Constants ──────────────────────────────────────────────────────────
  readonly moisOptions = MOIS;
  readonly joursOptions = JOURS;
  readonly typeAnalyseOptions = TYPE_ANALYSE;
  readonly statutMoisOptions = STATUTS_MOIS;

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly activites = signal<ActiviteCredit[]>([]);
  readonly error = signal<string | null>(null);
  readonly typesActivite = signal<CreditTypeActivite[]>([]);
  readonly communes = signal<CreditCommune[]>([]);

  readonly typeActiviteOptions = computed<SelectOption[]>(() =>
    this.typesActivite().map((ta) => ({ value: ta.id, label: ta.libelle })),
  );

  readonly activiteOptions = computed<SelectOption[]>(() =>
    this.activites().map((a) => ({ value: a.id!, label: a.libelle ?? `Activité #${a.id}` })),
  );

  readonly communeOptions = computed<SelectOption[]>(() =>
    this.communes().map((c) => ({ value: c.id!, label: c.libelle ?? '' })),
  );

  readonly analyseFinTotals = computed(() => {
    const toNumber = (value: unknown): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim() !== '') return Number(value);
      return 0;
    };

    return this.activites().reduce(
      (acc, activite) => {
        const analyse = activite.analyseFin;
        acc.detteEntreprise += toNumber(analyse?.detteEtreprise);
        acc.detteFournisseur += toNumber(analyse?.detteFournisseur);
        acc.espece += toNumber(analyse?.tresorerie?.espece);
        acc.banque += toNumber(analyse?.tresorerie?.banque);
        acc.creanceClient += toNumber(analyse?.creanceClient);
        acc.avanceFournisseur += toNumber(analyse?.avanceFournisseur);
        acc.totalStock += toNumber(analyse?.stock?.totalStock);
        return acc;
      },
      {
        detteEntreprise: 0,
        detteFournisseur: 0,
        espece: 0,
        banque: 0,
        creanceClient: 0,
        avanceFournisseur: 0,
        totalStock: 0,
      },
    );
  });

  // Drawer states
  activiteDrawerOpen = false;
  activiteDrawerMode: 'create' | 'edit' = 'create';
  ventesMDrawerOpen = false;
  ventesJDrawerOpen = false;
  margeDrawerOpen = false;
  margeDrawerMode: 'create' | 'edit' = 'create';
  private currentMargeId: number | null = null;

  // Delete dialog
  deleteDialogOpen = false;
  deleteTarget: { type: 'activite' | 'venteM' | 'venteJ' | 'marge'; id: number; label: string } | null = null;

  readonly isSavingActivite = signal(false);
  readonly isSavingVenteM = signal(false);
  readonly isSavingVenteJ = signal(false);
  readonly isSavingMarge = signal(false);
  readonly savingMargePondereId = signal<number | null>(null);
  readonly isDeleting = signal(false);

  // Collapse/expand state: Map<activiteId, boolean> (true = collapsed)
  readonly collapsedSections = signal<Map<number, boolean>>(new Map());

  // ── Forms ──────────────────────────────────────────────────────────────
  readonly activiteForm = this.fb.group({
    activite: [null as number | null],
    libelle: ['', Validators.required],
    typeAnalyse: ['', Validators.required],
    commune: [null as number | null, Validators.required],
    quartier: ['', Validators.required],
    rue: [''],
    boitePostale: [''],
    typeActivite: [null as number | null, Validators.required],
  });

  readonly venteMensuelleForm = this.fb.group({
    venteMensuelle: [null as number | null],
    activite: [null as number | null, Validators.required],
    mois: ['', Validators.required],
    montant: [null as number | null, Validators.required],
    statut: ['', Validators.required],
  });

  readonly venteJournaliereForm = this.fb.group({
    venteJournaliere: [null as number | null],
    activite: [null as number | null, Validators.required],
    jour: ['', Validators.required],
    montant: [null as number | null, Validators.required],
    statut: ['', Validators.required],
  });

  readonly margeForm = this.fb.group({
    activite: [null as number | null, Validators.required],
    article: ['', Validators.required],
    quantite: [null as number | null, Validators.required],
    prixVente: [null as number | null, Validators.required],
    prixAchat: [null as number | null, Validators.required],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadData();
    this.creditService.getTypesActivite().subscribe((types) => this.typesActivite.set(types));
    this.creditService
      .getPaysCommuneData()
      .subscribe((data) => this.communes.set(data.communes ?? []));
  }

  // ── Data loading ───────────────────────────────────────────────────────
  loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    this.creditService.getAnalyseFinanciere(this.ref()).subscribe({
      next: (data) => {
        if (!data?.demande) {
          this.error.set('Données du dossier introuvables.');
          this.isLoading.set(false);
          return;
        }
        this.activites.set(data.demande.activites ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les données du dossier.');
        this.isLoading.set(false);
      },
    });
  }

  formatMontant(n: number | undefined): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-FR').format(n);
  }

  formatPourcentage(n: number | undefined | null): string {
    if (n == null) return '—';
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n)} %`;
  }

  margeMontant(prixVente?: number | null, prixAchat?: number | null): number {
    return (prixVente ?? 0) - (prixAchat ?? 0);
  }

  margePourcentage(prixVente?: number | null, prixAchat?: number | null): number | null {
    const vente = prixVente ?? 0;
    if (vente <= 0) return null;
    return (this.margeMontant(prixVente, prixAchat) / vente) * 100;
  }

  margePourcentageLigne(marge: MargeCommerciale): number | null {
    if (marge.marge != null) return marge.marge;
    return this.margePourcentage(marge.prixVente, marge.prixAchat);
  }

  analyseMargeMoyenne(activite: ActiviteCredit): number | null {
    return activite.analyseFin?.margeCommerciale?.margeMoyenne ?? null;
  }

  analyseMargeARetenir(activite: ActiviteCredit): number | null {
    return activite.analyseFin?.margeCommerciale?.margeAretenir ?? null;
  }

  updateMargePondere(activite: ActiviteCredit, event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    const raw = target.value.trim();
    activite.margePondere = raw === '' ? 0 : Number(raw);
  }

  saveMargePondere(activite: ActiviteCredit) {
    if (!activite.id) return;
    const margePondere = Number(activite.margePondere ?? 0);
    this.savingMargePondereId.set(activite.id);
    this.creditService
      .saveActivite({
        activite: activite.id,
        margePondere,
        refDemande: this.ref(),
      })
      .subscribe({
        next: () => {
          this.toast.success('Marge pondérée enregistrée.');
          this.savingMargePondereId.set(null);
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
          this.savingMargePondereId.set(null);
        },
      });
  }

  venteJStatutLabel(): string {
    const activiteId = this.venteJournaliereForm.controls.activite.value;
    const typeAnalyse = this.activites().find((a) => a.id === activiteId)?.typeAnalyse;
    return typeAnalyse === 'Semaine' ? 'Statut de la semaine' : 'Statut du jour';
  }

  venteJStatutOptions(): SelectOption[] {
    const activiteId = this.venteJournaliereForm.controls.activite.value;
    const typeAnalyse = this.activites().find((a) => a.id === activiteId)?.typeAnalyse;
    const isSemaine = typeAnalyse === 'Semaine';

    return [
      { value: '3', label: isSemaine ? 'Semaine bonne' : 'Jour bon' },
      { value: '2', label: isSemaine ? 'Semaine moyenne' : 'Jour moyen' },
      { value: '1', label: isSemaine ? 'Semaine faible' : 'Jour faible' },
    ];
  }

  communeLabel(commune: string | { id?: number; libelle?: string } | undefined): string {
    if (!commune) return '';
    if (typeof commune === 'string') return commune;
    return commune.libelle ?? '';
  }

  // ── Collapse/Expand Helpers ────────────────────────────────────────────
  toggleCollapseSection(activiteId: number) {
    const map = this.collapsedSections();
    const isCollapsed = map.get(activiteId) ?? false;
    map.set(activiteId, !isCollapsed);
    this.collapsedSections.set(new Map(map));
  }

  isSectionCollapsed(activiteId: number): boolean {
    return this.collapsedSections().get(activiteId) ?? false;
  }

  resolveCommune(commune: string | { id?: number; libelle?: string } | undefined): number | null {
    if (!commune) return null;
    if (typeof commune === 'object' && commune.id != null) return commune.id;
    // Try to match by libelle in the loaded list
    const label = typeof commune === 'string' ? commune : (commune.libelle ?? '');
    const match = this.communes().find(
      (c) => c.libelle?.toLowerCase() === label.toLowerCase(),
    );
    return match?.id ?? null;
  }

  // ── Activité CRUD ──────────────────────────────────────────────────────
  openCreateActivite() {
    this.activiteDrawerMode = 'create';
    this.activiteForm.reset({
      activite: null,
      libelle: '',
      typeAnalyse: '',
      commune: null,
      quartier: '',
      rue: '',
      boitePostale: '',
      typeActivite: null,
    });
    this.activiteDrawerOpen = true;
  }

  openEditActivite(a: ActiviteCredit) {
    this.activiteDrawerMode = 'edit';
    const communeId = this.resolveCommune(a.commune);
    this.activiteForm.reset({
      activite: a.id ?? null,
      libelle: a.libelle ?? '',
      typeAnalyse: a.typeAnalyse ?? '',
      commune: communeId,
      quartier: a.quartier ?? '',
      rue: a.rue ?? '',
      boitePostale: a.boitePostale ?? '',
      typeActivite: a.typeActivite?.id ?? null,
    });
    this.activiteDrawerOpen = true;
  }

  saveActivite() {
    if (this.activiteForm.invalid) {
      this.activiteForm.markAllAsTouched();
      return;
    }
    const val = this.activiteForm.value;
    const payload: Record<string, unknown> = {
      libelle: val.libelle,
      typeAnalyse: val.typeAnalyse,
      commune: val.commune, // Send ID directly, not object
      quartier: val.quartier,
      rue: val.rue,
      boitePostale: val.boitePostale,
      typeActivite: val.typeActivite, // Send ID directly, not object
      refDemande: this.ref(),
    };
    if (val.activite) payload['activite'] = val.activite;

    this.isSavingActivite.set(true);
    this.creditService.saveActivite(payload).subscribe({
      next: () => {
        this.toast.success(
          this.activiteDrawerMode === 'create' ? 'Activité ajoutée.' : 'Activité modifiée.',
        );
        this.activiteDrawerOpen = false;
        this.isSavingActivite.set(false);
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
        this.isSavingActivite.set(false);
      },
    });
  }

  // ── Vente Mensuelle ────────────────────────────────────────────────────
  openAddVenteMensuelle(activiteId: number) {
    this.venteMensuelleForm.reset({
      venteMensuelle: null,
      activite: activiteId,
      mois: '',
      montant: null,
      statut: '',
    });
    this.ventesMDrawerOpen = true;
  }

  saveVenteMensuelle() {
    if (this.venteMensuelleForm.invalid) {
      this.venteMensuelleForm.markAllAsTouched();
      return;
    }
    const val = this.venteMensuelleForm.value;
    this.isSavingVenteM.set(true);
    this.creditService
      .saveVenteMensuelle({
        mois: val.mois,
        montant: val.montant,
        statut: val.statut,
        refDemande: this.ref(),
        activite: val.activite,
      })
      .subscribe({
        next: () => {
          this.toast.success('Vente mensuelle enregistrée.');
          this.ventesMDrawerOpen = false;
          this.isSavingVenteM.set(false);
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
          this.isSavingVenteM.set(false);
        },
      });
  }

  // ── Vente Journalière ──────────────────────────────────────────────────
  openAddVenteJournaliere(activiteId: number) {
    this.venteJournaliereForm.reset({
      venteJournaliere: null,
      activite: activiteId,
      jour: '',
      montant: null,
      statut: '',
    });
    this.ventesJDrawerOpen = true;
  }

  saveVenteJournaliere() {
    if (this.venteJournaliereForm.invalid) {
      this.venteJournaliereForm.markAllAsTouched();
      return;
    }
    const val = this.venteJournaliereForm.value;
    this.isSavingVenteJ.set(true);
    this.creditService
      .saveVenteJournaliere({
        jour: val.jour,
        montant: val.montant,
        statut: val.statut,
        refDemande: this.ref(),
        activite: val.activite,
      })
      .subscribe({
        next: () => {
          this.toast.success('Vente journalière enregistrée.');
          this.ventesJDrawerOpen = false;
          this.isSavingVenteJ.set(false);
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
          this.isSavingVenteJ.set(false);
        },
      });
  }

  // ── Marge Commerciale ──────────────────────────────────────────────────
  openAddMarge(activiteId: number) {
    this.margeDrawerMode = 'create';
    this.currentMargeId = null;
    this.margeForm.reset({ activite: activiteId, article: '', quantite: null, prixVente: null, prixAchat: null });
    this.margeDrawerOpen = true;
  }

  openEditMarge(marge: MargeCommerciale, activiteId: number) {
    this.margeDrawerMode = 'edit';
    this.currentMargeId = marge.id ?? null;
    this.margeForm.reset({
      activite: activiteId,
      article: marge.article ?? '',
      quantite: marge.quantite ?? null,
      prixVente: marge.prixVente ?? null,
      prixAchat: marge.prixAchat ?? null,
    });
    this.margeDrawerOpen = true;
  }

  saveMarge() {
    if (this.margeForm.invalid) {
      this.margeForm.markAllAsTouched();
      return;
    }
    const val = this.margeForm.value;
    const payload: Record<string, unknown> = {
      refDemande: this.ref(),
      activite: val.activite,
      article: val.article,
      quantite: val.quantite,
      prixVente: val.prixVente,
      prixAchat: val.prixAchat,
    };
    this.isSavingMarge.set(true);
    const obs$ = this.margeDrawerMode === 'edit' && this.currentMargeId != null
      ? this.creditService.updateMargeCommerciale(this.currentMargeId, payload)
      : this.creditService.saveMargeCommerciale(payload);
    obs$.subscribe({
      next: () => {
        this.toast.success(this.margeDrawerMode === 'create' ? 'Marge ajoutée.' : 'Marge modifiée.');
        this.margeDrawerOpen = false;
        this.isSavingMarge.set(false);
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
        this.isSavingMarge.set(false);
      },
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  openDeleteActivite(a: ActiviteCredit) {
    this.deleteTarget = { type: 'activite', id: a.id!, label: a.libelle ?? '' };
    this.deleteDialogOpen = true;
  }

  openDeleteVenteM(vm: ActiviteVenteMensuelle) {
    this.deleteTarget = { type: 'venteM', id: vm.id!, label: vm.mois ?? '' };
    this.deleteDialogOpen = true;
  }

  openDeleteVenteJ(vj: ActiviteVenteJournaliere) {
    this.deleteTarget = { type: 'venteJ', id: vj.id!, label: vj.jour ?? '' };
    this.deleteDialogOpen = true;
  }

  openDeleteMarge(marge: MargeCommerciale) {
    this.deleteTarget = { type: 'marge', id: marge.id!, label: marge.article ?? '' };
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    const { type, id } = this.deleteTarget;
    this.deleteDialogOpen = false;
    this.isDeleting.set(true);
    const obs$ =
      type === 'activite'
        ? this.creditService.deleteActivite(id)
        : type === 'venteM'
          ? this.creditService.deleteVenteMensuelle(id)
          : type === 'venteJ'
            ? this.creditService.deleteVenteJournaliere(id)
            : this.creditService.deleteMargeCommerciale(id);

    obs$.subscribe({
      next: () => {
        this.toast.success('Supprimé avec succès.');
        this.isDeleting.set(false);
        this.deleteTarget = null;
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.message ?? 'Erreur lors de la suppression.');
        this.isDeleting.set(false);
      },
    });
  }
}
