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
  DetteEntreprise,
  AvanceFournisseur,
  TresorerieDisponible,
  ActiviteCredit,
} from '../../../../interfaces/credit.interface';
import { FormSelect } from '@/shared/components/form-select/form-select.component';

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
    FormSelect,
  ],
})
export class TresorerieSectionComponent implements OnInit {
  ref = input<string>('');
  canEdit = input<boolean>(false); // AR ou Admin sur dossier statut 5

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
  readonly avancesFournisseurs = signal<AvanceFournisseur[]>([]);
  readonly stocks = signal<TresorerieStockItem[]>([]);
  readonly dettesFournisseurs = signal<DetteFournisseur[]>([]);
  readonly dettesEntreprise = signal<DetteEntreprise[]>([]);
  readonly activitesList = signal<ActiviteCredit[]>([]);

  readonly totalCreances = computed(() => this.creances().reduce((s, c) => s + (c.montant ?? 0), 0));
  readonly totalAvances = computed(() => this.avancesFournisseurs().reduce((s, c) => s + (c.montant ?? 0), 0));
  readonly totalStocks = computed(() => this.stocks().reduce((s, c) => s + (c.montant ?? 0), 0));
  readonly totalDettesFournisseurs = computed(() => this.dettesFournisseurs().reduce((s, c) => s + (c.montant ?? 0), 0));
  readonly totalDettesEntreprise = computed(() => this.dettesEntreprise().reduce((s, c) => s + (c.montantEmprun ?? 0), 0));
  readonly dettes = signal<DetteFournisseur[]>([]); // Legacy alias
  readonly totalDettes = computed(() => this.dettes().reduce((s, c) => s + (c.montant ?? 0), 0)); // Legacy
  readonly totalTresorerie = computed(() => {
    const t = this.tresorerie();
    return (t?.caisse ?? 0) + (t?.banque ?? 0) + (t?.mobileMoney ?? 0);
  });

  // Drawer states
  creanceDrawerOpen = false;
  avanceDrawerOpen = false;
  stockDrawerOpen = false;
  detteFournisseurDrawerOpen = false;
  detteEntrepriseDrawerOpen = false;

  readonly isSavingTresorerie = signal(false);
  readonly isSavingCreance = signal(false);
  readonly isSavingAvance = signal(false);
  readonly isSavingStock = signal(false);
  readonly isSavingDetteFournisseur = signal(false);
  readonly isSavingDetteEntreprise = signal(false);

  // Delete
  deleteDialogOpen = false;
  deleteTarget: { type: 'creance' | 'avance' | 'stock' | 'detteFournisseur' | 'detteEntreprise'; id: number; label: string } | null = null;
  readonly isDeleting = signal(false);

  // ── Forms ──────────────────────────────────────────────────────────────
  readonly tresorerieForm = this.fb.group({
    caisse: [null as number | null],
    banque: [null as number | null],
    mobileMoney: [null as number | null],
  });

  readonly creanceForm = this.fb.group({
    activite: [null as number | null, Validators.required],
    objet: ['', Validators.required],
    duree: [null as number | null],
    montant: [null as number | null, Validators.required],
    solde: [null as number | null],
    recouvrMax: [null as number | null],
    montArecevoir: [null as number | null],
  });

  readonly avanceForm = this.fb.group({
    activite: [null as number | null, Validators.required],
    objet: ['', Validators.required],
    montant: [null as number | null, Validators.required],
    dateVersAvc: [''],
    dateRecepMarch: [''],
    resteApay: [null as number | null],
  });

  readonly stockForm = this.fb.group({
    description: ['', Validators.required],
    quantite: [null as number | null, Validators.required],
    prix: [null as number | null, Validators.required],
    assurStock: [null as number | null, Validators.required],
    garantie: [null as number | null, Validators.required],
  });

  readonly detteFournisseurForm = this.fb.group({
    activite: [null as number | null, Validators.required],
    objet: ['', Validators.required],
    montant: [null as number | null, Validators.required],
    datePaie: [''],
    dateRecepMarch: [''],
    solde: [null as number | null],
  });

  readonly detteEntrepriseForm = this.fb.group({
    activite: [null as number | null, Validators.required],
    preteur: ['', Validators.required],
    montantEmprun: [null as number | null, Validators.required],
    dateDebut: [''],
    finEcheance: [''],
    restantDu: [null as number | null],
    typeObjDette: [''],
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
        this.avancesFournisseurs.set(data.demande.avancesFournisseurs ?? []);
        this.stocks.set(data.demande.stocks ?? []);
        this.dettesFournisseurs.set(data.demande.dettesFournisseurs ?? []);
        this.dettesEntreprise.set(data.demande.dettesEntreprise ?? []);
        this.activitesList.set(data.demande.activites ?? []);
        
        // Legacy compatibility: combine all dettes
        this.dettes.set([...(data.demande.dettesFournisseurs ?? []), ...(data.demande.dettes ?? [])]);
        
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
    this.creanceForm.reset({ 
      activite: null, 
      objet: '', 
      duree: null, 
      montant: null, 
      solde: null, 
      recouvrMax: null, 
      montArecevoir: null 
    });
    this.creanceDrawerOpen = true;
  }

  saveCreance() {
    if (this.creanceForm.invalid) { this.creanceForm.markAllAsTouched(); return; }
    const val = this.creanceForm.value;
    this.isSavingCreance.set(true);
    this.creditService.saveCreanceClient({
      activite: val.activite,
      objet: val.objet,
      duree: val.duree,
      montant: val.montant,
      solde: val.solde,
      recouvrMax: val.recouvrMax,
      montArecevoir: val.montArecevoir,
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

  // ── Avances fournisseurs ───────────────────────────────────────────────
  openAddAvance() {
    this.avanceForm.reset({ 
      activite: null, 
      objet: '', 
      montant: null, 
      dateVersAvc: '', 
      dateRecepMarch: '', 
      resteApay: null 
    });
    this.avanceDrawerOpen = true;
  }

  saveAvance() {
    if (this.avanceForm.invalid) { this.avanceForm.markAllAsTouched(); return; }
    const val = this.avanceForm.value;
    this.isSavingAvance.set(true);
    this.creditService.saveAvanceFournisseur({
      activite: val.activite,
      objet: val.objet,
      montant: val.montant,
      dateVersAvc: val.dateVersAvc || null,
      dateRecepMarch: val.dateRecepMarch || null,
      resteApay: val.resteApay,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Avance fournisseur enregistrée.');
        this.avanceDrawerOpen = false;
        this.isSavingAvance.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingAvance.set(false);
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

  // ── Dettes fournisseurs ────────────────────────────────────────────────
  openAddDetteFournisseur() {
    this.detteFournisseurForm.reset({ 
      activite: null, 
      objet: '', 
      montant: null, 
      datePaie: '', 
      dateRecepMarch: '', 
      solde: null 
    });
    this.detteFournisseurDrawerOpen = true;
  }

  saveDetteFournisseur() {
    if (this.detteFournisseurForm.invalid) { this.detteFournisseurForm.markAllAsTouched(); return; }
    const val = this.detteFournisseurForm.value;
    this.isSavingDetteFournisseur.set(true);
    this.creditService.saveDetteFournisseur({
      activite: val.activite,
      objet: val.objet,
      montant: val.montant,
      datePaie: val.datePaie || null,
      dateRecepMarch: val.dateRecepMarch || null,
      solde: val.solde,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Dette fournisseur enregistrée.');
        this.detteFournisseurDrawerOpen = false;
        this.isSavingDetteFournisseur.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingDetteFournisseur.set(false);
      },
    });
  }

  // ── Dettes entreprise (historique) ─────────────────────────────────────
  openAddDetteEntreprise() {
    this.detteEntrepriseForm.reset({ 
      activite: null, 
      preteur: '', 
      montantEmprun: null, 
      dateDebut: '', 
      finEcheance: '', 
      restantDu: null, 
      typeObjDette: '' 
    });
    this.detteEntrepriseDrawerOpen = true;
  }

  saveDetteEntreprise() {
    if (this.detteEntrepriseForm.invalid) { this.detteEntrepriseForm.markAllAsTouched(); return; }
    const val = this.detteEntrepriseForm.value;
    this.isSavingDetteEntreprise.set(true);
    this.creditService.saveDetteEntreprise({
      activite: val.activite,
      preteur: val.preteur,
      montantEmprun: val.montantEmprun,
      dateDebut: val.dateDebut || null,
      finEcheance: val.finEcheance || null,
      restantDu: val.restantDu,
      typeObjDette: val.typeObjDette,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Historique dette enregistré.');
        this.detteEntrepriseDrawerOpen = false;
        this.isSavingDetteEntreprise.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingDetteEntreprise.set(false);
      },
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  openDelete(type: 'creance' | 'avance' | 'stock' | 'detteFournisseur' | 'detteEntreprise', id: number, label: string) {
    this.deleteTarget = { type, id, label };
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    const { type, id } = this.deleteTarget;
    this.deleteDialogOpen = false;
    this.isDeleting.set(true);
    const obs$ =
      type === 'creance' ? this.creditService.deleteCreanceClient(id)
      : type === 'avance' ? this.creditService.deleteAvanceFournisseur(id)
      : type === 'stock' ? this.creditService.deleteStock(id)
      : type === 'detteFournisseur' ? this.creditService.deleteDetteFournisseur(id)
      : this.creditService.deleteDetteEntreprise(id);

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
