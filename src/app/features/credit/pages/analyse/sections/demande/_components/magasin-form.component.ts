import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { LucideAngularModule, Store, Plus, Pencil, X, Save } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { CreditService } from '../../../../../services/credit/credit.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditMagasin } from '../../../../../interfaces/credit.interface';

@Component({
  selector: 'app-magasin-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    ButtonDirective,
    FormInput,
  ],
  template: `
    <app-card>
      <app-card-header>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <lucide-icon [img]="StoreIcon" [size]="16" class="text-muted-foreground" />
            <app-card-title>Info magasin</app-card-title>
          </div>
          @if (!showForm() && !readOnly()) {
            <button type="button" appButton size="sm" class="flex items-center gap-1.5"
              (click)="openAdd()">
              <lucide-icon [img]="PlusIcon" [size]="13" />
              Ajouter
            </button>
          }
        </div>
      </app-card-header>
      <app-card-content>

        <!-- Liste des magasins existants -->
        @if (magasins().length > 0 && !showForm()) {
          <div class="flex flex-col gap-3 mb-4">
            @for (m of magasins(); track $index) {
              <div class="rounded-lg border border-border bg-muted/20 p-4">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm font-semibold text-foreground">Magasin {{ $index + 1 }}</p>
                  @if (!readOnly()) {
                    <button type="button" appButton variant="ghost" size="sm"
                      class="flex items-center gap-1 text-xs"
                      (click)="openEdit(m, $index)">
                      <lucide-icon [img]="PencilIcon" [size]="12" />
                      Modifier
                    </button>
                  }
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                  @if (m.numMagasin) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">N° Magasin</span>
                      <span class="text-xs font-medium font-mono text-foreground">{{ m.numMagasin }}</span>
                    </div>
                  }
                  @if (m.blocCommerciale) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Bloc commercial</span>
                      <span class="text-xs font-medium text-foreground">{{ m.blocCommerciale }}</span>
                    </div>
                  }
                  @if (m.etage) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Étage</span>
                      <span class="text-xs font-medium text-foreground">{{ m.etage }}</span>
                    </div>
                  }
                  @if (m.localisation) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Localisation</span>
                      <span class="text-xs font-medium text-foreground">{{ m.localisation }}</span>
                    </div>
                  }
                  @if (m.telephone) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Téléphone</span>
                      <span class="text-xs font-medium text-foreground">{{ m.telephone }}</span>
                    </div>
                  }
                  @if (m.MontantPartPorte != null) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Montant part de porte</span>
                      <span class="text-xs font-medium text-foreground">{{ formatMontant(m.MontantPartPorte) }}</span>
                    </div>
                  }
                  @if (m.montantLoyer != null) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Montant loyer</span>
                      <span class="text-xs font-medium text-foreground">{{ formatMontant(m.montantLoyer) }}</span>
                    </div>
                  }
                  @if (m.fraisReservation != null) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Frais de réservation</span>
                      <span class="text-xs font-medium text-foreground">{{ formatMontant(+m.fraisReservation) }}</span>
                    </div>
                  }
                  @if (m.acompte != null) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Acompte</span>
                      <span class="text-xs font-medium text-foreground">{{ formatMontant(+m.acompte) }}</span>
                    </div>
                  }
                  @if (m.acomptePercu != null) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Acompte perçu</span>
                      <span class="text-xs font-medium text-foreground">{{ formatMontant(+m.acomptePercu) }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Formulaire ajout / modification -->
        @if (showForm()) {
          <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-form-input name="numMagasin"    label="N° Magasin"       type="text" />
              <app-form-input name="blocCommerciale" label="Bloc commercial" type="text" />
              <app-form-input name="etage"         label="Étage"            type="text" />
              <app-form-input name="localisation"  label="Localisation"     type="text" />
              <app-form-input name="telephone"     label="Téléphone"        type="text" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-form-input name="MontantPartPorte"  label="Montant part de porte (FCFA)"  type="number" [min]="0" />
              <app-form-input name="montantLoyer"      label="Montant loyer (FCFA)"          type="number" [min]="0" />
              <app-form-input name="fraisReservation"  label="Frais de réservation (FCFA)"   type="number" [min]="0" />
              <app-form-input name="acompte"           label="Acompte (FCFA)"                type="number" [min]="0" />
              <app-form-input name="acomptePercu"      label="Acompte perçu (FCFA)"          type="number" [min]="0" />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" appButton variant="outline" size="sm"
                class="flex items-center gap-1.5"
                [disabled]="saving()"
                (click)="cancelForm()">
                <lucide-icon [img]="XIcon" [size]="13" />
                Annuler
              </button>
              <button type="submit" appButton size="sm"
                class="flex items-center gap-1.5"
                [disabled]="saving()">
                <lucide-icon [img]="SaveIcon" [size]="13" />
                {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        }

        @if (magasins().length === 0 && !showForm()) {
          <div class="flex flex-col items-center justify-center py-10 text-center">
            <lucide-icon [img]="StoreIcon" [size]="28" class="text-muted-foreground/40 mb-2" />
            <p class="text-sm text-muted-foreground">Aucun magasin enregistré.</p>
          </div>
        }

      </app-card-content>
    </app-card>
  `,
})
export class MagasinFormComponent {
  readonly StoreIcon  = Store;
  readonly PlusIcon   = Plus;
  readonly PencilIcon = Pencil;
  readonly XIcon      = X;
  readonly SaveIcon   = Save;

  private readonly creditService = inject(CreditService);
  private readonly toast         = inject(ToastService);

  readonly ref            = input.required<string>();
  readonly codeClient     = input.required<string>();
  readonly initialMagasins = input<CreditMagasin[]>([]);
  readonly readOnly        = input<boolean>(false);
  readonly magasinSaved = output<void>();

  readonly magasins   = signal<CreditMagasin[]>([]);
  readonly showForm   = signal(false);
  readonly saving     = signal(false);
  private editingId: number | null = null;

  readonly form = new FormGroup({
    numMagasin:       new FormControl<string | null>(null),
    blocCommerciale:  new FormControl<string | null>(null),
    etage:            new FormControl<string | null>(null),
    localisation:     new FormControl<string | null>(null),
    telephone:        new FormControl<string | null>(null),
    MontantPartPorte: new FormControl<number | null>(null),
    montantLoyer:     new FormControl<number | null>(null),
    fraisReservation: new FormControl<number | null>(null),
    acompte:          new FormControl<number | null>(null),
    acomptePercu:     new FormControl<number | null>(null),
  });

  ngOnInit() {
    this.magasins.set(this.initialMagasins());
  }

  formatMontant(n: number | undefined | null): string {
    if (n == null || isNaN(+n)) return '—';
    return new Intl.NumberFormat('fr-FR').format(+n) + ' FCFA';
  }

  openAdd() {
    this.editingId = null;
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(m: CreditMagasin, index: number) {
    this.editingId = m.id ?? null;
    this.form.reset({
      numMagasin:       m.numMagasin ?? null,
      blocCommerciale:  m.blocCommerciale ?? null,
      etage:            m.etage ?? null,
      localisation:     m.localisation ?? null,
      telephone:        m.telephone ?? null,
      MontantPartPorte: m.MontantPartPorte ?? null,
      montantLoyer:     m.montantLoyer ?? null,
      fraisReservation: m.fraisReservation != null ? +m.fraisReservation : null,
      acompte:          m.acompte != null ? +m.acompte : null,
      acomptePercu:     m.acomptePercu != null ? +m.acomptePercu : null,
    });
    this.showForm.set(true);
  }

  cancelForm() {
    this.editingId = null;
    this.showForm.set(false);
  }

  save() {
    const v = this.form.value;
    this.saving.set(true);

    this.creditService.saveMagasin({
      refDemande:       this.ref(),
      codeClient:       this.codeClient(),
      crMagasin:        this.editingId,
      numMagasin:       v.numMagasin ?? undefined,
      blocCommerciale:  v.blocCommerciale ?? undefined,
      etage:            v.etage ?? undefined,
      localisation:     v.localisation ?? undefined,
      MontantPartPorte: v.MontantPartPorte ?? null,
      montantLoyer:     v.montantLoyer ?? null,
      fraisReservation: v.fraisReservation ?? null,
      acompte:          v.acompte ?? null,
      acomptePercu:     v.acomptePercu ?? null,
    }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.status === 1) {
          this.toast.success('Magasin enregistré avec succès.');
          this.showForm.set(false);
          this.editingId = null;
          this.magasinSaved.emit();
        } else {
          this.toast.error(res.message ?? 'Échec de l\'enregistrement.');
        }
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erreur lors de l\'enregistrement.');
      },
    });
  }
}
