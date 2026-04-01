import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  CirclePause,
  ShieldAlert,
  Pencil,
  X,
  Save,
  AlertCircle,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect, SelectOption } from '@/shared/components/form-select/form-select.component';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';
import { CreditService } from '../../../../../services/credit/credit.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditFicheDemandeDetail } from '../../../../../interfaces/credit.interface';

const OBJETS_CREDIT: SelectOption[] = [
  { value: '1', label: 'Fonds de roulement' },
  { value: '2', label: 'Investissement' },
  { value: '3', label: 'Fonds de roulement et Investissement' },
  { value: '4', label: 'Financement du pas-de-porte' },
  { value: '5', label: 'Avance sur trésorerie' },
];

const OBJETS_CREDIT_MAP: Record<string | number, string> = {
  1: 'Fonds de roulement',
  2: 'Investissement',
  3: 'Fonds de roulement et Investissement',
  4: 'Financement du pas-de-porte',
  5: 'Avance sur trésorerie',
};

@Component({
  selector: 'app-credit-info-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    DatePipe,
    ReactiveFormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    ButtonDirective,
    FormInput,
    FormSelect,
    FormTextarea,
  ],
  template: `
    @if (isLoading()) {
      <div class="space-y-3">
        <div class="h-48 rounded-xl border border-border bg-white animate-pulse"></div>
      </div>
    } @else if (error()) {
      <div
        class="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
      >
        <lucide-icon [img]="AlertCircleIcon" [size]="16" class="text-destructive shrink-0" />
        <p class="text-sm text-destructive">{{ error() }}</p>
      </div>
    } @else if (demande(); as d) {
      <app-card>
        <app-card-header>
          <div class="flex items-center justify-between w-full flex-wrap gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              <app-card-title>Demande de crédit</app-card-title>
              @if (d.pause === 1) {
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                >
                  <lucide-icon [img]="CirclePauseIcon" [size]="11" /> En pause
                </span>
              }
              @if (d.derogation === 1) {
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                >
                  <lucide-icon [img]="ShieldAlertIcon" [size]="11" /> En dérogation
                </span>
              }
              @if (d.derogation === 2) {
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
                >
                  <lucide-icon [img]="ShieldAlertIcon" [size]="11" /> Dérogation validée
                </span>
              }
            </div>
            @if (!editing()) {
              <button
                type="button"
                appButton
                variant="outline"
                size="sm"
                class="flex items-center gap-1.5"
                (click)="startEdit()"
              >
                <lucide-icon [img]="PencilIcon" [size]="13" />
                Modifier
              </button>
            }
          </div>
        </app-card-header>
        <app-card-content>
          <!-- ── Mode lecture ───────────────────────────────────────── -->
          @if (!editing()) {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
              <div class="flex justify-between py-2 border-b border-border/50">
                <span class="text-sm text-muted-foreground">Référence</span>
                <span class="text-sm font-medium font-mono text-foreground">{{
                  d.refDemande
                }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-border/50">
                <span class="text-sm text-muted-foreground">Type de crédit</span>
                <span class="text-sm font-medium text-foreground">{{ d.typeCredit.libelle }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-border/50">
                <span class="text-sm text-muted-foreground">Objet du crédit</span>
                <span class="text-sm font-medium text-foreground">{{ objetLabel() }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-border/50">
                <span class="text-sm text-muted-foreground">Secteur d'activité</span>
                <span class="text-sm font-medium text-foreground">{{
                  d.typeActivite?.libelle ?? '—'
                }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-border/50">
                <span class="text-sm text-muted-foreground">Date de demande</span>
                <span class="text-sm font-medium text-foreground">{{
                  d.dateDemande | date: 'dd/MM/yyyy'
                }}</span>
              </div>
              @if (d.numTransaction) {
                <div class="flex justify-between py-2 border-b border-border/50">
                  <span class="text-sm text-muted-foreground">N° Perfect</span>
                  <span class="text-sm font-medium font-mono text-foreground">{{
                    d.numTransaction
                  }}</span>
                </div>
              }
              <div class="flex justify-between py-2 border-b border-border/50">
                <span class="text-sm text-muted-foreground">Montant demandé</span>
                <app-badge variant="default"
                  >{{ d.montantSollicite | number: '1.0-0' : 'fr-FR' }} FCFA</app-badge
                >
              </div>
              <div class="flex justify-between py-2 border-b border-border/50">
                <span class="text-sm text-muted-foreground">Durée de remboursement</span>
                <app-badge variant="secondary">{{ d.nbreEcheanceSollicite }} Mois</app-badge>
              </div>
              <div class="flex justify-between py-2 border-b border-border/50">
                <span class="text-sm text-muted-foreground">Échéances différées</span>
                <app-badge variant="outline">{{ d.nbreEcheDiffere ?? 0 }} Mois</app-badge>
              </div>
              <div class="flex justify-between py-2 border-b border-border/50">
                <span class="text-sm text-muted-foreground">Mt souhaité / échéance</span>
                <app-badge variant="default"
                  >{{ d.montantEcheSouhaite | number: '1.0-0' : 'fr-FR' }} FCFA</app-badge
                >
              </div>
            </div>
            <div class="mt-4 rounded-lg border border-border bg-muted/30 p-4">
              <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Description de l'utilisation du crédit
              </p>
              <p class="text-sm text-foreground leading-relaxed">{{ d.description || '—' }}</p>
            </div>

            <!-- ── Mode édition ───────────────────────────────────────── -->
          } @else {
            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <app-form-select
                  name="typeCredit"
                  label="Type de crédit"
                  [options]="typeCreditOptions()"
                  required
                />

                <app-form-select
                  name="objetCredit"
                  label="Objet du crédit"
                  [options]="objetOptions"
                  required
                />

                <app-form-select
                  name="typeActivite"
                  label="Secteur d'activité"
                  [options]="typeActiviteOptions()"
                  required
                />

                <app-form-input
                  name="nbreEcheDiffere"
                  label="Échéances différées (Mois)"
                  type="number"
                  [min]="0"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <app-form-input
                  name="montantSollicite"
                  label="Montant demandé (FCFA)"
                  type="number"
                  [min]="1"
                  required
                />

                <app-form-input
                  name="nbreEcheanceSollicite"
                  label="Durée (Mois)"
                  type="number"
                  [min]="1"
                  required
                />

                <app-form-input
                  name="montantEcheSouhaite"
                  label="Mt souhaité / échéance (FCFA)"
                  type="number"
                  [min]="0"
                  required
                />
              </div>

              <app-form-textarea
                name="description"
                label="Description de l'utilisation du crédit"
                [rows]="4"
                required
              />

              <div class="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  appButton
                  variant="outline"
                  size="sm"
                  class="flex items-center gap-1.5"
                  [disabled]="saving()"
                  (click)="cancelEdit()"
                >
                  <lucide-icon [img]="XIcon" [size]="13" />
                  Annuler
                </button>
                <button
                  type="submit"
                  appButton
                  size="sm"
                  class="flex items-center gap-1.5"
                  [disabled]="saving()"
                >
                  <lucide-icon [img]="SaveIcon" [size]="13" />
                  {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
                </button>
              </div>
            </form>
          }
        </app-card-content>
      </app-card>
    }
  `,
})
export class CreditInfoFormComponent implements OnInit {
  readonly CirclePauseIcon = CirclePause;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly AlertCircleIcon = AlertCircle;
  readonly PencilIcon = Pencil;
  readonly XIcon = X;
  readonly SaveIcon = Save;

  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  readonly ref = input.required<string>();
  readonly updated = output<void>();

  readonly demande = signal<CreditFicheDemandeDetail | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly editing = signal(false);
  readonly saving = signal(false);

  readonly typeCreditOptions = signal<SelectOption[]>([]);
  readonly typeActiviteOptions = signal<SelectOption[]>([]);
  readonly objetOptions = OBJETS_CREDIT;

  readonly objetLabel = computed(() => {
    const obj = this.demande()?.objetCredit;
    if (!obj) return '—';
    return OBJETS_CREDIT_MAP[obj] ?? String(obj);
  });

  readonly form = new FormGroup({
    typeCredit: new FormControl<number | null>(null, Validators.required),
    objetCredit: new FormControl<string | null>(null, Validators.required),
    typeActivite: new FormControl<number | null>(null, Validators.required),
    montantSollicite: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    nbreEcheanceSollicite: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    montantEcheSouhaite: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
    ]),
    nbreEcheDiffere: new FormControl<number | null>(null),
    numTransaction: new FormControl<string | null>(null),
    description: new FormControl<string>('', Validators.required),
  });

  ngOnInit() {
    this.loadOptions();
    this.loadDetails();
  }

  loadDetails() {
    this.isLoading.set(true);
    this.error.set(null);
    this.creditService.getDetailsDemande(this.ref()).subscribe({
      next: (data) => {
        this.demande.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les détails de la demande.');
        this.isLoading.set(false);
      },
    });
  }

  private loadOptions() {
    this.creditService.getTypesCredit().subscribe({
      next: (list) =>
        this.typeCreditOptions.set(list.map((t) => ({ value: t.id, label: t.libelle }))),
      error: () => {},
    });
    this.creditService.getTypesActivite().subscribe({
      next: (list) =>
        this.typeActiviteOptions.set(list.map((t) => ({ value: t.id, label: t.libelle }))),
      error: () => {},
    });
  }

  startEdit() {
    const d = this.demande();
    if (!d) return;
    this.form.reset({
      typeCredit: d.typeCredit?.id ?? null,
      objetCredit: d.objetCredit != null ? String(d.objetCredit) : null,
      typeActivite: (d.typeActivite as unknown as { id: number })?.id ?? null,
      montantSollicite: d.montantSollicite,
      nbreEcheanceSollicite: d.nbreEcheanceSollicite,
      montantEcheSouhaite: d.montantEcheSouhaite,
      nbreEcheDiffere: d.nbreEcheDiffere ?? null,
      numTransaction: d.numTransaction ?? null,
      description: d.description ?? '',
    });
    this.editing.set(true);
  }

  cancelEdit() {
    this.editing.set(false);
  }

  save() {
    if (this.form.invalid) return;
    const d = this.demande();
    if (!d) return;

    const v = this.form.value;
    this.saving.set(true);

    this.creditService
      .updateDemandeCredit({
        refDemande: d.refDemande,
        codeClient: d.client.codeClient,
        typeCredit: v.typeCredit!,
        objetCredit: v.objetCredit!,
        typeActivite: v.typeActivite!,
        montantSollicite: v.montantSollicite!,
        nbreEcheanceSollicite: v.nbreEcheanceSollicite!,
        montantEcheSouhaite: v.montantEcheSouhaite!,
        nbreEcheDiffere: v.nbreEcheDiffere ?? null,
        numTransaction: v.numTransaction ?? undefined,
        description: v.description!,
      })
      .subscribe({
        next: (res) => {
          console.log();
          this.saving.set(false);
          console.log('Update response:', res);
          if (res.status === 1 || res.message?.toLowerCase() === 'success') {
            this.toast.success('Demande mise à jour avec succès.');
            this.editing.set(false);
            this.loadDetails();
            this.updated.emit();
          } else {
            this.toast.error(res.message ?? 'Échec de la mise à jour.');
          }
        },
        error: () => {
          this.saving.set(false);
          this.toast.error('Erreur lors de la mise à jour.');
        },
      });
  }
}
