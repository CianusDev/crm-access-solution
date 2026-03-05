import { InputDirective } from '@/shared/directives/ui/input/input';
import { LabelDirective } from '@/shared/directives/ui/label/label';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import {
  ReactiveFormsModule,
  ControlContainer,
  FormGroupDirective,
  FormGroup,
  AbstractControl,
} from '@angular/forms';

const ERROR_MESSAGES: Record<string, (params?: Record<string, unknown>) => string> = {
  required: () => 'Ce champ est requis.',
  email: () => 'Veuillez saisir une adresse e-mail valide.',
  minlength: (params) => `Minimum ${params?.['requiredLength'] ?? ''} caractères requis.`,
  maxlength: (params) => `Maximum ${params?.['requiredLength'] ?? ''} caractères autorisés.`,
  pattern: () => 'Le format est invalide.',
};

@Component({
  selector: 'app-form-input',
  imports: [InputDirective, LabelDirective, ReactiveFormsModule, LucideAngularModule],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-input.component.html',
  providers: [
    {
      provide: 'icons',
      useValue: { Eye, EyeOff },
    },
  ],
})
export class FormInput {
  readonly icons = { Eye, EyeOff };

  private formGroupDirective = inject(FormGroupDirective);

  label = input<string | null>(null);
  name = input<string>('');
  placeholder = input<string>('');
  type = input<'text' | 'password' | 'email'>('text');

  showPassword = signal(false);

  isPasswordType = computed(() => this.type() === 'password');

  resolvedType = computed(() => {
    if (this.isPasswordType() && this.showPassword()) {
      return 'text';
    }
    return this.type();
  });

  get control(): AbstractControl | null {
    const formGroup = this.formGroupDirective.form as FormGroup;
    return formGroup.get(this.name());
  }

  get isSubmitted(): boolean {
    return this.formGroupDirective.submitted;
  }

  get shouldShowError(): boolean {
    const ctrl = this.control;
    if (!ctrl || !ctrl.errors) return false;

    const errorKeys = Object.keys(ctrl.errors);
    const hasOnlyRequired = errorKeys.length === 1 && errorKeys[0] === 'required';

    if (hasOnlyRequired) {
      return this.isSubmitted;
    }

    return ctrl.invalid && (ctrl.dirty || this.isSubmitted);
  }

  get errorMessage(): string | null {
    const ctrl = this.control;
    if (!ctrl || !ctrl.errors) return null;

    const errorKeys = Object.keys(ctrl.errors);

    for (const errorKey of errorKeys) {
      if (errorKey === 'required' && !this.isSubmitted) {
        continue;
      }
      const messageFn = ERROR_MESSAGES[errorKey];
      if (messageFn) {
        return messageFn(ctrl.errors[errorKey]);
      }
    }

    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }
}
