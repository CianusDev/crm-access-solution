import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { LucideAngularModule, Receipt, Plus, Pencil, X, Save } from 'lucide-angular';
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

interface FactureItem {
  id?: number;
  numFacture?: string;
  entreprise?: string;
  dateFacture?: string;
  dateEcheance?: string;
  mtHt?: number;
  mtTtc?: number;
  adresse?: string;
  tel?: string;
}

@Component({
  selector: 'app-facture-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
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
            <lucide-icon [img]="ReceiptIcon" [size]="16" class="text-muted-foreground" />
            <app-card-title>Factures</app-card-title>
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

        @if (factures().length > 0 && !showForm()) {
          <div class="flex flex-col gap-3 mb-4">
            @for (f of factures(); track $index) {
              <div class="rounded-lg border border-border bg-muted/20 p-4">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm font-semibold text-foreground">
                    Facture {{ f.numFacture ? '#' + f.numFacture : ($index + 1) }}
                  </p>
                  <button type="button" appButton variant="ghost" size="sm"
                    class="flex items-center gap-1 text-xs"
                    (click)="openEdit(f)">
                    <lucide-icon [img]="PencilIcon" [size]="12" />
                    Modifier
                  </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                  @if (f.entreprise) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Entreprise</span>
                      <span class="text-xs font-medium text-foreground">{{ f.entreprise }}</span>
                    </div>
                  }
                  @if (f.dateFacture) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Date facture</span>
                      <span class="text-xs font-medium text-foreground">{{ f.dateFacture | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                  @if (f.mtHt) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Montant HT</span>
                      <span class="text-xs font-medium text-foreground">{{ f.mtHt | number:'1.0-0':'fr-FR' }} FCFA</span>
                    </div>
                  }
                  @if (f.mtTtc) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Montant TTC</span>
                      <span class="text-xs font-medium text-foreground">{{ f.mtTtc | number:'1.0-0':'fr-FR' }} FCFA</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }

        @if (showForm()) {
          <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-form-input name="numFacture"   label="N° Facture"    type="text" />
              <app-form-input name="entreprise"   label="Entreprise"    type="text" />
              <app-form-input name="dateFacture"  label="Date facture"  type="date" />
              <app-form-input name="dateEcheance" label="Date échéance" type="date" />
              <app-form-input name="adresse"      label="Adresse"       type="text" />
              <app-form-input name="refClient"    label="Réf. client"   type="text" />
              <app-form-input name="tel"          label="Téléphone"     type="text" />
              <app-form-input name="cel"          label="Portable"      type="text" />
              <app-form-input name="rccm"         label="N° RCCM"       type="text" />
              <app-form-input name="cc"           label="N° CC"         type="text" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-form-input name="mtHt"  label="Montant HT (FCFA)"  type="number" [min]="0" />
              <app-form-input name="mtTtc" label="Montant TTC (FCFA)" type="number" [min]="0" />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" appButton variant="outline" size="sm"
                class="flex items-center gap-1.5" [disabled]="saving()" (click)="cancelForm()">
                <lucide-icon [img]="XIcon" [size]="13" /> Annuler
              </button>
              <button type="submit" appButton size="sm"
                class="flex items-center gap-1.5" [disabled]="saving()">
                <lucide-icon [img]="SaveIcon" [size]="13" />
                {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        }

        @if (factures().length === 0 && !showForm()) {
          <div class="flex flex-col items-center justify-center py-10 text-center">
            <lucide-icon [img]="ReceiptIcon" [size]="28" class="text-muted-foreground/40 mb-2" />
            <p class="text-sm text-muted-foreground">Aucune facture enregistrée.</p>
          </div>
        }

      </app-card-content>
    </app-card>
  `,
})
export class FactureFormComponent {
  readonly ReceiptIcon = Receipt;
  readonly PlusIcon    = Plus;
  readonly PencilIcon  = Pencil;
  readonly XIcon       = X;
  readonly SaveIcon    = Save;

  private readonly creditService = inject(CreditService);
  private readonly toast         = inject(ToastService);

  readonly ref        = input.required<string>();
  readonly initialFactures = input<FactureItem[]>([]);

  readonly factures  = signal<FactureItem[]>([]);
  readonly showForm  = signal(false);
  readonly saving    = signal(false);
  private editingId: number | null = null;

  readonly form = new FormGroup({
    numFacture:   new FormControl<string | null>(null),
    entreprise:   new FormControl<string | null>(null),
    dateFacture:  new FormControl<string | null>(null),
    dateEcheance: new FormControl<string | null>(null),
    adresse:      new FormControl<string | null>(null),
    refClient:    new FormControl<string | null>(null),
    tel:          new FormControl<string | null>(null),
    cel:          new FormControl<string | null>(null),
    rccm:         new FormControl<string | null>(null),
    cc:           new FormControl<string | null>(null),
    mtHt:         new FormControl<number | null>(null),
    mtTtc:        new FormControl<number | null>(null),
  });

  ngOnInit() {
    this.factures.set(this.initialFactures());
  }

  openAdd() {
    this.editingId = null;
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(f: FactureItem) {
    this.editingId = f.id ?? null;
    this.form.reset({
      numFacture: f.numFacture ?? null, entreprise: f.entreprise ?? null,
      dateFacture: f.dateFacture ?? null, dateEcheance: f.dateEcheance ?? null,
      adresse: f.adresse ?? null, refClient: null, tel: f.tel ?? null,
      cel: null, rccm: null, cc: null,
      mtHt: f.mtHt ?? null, mtTtc: f.mtTtc ?? null,
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

    this.creditService.saveFacture({
      refDemande:   this.ref(),
      crFacture:    this.editingId,
      numFacture:   v.numFacture ?? undefined,
      entreprise:   v.entreprise ?? undefined,
      dateFacture:  v.dateFacture ?? undefined,
      dateEcheance: v.dateEcheance ?? undefined,
      adresse:      v.adresse ?? undefined,
      refClient:    v.refClient ?? undefined,
      tel:          v.tel ?? undefined,
      cel:          v.cel ?? undefined,
      rccm:         v.rccm ?? undefined,
      cc:           v.cc ?? undefined,
      mtHt:         v.mtHt ?? null,
      mtTtc:        v.mtTtc ?? null,
    }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.status === 1) {
          this.toast.success('Facture enregistrée avec succès.');
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
