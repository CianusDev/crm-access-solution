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

const SAISONS: SelectOption[] = [
  { value: 'HAUTE SAISON', label: 'Haute saison' },
  { value: 'BASSE SAISON', label: 'Basse saison' },
  { value: 'NORMALE', label: 'Normale' },
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

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  // ── Constants ──────────────────────────────────────────────────────────
  readonly moisOptions = MOIS;
  readonly joursOptions = JOURS;
  readonly typeAnalyseOptions = TYPE_ANALYSE;
  readonly saisonOptions = SAISONS;

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

  // Drawer states
  activiteDrawerOpen = false;
  activiteDrawerMode: 'create' | 'edit' = 'create';
  ventesMDrawerOpen = false;
  ventesJDrawerOpen = false;

  // Delete dialog
  deleteDialogOpen = false;
  deleteTarget: { type: 'activite' | 'venteM' | 'venteJ'; id: number; label: string } | null = null;

  readonly isSavingActivite = signal(false);
  readonly isSavingVenteM = signal(false);
  readonly isSavingVenteJ = signal(false);
  readonly isDeleting = signal(false);

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
    margePondere: [null as number | null],
    valDernierAchat: [null as number | null],
    dateDernierAchat: [''],
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

  communeLabel(commune: string | { id?: number; libelle?: string } | undefined): string {
    if (!commune) return '';
    if (typeof commune === 'string') return commune;
    return commune.libelle ?? '';
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
      margePondere: null,
      valDernierAchat: null,
      dateDernierAchat: '',
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
      margePondere: a.margePondere ?? null,
      valDernierAchat: a.valDernierAchat ?? null,
      dateDernierAchat: a.dateDernierAchat ?? '',
    });
    this.activiteDrawerOpen = true;
  }

  saveActivite() {
    if (this.activiteForm.invalid) {
      this.activiteForm.markAllAsTouched();
      return;
    }
    const val = this.activiteForm.value;
    const typeActiviteObj = this.typesActivite().find((ta) => ta.id === val.typeActivite);
    const communeObj = val.commune != null
      ? this.communes().find((c) => c.id === val.commune) ?? { id: val.commune }
      : null;
    const payload: Record<string, unknown> = {
      libelle: val.libelle,
      typeAnalyse: val.typeAnalyse,
      commune: communeObj,
      quartier: val.quartier,
      rue: val.rue,
      boitePostale: val.boitePostale,
      typeActivite: typeActiviteObj ?? val.typeActivite,
      refDemande: this.ref(),
      margePondere: val.margePondere,
      valDernierAchat: val.valDernierAchat,
      dateDernierAchat: val.dateDernierAchat || null,
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
          : this.creditService.deleteVenteJournaliere(id);

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
