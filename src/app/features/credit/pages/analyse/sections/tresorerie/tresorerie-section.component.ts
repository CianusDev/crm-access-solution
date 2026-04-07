import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  Pencil,
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
  TresorerieActifCirculant,
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
  readonly PencilIcon = Pencil;
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
  readonly tresoreriesActifCirculant = signal<TresorerieActifCirculant[]>([]); // Nouveau: CRUD dynamique
  readonly creances = signal<CreanceClient[]>([]);
  readonly avancesFournisseurs = signal<AvanceFournisseur[]>([]);
  readonly stocks = signal<TresorerieStockItem[]>([]);
  readonly dettesFournisseurs = signal<DetteFournisseur[]>([]);
  readonly dettesEntreprise = signal<DetteEntreprise[]>([]);
  readonly activitesList = signal<ActiviteCredit[]>([]);

  readonly totalCreances = computed(() =>
    this.creances().reduce((s, c) => s + (c.montant ?? 0), 0),
  );
  readonly totalAvances = computed(() =>
    this.avancesFournisseurs().reduce((s, c) => s + (c.montant ?? 0), 0),
  );
  readonly totalStocks = computed(() => this.stocks().reduce((s, c) => s + (c.montant ?? 0), 0));
  readonly totalDettesFournisseurs = computed(() =>
    this.dettesFournisseurs().reduce((s, c) => s + (c.montant ?? 0), 0),
  );
  readonly totalDettesEntreprise = computed(() =>
    this.dettesEntreprise().reduce((s, c) => s + (c.montantEmprun ?? 0), 0),
  );
  readonly dettes = signal<DetteFournisseur[]>([]); // Legacy alias
  readonly totalDettes = computed(() => this.dettes().reduce((s, c) => s + (c.montant ?? 0), 0)); // Legacy
  readonly totalTresorerie = computed(() => {
    const t = this.tresorerie();
    return (t?.caisse ?? 0) + (t?.banque ?? 0) + (t?.mobileMoney ?? 0);
  });
  readonly totalTresorerieActifCirculant = computed(() =>
    this.tresoreriesActifCirculant().reduce((s, t) => s + (t.montant ?? 0), 0),
  );

  // Drawer states
  tresorerieActifCirculantDrawerOpen = false; // Nouveau
  creanceDrawerOpen = false;
  avanceDrawerOpen = false;
  stockDrawerOpen = false;
  detteFournisseurDrawerOpen = false;
  detteEntrepriseDrawerOpen = false;

  // Edit IDs
  readonly editingTresorerieId = signal<number | null>(null); // Nouveau
  readonly editingCreanceId = signal<number | null>(null);
  readonly editingAvanceId = signal<number | null>(null);
  readonly editingStockId = signal<number | null>(null);
  readonly editingDetteFournisseurId = signal<number | null>(null);
  readonly editingDetteEntrepriseId = signal<number | null>(null);

  readonly isSavingTresorerieActifCirculant = signal(false); // Nouveau
  readonly isSavingTresorerie = signal(false);
  readonly isSavingCreance = signal(false);
  readonly isSavingAvance = signal(false);
  readonly isSavingStock = signal(false);
  readonly isSavingDetteFournisseur = signal(false);
  readonly isSavingDetteEntreprise = signal(false);

  // Delete
  deleteDialogOpen = false;
  deleteTarget: {
    type:
      | 'tresorerieActifCirculant'
      | 'creance'
      | 'avance'
      | 'stock'
      | 'detteFournisseur'
      | 'detteEntreprise';
    id: number;
    label: string;
  } | null = null;
  readonly isDeleting = signal(false);

  // ── Forms ──────────────────────────────────────────────────────────────

  // Constantes pour trésorerie actif circulant
  readonly TYPES_TRESORERIE = [
    { value: '1', label: 'Espèce' },
    { value: '2', label: 'Banque' },
  ];

  readonly TYPES_ESPECE = [
    { value: 'Espèces du jour', label: 'Espèces du jour' },
    { value: 'Espèces cumulées', label: 'Espèces cumulées' },
  ];

  readonly LISTE_BANQUES = [
    { value: 'NSIA', label: 'NSIA' },
    { value: 'Société Générale', label: 'Société Générale' },
    { value: 'BICICI', label: 'BICICI' },
    { value: 'BOA', label: 'BOA' },
    { value: 'Ecobank', label: 'Ecobank' },
    { value: 'BNI', label: 'BNI' },
    { value: 'Standard Chartered', label: 'Standard Chartered' },
    { value: 'Coris Bank', label: 'Coris Bank' },
    { value: 'Banque Atlantique', label: 'Banque Atlantique' },
    { value: 'Orange Money', label: 'Orange Money' },
    { value: 'MTN Money', label: 'MTN Money' },
    { value: 'Wave', label: 'Wave' },
    { value: 'Moov Money', label: 'Moov Money' },
  ];

  readonly tresorerieActifCirculantForm = this.fb.group({
    activite: [null as number | null, Validators.required],
    type: ['1', Validators.required], // 1 = Espèce, 2 = Banque
    libelle: ['', Validators.required],
    montant: [null as number | null, Validators.required],
  });

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
        this.tresoreriesActifCirculant.set(data.demande.tresoreriesActifCirculant ?? []); // Nouveau
        this.creances.set(data.demande.creances ?? []);
        this.avancesFournisseurs.set(data.demande.avancesFournisseurs ?? []);
        this.stocks.set(data.demande.stocks ?? []);
        this.dettesFournisseurs.set(data.demande.dettesFournisseurs ?? []);
        this.dettesEntreprise.set(data.demande.dettesEntreprise ?? []);
        this.activitesList.set(data.demande.activites ?? []);

        // Legacy compatibility: combine all dettes
        this.dettes.set([
          ...(data.demande.dettesFournisseurs ?? []),
          ...(data.demande.dettes ?? []),
        ]);

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

  // ── Trésorerie disponible (ancien format simple) ──────────────────────
  saveTresorerie() {
    const val = this.tresorerieForm.value;
    this.isSavingTresorerie.set(true);
    this.creditService
      .saveTresorerie({
        caisse: val.caisse,
        banque: val.banque,
        mobileMoney: val.mobileMoney,
        refDemande: this.ref(),
      })
      .subscribe({
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

  // ── Trésorerie Actif Circulant (nouveau format CRUD legacy) ────────────
  get isTypeEspece(): boolean {
    return this.tresorerieActifCirculantForm.value.type === '1';
  }

  get isTypeBanque(): boolean {
    return this.tresorerieActifCirculantForm.value.type === '2';
  }

  get libelleOptions() {
    return this.isTypeEspece ? this.TYPES_ESPECE : this.LISTE_BANQUES;
  }

  openAddTresorerie() {
    this.editingTresorerieId.set(null);
    this.tresorerieActifCirculantForm.reset({
      activite: null,
      type: '1',
      libelle: '',
      montant: null,
    });
    this.tresorerieActifCirculantDrawerOpen = true;
  }

  openEditTresorerie(t: TresorerieActifCirculant) {
    this.editingTresorerieId.set(t.id ?? null);
    this.tresorerieActifCirculantForm.patchValue({
      activite: t.activite ?? null,
      type: String(t.type) ?? '1',
      libelle: t.libelle ?? '',
      montant: t.montant ?? null,
    });
    this.tresorerieActifCirculantDrawerOpen = true;
  }

  saveTresorerieActifCirculant() {
    if (!this.tresorerieActifCirculantForm.valid) {
      this.toast.error('Veuillez remplir tous les champs requis.');
      return;
    }

    const val = this.tresorerieActifCirculantForm.value;
    const editId = this.editingTresorerieId();

    this.isSavingTresorerieActifCirculant.set(true);
    this.creditService
      .saveTresorerie({
        tresorerie: editId,
        refDemande: this.ref(),
        activite: val.activite,
        type: val.type,
        libelle: val.libelle,
        montant: val.montant,
      })
      .subscribe({
        next: () => {
          this.toast.success('Trésorerie enregistrée.');
          this.tresorerieActifCirculantDrawerOpen = false;
          this.isSavingTresorerieActifCirculant.set(false);
          this.loadData();
        },
        error: () => {
          this.toast.error("Erreur lors de l'enregistrement.");
          this.isSavingTresorerieActifCirculant.set(false);
        },
      });
  }

  openDeleteTresorerie(id: number, libelle: string) {
    this.deleteTarget = { type: 'tresorerieActifCirculant', id, label: libelle };
    this.deleteDialogOpen = true;
  }

  getActiviteLibelle(actId: number | undefined): string {
    if (!actId) return '—';
    const act = this.activitesList().find((a) => a.id === actId);
    return act?.libelle ?? `Activité #${actId}`;
  }

  getTypeLabel(type: number | undefined): string {
    if (type === 1) return 'Espèce';
    if (type === 2) return 'Banque';
    return '—';
  }

  // ── Créances ───────────────────────────────────────────────────────────
  openAddCreance() {
    this.editingCreanceId.set(null);
    this.creanceForm.reset({
      activite: null,
      objet: '',
      duree: null,
      montant: null,
      solde: null,
      recouvrMax: null,
      montArecevoir: null,
    });
    this.creanceDrawerOpen = true;
  }

  openEditCreance(c: CreanceClient) {
    this.editingCreanceId.set(c.id ?? null);
    this.creanceForm.patchValue({
      activite: (c.activite as any)?.id ?? c.activite ?? null,
      objet: c.objet ?? '',
      duree: c.duree ?? null,
      montant: c.montant ?? null,
      solde: c.solde ?? null,
      recouvrMax: c.recouvrMax ?? null,
      montArecevoir: c.montArecevoir ?? null,
    });
    this.creanceDrawerOpen = true;
  }

  saveCreance() {
    if (this.creanceForm.invalid) {
      this.creanceForm.markAllAsTouched();
      return;
    }
    const val = this.creanceForm.value;
    const payload = {
      activite: val.activite,
      objet: val.objet,
      duree: val.duree,
      montant: val.montant,
      solde: val.solde,
      recouvrMax: val.recouvrMax,
      montArecevoir: val.montArecevoir,
      refDemande: this.ref(),
    };
    this.isSavingCreance.set(true);
    const editId = this.editingCreanceId();
    const obs$ = editId
      ? this.creditService.updateCreanceClient(editId, payload)
      : this.creditService.saveCreanceClient(payload);
    obs$.subscribe({
      next: () => {
        this.toast.success(editId ? 'Créance modifiée.' : 'Créance enregistrée.');
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
    this.editingAvanceId.set(null);
    this.avanceForm.reset({
      activite: null,
      objet: '',
      montant: null,
      dateVersAvc: '',
      dateRecepMarch: '',
      resteApay: null,
    });
    this.avanceDrawerOpen = true;
  }

  openEditAvance(a: AvanceFournisseur) {
    this.editingAvanceId.set(a.id ?? null);
    this.avanceForm.patchValue({
      activite: (a.activite as any)?.id ?? a.activite ?? null,
      objet: a.objet ?? '',
      montant: a.montant ?? null,
      dateVersAvc: a.dateVersAvc ? String(a.dateVersAvc).substring(0, 10) : '',
      dateRecepMarch: a.dateRecepMarch ? String(a.dateRecepMarch).substring(0, 10) : '',
      resteApay: a.resteApay ?? null,
    });
    this.avanceDrawerOpen = true;
  }

  saveAvance() {
    if (this.avanceForm.invalid) {
      this.avanceForm.markAllAsTouched();
      return;
    }
    const val = this.avanceForm.value;
    const payload = {
      activite: val.activite,
      objet: val.objet,
      montant: val.montant,
      dateVersAvc: val.dateVersAvc || null,
      dateRecepMarch: val.dateRecepMarch || null,
      resteApay: val.resteApay,
      refDemande: this.ref(),
    };
    this.isSavingAvance.set(true);
    const editId = this.editingAvanceId();
    const obs$ = editId
      ? this.creditService.updateAvanceFournisseur(editId, payload)
      : this.creditService.saveAvanceFournisseur(payload);
    obs$.subscribe({
      next: () => {
        this.toast.success(editId ? 'Avance modifiée.' : 'Avance fournisseur enregistrée.');
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
    this.editingStockId.set(null);
    this.stockForm.reset({
      description: '',
      quantite: null,
      prix: null,
      assurStock: null,
      garantie: null,
    });
    this.stockDrawerOpen = true;
  }

  openEditStock(s: TresorerieStockItem) {
    this.editingStockId.set(s.id ?? null);
    this.stockForm.patchValue({
      description: s.description ?? s.libelle ?? '',
      quantite: s.quantite ?? null,
      prix: s.prix ?? null,
      assurStock: s.assurStock ?? null,
      garantie: s.garantie ?? null,
    });
    this.stockDrawerOpen = true;
  }

  saveStock() {
    if (this.stockForm.invalid) {
      this.stockForm.markAllAsTouched();
      return;
    }
    const val = this.stockForm.value;
    const montantCalcule = (val.quantite ?? 0) * (val.prix ?? 0);
    const editId = this.editingStockId();
    this.isSavingStock.set(true);
    this.creditService
      .saveStock({
        stock: editId ?? undefined,
        description: val.description,
        libelle: val.description,
        quantite: val.quantite,
        prix: val.prix,
        montant: montantCalcule,
        assurStock: val.assurStock,
        garantie: val.garantie,
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

  // ── Dettes fournisseurs ────────────────────────────────────────────────
  openAddDetteFournisseur() {
    this.editingDetteFournisseurId.set(null);
    this.detteFournisseurForm.reset({
      activite: null,
      objet: '',
      montant: null,
      datePaie: '',
      dateRecepMarch: '',
      solde: null,
    });
    this.detteFournisseurDrawerOpen = true;
  }

  openEditDetteFournisseur(d: DetteFournisseur) {
    this.editingDetteFournisseurId.set(d.id ?? null);
    this.detteFournisseurForm.patchValue({
      activite: (d.activite as any)?.id ?? d.activite ?? null,
      objet: d.objet ?? '',
      montant: d.montant ?? null,
      datePaie: d.datePaie ? String(d.datePaie).substring(0, 10) : '',
      dateRecepMarch: d.dateRecepMarch ? String(d.dateRecepMarch).substring(0, 10) : '',
      solde: d.solde ?? null,
    });
    this.detteFournisseurDrawerOpen = true;
  }

  saveDetteFournisseur() {
    if (this.detteFournisseurForm.invalid) {
      this.detteFournisseurForm.markAllAsTouched();
      return;
    }
    const val = this.detteFournisseurForm.value;
    const payload = {
      activite: val.activite,
      objet: val.objet,
      montant: val.montant,
      datePaie: val.datePaie || null,
      dateRecepMarch: val.dateRecepMarch || null,
      solde: val.solde,
      refDemande: this.ref(),
    };
    this.isSavingDetteFournisseur.set(true);
    const editId = this.editingDetteFournisseurId();
    const obs$ = editId
      ? this.creditService.updateDetteFournisseur(editId, payload)
      : this.creditService.saveDetteFournisseur(payload);
    obs$.subscribe({
      next: () => {
        this.toast.success(
          editId ? 'Dette fournisseur modifiée.' : 'Dette fournisseur enregistrée.',
        );
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
    this.editingDetteEntrepriseId.set(null);
    this.detteEntrepriseForm.reset({
      activite: null,
      preteur: '',
      montantEmprun: null,
      dateDebut: '',
      finEcheance: '',
      restantDu: null,
      typeObjDette: '',
    });
    this.detteEntrepriseDrawerOpen = true;
  }

  openEditDetteEntreprise(d: DetteEntreprise) {
    this.editingDetteEntrepriseId.set(d.id ?? null);
    this.detteEntrepriseForm.patchValue({
      activite: (d.activite as any)?.id ?? d.activite ?? null,
      preteur: d.preteur ?? '',
      montantEmprun: d.montantEmprun ?? null,
      dateDebut: d.dateDebut ? String(d.dateDebut).substring(0, 10) : '',
      finEcheance: d.finEcheance ? String(d.finEcheance).substring(0, 10) : '',
      restantDu: d.restantDu ?? null,
      typeObjDette: d.typeObjDette ?? '',
    });
    this.detteEntrepriseDrawerOpen = true;
  }

  saveDetteEntreprise() {
    if (this.detteEntrepriseForm.invalid) {
      this.detteEntrepriseForm.markAllAsTouched();
      return;
    }
    const val = this.detteEntrepriseForm.value;
    const payload = {
      activite: val.activite,
      preteur: val.preteur,
      montantEmprun: val.montantEmprun,
      dateDebut: val.dateDebut || null,
      finEcheance: val.finEcheance || null,
      restantDu: val.restantDu,
      typeObjDette: val.typeObjDette,
      refDemande: this.ref(),
    };
    this.isSavingDetteEntreprise.set(true);
    const editId = this.editingDetteEntrepriseId();
    const obs$ = editId
      ? this.creditService.updateDetteEntreprise(editId, payload)
      : this.creditService.saveDetteEntreprise(payload);
    obs$.subscribe({
      next: () => {
        this.toast.success(editId ? 'Dette modifiée.' : 'Historique dette enregistré.');
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
  openDelete(
    type: 'creance' | 'avance' | 'stock' | 'detteFournisseur' | 'detteEntreprise',
    id: number,
    label: string,
  ) {
    this.deleteTarget = { type, id, label };
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    const { type, id } = this.deleteTarget;
    this.deleteDialogOpen = false;
    this.isDeleting.set(true);
    const obs$ =
      type === 'tresorerieActifCirculant'
        ? this.creditService.deleteTresorerie(id)
        : type === 'creance'
          ? this.creditService.deleteCreanceClient(id)
          : type === 'avance'
            ? this.creditService.deleteAvanceFournisseur(id)
            : type === 'stock'
              ? this.creditService.deleteStock(id)
              : type === 'detteFournisseur'
                ? this.creditService.deleteDetteFournisseur(id)
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
