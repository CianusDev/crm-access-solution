import { LabelDirective } from '@/shared/directives/ui/label/label';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  booleanAttribute,
  inject,
  input,
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
import { QuillEditorComponent } from 'ngx-quill';

const ERROR_MESSAGES: Record<string, (params?: Record<string, unknown>) => string> = {
  required: () => 'Ce champ est requis.',
  minlength: (p) => `Minimum ${p?.['requiredLength'] ?? ''} caractères requis.`,
  maxlength: (p) => `Maximum ${p?.['requiredLength'] ?? ''} caractères autorisés.`,
};

@Component({
  selector: 'app-form-rich-textarea',
  imports: [LabelDirective, ReactiveFormsModule, QuillEditorComponent],
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
      <quill-editor
        [formControlName]="name()"
        [placeholder]="placeholder()"
        [styles]="editorStyles"
        class="block w-full rounded-xl border-2 overflow-hidden"
        [class.border-border]="!shouldShowError"
        [class.border-destructive]="shouldShowError"
      >
        <div quill-editor-toolbar>
          <span class="ql-formats">
            <button class="ql-bold" title="Gras"></button>
            <button class="ql-italic" title="Italique"></button>
            <button class="ql-underline" title="Souligné"></button>
          </span>
          <span class="ql-formats">
            <select class="ql-align" title="Alignement">
              <option selected></option>
              <option value="center"></option>
              <option value="right"></option>
              <option value="justify"></option>
            </select>
          </span>
          <span class="ql-formats">
            <button class="ql-list" value="ordered" type="button"></button>
          </span>
        </div>
      </quill-editor>
      @if (shouldShowError) {
        <span class="text-destructive text-sm" role="alert">{{ errorMessage }}</span>
      }
    </fieldset>
  `,
})
export class FormRichTextarea implements OnInit {
  private readonly formGroupDirective = inject(FormGroupDirective);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  label = input<string | null>(null);
  name = input<string>('');
  placeholder = input<string>('Insert text here ...');
  required = input(false, { transform: booleanAttribute });

  readonly editorStyles = {
    'min-height': '100px',
    'font-size': '0.875rem',
    'font-family': 'inherit',
  };

  private _submitted = false;

  ngOnInit(): void {
    const ctrl = this.control;
    if (!ctrl) return;
    merge(ctrl.statusChanges, this.formGroupDirective.ngSubmit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this._submitted = this.formGroupDirective.submitted;
        this.cdr.markForCheck();
      });
  }

  get control(): AbstractControl | null {
    return (this.formGroupDirective.form as FormGroup).get(this.name());
  }

  get shouldShowError(): boolean {
    const ctrl = this.control;
    if (!ctrl || !ctrl.errors) return false;
    const keys = Object.keys(ctrl.errors);
    if (keys.length === 1 && keys[0] === 'required') return this._submitted;
    return ctrl.invalid && (ctrl.dirty || this._submitted);
  }

  get errorMessage(): string | null {
    const ctrl = this.control;
    if (!ctrl || !ctrl.errors) return null;
    for (const key of Object.keys(ctrl.errors)) {
      if (key === 'required' && !this._submitted) continue;
      const fn = ERROR_MESSAGES[key];
      if (fn) return fn(ctrl.errors[key]);
    }
    return null;
  }
}
