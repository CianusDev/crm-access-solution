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
import { LabelDirective } from '@/shared/directives/ui/label/label';
import { LucideAngularModule } from 'lucide-angular';
import {
  ReactiveFormsModule,
  ControlContainer,
  FormGroupDirective,
  FormGroup,
  AbstractControl,
} from '@angular/forms';

export interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

export type RadioGroupOrientation = 'vertical' | 'horizontal';

const ERROR_MESSAGES: Record<string, (params?: Record<string, unknown>) => string> = {
  required: () => 'Veuillez sélectionner une option.',
};

@Component({
  selector: 'app-form-radio-group',
  imports: [LabelDirective, ReactiveFormsModule, LucideAngularModule],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-radio-group.component.html',
})
export class FormRadioGroup implements OnInit {
  private destroyRef = inject(DestroyRef);
  private formGroupDirective = inject(FormGroupDirective);

  // ── Inputs ────────────────────────────────────────────────────────────────
  label = input<string | null>(null);
  name = input<string>('');
  options = input<RadioOption[]>([]);
  orientation = input<RadioGroupOrientation>('vertical');

  // ── State ─────────────────────────────────────────────────────────────────
  /** Signal synchronisé avec le FormControl pour réactivité OnPush */
  selectedValue = signal<string | number | null>(null);

  ngOnInit() {
    const ctrl = this.control;
    if (!ctrl) return;

    this.selectedValue.set(ctrl.value ?? null);

    ctrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.selectedValue.set(v ?? null));
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  containerClass = computed(() =>
    this.orientation() === 'horizontal' ? 'flex flex-row flex-wrap gap-4' : 'flex flex-col gap-2',
  );

  // ── Form helpers ──────────────────────────────────────────────────────────
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

  // ── Actions ───────────────────────────────────────────────────────────────
  select(option: RadioOption) {
    if (option.disabled) return;
    this.control?.setValue(option.value);
    this.control?.markAsDirty();
  }

  isSelected(option: RadioOption): boolean {
    return this.selectedValue() === option.value;
  }

  trackById(_: number, option: RadioOption) {
    return option.value;
  }
}
