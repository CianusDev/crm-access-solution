import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { LabelDirective } from '@/shared/directives/ui/label/label';
import { LucideAngularModule, Check, Minus } from 'lucide-angular';
import {
  ReactiveFormsModule,
  ControlContainer,
  FormGroupDirective,
  FormGroup,
  AbstractControl,
} from '@angular/forms';

const ERROR_MESSAGES: Record<string, (params?: Record<string, unknown>) => string> = {
  required: () => 'Ce champ est requis.',
  requiredTrue: () => 'Vous devez cocher cette case.',
};

@Component({
  selector: 'app-form-checkbox',
  imports: [LabelDirective, ReactiveFormsModule, LucideAngularModule],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-checkbox.component.html',
})
export class FormCheckbox implements OnInit {
  readonly icons = { Check, Minus };

  private destroyRef = inject(DestroyRef);
  private formGroupDirective = inject(FormGroupDirective);

  // ── Inputs ────────────────────────────────────────────────────────────────
  label = input<string>('');
  description = input<string | null>(null);
  name = input<string>('');

  /**
   * Mode "indeterminate" : affiche un tiret au lieu d'une coche.
   * Utile pour les cases "Tout sélectionner".
   */
  indeterminate = input<boolean>(false);

  // ── State ─────────────────────────────────────────────────────────────────
  /** Signal synchronisé avec le FormControl pour réactivité OnPush */
  isChecked = signal<boolean>(false);
  private readonly _tick = signal(0);

  ngOnInit() {
    const ctrl = this.control;
    if (!ctrl) return;

    this.isChecked.set(!!ctrl.value);

    ctrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.isChecked.set(!!v));

    merge(ctrl.statusChanges, this.formGroupDirective.ngSubmit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this._tick.update((n) => n + 1));
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  isActive = computed(() => this.indeterminate() || this.isChecked());

  // ── Form helpers ──────────────────────────────────────────────────────────
  get control(): AbstractControl | null {
    return (this.formGroupDirective.form as FormGroup).get(this.name());
  }

  get isSubmitted(): boolean {
    return this.formGroupDirective.submitted;
  }

  get isDisabled(): boolean {
    return this.control?.disabled ?? false;
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

  // ── Actions ───────────────────────────────────────────────────────────────
  toggle() {
    if (this.isDisabled) return;
    const newValue = !this.control?.value;
    this.control?.setValue(newValue);
    this.control?.markAsDirty();
  }
}
