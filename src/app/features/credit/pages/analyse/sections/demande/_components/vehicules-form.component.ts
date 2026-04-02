import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { LucideAngularModule, Car, Plus, Pencil, X, Save, Trash2 } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import {
  DialogComponent,
  DialogHeaderComponent,
  DialogTitleComponent,
  DialogDescriptionComponent,
  DialogFooterComponent,
} from '@/shared/components/dialog/dialog.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect, SelectOption } from '@/shared/components/form-select/form-select.component';
import { CreditService } from '../../../../../services/credit/credit.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditAutoInfo } from '../../../../../interfaces/credit.interface';

const VEHICULE_VU_OPTIONS: SelectOption[] = [
  { value: '1', label: 'Oui' },
  { value: '2', label: 'Non' },
];

@Component({
  selector: 'app-vehicules-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    DialogComponent,
    DialogHeaderComponent,
    DialogTitleComponent,
    DialogDescriptionComponent,
    DialogFooterComponent,
    ButtonDirective,
    FormInput,
    FormSelect,
  ],
  template: `
    <app-card>
      <app-card-header>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <lucide-icon [img]="CarIcon" [size]="16" class="text-muted-foreground" />
            <app-card-title>Véhicules demandés</app-card-title>
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

        <!-- Liste des véhicules existants -->
        @if (vehicules().length > 0 && !showForm()) {
          <div class="flex flex-col gap-3 mb-4">
            @for (v of vehicules(); track v.id ?? $index) {
              <div class="rounded-lg border border-border bg-muted/20 p-4">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm font-semibold text-foreground">Véhicule {{ $index + 1 }}</p>
                  @if (!readOnly()) {
                    <div class="flex items-center gap-1">
                      <button type="button" appButton variant="ghost" size="sm"
                        class="flex items-center gap-1 text-xs"
                        (click)="openEdit(v)">
                        <lucide-icon [img]="PencilIcon" [size]="12" />
                      </button>
                      <button type="button" appButton variant="ghost" size="sm"
                        class="flex items-center gap-1 text-xs text-destructive"
                        (click)="openDelete(v)">
                        <lucide-icon [img]="Trash2Icon" [size]="12" />
                      </button>
                    </div>
                  }
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                  @if (v.marque) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Marque</span>
                      <span class="text-xs font-medium text-foreground">{{ v.marque }}</span>
                    </div>
                  }
                  @if (v.typeCommercial) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Type commercial</span>
                      <span class="text-xs font-medium text-foreground">{{ v.typeCommercial }}</span>
                    </div>
                  }
                  @if (v.nbrePlace) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Nombre de places</span>
                      <span class="text-xs font-medium text-foreground">{{ v.nbrePlace }}</span>
                    </div>
                  }
                  @if (v.puissanceFiscale) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Puissance fiscale</span>
                      <span class="text-xs font-medium text-foreground">{{ v.puissanceFiscale }}</span>
                    </div>
                  }
                  @if (v.immatriculation) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Immatriculation</span>
                      <span class="text-xs font-medium font-mono text-foreground">{{ v.immatriculation }}</span>
                    </div>
                  }
                  @if (v.couleur) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Couleur</span>
                      <span class="text-xs font-medium text-foreground">{{ v.couleur }}</span>
                    </div>
                  }
                  @if (v.dateMiseEnCirculation) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Mise en circulation</span>
                      <span class="text-xs font-medium text-foreground">{{ v.dateMiseEnCirculation | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                  @if (v.vehiculeVu != null) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Véhicule vu</span>
                      <span class="text-xs font-medium" [class.text-green-600]="'' + v.vehiculeVu === '1'" [class.text-muted-foreground]="'' + v.vehiculeVu !== '1'">
                        {{ '' + v.vehiculeVu === '1' ? 'Oui' : 'Non' }}
                      </span>
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
              <app-form-input name="marque" label="Marque" [required]="true" />
              <app-form-input name="typeCommercial" label="Type commercial" [required]="true" />
              <app-form-input name="nbrePlace" label="Nombre de places assises" [required]="true" />
              <app-form-input name="puissanceFiscale" label="Puissance fiscale" [required]="true" />
              <app-form-input name="immatriculation" label="Immatriculation" />
              <app-form-input name="couleur" label="Couleur" />
              <app-form-input name="dateMiseEnCirculation" label="Date de mise en circulation" type="date" />
              <app-form-select name="vehiculeVu" label="Véhicule vu" [options]="vehiculeVuOptions" />
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

        @if (vehicules().length === 0 && !showForm()) {
          <div class="flex flex-col items-center justify-center py-10 text-center">
            <lucide-icon [img]="CarIcon" [size]="28" class="text-muted-foreground/40 mb-2" />
            <p class="text-sm text-muted-foreground">Aucun véhicule enregistré.</p>
          </div>
        }

        <!-- Dialog de confirmation de suppression -->
        <app-dialog [(open)]="deleteDialogOpen">
          <app-dialog-header>
            <app-dialog-title>Suppression</app-dialog-title>
            <app-dialog-description>
              Êtes-vous sûr de vouloir supprimer ce véhicule ?
            </app-dialog-description>
          </app-dialog-header>
          <app-dialog-footer>
            <button type="button" appButton variant="outline" size="sm" (click)="deleteDialogOpen = false" [disabled]="deleting()">
              Annuler
            </button>
            <button type="button" appButton variant="destructive" size="sm" (click)="confirmDelete()" [disabled]="deleting()">
              {{ deleting() ? 'Suppression…' : 'Supprimer' }}
            </button>
          </app-dialog-footer>
        </app-dialog>

      </app-card-content>
    </app-card>
  `,
})
export class VehiculesFormComponent implements OnInit {
  readonly CarIcon    = Car;
  readonly PlusIcon   = Plus;
  readonly PencilIcon = Pencil;
  readonly XIcon      = X;
  readonly SaveIcon   = Save;
  readonly Trash2Icon = Trash2;

  readonly vehiculeVuOptions = VEHICULE_VU_OPTIONS;

  private readonly fb            = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast         = inject(ToastService);

  readonly ref              = input.required<string>();
  readonly initialVehicules = input<CreditAutoInfo[]>([]);
  readonly readOnly         = input<boolean>(false);
  readonly vehiculeSaved    = output<void>();

  readonly vehicules = signal<CreditAutoInfo[]>([]);
  readonly showForm  = signal(false);
  readonly saving    = signal(false);
  readonly deleting  = signal(false);
  private editingId: number | null = null;

  deleteDialogOpen = false;
  private deleteTargetId: number | null = null;

  readonly form = this.fb.group({
    marque:                 ['', Validators.required],
    typeCommercial:         ['', Validators.required],
    nbrePlace:              ['', Validators.required],
    puissanceFiscale:       ['', Validators.required],
    immatriculation:        [''],
    couleur:                [''],
    dateMiseEnCirculation:  [''],
    vehiculeVu:             [''],
  });

  ngOnInit() {
    this.vehicules.set(this.initialVehicules());
  }

  openAdd() {
    this.editingId = null;
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(v: CreditAutoInfo) {
    this.editingId = v.id ?? null;
    this.form.reset({
      marque:                v.marque ?? '',
      typeCommercial:        v.typeCommercial ?? '',
      nbrePlace:             v.nbrePlace != null ? String(v.nbrePlace) : '',
      puissanceFiscale:      v.puissanceFiscale != null ? String(v.puissanceFiscale) : '',
      immatriculation:       v.immatriculation ?? '',
      couleur:               v.couleur ?? '',
      dateMiseEnCirculation: toDateInput(v.dateMiseEnCirculation),
      vehiculeVu:            v.vehiculeVu != null ? String(v.vehiculeVu) : '',
    });
    this.showForm.set(true);
  }

  cancelForm() {
    this.editingId = null;
    this.showForm.set(false);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.saving.set(true);

    const payload: Record<string, unknown> = {
      refDemande:            this.ref(),
      crAutoInfo:            this.editingId ?? '',
      marque:                v.marque,
      typeCommercial:        v.typeCommercial,
      nbrePlace:             v.nbrePlace,
      puissanceFiscale:      v.puissanceFiscale,
      immatriculation:       v.immatriculation || '',
      couleur:               v.couleur || '',
      dateMiseEnCirculation: v.dateMiseEnCirculation || '',
      vehiculeVu:            v.vehiculeVu || '',
    };

    this.creditService.saveInfoCrAuto(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Véhicule enregistré avec succès.');
        this.showForm.set(false);
        this.editingId = null;
        this.vehiculeSaved.emit();
      },
      error: () => {
        this.saving.set(false);
        this.toast.error("Erreur lors de l'enregistrement.");
      },
    });
  }

  openDelete(v: CreditAutoInfo) {
    this.deleteTargetId = v.id ?? null;
    this.deleteDialogOpen = true;
  }

  confirmDelete() {
    if (!this.deleteTargetId) return;
    this.deleting.set(true);
    this.creditService.deleteInfoCrAuto(this.deleteTargetId).subscribe({
      next: () => {
        this.toast.success('Véhicule supprimé.');
        this.deleting.set(false);
        this.deleteDialogOpen = false;
        this.deleteTargetId = null;
        this.vehiculeSaved.emit();
      },
      error: () => {
        this.toast.error('Erreur lors de la suppression.');
        this.deleting.set(false);
      },
    });
  }
}

function toDateInput(d: string | undefined | null): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().substring(0, 10);
}
