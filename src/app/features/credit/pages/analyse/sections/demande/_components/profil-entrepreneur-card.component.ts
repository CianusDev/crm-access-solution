import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Briefcase } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect, SelectOption } from '@/shared/components/form-select/form-select.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditService } from '../../../../../services/credit/credit.service';
import { ProfilEntrepreneur } from '../../../../../interfaces/credit.interface';

const NIVEAUX_EDUCATION: SelectOption[] = [
  { value: 'Sans instruction', label: 'Sans instruction' },
  { value: 'Primaire', label: 'Primaire' },
  { value: 'Secondaire', label: 'Secondaire' },
  { value: 'Supérieur', label: 'Supérieur' },
  { value: 'Formation professionnelle', label: 'Formation professionnelle' },
];

@Component({
  selector: 'app-profil-entrepreneur-card',
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
    FormSelect,
  ],
  template: `
    <app-card>
      <app-card-header>
        <div class="flex items-center gap-2">
          <lucide-icon [img]="BriefcaseIcon" [size]="16" class="text-primary" />
          <app-card-title>Profil Entrepreneur</app-card-title>
        </div>
      </app-card-header>
      <app-card-content>
        <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4">
          <app-form-select
            name="niveauEducation"
            label="Niveau d'éducation"
            [options]="niveauxOptions"
            required />
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-foreground">
              Parcours professionnel <span class="text-destructive">*</span>
            </label>
            <textarea
              formControlName="parcoursPro"
              rows="5"
              placeholder="Décrivez le parcours professionnel du client…"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              [class.border-destructive]="form.get('parcoursPro')?.invalid && form.get('parcoursPro')?.touched">
            </textarea>
            @if (form.get('parcoursPro')?.invalid && form.get('parcoursPro')?.touched) {
              <p class="text-xs text-destructive">Ce champ est requis.</p>
            }
          </div>

          @if (!readOnly()) {
            <div class="flex justify-end pt-2">
              <button type="submit" [disabled]="isSaving()" appButton>
                @if (isSaving()) { Enregistrement… } @else { Enregistrer }
              </button>
            </div>
          }
        </form>
      </app-card-content>
    </app-card>
  `,
})
export class ProfilEntrepreneurCardComponent implements OnInit {
  readonly BriefcaseIcon = Briefcase;

  readonly ref = input<string>('');
  readonly profilEnt = input<ProfilEntrepreneur | null>(null);
  readonly readOnly = input<boolean>(false);
  readonly saved = output<void>();

  readonly niveauxOptions = NIVEAUX_EDUCATION;
  readonly isSaving = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.group({
    niveauEducation: ['', Validators.required],
    parcoursPro: ['', Validators.required],
  });

  ngOnInit() {
    const p = this.profilEnt();
    if (p) {
      this.form.patchValue({
        niveauEducation: p.niveauEducation ?? '',
        parcoursPro: p.parcoursPro ?? '',
      });
    }
    if (this.readOnly()) {
      this.form.disable();
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    this.isSaving.set(true);
    this.creditService.saveProfilEntrepreneur({
      refDemande: this.ref(),
      parcoursPro: val.parcoursPro,
      niveauEducation: val.niveauEducation,
    }).subscribe({
      next: () => {
        this.toast.success('Profil entrepreneur enregistré.');
        this.isSaving.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
        this.isSaving.set(false);
      },
    });
  }
}
