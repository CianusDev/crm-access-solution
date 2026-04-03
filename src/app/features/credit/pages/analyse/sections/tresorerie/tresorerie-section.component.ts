import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  AlertCircle,
  Landmark,
  Package,
  Users,
  Wallet,
  Save,
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
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../../services/credit/credit.service';
import {
  CreanceClient,
  TresorerieStockItem,
  DetteFournisseur,
  TresorerieDisponible,
} from '../../../../interfaces/credit.interface';

@Component({
  selector: 'app-tresorerie-section',
  templateUrl: './tresorerie-section.component.html',
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
  ],
})
export class TresorerieSectionComponent implements OnInit {
  ref = input<string>('');

  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
  readonly AlertCircleIcon = AlertCircle;
  readonly LandmarkIcon = Landmark;
  readonly PackageIcon = Package;
  readonly UsersIcon = Users;
  readonly WalletIcon = Wallet;
  readonly SaveIcon = Save;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly tresorerie = signal<TresorerieDisponible | null>(null);
  readonly creances = signal<CreanceClient[]>([]);
  readonly stocks = signal<TresorerieStockItem[]>([]);
  readonly dettes = signal<DetteFournisseur[]>([]);

  readonly totalCreances = computed(() => this.creances().reduce((s, c) => s + (c.montant ?? 0), 0));
  readonly totalStocks = computed(() => this.stocks().reduce((s, c) => s + (c.montant ?? 0), 0));
  readonly totalDettes = computed(() => this.dettes().reduce((s, c) => s + (c.montant ?? 0), 0));
  readonly totalTresorerie = computed(() => {
    const t = this.tresorerie();
    return (t?.caisse ?? 0) + (t?.banque ?? 0) + (t?.mobileMoney ?? 0);
  });

  // Drawer states
  creanceDrawerOpen = false;
  stockDrawerOpen = false;
  detteDrawerOpen = false;

  readonly isSavingTresorerie = signal(false);
  readonly isSavingCreance = signal(false);
  readonly isSavingStock = signal(false);
  readonly isSavingDette = signal(false);

  // Delete
  deleteDialogOpen = false;
  deleteTarget: { type: 'creance' | 'stock' | 'dette'; id: number; label: string } | null = null;
  readonly isDeleting = signal(false);

  // ── Forms ──────────────────────────────────────────────────────────────
  readonly tresorerieForm = this.fb.group({
    caisse: [null as number | null],
    banque: [null as number | null],
    mobileMoney: [null as number | null],
  });

  readonly creanceForm = this.fb.group({
    libelle: ['', Validators.required],
    montant: [null as number | null, Validators.required],
    echeance: [''],
  });

  readonly stockForm = this.fb.group({
    description: ['', Validators.required],
    quantite: [null as number | null, Validators.required],
    prix: [null as number | null, Validators.required],
    assurStock: [null as number | null, Validators.required],
    garantie: [null as number | null, Validators.required],
  });

  readonly detteForm = this.fb.group({
    libelle: ['', Validators.required],
    montant: [null as number | null, Validators.required],
    echeance: [''],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadData();
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
        this.tresorerie.set(data.demande.tresorerie ?? null);
        this.creances.set(data.demande.creances ?? []);
        this.stocks.set(data.demande.stocks ?? []);
        this.dettes.set(data.demande.dettes ?? []);
        // Pré-remplir le formulaire trésorerie
        const t = data.demande.tresorerie;
        if (t) {
          this.tresorerieForm.patchValue({
            caisse: t.caisse ?? null,
            banque: t.banque ?? null,
            mobileMoney: t.mobileMoney ?? null,
          });
        }
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

  // ── Trésorerie disponible ──────────────────────────────────────────────
  saveTresorerie() {
    const val = this.tresorerieForm.value;
    this.isSavingTresorerie.set(true);
    this.creditService.saveTresorerie({
      caisse: val.caisse,
      banque: val.banque,
      mobileMoney: val.mobileMoney,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Trésorerie enregistrée.');
        this.isSavingTresorerie.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingTresorerie.set(false);
      },
    });
  }

  // ── Créances ───────────────────────────────────────────────────────────
  openAddCreance() {
    this.creanceForm.reset({ libelle: '', montant: null, echeance: '' });
    this.creanceDrawerOpen = true;
  }

  saveCreance() {
    if (this.creanceForm.invalid) { this.creanceForm.markAllAsTouched(); return; }
    const val = this.creanceForm.value;
    this.isSavingCreance.set(true);
    this.creditService.saveCreance({
      libelle: val.libelle,
      montant: val.montant,
      echeance: val.echeance || null,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Créance enregistrée.');
        this.creanceDrawerOpen = false;
        this.isSavingCreance.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingCreance.set(false);
      },
    });
  }

  // ── Stocks ─────────────────────────────────────────────────────────────
  openAddStock() {
    this.stockForm.reset({ description: '', quantite: null, prix: null, assurStock: null, garantie: null });
    this.stockDrawerOpen = true;
  }

  saveStock() {
    if (this.stockForm.invalid) { this.stockForm.markAllAsTouched(); return; }
    const val = this.stockForm.value;
    const montantCalcule = (val.quantite ?? 0) * (val.prix ?? 0);
    this.isSavingStock.set(true);
    this.creditService.saveStock({
      description: val.description,
      libelle: val.description, // Alias pour API
      quantite: val.quantite,
      prix: val.prix,
      montant: montantCalcule,
      assurStock: val.assurStock,
      garantie: val.garantie,
      refDemande: this.ref(),
    }).subscribe({
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

  // ── Dettes ─────────────────────────────────────────────────────────────
  openAddDette() {
    this.detteForm.reset({ libelle: '', montant: null, echeance: '' });
    this.detteDrawerOpen = true;
  }

  saveDette() {
    if (this.detteForm.invalid) { this.detteForm.markAllAsTouched(); return; }
    const val = this.detteForm.value;
    this.isSavingDette.set(true);
    this.creditService.saveDette({
      libelle: val.libelle,
      montant: val.montant,
      echeance: val.echeance || null,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Dette enregistrée.');
        this.detteDrawerOpen = false;
        this.isSavingDette.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingDette.set(false);
      },
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  openDelete(type: 'creance' | 'stock' | 'dette', id: number, label: string) {
    this.deleteTarget = { type, id, label };
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    const { type, id } = this.deleteTarget;
    this.deleteDialogOpen = false;
    this.isDeleting.set(true);
    const obs$ =
      type === 'creance' ? this.creditService.deleteCreance(id)
      : type === 'stock' ? this.creditService.deleteStock(id)
      : this.creditService.deleteDette(id);

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
