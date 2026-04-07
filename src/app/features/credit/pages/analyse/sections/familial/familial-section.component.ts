import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Users,
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
import { FormSelect, SelectOption } from '@/shared/components/form-select/form-select.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../../services/credit/credit.service';
import { ChargeFamille, MembreMenage, ProfilFamilial, TresorerieFamille } from '../../../../interfaces/credit.interface';

const SITUATIONS: SelectOption[] = [
  { value: 'CELIBATAIRE', label: 'Célibataire' },
  { value: 'MARIE', label: 'Marié(e)' },
  { value: 'DIVORCE', label: 'Divorcé(e)' },
  { value: 'VEUF', label: 'Veuf/Veuve' },
  { value: 'UNION_LIBRE', label: 'Union libre' },
];

const NIVEAUX_INSTRUCTION: SelectOption[] = [
  { value: 'SANS', label: 'Sans instruction' },
  { value: 'PRIMAIRE', label: 'Primaire' },
  { value: 'SECONDAIRE', label: 'Secondaire' },
  { value: 'SUPERIEUR', label: 'Supérieur' },
  { value: 'TECHNIQUE', label: 'Formation technique' },
];

interface TypeChargeFamiliale {
  id: number;
  name: string;
  sousCharges: string[];
}

const TYPES_TRESORERIE: SelectOption[] = [
  { value: '1', label: 'Épargne' },
  { value: '2', label: 'Dette' },
];

const TYPES_COMPTE: SelectOption[] = [
  { value: '1', label: 'Espèces' },
  { value: '2', label: 'Banque' },
];

const TYPES_CHARGE_FAM: TypeChargeFamiliale[] = [
  { id: 1, name: 'Domicile', sousCharges: ['Loyer', 'Entretien et réparation', 'Ecolage et fournitures', 'Enfants & Bébé', 'Téléphone & Internet'] },
  { id: 2, name: 'Transport', sousCharges: ['Transport en commun', 'Entretien et réparation', 'Carburant', 'Assurance, vignette, etc.', 'Eau, électricité, gaz', 'Charges financières', "Transfert d'argent", 'Loisirs'] },
  { id: 3, name: 'Personnel', sousCharges: ['Employés de maison', 'Actions sociales et religieuses'] },
  { id: 4, name: 'Familiale', sousCharges: ['Alimentation', 'Santé', 'Hygiène'] },
  { id: 5, name: 'Autres', sousCharges: [] },
];

const REGIMES: SelectOption[] = [
  { value: 'SEPARATION', label: 'Séparation de biens' },
  { value: 'COMMUNAUTE', label: 'Communauté de biens' },
];

const IMPREVU_FAM_OPTIONS: SelectOption[] = [
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
  { value: 25, label: '25%' },
  { value: 30, label: '30%' },
];

const MEMBRES_FAMILLE: SelectOption[] = [
  { value: 'Demandeur', label: 'Demandeur' },
  { value: 'Conjoint (e)', label: 'Conjoint(e)' },
  { value: 'Enfants', label: 'Enfants' },
  { value: 'Parents', label: 'Parents' },
  { value: 'Famille (nièce, oncle, etc.)', label: 'Famille (nièce, oncle…)' },
  { value: 'Domestiques', label: 'Domestiques' },
  { value: 'Autres sources de revenus (loyer, transferts, pension, etc.)', label: 'Autres sources de revenus' },
];

@Component({
  selector: 'app-familial-section',
  templateUrl: './familial-section.component.html',
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
export class FamilialSectionComponent implements OnInit {
  ref = input<string>('');

  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly Trash2Icon = Trash2;
  readonly AlertCircleIcon = AlertCircle;
  readonly UsersIcon = Users;
  readonly SaveIcon = Save;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  // ── Constants ──────────────────────────────────────────────────────────
  readonly situationOptions = SITUATIONS;
  readonly niveauOptions = NIVEAUX_INSTRUCTION;
  readonly regimeOptions = REGIMES;
  readonly membresFamilleOptions = MEMBRES_FAMILLE;
  readonly imprevuFamOptions = IMPREVU_FAM_OPTIONS;
  readonly typesChargeFam = TYPES_CHARGE_FAM;
  readonly typesChargeFamOptions = TYPES_CHARGE_FAM.map(t => ({ value: t.id, label: t.name }));
  readonly typesTresorerieOptions = TYPES_TRESORERIE;
  readonly typesCompteOptions = TYPES_COMPTE;

  // ── State ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly membresMenage = signal<MembreMenage[]>([]);
  readonly chargesFamiliales = signal<ChargeFamille[]>([]);
  readonly tresoreriesFamiliales = signal<TresorerieFamille[]>([]);
  readonly imprevuChargeFamille = signal<number | null>(null);
  readonly isSavingImprevu = signal(false);

  readonly totalEpargnes = computed(() =>
    this.tresoreriesFamiliales().filter(t => String(t.type) === '1').reduce((s, t) => s + (t.montant ?? 0), 0),
  );
  readonly totalDettes = computed(() =>
    this.tresoreriesFamiliales().filter(t => String(t.type) === '2').reduce((s, t) => s + (t.montant ?? 0), 0),
  );

  // Charge form — type sélectionné pour sous-charges
  readonly selectedTypeChargeId = signal<number | null>(null);
  readonly sousChargesOptions = computed<SelectOption[]>(() => {
    const t = TYPES_CHARGE_FAM.find(tc => tc.id === this.selectedTypeChargeId());
    return (t?.sousCharges ?? []).map(s => ({ value: s, label: s }));
  });
  readonly typeHasSousCharges = computed(() => {
    const id = this.selectedTypeChargeId();
    return id != null && id !== 5;
  });

  readonly totalChargesFamilialesDetail = computed(() =>
    this.chargesFamiliales().reduce((s, c) => s + (c.montant ?? 0), 0),
  );

  readonly montantImprevuChargesFam = computed(() => {
    const pct = this.imprevuChargeFamille();
    const total = this.totalChargesFamilialesDetail();
    return pct != null ? Math.round(total * pct / 100) : 0;
  });

  readonly totalChargesFamiliales = computed(() => {
    const f = this.profilForm.value;
    return (f.loyerMensuel ?? 0) + (f.scolarite ?? 0) + (f.sante ?? 0) + (f.autresChargesFamiliales ?? 0);
  });

  readonly totalRevenusMembers = computed(() =>
    this.membresMenage().reduce((s, m) => s + (m.revenus ?? 0), 0),
  );

  // Drawer
  membreDrawerOpen = false;
  chargeDrawerOpen = false;
  chargeDrawerMode: 'create' | 'edit' = 'create';
  private currentChargeId: number | null = null;
  tresorerieDrawerOpen = false;
  tresorerieDrawerMode: 'create' | 'edit' = 'create';
  private currentTresorerieId: number | null = null;
  readonly isSavingProfil = signal(false);
  readonly isSavingMembre = signal(false);
  readonly isSavingCharge = signal(false);
  readonly isSavingTresorerie = signal(false);

  // Delete
  deleteDialogOpen = false;
  membreToDelete: MembreMenage | null = null;
  readonly isDeleting = signal(false);

  // ── Forms ──────────────────────────────────────────────────────────────
  readonly profilForm = this.fb.group({
    situationMatrimoniale: [''],
    nbreEpouses: [null as number | null],
    nbreEnfants: [null as number | null],
    niveauInstruction: [''],
    regimeMatrimonial: [''],
    loyerMensuel: [null as number | null],
    scolarite: [null as number | null],
    sante: [null as number | null],
    autresChargesFamiliales: [null as number | null],
    commentaire: [''],
  });

  readonly membreForm = this.fb.group({
    membreFamille: ['', Validators.required],
    nombre: [null as number | null, Validators.required],
    age: [null as number | null],
    activite: [''],
    revenus: [null as number | null],
    justifs: [''],
  });

  readonly chargeForm = this.fb.group({
    typeCharge: [null as number | null, Validators.required],
    sousCharge: [''],
    montant: [null as number | null, Validators.required],
  });

  readonly tresorerieForm = this.fb.group({
    libelle: ['', Validators.required],
    type: [null as string | null, Validators.required],
    typeCompte: [null as string | null, Validators.required],
    montant: [null as number | null, Validators.required],
    provenance: [''],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadData();
    // Sync typeCharge form value → signal pour les sous-charges
    this.chargeForm.get('typeCharge')!.valueChanges.subscribe(val => {
      this.selectedTypeChargeId.set(val);
      this.chargeForm.get('sousCharge')!.setValue('');
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
        const p = data.demande.profilFamilial;
        if (p) {
          this.profilForm.patchValue({
            situationMatrimoniale: p.situationMatrimoniale ?? '',
            nbreEpouses: p.nbreEpouses ?? null,
            nbreEnfants: p.nbreEnfants ?? null,
            niveauInstruction: p.niveauInstruction ?? '',
            regimeMatrimonial: p.regimeMatrimonial ?? '',
            loyerMensuel: p.loyerMensuel ?? null,
            scolarite: p.scolarite ?? null,
            sante: p.sante ?? null,
            autresChargesFamiliales: p.autresChargesFamiliales ?? null,
            commentaire: p.commentaire ?? '',
          });
        }
        this.membresMenage.set(data.demande.membresMenage ?? []);
        this.chargesFamiliales.set(data.demande.chargesFamiliales ?? []);
        this.tresoreriesFamiliales.set(data.demande.tresoreriesFamiliales ?? []);
        this.imprevuChargeFamille.set(data.demande.imprevuChargeFamille ?? null);
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

  // ── Profil familial ────────────────────────────────────────────────────
  saveProfil() {
    const val = this.profilForm.value;
    this.isSavingProfil.set(true);
    this.creditService.saveProfilFamilial({
      ...val,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Profil familial enregistré.');
        this.isSavingProfil.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingProfil.set(false);
      },
    });
  }

  // ── Imprévus charges familiales ────────────────────────────────────────
  saveImprevuChargesFamiliales(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!value) return;
    this.isSavingImprevu.set(true);
    this.creditService.saveImprevuChargeFamilial({
      imprevu: value,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Imprévus charges familiales enregistrés.');
        this.isSavingImprevu.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingImprevu.set(false);
      },
    });
  }

  // ── Charges familiales ─────────────────────────────────────────────────
  typeChargeLabel(typeId: number | undefined): string {
    return TYPES_CHARGE_FAM.find(t => t.id === typeId)?.name ?? '—';
  }

  openAddCharge() {
    this.chargeDrawerMode = 'create';
    this.currentChargeId = null;
    this.selectedTypeChargeId.set(null);
    this.chargeForm.reset({ typeCharge: null, sousCharge: '', montant: null });
    this.chargeDrawerOpen = true;
  }

  openEditCharge(charge: ChargeFamille) {
    this.chargeDrawerMode = 'edit';
    this.currentChargeId = charge.id ?? null;
    this.selectedTypeChargeId.set(charge.typeCharge ?? null);
    this.chargeForm.reset({
      typeCharge: charge.typeCharge ?? null,
      sousCharge: charge.chargeMens === 'RAS' ? '' : (charge.chargeMens ?? ''),
      montant: charge.montant ?? null,
    });
    this.chargeDrawerOpen = true;
  }

  saveCharge() {
    if (this.chargeForm.invalid) { this.chargeForm.markAllAsTouched(); return; }
    const val = this.chargeForm.value;
    const typeId = val.typeCharge;
    const payload: Record<string, unknown> = {
      refDemande: this.ref(),
      typeCharge: typeId,
      chargeMens: (typeId !== 5 && val.sousCharge) ? val.sousCharge : 'RAS',
      montant: val.montant,
      commentaire: 'RAS',
    };
    if (this.chargeDrawerMode === 'edit' && this.currentChargeId != null) {
      payload['chargeFamille'] = this.currentChargeId;
    }
    this.isSavingCharge.set(true);
    this.creditService.saveChargeFamille(payload).subscribe({
      next: () => {
        this.toast.success(this.chargeDrawerMode === 'create' ? 'Charge ajoutée.' : 'Charge modifiée.');
        this.chargeDrawerOpen = false;
        this.isSavingCharge.set(false);
        this.loadData();
      },
      error: (err) => {
        this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
        this.isSavingCharge.set(false);
      },
    });
  }

  // ── Trésorerie famille ─────────────────────────────────────────────────
  typeLabel(type: number | string | undefined): string {
    return TYPES_TRESORERIE.find(t => String(t.value) === String(type))?.label ?? '—';
  }

  typeCompteLabel(tc: number | string | undefined): string {
    return TYPES_COMPTE.find(t => String(t.value) === String(tc))?.label ?? '—';
  }

  openAddTresorerie() {
    this.tresorerieDrawerMode = 'create';
    this.currentTresorerieId = null;
    this.tresorerieForm.reset({ libelle: '', type: null, typeCompte: null, montant: null, provenance: '' });
    this.tresorerieDrawerOpen = true;
  }

  openEditTresorerie(t: TresorerieFamille) {
    this.tresorerieDrawerMode = 'edit';
    this.currentTresorerieId = t.id ?? null;
    this.tresorerieForm.reset({
      libelle: t.libelle ?? '',
      type: t.type != null ? String(t.type) : null,
      typeCompte: t.typeCompte != null ? String(t.typeCompte) : null,
      montant: t.montant ?? null,
      provenance: t.provenance ?? '',
    });
    this.tresorerieDrawerOpen = true;
  }

  saveTresorerie() {
    if (this.tresorerieForm.invalid) { this.tresorerieForm.markAllAsTouched(); return; }
    const val = this.tresorerieForm.value;
    const payload: Record<string, unknown> = {
      refDemande: this.ref(),
      libelle: val.libelle,
      type: val.type,
      typeCompte: val.typeCompte,
      montant: val.montant,
      provenance: val.provenance,
    };
    if (this.tresorerieDrawerMode === 'edit' && this.currentTresorerieId != null) {
      payload['tresorerieFamille'] = this.currentTresorerieId;
    }
    this.isSavingTresorerie.set(true);
    this.creditService.saveTresorerieFamille(payload).subscribe({
      next: () => {
        this.toast.success(this.tresorerieDrawerMode === 'create' ? 'Trésorerie ajoutée.' : 'Trésorerie modifiée.');
        this.tresorerieDrawerOpen = false;
        this.isSavingTresorerie.set(false);
        this.loadData();
      },
      error: (err) => {
        this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
        this.isSavingTresorerie.set(false);
      },
    });
  }

  // ── Membres du ménage ──────────────────────────────────────────────────
  openAddMembre() {
    this.membreForm.reset({ membreFamille: '', nombre: null, age: null, activite: '', revenus: null, justifs: '' });
    this.membreDrawerOpen = true;
  }

  saveMembre() {
    if (this.membreForm.invalid) { this.membreForm.markAllAsTouched(); return; }
    const val = this.membreForm.value;
    this.isSavingMembre.set(true);
    this.creditService.saveMembreMenage({
      membreFamille: val.membreFamille,
      nombre: val.nombre,
      age: val.age,
      activite: val.activite,
      revenus: val.revenus,
      justifs: val.justifs,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.toast.success('Membre ajouté.');
        this.membreDrawerOpen = false;
        this.isSavingMembre.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingMembre.set(false);
      },
    });
  }

  openDeleteMembre(m: MembreMenage) {
    this.membreToDelete = m;
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.membreToDelete?.id) return;
    this.deleteDialogOpen = false;
    this.isDeleting.set(true);
    this.creditService.deleteMembreMenage(this.membreToDelete.id).subscribe({
      next: () => {
        this.toast.success('Membre supprimé.');
        this.isDeleting.set(false);
        this.membreToDelete = null;
        this.loadData();
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression.');
        this.isDeleting.set(false);
      },
    });
  }
}
