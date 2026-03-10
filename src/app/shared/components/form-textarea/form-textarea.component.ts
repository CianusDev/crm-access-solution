import { LabelDirective } from '@/shared/directives/ui/label/label';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  booleanAttribute,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import {
  AbstractControl,
  ControlContainer,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';

const ERROR_MESSAGES: Record<string, (params?: Record<string, unknown>) => string> = {
  required: () => 'Ce champ est requis.',
  minlength: (p) => `Minimum ${p?.['requiredLength'] ?? ''} caractères requis.`,
  maxlength: (p) => `Maximum ${p?.['requiredLength'] ?? ''} caractères autorisés.`,
};

@Component({
  selector: 'app-form-textarea',
  imports: [LabelDirective, ReactiveFormsModule],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="flex flex-col gap-2">
      @if (label() !== null) {
        <label appLabel>
          {{ label() }}
          @if (required()) {
            <span class="text-destructive" aria-hidden="true">*</span>
          }
        </label>
      }
      <textarea
        [formControlName]="name()"
        [placeholder]="placeholder()"
        [rows]="rows()"
        [attr.aria-invalid]="shouldShowError"
        class="dark:bg-input/30 focus-visible:shadow-sm border-input focus-visible:border-primary focus-visible:ring-primary/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:bg-input/50 rounded-lg border bg-input/20 px-2.5 py-2 text-base transition-colors focus-visible:outline-none focus-visible:ring-[2px] min-w-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 resize-none md:text-sm w-full"
      ></textarea>
      @if (shouldShowError) {
        <span [id]="name() + '-error'" class="text-destructive text-sm" role="alert">
          {{ errorMessage }}
        </span>
      }
    </fieldset>
  `,
})
export class FormTextarea implements OnInit {
  private readonly formGroupDirective = inject(FormGroupDirective);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _tick = signal(0);

  label = input<string | null>(null);
  name = input<string>('');
  placeholder = input<string>('');
  rows = input<number>(4);
  required = input(false, { transform: booleanAttribute });

  ngOnInit(): void {
    const ctrl = this.control;
    if (!ctrl) return;
    merge(ctrl.statusChanges, this.formGroupDirective.ngSubmit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this._tick.update((n) => n + 1));
  }

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
}
