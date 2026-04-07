import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  Pencil,
  AlertCircle,
  ShoppingCart,
  Banknote,
  Package,
  TrendingUp,
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

const IMPREVU_OPTIONS: SelectOption[] = [
  { value: 10, label: '10%' },
  { value: 20, label: '20%' },
  { value: 30, label: '30%' },
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
  readonly PencilIcon = Pencil;
  readonly AlertCircleIcon = AlertCircle;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly BanknoteIcon = Banknote;
  readonly PackageIcon = Package;
  readonly TrendingUpIcon = TrendingUp;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  // ── Constants ──────────────────────────────────────────────────────────
  readonly saisonOptions = SAISONS;
  readonly imprevuOptions = IMPREVU_OPTIONS;

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

  // Imprévus : total charges par activité + imprevu % depuis analyseFin
  readonly chargesParActivite = computed(() =>
    this.activites().map((a) => {
      const total = this.chargesExploitation()
        .filter((c) => c.activite === a.id)
        .reduce((s, c) => s + (c.montant ?? 0), 0);
      const imprevu = a.analyseFin?.chargeExploitation?.imprevu ?? null;
      const montantImprevu = imprevu != null ? Math.round(total * imprevu / 100) : 0;
      return { activite: a, total, imprevu, montantImprevu };
    }),
  );

  readonly totalImprevu = computed(() =>
    this.chargesParActivite().reduce((s, r) => s + r.montantImprevu, 0),
  );

  // Drawer — Achats
  achatDrawerOpen = false;
  readonly isSavingAchat = signal(false);
  readonly editingAchatId = signal<number | null>(null);

  // Drawer — Charges
  chargeDrawerOpen = false;
  readonly isSavingCharge = signal(false);
  readonly editingChargeId = signal<number | null>(null);

  // Drawer — Stocks
  stockDrawerOpen = false;
  readonly isSavingStock = signal(false);
  readonly editingStockId = signal<number | null>(null);

  // Imprévus
  readonly isSavingImprevu = signal(false);

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
    // Charge les activités via l'endpoint dédié pour alimenter le dropdown
    this.creditService.getActivitesDemande(this.ref()).subscribe({
      next: (activites) => this.activites.set(activites),
      error: () => {},
    });
    this.creditService.getAnalyseFinanciere(this.ref()).subscribe({
      next: (data) => {
        if (!data?.demande) {
          this.error.set('Données du dossier introuvables.');
          this.isLoading.set(false);
          return;
        }
        // getAnalyseFinanciere renvoie les activités avec les achats imbriqués —
        // on l'utilise en priorité pour le tableau (qui affiche activite.achatsMensuels).
        // Sinon on garde les activités chargées via getActivitesDemande.
        const activitesAvecNested = data.demande.activites ?? [];
        if (activitesAvecNested.length > 0) {
          this.activites.set(activitesAvecNested);
        }
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
    this.editingAchatId.set(null);
    this.achatForm.reset({ activite: activiteId ?? null, article: '', fournisseur: '', quantite: null, frequence: '', montant: null });
    this.achatDrawerOpen = true;
  }

  openEditAchat(a: AchatMensuel) {
    this.editingAchatId.set(a.id ?? null);
    this.achatForm.patchValue({
      activite: (a.activite as any)?.id ?? a.activite ?? null,
      article: a.article ?? '',
      fournisseur: a.fournisseur ?? '',
      quantite: a.quantite ?? null,
      frequence: a.frequence ?? '',
      montant: a.achatsMensuels ?? null,
    });
    this.achatDrawerOpen = true;
  }

  saveAchat() {
    if (this.achatForm.invalid) { this.achatForm.markAllAsTouched(); return; }
    const val = this.achatForm.value;
    const editId = this.editingAchatId();
    this.isSavingAchat.set(true);
    this.creditService.saveAchatMensuel({
        achatMensuel: editId ?? undefined,
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
          this.toast.success(editId ? 'Achat modifié.' : 'Achat mensuel enregistré.');
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
    this.editingChargeId.set(null);
    this.chargeForm.reset({ activite: null, charge: null, montant: null });
    this.chargeDrawerOpen = true;
  }

  openEditCharge(c: ChargeExploitation) {
    this.editingChargeId.set(c.id ?? null);
    this.chargeForm.patchValue({
      activite: (c.activite as any)?.id ?? c.activite ?? null,
      charge: (c.charge as any)?.id ?? c.charge ?? null,
      montant: c.montant ?? null,
    });
    this.chargeDrawerOpen = true;
  }

  saveCharge() {
    if (this.chargeForm.invalid) { this.chargeForm.markAllAsTouched(); return; }
    const val = this.chargeForm.value;
    const editId = this.editingChargeId();
    this.isSavingCharge.set(true);
    this.creditService.saveChargeExploitation({
        chargeExploitation: editId ?? undefined,
        activite: val.activite,
        charge: val.charge,
        montant: val.montant,
        refDemande: this.ref(),
      })
      .subscribe({
        next: () => {
          this.toast.success(editId ? 'Charge modifiée.' : 'Charge enregistrée.');
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
    this.editingStockId.set(null);
    this.stockForm.reset({ activite: null, article: '', quantite: null, montantTotal: null });
    this.stockDrawerOpen = true;
  }

  openEditStock(s: StockItem) {
    this.editingStockId.set(s.id ?? null);
    this.stockForm.patchValue({
      activite: (s.activite as any)?.id ?? s.activite ?? null,
      article: s.article ?? '',
      quantite: s.quantite ?? null,
      montantTotal: s.montantTotal ?? null,
    });
    this.stockDrawerOpen = true;
  }

  saveStock() {
    if (this.stockForm.invalid) { this.stockForm.markAllAsTouched(); return; }
    const val = this.stockForm.value;
    const editId = this.editingStockId();
    this.isSavingStock.set(true);
    this.creditService.saveStock({
        stock: editId ?? undefined,
        activite: val.activite,
        article: val.article,
        quantite: val.quantite,
        montanTotal: val.montantTotal,
        refDemande: this.ref(),
      })
      .subscribe({
        next: () => {
          this.toast.success(editId ? 'Stock modifié.' : 'Stock enregistré.');
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

  // ── Imprévus charges exploitation ─────────────────────────────────────
  saveImprevu(activiteId: number, event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!value) return;
    this.isSavingImprevu.set(true);
    this.creditService.saveImprevuChargeExploitation({
      activite: activiteId,
      imprevu: value,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Imprévus enregistrés.');
        this.isSavingImprevu.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingImprevu.set(false);
      },
    });
  }

  activiteLabel(activiteId: number | undefined): string {
    if (activiteId == null) return '—';
    return this.activites().find((a) => a.id === activiteId)?.libelle ?? `#${activiteId}`;
  }
}
