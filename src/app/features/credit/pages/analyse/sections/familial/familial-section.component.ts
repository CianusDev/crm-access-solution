import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  ChevronDown,
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
import {
  ActiviteCredit,
  ChargeFamille,
  CreditAnalyseDemandeDetail,
  MembreMenage,
  TresorerieFamille,
} from '../../../../interfaces/credit.interface';

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

const JUSTIFS_OPTIONS: SelectOption[] = [
  { value: '1', label: 'OUI' },
  { value: '0', label: 'NON' },
];

type MembreCondition = 'none' | 'demandeur' | 'domestiques' | 'autresRevenus' | 'autresFamille';

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
  canEdit = input<boolean>(false);

  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly Trash2Icon = Trash2;
  readonly AlertCircleIcon = AlertCircle;
  readonly ChevronDownIcon = ChevronDown;
  readonly UsersIcon = Users;
  readonly SaveIcon = Save;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  // ── Constants ──────────────────────────────────────────────────────────
  readonly membresFamilleOptions = MEMBRES_FAMILLE;
  readonly justifsOptions = JUSTIFS_OPTIONS;
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
  readonly profilCommentaire = signal('');
  readonly profilEditMode = signal(false);
  readonly isSavingImprevu = signal(false);
  readonly collapsedSections = signal<Record<string, boolean>>({
    chargesFamiliales: true,
    tresorerieFamiliale: true,
    compositionMenage: true,
  });

  readonly totalEpargnes = computed(() =>
    this.tresoreriesFamiliales()
      .filter(t => String(t.type) === '1')
      .reduce((s, t) => s + this.toNumber(t.montant), 0),
  );
  readonly totalDettes = computed(() =>
    this.tresoreriesFamiliales()
      .filter(t => String(t.type) === '2')
      .reduce((s, t) => s + this.toNumber(t.montant), 0),
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
    this.chargesFamiliales().reduce((s, c) => s + this.toNumber(c.montant), 0),
  );

  readonly montantImprevuChargesFam = computed(() => {
    const pct = this.imprevuChargeFamille();
    const total = this.totalChargesFamilialesDetail();
    return pct != null ? Math.round(total * pct / 100) : 0;
  });

  readonly totalRevenusMembers = computed(() =>
    this.membresMenage().reduce((s, m) => s + this.toNumber(m.revenus), 0),
  );
  readonly selectedMembreCondition = signal<MembreCondition>('none');
  readonly showMembreNombre = computed(
    () =>
      this.selectedMembreCondition() === 'domestiques' ||
      this.selectedMembreCondition() === 'autresFamille',
  );
  readonly showMembreAge = computed(
    () =>
      this.selectedMembreCondition() === 'demandeur' ||
      this.selectedMembreCondition() === 'domestiques' ||
      this.selectedMembreCondition() === 'autresFamille',
  );
  readonly showMembreActivite = computed(
    () =>
      this.selectedMembreCondition() === 'demandeur' ||
      this.selectedMembreCondition() === 'autresRevenus' ||
      this.selectedMembreCondition() === 'autresFamille',
  );
  readonly showMembreRevenus = computed(
    () =>
      this.selectedMembreCondition() === 'demandeur' ||
      this.selectedMembreCondition() === 'autresRevenus' ||
      this.selectedMembreCondition() === 'autresFamille',
  );
  readonly showMembreJustifs = computed(
    () =>
      this.selectedMembreCondition() === 'demandeur' ||
      this.selectedMembreCondition() === 'autresRevenus' ||
      this.selectedMembreCondition() === 'autresFamille',
  );

  // Drawer
  membreDrawerOpen = false;
  membreDrawerMode: 'create' | 'edit' = 'create';
  private currentMembreId: number | null = null;
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
    commentaire: ['', Validators.required],
  });

  readonly membreForm = this.fb.group({
    membreFamille: ['', Validators.required],
    nombre: [null as number | null],
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
    this.membreForm.get('membreFamille')!.valueChanges.subscribe((value) => {
      const condition = this.resolveMembreCondition(value);
      this.selectedMembreCondition.set(condition);
      this.applyMembreValidators(condition);
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
        const demande = data.demande;
        const activites = demande.activites ?? [];
        const demandeLegacy = demande as CreditAnalyseDemandeDetail & {
          chargeFamilles?: ChargeFamille[];
          tresorerieFamilles?: TresorerieFamille[];
          menageRevenuFamilles?: MembreMenage[];
        };
        const p = demande.profilFamilial ?? this.extractProfilFamilialFromActivites(activites);
        const commentaireProfil = (p?.commentaire ?? '').trim();
        this.profilCommentaire.set(commentaireProfil);
        this.profilEditMode.set(commentaireProfil.length === 0 && this.canEdit());
        if (p) {
          this.profilForm.patchValue({
            commentaire: p.commentaire ?? '',
          });
        } else {
          this.profilForm.patchValue({ commentaire: '' });
        }
        this.membresMenage.set(
          this.firstNonEmptyArray(
            demande.membresMenage,
            demandeLegacy.menageRevenuFamilles,
            this.extractMenageFromActivites(activites),
          ),
        );
        this.chargesFamiliales.set(
          this.firstNonEmptyArray(
            demande.chargesFamiliales,
            demandeLegacy.chargeFamilles,
            this.extractChargesFromActivites(activites),
          ),
        );
        this.tresoreriesFamiliales.set(
          this.firstNonEmptyArray(
            demande.tresoreriesFamiliales,
            demandeLegacy.tresorerieFamilles,
            this.extractTresoreriesFromActivites(activites),
          ),
        );
        const imprevuAnalyse = this.extractImprevuChargeFamille(demande);
        this.imprevuChargeFamille.set(imprevuAnalyse);
        this.creditService.getDetailsDemande(this.ref()).subscribe({
          next: (details) => {
            const imprevuDetails = this.extractImprevuChargeFamille(details);
            if (imprevuDetails != null) {
              this.imprevuChargeFamille.set(imprevuDetails);
            }
          },
          error: () => {
            // no-op: analyse data remains source of truth if details endpoint fails
          },
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les données du dossier.');
        this.isLoading.set(false);
      },
    });
  }

  formatMontant(n: number | string | undefined | null): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-FR').format(this.toNumber(n));
  }

  isSectionCollapsed(key: string): boolean {
    return !!this.collapsedSections()[key];
  }

  toggleSection(key: string): void {
    this.collapsedSections.update((state) => ({
      ...state,
      [key]: !state[key],
    }));
  }

  private toNumber(value: unknown): number {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = String(value).replace(/\s/g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private firstNonEmptyArray<T>(...arrays: Array<T[] | undefined>): T[] {
    for (const arr of arrays) {
      if (arr && arr.length > 0) return arr;
    }
    return [];
  }

  private extractProfilFamilialFromActivites(activites: ActiviteCredit[]) {
    for (const activite of activites) {
      const profil = (activite as unknown as { profilFamilial?: { commentaire?: string } }).profilFamilial;
      if (profil && (profil.commentaire ?? '').trim() !== '') {
        return profil;
      }
    }
    return null;
  }

  private extractChargesFromActivites(activites: ActiviteCredit[]): ChargeFamille[] {
    for (const activite of activites) {
      const source = (activite as unknown as { chargeFamilles?: ChargeFamille[] }).chargeFamilles ?? [];
      if (source.length > 0) {
        return this.dedupeByIdOrPayload(
          source.map((item) => ({
            ...item,
            refDemande: item.refDemande ?? activite.refDemande,
          })),
        );
      }
    }
    return [];
  }

  private extractTresoreriesFromActivites(activites: ActiviteCredit[]): TresorerieFamille[] {
    for (const activite of activites) {
      const source =
        (activite as unknown as { tresorerieFamilles?: TresorerieFamille[] }).tresorerieFamilles ?? [];
      if (source.length > 0) {
        return this.dedupeByIdOrPayload(
          source.map((item) => ({
            ...item,
            refDemande: item.refDemande ?? activite.refDemande,
          })),
        );
      }
    }
    return [];
  }

  private extractMenageFromActivites(activites: ActiviteCredit[]): MembreMenage[] {
    for (const activite of activites) {
      const source =
        (activite as unknown as { menageRevenuFamilles?: MembreMenage[] }).menageRevenuFamilles ?? [];
      if (source.length > 0) {
        return this.dedupeByIdOrPayload(
          source.map((item) => ({
            ...item,
            refDemande: item.refDemande ?? activite.refDemande,
          })),
        );
      }
    }
    return [];
  }

  private dedupeByIdOrPayload<T extends { id?: number }>(items: T[]): T[] {
    const seen = new Set<string>();
    const deduped: T[] = [];
    for (const item of items) {
      const key = item.id != null ? `id:${item.id}` : `payload:${JSON.stringify(item)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }
    return deduped;
  }

  private extractImprevuChargeFamille(source: unknown): number | null {
    const input = source as
      | { imprevuChargeFamille?: unknown; imprevu?: unknown; analyseFin?: { chargeFamille?: { imprevu?: unknown } } }
      | undefined;
    const raw =
      input?.imprevuChargeFamille ??
      input?.imprevu ??
      input?.analyseFin?.chargeFamille?.imprevu ??
      null;
    const value = this.toNumber(raw);
    return value > 0 ? value : null;
  }

  // ── Profil familial ────────────────────────────────────────────────────
  enterProfilEditMode() {
    if (!this.canEdit()) return;
    this.profilForm.patchValue({ commentaire: this.profilCommentaire() });
    this.profilEditMode.set(true);
  }

  cancelProfilEditMode() {
    this.profilForm.patchValue({ commentaire: this.profilCommentaire() });
    this.profilEditMode.set(false);
  }

  saveProfil() {
    if (!this.canEdit()) return;
    if (this.profilForm.invalid) {
      this.profilForm.markAllAsTouched();
      return;
    }
    const val = this.profilForm.value;
    this.isSavingProfil.set(true);
    this.creditService.saveProfilFamilial({
      commentaire: val.commentaire,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.profilCommentaire.set((val.commentaire ?? '').trim());
        this.profilEditMode.set(false);
        this.toast.success('Profil familial enregistré.');
        this.isSavingProfil.set(false);
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingProfil.set(false);
      },
    });
  }

  // ── Imprévus charges familiales ────────────────────────────────────────
  saveImprevuChargesFamiliales(event: Event) {
    if (!this.canEdit()) return;
    const value = Number((event.target as HTMLSelectElement).value);
    if (!value) return;
    this.isSavingImprevu.set(true);
    this.creditService.saveImprevuChargeFamilial({
      imprevu: value,
      refDemande: this.ref(),
    }).subscribe({
      next: () => {
        this.imprevuChargeFamille.set(value);
        this.toast.success('Imprévus charges familiales enregistrés.');
        this.isSavingImprevu.set(false);
      },
      error: () => {
        this.toast.error("Erreur lors de l'enregistrement.");
        this.isSavingImprevu.set(false);
      },
    });
  }

  // ── Charges familiales ─────────────────────────────────────────────────
  typeChargeLabel(typeId: number | string | undefined): string {
    const normalized = this.toNumber(typeId);
    return TYPES_CHARGE_FAM.find(t => t.id === normalized)?.name ?? '—';
  }

  openAddCharge() {
    if (!this.canEdit()) return;
    this.chargeDrawerMode = 'create';
    this.currentChargeId = null;
    this.selectedTypeChargeId.set(null);
    this.chargeForm.reset({ typeCharge: null, sousCharge: '', montant: null });
    this.chargeDrawerOpen = true;
  }

  openEditCharge(charge: ChargeFamille) {
    if (!this.canEdit()) return;
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
    if (!this.canEdit()) return;
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

  isTypeEpargne(type: number | string | undefined): boolean {
    return String(type) === '1';
  }

  isTypeDette(type: number | string | undefined): boolean {
    return String(type) === '2';
  }

  justifLabel(value: string | number | undefined): string {
    if (String(value) === '1') return 'OUI';
    if (String(value) === '0') return 'NON';
    return '—';
  }

  openAddTresorerie() {
    if (!this.canEdit()) return;
    this.tresorerieDrawerMode = 'create';
    this.currentTresorerieId = null;
    this.tresorerieForm.reset({ libelle: '', type: null, typeCompte: null, montant: null, provenance: '' });
    this.tresorerieDrawerOpen = true;
  }

  openEditTresorerie(t: TresorerieFamille) {
    if (!this.canEdit()) return;
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
    if (!this.canEdit()) return;
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
  private resolveMembreCondition(value: string | null | undefined): MembreCondition {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (!normalized) return 'none';
    if (normalized === 'demandeur') return 'demandeur';
    if (normalized.includes('domestique')) return 'domestiques';
    if (normalized.includes('autres sources de revenus')) return 'autresRevenus';
    return 'autresFamille';
  }

  private applyMembreValidators(condition: MembreCondition) {
    const nombre = this.membreForm.get('nombre');
    const age = this.membreForm.get('age');
    const activite = this.membreForm.get('activite');
    const revenus = this.membreForm.get('revenus');
    const justifs = this.membreForm.get('justifs');
    if (!nombre || !age || !activite || !revenus || !justifs) return;

    nombre.clearValidators();
    age.clearValidators();
    activite.clearValidators();
    revenus.clearValidators();
    justifs.clearValidators();

    if (condition === 'demandeur') {
      age.setValidators([Validators.required]);
      activite.setValidators([Validators.required]);
      revenus.setValidators([Validators.required]);
      justifs.setValidators([Validators.required]);
    } else if (condition === 'domestiques') {
      nombre.setValidators([Validators.required]);
      age.setValidators([Validators.required]);
    } else if (condition === 'autresRevenus') {
      activite.setValidators([Validators.required]);
      revenus.setValidators([Validators.required]);
      justifs.setValidators([Validators.required]);
    } else if (condition === 'autresFamille') {
      nombre.setValidators([Validators.required]);
      age.setValidators([Validators.required]);
      activite.setValidators([Validators.required]);
      revenus.setValidators([Validators.required]);
      justifs.setValidators([Validators.required]);
    }

    nombre.updateValueAndValidity({ emitEvent: false });
    age.updateValueAndValidity({ emitEvent: false });
    activite.updateValueAndValidity({ emitEvent: false });
    revenus.updateValueAndValidity({ emitEvent: false });
    justifs.updateValueAndValidity({ emitEvent: false });
  }

  openAddMembre() {
    if (!this.canEdit()) return;
    this.membreDrawerMode = 'create';
    this.currentMembreId = null;
    this.membreForm.reset({
      membreFamille: '',
      nombre: null,
      age: null,
      activite: '',
      revenus: null,
      justifs: '',
    });
    this.selectedMembreCondition.set('none');
    this.applyMembreValidators('none');
    this.membreDrawerOpen = true;
  }

  openEditMembre(membre: MembreMenage) {
    if (!this.canEdit()) return;
    this.membreDrawerMode = 'edit';
    this.currentMembreId = membre.id ?? null;
    const membreFamille = membre.membreFamille ?? '';
    this.membreForm.reset({
      membreFamille,
      nombre: membre.nombre ?? null,
      age: membre.age ?? null,
      activite: membre.activite ?? '',
      revenus: membre.revenus ?? null,
      justifs: membre.justifs != null ? String(membre.justifs) : '',
    });
    const condition = this.resolveMembreCondition(membreFamille);
    this.selectedMembreCondition.set(condition);
    this.applyMembreValidators(condition);
    this.membreDrawerOpen = true;
  }

  saveMembre() {
    if (!this.canEdit()) return;
    if (this.membreForm.invalid) { this.membreForm.markAllAsTouched(); return; }
    const val = this.membreForm.value;
    const payload: Record<string, unknown> = {
      membreFamille: val.membreFamille,
      nombre: val.nombre,
      age: val.age,
      activite: val.activite,
      revenus: val.revenus,
      justifs: val.justifs,
      refDemande: this.ref(),
    };
    if (this.membreDrawerMode === 'edit' && this.currentMembreId != null) {
      payload['menageRevenuFamille'] = this.currentMembreId;
    }
    this.isSavingMembre.set(true);
    this.creditService.saveMembreMenage(payload).subscribe({
      next: () => {
        this.toast.success(this.membreDrawerMode === 'create' ? 'Membre ajouté.' : 'Membre modifié.');
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
    if (!this.canEdit()) return;
    this.membreToDelete = m;
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.canEdit()) return;
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
