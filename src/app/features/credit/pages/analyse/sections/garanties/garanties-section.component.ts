import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  AlertCircle,
  Building2,
  Car,
  Wrench,
  PiggyBank,
  Box,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
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
import { ActifGarantie, TypeActif } from '../../../../interfaces/credit.interface';

const TYPES_ACTIF: SelectOption[] = [
  { value: 'IMMOBILIER', label: 'Bien immobilier' },
  { value: 'VEHICULE', label: 'Véhicule' },
  { value: 'EQUIPEMENT', label: 'Équipement / Matériel' },
  { value: 'DAT', label: 'Dépôt à terme (DAT)' },
  { value: 'AUTRE', label: 'Autre actif' },
];

@Component({
  selector: 'app-garanties-section',
  templateUrl: './garanties-section.component.html',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
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
export class GarantiesSectionComponent implements OnInit {
  ref = input<string>('');

  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
  readonly AlertCircleIcon = AlertCircle;
  readonly Building2Icon = Building2;
  readonly CarIcon = Car;
  readonly WrenchIcon = Wrench;
  readonly PiggyBankIcon = PiggyBank;
  readonly BoxIcon = Box;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  readonly typesActifOptions = TYPES_ACTIF;

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly actifs = signal<ActifGarantie[]>([]);

  readonly immobiliers = computed(() => this.actifs().filter((a) => a.type === 'IMMOBILIER'));
  readonly vehicules = computed(() => this.actifs().filter((a) => a.type === 'VEHICULE'));
  readonly equipements = computed(() => this.actifs().filter((a) => a.type === 'EQUIPEMENT'));
  readonly dats = computed(() => this.actifs().filter((a) => a.type === 'DAT'));
  readonly autres = computed(() => this.actifs().filter((a) => a.type === 'AUTRE'));

  readonly totalValeur = computed(() =>
    this.actifs().reduce((s, a) => s + (a.valeurEstimee ?? 0), 0),
  );

  // Drawer
  actifDrawerOpen = false;
  selectedType = signal<TypeActif | null>(null);
  readonly isSaving = signal(false);

  // Delete
  deleteDialogOpen = false;
  actifToDelete: ActifGarantie | null = null;
  readonly isDeleting = signal(false);

  // ── Form ───────────────────────────────────────────────────────────────
  readonly actifForm = this.fb.group({
    type: ['' as TypeActif | '', Validators.required],
    libelle: ['', Validators.required],
    valeurEstimee: [null as number | null, Validators.required],
    // Immobilier
    localisation: [''],
    superficie: [null as number | null],
    // Véhicule
    marque: [''],
    annee: [null as number | null],
    // DAT
    banque: [''],
    echeance: [''],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadData();
    // Réagir au changement de type pour afficher les champs dynamiques
    this.actifForm.get('type')?.valueChanges.subscribe((v) => {
      this.selectedType.set((v as TypeActif) || null);
    });
  }

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
        this.actifs.set(data.demande.actifsGaranties ?? []);
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

  typeLabel(type: TypeActif | undefined): string {
    return TYPES_ACTIF.find((t) => t.value === type)?.label ?? type ?? '—';
  }

  // ── CRUD ───────────────────────────────────────────────────────────────
  openAdd(preselect?: TypeActif) {
    this.actifForm.reset({
      type: preselect ?? '',
      libelle: '',
      valeurEstimee: null,
      localisation: '',
      superficie: null,
      marque: '',
      annee: null,
      banque: '',
      echeance: '',
    });
    this.selectedType.set(preselect ?? null);
    this.actifDrawerOpen = true;
  }

  save() {
    if (this.actifForm.invalid) {
      this.actifForm.markAllAsTouched();
      return;
    }
    const val = this.actifForm.value;
    this.isSaving.set(true);
    this.creditService
      .saveActifGarantie({
        type: val.type,
        libelle: val.libelle,
        valeurEstimee: val.valeurEstimee,
        localisation: val.localisation || null,
        superficie: val.superficie,
        marque: val.marque || null,
        annee: val.annee,
        banque: val.banque || null,
        echeance: val.echeance || null,
        refDemande: this.ref(),
      })
      .subscribe({
        next: () => {
          this.toast.success('Actif enregistré.');
          this.actifDrawerOpen = false;
          this.isSaving.set(false);
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
          this.isSaving.set(false);
        },
      });
  }

  openDelete(actif: ActifGarantie) {
    this.actifToDelete = actif;
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.actifToDelete?.id) return;
    this.deleteDialogOpen = false;
    this.isDeleting.set(true);
    this.creditService.deleteActifGarantie(this.actifToDelete.id).subscribe({
      next: () => {
        this.toast.success('Actif supprimé.');
        this.isDeleting.set(false);
        this.actifToDelete = null;
        this.loadData();
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression.');
        this.isDeleting.set(false);
      },
    });
  }
}
