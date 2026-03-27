import { InputDirective } from '@/shared/directives/ui/input/input';
import { LabelDirective } from '@/shared/directives/ui/label/label';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnInit, booleanAttribute, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { merge } from 'rxjs';
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
export class FormInput implements OnInit {
  readonly icons = { Eye, EyeOff };

  private readonly formGroupDirective = inject(FormGroupDirective);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _tick = signal(0);

  label = input<string | null>(null);
  name = input<string>('');
  placeholder = input<string>('');
  type = input<InputType>('text');
  required = input(false, { transform: booleanAttribute });

  /** Pour number : valeur min/max */
  min = input<number | null>(null);
  max = input<number | null>(null);

  /** Pour number : pas (ex: 0.01 pour les décimales) */
  step = input<number | null>(null);

  /** Formatage milliers en temps réel (uniquement pour type="number") */
  format = input(false, { transform: booleanAttribute });

  readonly useNumberFormat = computed(() => this.type() === 'number' && this.format());

  private readonly numInputRef = viewChild<ElementRef<HTMLInputElement>>('numInput');
  private _isTyping = false;

  showPassword = signal(false);

  isPasswordType = computed(() => this.type() === 'password');

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
    void this._tick();
    const ctrl = this.control;
    if (!ctrl || !ctrl.errors) return false;
    const keys = Object.keys(ctrl.errors);
    if (keys.length === 1 && keys[0] === 'required') return this.isSubmitted;
    return ctrl.invalid && (ctrl.dirty || this.isSubmitted);
  }

  get errorMessage(): string | null {
    void this._tick();
    const ctrl = this.control;
    if (!ctrl || !ctrl.errors) return null;
    for (const key of Object.keys(ctrl.errors)) {
      if (key === 'required' && !this.isSubmitted) continue;
      const fn = ERROR_MESSAGES[key];
      if (fn) return fn(ctrl.errors[key]);
    }
    return null;
  }

  constructor() {
    // Initialise l'affichage formaté + écoute les changements programmatiques (patchValue, reset…)
    effect(() => {
      if (!this.useNumberFormat()) return;
      const el = this.numInputRef()?.nativeElement;
      if (!el) return;
      const ctrl = this.control;
      if (!ctrl) return;
      // N'écrase pas ce que l'utilisateur est en train de taper
      if (this._isTyping) return;
      const val = ctrl.value;
      el.value = val != null && val !== '' ? this.toDisplayValue(Number(val)) : '';
    });
  }

  ngOnInit(): void {
    const ctrl = this.control;
    if (!ctrl) return;
    merge(ctrl.statusChanges, this.formGroupDirective.ngSubmit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this._tick.update((n) => n + 1));

    if (this.useNumberFormat()) {
      ctrl.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((val) => {
          if (this._isTyping) return;
          const el = this.numInputRef()?.nativeElement;
          if (!el) return;
          el.value = val != null && val !== '' ? this.toDisplayValue(Number(val)) : '';
        });
    }
  }

  onNumberInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    const digits = el.value.replace(/[^\d]/g, '');
    const num = digits === '' ? null : Number(digits);
    const formatted = num != null ? this.toDisplayValue(num) : '';
    el.value = formatted;
    const len = formatted.length;
    el.setSelectionRange(len, len);
    this._isTyping = true;
    this.control?.setValue(num, { emitEvent: true });
    this._isTyping = false;
  }

  private toDisplayValue(n: number): string {
    if (isNaN(n)) return '';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }
}
