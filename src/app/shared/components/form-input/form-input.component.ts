import { InputDirective } from '@/shared/directives/ui/input/input';
import { LabelDirective } from '@/shared/directives/ui/label/label';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LucideAngularModule, Eye, EyeOff, Calendar, Phone, Hash } from 'lucide-angular';
import {
  ReactiveFormsModule,
  ControlContainer,
  FormGroupDirective,
  FormGroup,
  AbstractControl,
} from '@angular/forms';

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'date';

const ERROR_MESSAGES: Record<string, (params?: Record<string, unknown>) => string> = {
  required: () => 'Ce champ est requis.',
  email: () => 'Veuillez saisir une adresse e-mail valide.',
  minlength: (p) => `Minimum ${p?.['requiredLength'] ?? ''} caractères requis.`,
  maxlength: (p) => `Maximum ${p?.['requiredLength'] ?? ''} caractères autorisés.`,
  pattern: () => 'Le format est invalide.',
  min: (p) => `La valeur minimale est ${p?.['min'] ?? ''}.`,
  max: (p) => `La valeur maximale est ${p?.['max'] ?? ''}.`,
};

@Component({
  selector: 'app-form-input',
  imports: [InputDirective, LabelDirective, ReactiveFormsModule, LucideAngularModule],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-input.component.html',
})
export class FormInput {
  readonly icons = { Eye, EyeOff, Calendar, Phone, Hash };

  private formGroupDirective = inject(FormGroupDirective);

  label = input<string | null>(null);
  name = input<string>('');
  placeholder = input<string>('');
  type = input<InputType>('text');

  /** Pour number : valeur min/max */
  min = input<number | null>(null);
  max = input<number | null>(null);

  /** Pour number : pas (ex: 0.01 pour les décimales) */
  step = input<number | null>(null);

  showPassword = signal(false);

  isPasswordType = computed(() => this.type() === 'password');
  isNumberType = computed(() => this.type() === 'number');
  isTelType = computed(() => this.type() === 'tel');
  isDateType = computed(() => this.type() === 'date');

  /** Icône décorative selon le type */
  trailingIcon = computed(() => {
    if (this.isPasswordType()) return null; // géré séparément
    if (this.isDateType()) return this.icons.Calendar;
    if (this.isTelType()) return this.icons.Phone;
    if (this.isNumberType()) return this.icons.Hash;
    return null;
  });

  resolvedType = computed(() => {
    if (this.isPasswordType() && this.showPassword()) return 'text';
    return this.type();
  });

  get control(): AbstractControl | null {
    return (this.formGroupDirective.form as FormGroup).get(this.name());
  }

  get isSubmitted(): boolean {
    return this.formGroupDirective.submitted;
  }

  get shouldShowError(): boolean {
    const ctrl = this.control;
    if (!ctrl || !ctrl.errors) return false;
    const keys = Object.keys(ctrl.errors);
    if (keys.length === 1 && keys[0] === 'required') return this.isSubmitted;
    return ctrl.invalid && (ctrl.dirty || this.isSubmitted);
  }

  get errorMessage(): string | null {
    const ctrl = this.control;
    if (!ctrl || !ctrl.errors) return null;
    for (const key of Object.keys(ctrl.errors)) {
      if (key === 'required' && !this.isSubmitted) continue;
      const fn = ERROR_MESSAGES[key];
      if (fn) return fn(ctrl.errors[key]);
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }
}
