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
  Package,
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
  CrTypeCharge,
  StockItem,
} from '../../../../interfaces/credit.interface';

const SAISONS: SelectOption[] = [
  { value: 'HAUTE SAISON', label: 'Haute saison' },
  { value: 'BASSE SAISON', label: 'Basse saison' },
  { value: 'NORMALE', label: 'Normale' },
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
  readonly PackageIcon = Package;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  // ── Constants ──────────────────────────────────────────────────────────
  readonly saisonOptions = SAISONS;

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly activites = signal<ActiviteCredit[]>([]);
  readonly chargesExploitation = signal<ChargeExploitation[]>([]);
  readonly stocks = signal<StockItem[]>([]);
  readonly typeCharges = signal<CrTypeCharge[]>([]);

  readonly activiteOptions = computed<SelectOption[]>(() =>
    this.activites().map((a) => ({ value: a.id!, label: a.libelle ?? `Activité #${a.id}` })),
  );

  readonly typeChargeOptions = computed<SelectOption[]>(() =>
    this.typeCharges().map((t) => ({ value: t.id!, label: t.libelle ?? `Type #${t.id}` })),
  );

  readonly totalAchats = computed(() => {
    let total = 0;
    for (const a of this.activites()) {
      for (const achat of a.achatsMensuels ?? []) {
        total += achat.achatsMensuels ?? 0;
      }
    }
    return total;
  });

  readonly totalCharges = computed(() =>
    this.chargesExploitation().reduce((s, c) => s + (c.montant ?? 0), 0),
  );

  readonly totalStocks = computed(() =>
    this.stocks().reduce((s, item) => s + (item.montantTotal ?? 0), 0),
  );

  // Drawer — Achats
  achatDrawerOpen = false;
  readonly isSavingAchat = signal(false);

  // Drawer — Charges
  chargeDrawerOpen = false;
  readonly isSavingCharge = signal(false);

  // Drawer — Stocks
  stockDrawerOpen = false;
  readonly isSavingStock = signal(false);

  // Delete dialog
  deleteDialogOpen = false;
  deleteTarget: { type: 'achat' | 'charge' | 'stock'; id: number; label: string } | null = null;
  readonly isDeleting = signal(false);

  // ── Forms ──────────────────────────────────────────────────────────────
  readonly achatForm = this.fb.group({
    activite: [null as number | null, Validators.required],
    article: ['', Validators.required],
    fournisseur: ['', Validators.required],
    quantite: [null as number | null, Validators.required],
    frequence: ['', Validators.required],
    montant: [null as number | null, Validators.required],
  });

  readonly chargeForm = this.fb.group({
    activite: [null as number | null, Validators.required],
    charge: [null as number | null, Validators.required],
    montant: [null as number | null, Validators.required],
  });

  readonly stockForm = this.fb.group({
    activite: [null as number | null, Validators.required],
    article: ['', Validators.required],
    quantite: [null as number | null],
    montantTotal: [null as number | null, Validators.required],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadData();
  }

  // ── Data loading ───────────────────────────────────────────────────────
  loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    // Charge les types de charges depuis l'API si pas encore chargés
    if (this.typeCharges().length === 0) {
      this.creditService.getListeTypeCharge().subscribe({
        next: (data) => this.typeCharges.set(data.crTypeCharges ?? []),
        error: () => {},
      });
    }
    this.creditService.getAnalyseFinanciere(this.ref()).subscribe({
      next: (data) => {
        if (!data?.demande) {
          this.error.set('Données du dossier introuvables.');
          this.isLoading.set(false);
          return;
        }
        this.activites.set(data.demande.activites ?? []);
        this.chargesExploitation.set(data.demande.chargesExploitation ?? []);
        this.stocks.set(data.demande.stocks ?? []);
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

  typeChargeLabel(chargeId: number | undefined | { id?: number; libelle?: string }): string {
    if (chargeId == null) return '—';
    if (typeof chargeId === 'object') return chargeId.libelle ?? '—';
    return this.typeCharges().find((t) => t.id === chargeId)?.libelle ?? `#${chargeId}`;
  }

  // ── Achat Mensuel CRUD ─────────────────────────────────────────────────
  openAddAchat(activiteId?: number) {
    this.achatForm.reset({
      activite: activiteId ?? null,
      article: '',
      fournisseur: '',
      quantite: null,
      frequence: '',
      montant: null,
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
        refDemande: this.ref(),
        activite: val.activite,
        article: val.article,
        fournisseur: val.fournisseur,
        quantite: val.quantite,
        frequence: val.frequence,
        achatsMensuels: val.montant,
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
    this.chargeForm.reset({ activite: null, charge: null, montant: null });
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
        activite: val.activite,
        charge: val.charge,
        montant: val.montant,
        refDemande: this.ref(),
      })
      .subscribe({
        next: () => {
          this.toast.success('Charge enregistrée.');
          this.chargeDrawerOpen = false;
          this.isSavingCharge.set(false);
          this.loadData();
        },
        error: () => {
          this.toast.error("Erreur lors de l'enregistrement.");
          this.isSavingCharge.set(false);
        },
      });
  }

  // ── Stock CRUD ─────────────────────────────────────────────────────────
  openAddStock() {
    this.stockForm.reset({ activite: null, article: '', quantite: null, montantTotal: null });
    this.stockDrawerOpen = true;
  }

  saveStock() {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }
    const val = this.stockForm.value;
    this.isSavingStock.set(true);
    this.creditService
      .saveStock({
        activite: val.activite,
        article: val.article,
        quantite: val.quantite,
        montanTotal: val.montantTotal,
        refDemande: this.ref(),
      })
      .subscribe({
        next: () => {
          this.toast.success('Stock enregistré.');
          this.stockDrawerOpen = false;
          this.isSavingStock.set(false);
          this.loadData();
        },
        error: () => {
          this.toast.error("Erreur lors de l'enregistrement.");
          this.isSavingStock.set(false);
        },
      });
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  openDeleteAchat(achat: AchatMensuel) {
    this.deleteTarget = { type: 'achat', id: achat.id!, label: achat.article ?? '' };
    this.deleteDialogOpen = true;
  }

  openDeleteCharge(charge: ChargeExploitation) {
    this.deleteTarget = { type: 'charge', id: charge.id!, label: this.typeChargeLabel(charge.charge) };
    this.deleteDialogOpen = true;
  }

  openDeleteStock(stock: StockItem) {
    this.deleteTarget = { type: 'stock', id: stock.id!, label: stock.article ?? '' };
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
        : type === 'stock'
          ? this.creditService.deleteStock(id)
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

  activiteLabel(activiteId: number | undefined): string {
    if (activiteId == null) return '—';
    return this.activites().find((a) => a.id === activiteId)?.libelle ?? `#${activiteId}`;
  }
}
