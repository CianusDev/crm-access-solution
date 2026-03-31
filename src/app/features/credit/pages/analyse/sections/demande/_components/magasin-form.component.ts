import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
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
    DecimalPipe,
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
          @if (!showForm()) {
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
                  <button type="button" appButton variant="ghost" size="sm"
                    class="flex items-center gap-1 text-xs"
                    (click)="openEdit(m, $index)">
                    <lucide-icon [img]="PencilIcon" [size]="12" />
                    Modifier
                  </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                  @if (m.numMagasin) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">N° Magasin</span>
                      <span class="text-xs font-medium font-mono text-foreground">{{ m.numMagasin }}</span>
                    </div>
                  }
                  @if (m.adresse) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Adresse</span>
                      <span class="text-xs font-medium text-foreground">{{ m.adresse }}</span>
                    </div>
                  }
                  @if (m.telephone) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Téléphone</span>
                      <span class="text-xs font-medium text-foreground">{{ m.telephone }}</span>
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

  openAdd() {
    this.editingId = null;
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(m: CreditMagasin, index: number) {
    this.editingId = m.id ?? null;
    this.form.reset({
      numMagasin:       m.numMagasin ?? null,
      blocCommerciale:  null,
      etage:            null,
      localisation:     m.adresse ?? null,
      telephone:        m.telephone ?? null,
      MontantPartPorte: null,
      montantLoyer:     null,
      fraisReservation: null,
      acompte:          null,
      acomptePercu:     null,
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
