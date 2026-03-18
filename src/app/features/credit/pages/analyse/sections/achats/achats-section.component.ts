import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  AlertCircle,
  ShoppingCart,
  Banknote,
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
import {
  ActiviteCredit,
  AchatMensuel,
  ChargeExploitation,
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

const SAISONS: SelectOption[] = [
  { value: 'HAUTE SAISON', label: 'Haute saison' },
  { value: 'BASSE SAISON', label: 'Basse saison' },
  { value: 'NORMALE', label: 'Normale' },
];

const TYPES_CHARGE: SelectOption[] = [
  { value: 'LOYER', label: 'Loyer' },
  { value: 'SALAIRE', label: 'Salaires' },
  { value: 'EAU', label: 'Eau' },
  { value: 'ELECTRICITE', label: 'Électricité' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'TELEPHONE', label: 'Téléphone' },
  { value: 'AUTRES', label: 'Autres charges' },
];

@Component({
  selector: 'app-achats-section',
  templateUrl: './achats-section.component.html',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
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
export class AchatsSectionComponent implements OnInit {
  ref = input<string>('');

  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
  readonly AlertCircleIcon = AlertCircle;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly BanknoteIcon = Banknote;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  // ── Constants ──────────────────────────────────────────────────────────
  readonly moisOptions = MOIS;
  readonly saisonOptions = SAISONS;
  readonly typesChargeOptions = TYPES_CHARGE;

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly activites = signal<ActiviteCredit[]>([]);
  readonly chargesExploitation = signal<ChargeExploitation[]>([]);

  readonly activiteOptions = computed<SelectOption[]>(() =>
    this.activites().map((a) => ({ value: a.id!, label: a.libelle ?? `Activité #${a.id}` })),
  );

  readonly totalAchats = computed(() => {
    let total = 0;
    for (const a of this.activites()) {
      for (const achat of a.achatsMensuels ?? []) {
        total += achat.montant ?? 0;
      }
    }
    return total;
  });

  readonly totalCharges = computed(() =>
    this.chargesExploitation().reduce((s, c) => s + (c.montant ?? 0), 0),
  );

  // Drawer — Achats
  achatDrawerOpen = false;
  readonly isSavingAchat = signal(false);

  // Drawer — Charges
  chargeDrawerOpen = false;
  readonly isSavingCharge = signal(false);

  // Delete dialog
  deleteDialogOpen = false;
  deleteTarget: { type: 'achat' | 'charge'; id: number; label: string } | null = null;
  readonly isDeleting = signal(false);

  // ── Forms ──────────────────────────────────────────────────────────────
  readonly achatForm = this.fb.group({
    activite: [null as number | null, Validators.required],
    mois: ['', Validators.required],
    montant: [null as number | null, Validators.required],
    statut: ['', Validators.required],
  });

  readonly chargeForm = this.fb.group({
    typeCharge: ['', Validators.required],
    libelle: ['', Validators.required],
    montant: [null as number | null, Validators.required],
    statut: ['', Validators.required],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadData();
  }

  // ── Data loading ───────────────────────────────────────────────────────
  loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    this.creditService.getAnalyseFinanciere(this.ref()).subscribe({
      next: (data) => {
        console.log('Données du dossier : ', data);
        if (!data?.demande) {
          this.error.set('Données du dossier introuvables.');
          this.isLoading.set(false);
          return;
        }
        this.activites.set(data.demande.activites ?? []);
        this.chargesExploitation.set(data.demande.chargesExploitation ?? []);
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

  typeChargeLabel(type: string | undefined): string {
    return TYPES_CHARGE.find((t) => t.value === type)?.label ?? type ?? '—';
  }

  // ── Achat Mensuel CRUD ─────────────────────────────────────────────────
  openAddAchat(activiteId?: number) {
    this.achatForm.reset({
      activite: activiteId ?? null,
      mois: '',
      montant: null,
      statut: '',
    });
    this.achatDrawerOpen = true;
  }

  saveAchat() {
    if (this.achatForm.invalid) {
      this.achatForm.markAllAsTouched();
      return;
    }
    const val = this.achatForm.value;
    this.isSavingAchat.set(true);
    this.creditService
      .saveAchatMensuel({
        mois: val.mois,
        montant: val.montant,
        statut: val.statut,
        refDemande: this.ref(),
        activite: val.activite,
      })
      .subscribe({
        next: () => {
          this.toast.success('Achat mensuel enregistré.');
          this.achatDrawerOpen = false;
          this.isSavingAchat.set(false);
          this.loadData();
        },
        error: () => {
          this.toast.error("Erreur lors de l'enregistrement.");
          this.isSavingAchat.set(false);
        },
      });
  }

  // ── Charge Exploitation CRUD ───────────────────────────────────────────
  openAddCharge() {
    this.chargeForm.reset({ typeCharge: '', libelle: '', montant: null, statut: '' });
    this.chargeDrawerOpen = true;
  }

  saveCharge() {
    if (this.chargeForm.invalid) {
      this.chargeForm.markAllAsTouched();
      return;
    }
    const val = this.chargeForm.value;
    this.isSavingCharge.set(true);
    this.creditService
      .saveChargeExploitation({
        typeCharge: val.typeCharge,
        libelle: val.libelle,
        montant: val.montant,
        statut: val.statut,
        refDemande: this.ref(),
      })
      .subscribe({
        next: () => {
          this.toast.success('Charge enregistrée.');
          this.chargeDrawerOpen = false;
          this.isSavingCharge.set(false);
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
          this.isSavingCharge.set(false);
        },
      });
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  openDeleteAchat(achat: AchatMensuel) {
    this.deleteTarget = { type: 'achat', id: achat.id!, label: achat.mois ?? '' };
    this.deleteDialogOpen = true;
  }

  openDeleteCharge(charge: ChargeExploitation) {
    this.deleteTarget = { type: 'charge', id: charge.id!, label: charge.libelle ?? '' };
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    const { type, id } = this.deleteTarget;
    this.deleteDialogOpen = false;
    this.isDeleting.set(true);
    const obs$ =
      type === 'achat'
        ? this.creditService.deleteAchatMensuel(id)
        : this.creditService.deleteChargeExploitation(id);

    obs$.subscribe({
      next: () => {
        this.toast.success('Supprimé avec succès.');
        this.isDeleting.set(false);
        this.deleteTarget = null;
        this.loadData();
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression.');
        this.isDeleting.set(false);
      },
    });
  }
}
