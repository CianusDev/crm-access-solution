import { Component, inject } from '@angular/core';
import { CoraForm } from '../../components/cora-form/cora-form.component';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSelect } from '@/shared/components/form-select/form-select.component';
import { FormCheckbox } from '@/shared/components/form-checkbox/form-checkbox.component';

@Component({
  selector: 'app-create-cora',
  imports: [
    CardComponent,
    CardTitleComponent,
    CardHeaderComponent,
    CardContentComponent,
    FormInput,
    FormSelect,
    FormCheckbox,
    ReactiveFormsModule,
  ],
  template: `
    <form [formGroup]="form" class="pt-4 w-full flex flex-col gap-4" (ngSubmit)="submit()">
      <!-- manditaire social -->
      <app-card>
        <app-card-header>
          <app-card-title>Mandataire social</app-card-title>
        </app-card-header>
        <app-card-content>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <app-form-input
              label="Nom & Prenom"
              placeholder="Ex: Jean Dupont"
              name="name"
            ></app-form-input>
            <app-form-input label="Date de naissance" type="date" name="birthdate"></app-form-input>
            <app-form-input
              label="Lieu de naissance"
              placeholder="Ex: Paris, France"
              name="birthplace"
            ></app-form-input>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <app-form-select
              label="Pays"
              name="country"
              placeholder="Choisir un pays"
              searchPlaceholder="Rechercher un pays…"
              [options]="countries"
            />
          </div>
        </app-card-content>
      </app-card>
    </form>
  `,
})
export class CreateCoraComponent {
  form = inject(FormBuilder).group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone: ['', Validators.required],
    age: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
    birthdate: ['', Validators.required],
    birthplace: ['', Validators.required],
    country: [null, Validators.required],
    role: [null, Validators.required],
  });

  countries = [
    { value: 'fr', label: 'France' },
    { value: 'ci', label: "Côte d'Ivoire" },
    { value: 'sn', label: 'Sénégal' },
    { value: 'cm', label: 'Cameroun' },
    { value: 'ml', label: 'Mali' },
    { value: 'bf', label: 'Burkina Faso' },
    { value: 'gn', label: 'Guinée' },
    { value: 'tg', label: 'Togo' },
    { value: 'bj', label: 'Bénin' },
    { value: 'ne', label: 'Niger' },
    { value: 'cd', label: 'Congo RDC' },
    { value: 'ma', label: 'Maroc' },
    { value: 'dz', label: 'Algérie' },
    { value: 'tn', label: 'Tunisie' },
  ];

  submit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
