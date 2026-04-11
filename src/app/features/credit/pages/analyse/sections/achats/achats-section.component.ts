import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  Pencil,
  AlertCircle,
  ChevronDown,
  ShoppingCart,
  Banknote,
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
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../../services/credit/credit.service';
import {
  ActiviteCredit,
  AchatMensuel,
  ChargeExploitation,
  CrTypeCharge,
} from '../../../../interfaces/credit.interface';

const SAISONS: SelectOption[] = [
  { value: 'HAUTE SAISON', label: 'Haute saison' },
  { value: 'BASSE SAISON', label: 'Basse saison' },
  { value: 'NORMALE', label: 'Normale' },
];

const IMPREVU_OPTIONS: SelectOption[] = [
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
  { value: 25, label: '25%' },
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
    FormTextarea,
  ],
})
export class AchatsSectionComponent implements OnInit {
  ref = input<string>('');
  canEdit = input<boolean>(false);

  readonly PlusIcon = Plus;
  readonly Trash2Icon = Trash2;
  readonly PencilIcon = Pencil;
  readonly AlertCircleIcon = AlertCircle;
  readonly ChevronDownIcon = ChevronDown;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly BanknoteIcon = Banknote;
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
  readonly demandeRef = signal<string>('');
  readonly activites = signal<ActiviteCredit[]>([]);
  readonly chargesExploitation = signal<ChargeExploitation[]>([]);
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
      for (const achat of a.achatMensuel ?? []) {
        total += this.toNumber(achat.achatsMensuels);
      }
    }
    return total;
  });

  readonly totalCharges = computed(() =>
    this.chargesExploitation().reduce((s, c) => s + this.toNumber(c.montant), 0),
  );

  // Imprévus : total charges par activité + imprevu % depuis analyseFin
  readonly chargesParActivite = computed(() =>
    this.activites().map((a) => {
      const total = a.analyseFin?.chargeExploitation?.total;
      const imprevu = this.normalizeImprevu(a.analyseFin?.chargeExploitation?.imprevu);
      // const montantImprevu = imprevu != null ? Math.round(( * imprevu) / 100) : 0;
      return {
        activite: a,
        total,
        imprevu,
        sousTotal: a.analyseFin?.chargeExploitation?.sousTotal,
      };
    }),
  );

  // readonly totalImprevu = computed(() =>
  //   this.chargesParActivite().reduce((s, r) => s + r.montantImprevu, 0),
  // );

  readonly totalChargeExploitation = computed(() =>
    this.chargesParActivite().reduce(
      (s, r) => s + r.activite.analyseFin?.chargeExploitation?.total! || 0,
      0,
    ),
  );

  // Drawer — Achats
  achatDrawerOpen = false;
  readonly isSavingAchat = signal(false);
  readonly editingAchatId = signal<number | null>(null);

  // Drawer — Charges
  chargeDrawerOpen = false;
  readonly isSavingCharge = signal(false);
  readonly editingChargeId = signal<number | null>(null);

  // Imprévus
  readonly isSavingImprevu = signal(false);

  // Delete dialog
  deleteDialogOpen = false;
  deleteTarget: {
    type: 'achat' | 'charge';
    id: number;
    label: string;
    chargeData?: ChargeExploitation;
  } | null = null;
  readonly isDeleting = signal(false);
  readonly collapsedSections = signal<Record<string, boolean>>({
    achats: true,
    charges: true,
    imprevus: true,
  });

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
    commentaire: [''],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadData();
  }

  isSectionCollapsed(section: 'achats' | 'charges' | 'imprevus'): boolean {
    return this.collapsedSections()[section] ?? false;
  }

  toggleSection(section: 'achats' | 'charges' | 'imprevus') {
    this.collapsedSections.update((current) => ({
      ...current,
      [section]: !current[section],
    }));
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
      next: (activites) => {
        const current = this.activites();
        // Avoid overwriting analyseFin-enriched activities when this request resolves later.
        const currentHasAnalyseFin = current.some(
          (a) => a.analyseFin?.chargeExploitation?.imprevu != null,
        );
        if (!currentHasAnalyseFin) {
          this.activites.set(activites);
        }
      },
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
        this.demandeRef.set(
          data.demande.refDemande ?? activitesAvecNested[0]?.refDemande ?? this.ref(),
        );
        const chargesDemande = data.demande.chargesExploitation ?? [];
        this.chargesExploitation.set(
          chargesDemande.length > 0
            ? chargesDemande
            : this.extractChargesFromActivites(activitesAvecNested),
        );

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

  private toNumber(value: unknown): number {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = String(value).replace(/\s/g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  normalizeImprevu(raw: unknown): number | null {
    if (raw == null || raw === '') return null;
    const num = Number(String(raw).replace('%', '').trim());
    if (!Number.isFinite(num) || num <= 0) return null;
    if (num === 1) return 10; // compat code legacy éventuel
    if (num === 2) return 20;
    if (num === 3) return 30;
    if (num < 1) return Math.round(num * 100); // ex: 0.1 => 10
    return Math.round(num);
  }

  private extractChargesFromActivites(activites: ActiviteCredit[]): ChargeExploitation[] {
    return activites.flatMap((activite) =>
      (activite.chargeExploitation ?? []).map((charge) => ({
        ...charge,
        activite: charge.activite != null ? charge.activite : activite.id,
      })),
    );
  }

  payloadRefDemande(): string {
    return this.demandeRef() || this.ref();
  }

  typeChargeLabel(chargeId: number | undefined | { id?: number; libelle?: string }): string {
    if (chargeId == null) return '—';
    if (typeof chargeId === 'object') return chargeId.libelle ?? '—';
    return this.typeCharges().find((t) => t.id === chargeId)?.libelle ?? `#${chargeId}`;
  }

  // ── Achat Mensuel CRUD ─────────────────────────────────────────────────
  openAddAchat(activiteId?: number) {
    if (!this.canEdit()) return;
    this.editingAchatId.set(null);
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

  openEditAchat(a: AchatMensuel, activiteId?: number) {
    if (!this.canEdit()) return;
    const editId = a.id ?? (a as unknown as { achatMensuel?: number }).achatMensuel ?? null;
    this.editingAchatId.set(editId);
    this.achatForm.patchValue({
      activite: (a.activite as any)?.id ?? a.activite ?? activiteId ?? null,
      article: a.article ?? '',
      fournisseur: a.fournisseur ?? '',
      quantite: a.quantite ?? null,
      frequence: a.frequence ?? '',
      montant: a.achatsMensuels ?? (a as unknown as { montant?: number }).montant ?? null,
    });
    this.achatDrawerOpen = true;
  }

  saveAchat() {
    if (!this.canEdit()) return;
    if (this.achatForm.invalid) {
      this.achatForm.markAllAsTouched();
      return;
    }
    const val = this.achatForm.value;
    const editId = this.editingAchatId();
    this.isSavingAchat.set(true);
    this.creditService
      .saveAchatMensuel({
        achatMensuel: editId ?? undefined,
        achat: editId ?? undefined,
        id: editId ?? undefined,
        refDemande: this.payloadRefDemande(),
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
    if (!this.canEdit()) return;
    this.editingChargeId.set(null);
    this.chargeForm.reset({ activite: null, charge: null, montant: null, commentaire: '' });
    this.chargeDrawerOpen = true;
  }

  openEditCharge(c: ChargeExploitation) {
    if (!this.canEdit()) return;
    const editId =
      c.id ?? (c as unknown as { chargeExploitation?: number }).chargeExploitation ?? null;
    this.editingChargeId.set(editId);
    this.chargeForm.patchValue({
      activite: (c.activite as any)?.id ?? c.activite ?? null,
      charge: (c.charge as any)?.id ?? c.charge ?? null,
      montant: c.montant ?? null,
      commentaire: c.commentaire ?? '',
    });
    this.chargeDrawerOpen = true;
  }

  saveCharge() {
    if (!this.canEdit()) return;
    if (this.chargeForm.invalid) {
      this.chargeForm.markAllAsTouched();
      return;
    }
    const val = this.chargeForm.value;
    const editId = this.editingChargeId();
    this.isSavingCharge.set(true);
    this.creditService
      .saveChargeExploitation({
        chargeExploitation: editId ?? undefined,
        activite: val.activite,
        charge: val.charge,
        montant: val.montant,
        commentaire: val.commentaire ?? '',
        refDemande: this.payloadRefDemande(),
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

  // ── Delete ─────────────────────────────────────────────────────────────
  openDeleteAchat(achat: AchatMensuel) {
    if (!this.canEdit()) return;
    this.deleteTarget = { type: 'achat', id: achat.id!, label: achat.article ?? '' };
    this.deleteDialogOpen = true;
  }

  openDeleteCharge(charge: ChargeExploitation) {
    if (!this.canEdit()) return;
    const chargeId =
      charge.id ?? (charge as unknown as { chargeExploitation?: number }).chargeExploitation;
    if (chargeId == null) {
      this.toast.error('Impossible de supprimer: identifiant de charge introuvable.');
      return;
    }
    this.deleteTarget = {
      type: 'charge',
      id: chargeId,
      label: this.typeChargeLabel(charge.charge),
      chargeData: charge,
    };
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.canEdit()) return;
    if (!this.deleteTarget) return;
    const { type, id, chargeData } = this.deleteTarget;
    this.deleteDialogOpen = false;
    this.isDeleting.set(true);
    if (type === 'charge') {
      this.creditService.deleteChargeExploitation(id).subscribe({
        next: () => this.onDeleteSuccess(),
        error: () => {
          if (!chargeData) {
            this.onDeleteError();
            return;
          }
          this.creditService
            .saveChargeExploitation({
              chargeExploitation: id,
              activite: (chargeData.activite as { id?: number })?.id ?? chargeData.activite ?? null,
              charge: (chargeData.charge as { id?: number })?.id ?? chargeData.charge ?? null,
              montant: this.toNumber(chargeData.montant),
              commentaire: chargeData.commentaire ?? '',
              refDemande: this.payloadRefDemande(),
              etat: 0,
              statut: 0,
            })
            .subscribe({
              next: () => this.onDeleteSuccess(),
              error: () => this.onDeleteError(),
            });
        },
      });
      return;
    }

    const obs$ = this.creditService.deleteAchatMensuel(id);
    obs$.subscribe({
      next: () => this.onDeleteSuccess(),
      error: () => this.onDeleteError(),
    });
  }

  private onDeleteSuccess() {
    this.toast.success('Supprimé avec succès.');
    this.isDeleting.set(false);
    this.deleteTarget = null;
    this.loadData();
  }

  private onDeleteError() {
    this.toast.error('Erreur lors de la suppression.');
    this.isDeleting.set(false);
  }

  // ── Imprévus charges exploitation ─────────────────────────────────────
  saveImprevu(activiteId: number, event: Event) {
    if (!this.canEdit()) return;
    const value = Number((event.target as HTMLSelectElement).value);
    if (!value) return;
    this.isSavingImprevu.set(true);
    this.creditService
      .saveImprevuChargeExploitation({
        activite: activiteId,
        imprevu: value,
        refDemande: this.payloadRefDemande(),
        // Legacy endpoint is lenient but historically receives the full charge form shape.
        charge: null,
        montant: null,
        commentaire: '',
        chargeExploitation: null,
      })
      .subscribe({
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
