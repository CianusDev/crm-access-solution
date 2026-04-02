import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { LucideAngularModule, ClipboardList, Plus, Pencil, X, Save } from 'lucide-angular';
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
import { CreditBonDeCommande } from '../../../../../interfaces/credit.interface';

@Component({
  selector: 'app-bon-commande-form',
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
            <lucide-icon [img]="ClipboardListIcon" [size]="16" class="text-muted-foreground" />
            <app-card-title>Bons de commande</app-card-title>
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

        @if (bons().length > 0 && !showForm()) {
          <div class="flex flex-col gap-3 mb-4">
            @for (b of bons(); track $index) {
              <div class="rounded-lg border border-border bg-muted/20 p-4">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm font-semibold text-foreground">
                    Bon de commande {{ b.numBonCmde ? '#' + b.numBonCmde : ($index + 1) }}
                  </p>
                  @if (!readOnly()) {
                    <button type="button" appButton variant="ghost" size="sm"
                      class="flex items-center gap-1 text-xs"
                      (click)="openEdit(b)">
                      <lucide-icon [img]="PencilIcon" [size]="12" />
                      Modifier
                    </button>
                  }
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                  @if (b.entreprise) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Commanditaire (Entreprise)</span>
                      <span class="text-xs font-medium text-foreground">{{ b.entreprise }}</span>
                    </div>
                  }
                  @if (b.dateBonCmde) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Date</span>
                      <span class="text-xs font-medium text-foreground">{{ b.dateBonCmde | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                  @if (b.mtHt != null) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Montant HT</span>
                      <span class="text-xs font-medium text-foreground">{{ b.mtHt | number:'1.0-0':'fr-FR' }} FCFA</span>
                    </div>
                  }
                  @if (b.mtTtc != null) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Montant TTC</span>
                      <span class="text-xs font-medium text-foreground">{{ b.mtTtc | number:'1.0-0':'fr-FR' }} FCFA</span>
                    </div>
                  }
                  @if (b.adresse) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Localisation</span>
                      <span class="text-xs font-medium text-foreground">{{ b.adresse }}</span>
                    </div>
                  }
                  @if (b.tel) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Téléphone</span>
                      <span class="text-xs font-medium text-foreground">{{ b.tel }}</span>
                    </div>
                  }
                  @if (b.cel) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Cellulaire</span>
                      <span class="text-xs font-medium text-foreground">{{ b.cel }}</span>
                    </div>
                  }
                  @if (b.rccm) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">RCCM</span>
                      <span class="text-xs font-medium text-foreground">{{ b.rccm }}</span>
                    </div>
                  }
                  @if (b.cc) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">CC</span>
                      <span class="text-xs font-medium text-foreground">{{ b.cc }}</span>
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
              <app-form-input name="numBonCmde"  label="N° Bon de commande" type="text" />
              <app-form-input name="entreprise"  label="Entreprise"         type="text" />
              <app-form-input name="dateBonCmde" label="Date"               type="date" />
              <app-form-input name="adresse"     label="Adresse"            type="text" />
              <app-form-input name="tel"         label="Téléphone"          type="text" />
              <app-form-input name="cel"         label="Portable"           type="text" />
              <app-form-input name="rccm"        label="N° RCCM"            type="text" />
              <app-form-input name="cc"          label="N° CC"              type="text" />
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

        @if (bons().length === 0 && !showForm()) {
          <div class="flex flex-col items-center justify-center py-10 text-center">
            <lucide-icon [img]="ClipboardListIcon" [size]="28" class="text-muted-foreground/40 mb-2" />
            <p class="text-sm text-muted-foreground">Aucun bon de commande enregistré.</p>
          </div>
        }

      </app-card-content>
    </app-card>
  `,
})
export class BonCommandeFormComponent {
  readonly ClipboardListIcon = ClipboardList;
  readonly PlusIcon          = Plus;
  readonly PencilIcon        = Pencil;
  readonly XIcon             = X;
  readonly SaveIcon          = Save;

  private readonly creditService = inject(CreditService);
  private readonly toast         = inject(ToastService);

  readonly ref         = input.required<string>();
  readonly initialBons = input<CreditBonDeCommande[]>([]);
  readonly readOnly    = input<boolean>(false);

  readonly bons      = signal<CreditBonDeCommande[]>([]);
  readonly showForm  = signal(false);
  readonly saving    = signal(false);
  private editingId: number | null = null;

  readonly form = new FormGroup({
    numBonCmde:  new FormControl<string | null>(null),
    entreprise:  new FormControl<string | null>(null),
    dateBonCmde: new FormControl<string | null>(null),
    adresse:     new FormControl<string | null>(null),
    tel:         new FormControl<string | null>(null),
    cel:         new FormControl<string | null>(null),
    rccm:        new FormControl<string | null>(null),
    cc:          new FormControl<string | null>(null),
    mtHt:        new FormControl<number | null>(null),
    mtTtc:       new FormControl<number | null>(null),
  });

  ngOnInit() {
    this.bons.set(this.initialBons());
  }

  openAdd() {
    this.editingId = null;
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(b: CreditBonDeCommande) {
    this.editingId = b.id ?? null;
    this.form.reset({
      numBonCmde: b.numBonCmde ?? null, entreprise: b.entreprise ?? null,
      dateBonCmde: b.dateBonCmde ?? null, adresse: b.adresse ?? null,
      tel: b.tel ?? null, cel: null, rccm: null, cc: null,
      mtHt: b.mtHt ?? null, mtTtc: b.mtTtc ?? null,
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

    this.creditService.saveBonCommande({
      refDemande:  this.ref(),
      bonDeCommande: this.editingId,
      numBonCmde:  v.numBonCmde ?? undefined,
      entreprise:  v.entreprise ?? undefined,
      dateBonCmde: v.dateBonCmde ?? undefined,
      adresse:     v.adresse ?? undefined,
      tel:         v.tel ?? undefined,
      cel:         v.cel ?? undefined,
      rccm:        v.rccm ?? undefined,
      cc:          v.cc ?? undefined,
      mtHt:        v.mtHt ?? null,
      mtTtc:       v.mtTtc ?? null,
    }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.status === 1) {
          this.toast.success('Bon de commande enregistré avec succès.');
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
