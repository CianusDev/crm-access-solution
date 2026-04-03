import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  ElementRef,
  HostListener,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { LabelDirective } from '@/shared/directives/ui/label/label';
import { LucideAngularModule, ChevronDown, Search, X, Check } from 'lucide-angular';
import {
  ReactiveFormsModule,
  ControlContainer,
  FormGroupDirective,
  FormGroup,
  AbstractControl,
} from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

const ERROR_MESSAGES: Record<string, (params?: Record<string, unknown>) => string> = {
  required: () => 'Ce champ est requis.',
};

@Component({
  selector: 'app-form-select',
  imports: [LabelDirective, ReactiveFormsModule, LucideAngularModule],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-select.component.html',
})
export class FormSelect implements OnInit {
  readonly icons = { ChevronDown, Search, X, Check };

  private el = inject(ElementRef);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private formGroupDirective = inject(FormGroupDirective);

  // ── Inputs ────────────────────────────────────────────────────────────────
  label = input<string | null>(null);
  name = input<string>('');
  placeholder = input<string>('Sélectionner…');
  options = input<any[]>([]);
  searchPlaceholder = input<string>('Rechercher…');
  required = input(false, { transform: booleanAttribute });
  loading = input(false, { transform: booleanAttribute });
  bindLabel = input<string>('label');
  bindValue = input<string>('value');

  // ── Outputs ───────────────────────────────────────────────────────────────
  change = output<any>();

  // ── State ─────────────────────────────────────────────────────────────────
  isOpen = signal(false);
  searchQuery = signal('');
  selectedValue = signal<string | number | null>(null);
  private readonly _tick = signal(0);

  ngOnInit() {
    const ctrl = this.control;
    if (!ctrl) return;

    this.selectedValue.set(ctrl.value ?? null);

    ctrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => {
        this.selectedValue.set(v ?? null);
        this.cdr.markForCheck();
      });

    merge(ctrl.statusChanges, this.formGroupDirective.ngSubmit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this._tick.update((n) => n + 1));
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  /** Convertit les options en SelectOption si bindLabel/bindValue sont fournis */
  normalizedOptions = computed(() => {
    const opts = this.options();
    const labelKey = this.bindLabel();
    const valueKey = this.bindValue();
    
    // Si déjà au bon format
    if (opts.length === 0 || (opts[0]?.label !== undefined && opts[0]?.value !== undefined)) {
      return opts as SelectOption[];
    }
    
    // Convertir en utilisant bindLabel et bindValue
    return opts.map(opt => ({
      value: opt[valueKey],
      label: opt[labelKey],
      disabled: opt.disabled ?? false
    }));
  });

  filteredOptions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.normalizedOptions();
    return this.normalizedOptions().filter((o) => o.label.toLowerCase().includes(q));
  });

  /** Label affiché dans le trigger — réactif grâce au signal selectedValue */
  selectedLabel = computed(() => {
    const v = this.selectedValue();
    if (v === null || v === '' || v === undefined) return null;
    return this.normalizedOptions().find((o) => o.value === v)?.label ?? null;
  });

  // ── Form helpers ──────────────────────────────────────────────────────────
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

  // ── Actions ───────────────────────────────────────────────────────────────
  toggle() {
    this.isOpen.update((v) => !v);
    if (this.isOpen()) this.searchQuery.set('');
  }

  select(option: SelectOption) {
    if (option.disabled) return;
    this.control?.setValue(option.value);
    this.control?.markAsDirty();
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.change.emit(option.value);
  }

  clear(event: Event) {
    event.stopPropagation();
    this.control?.setValue(null);
    this.control?.markAsDirty();
  }

  isSelected(option: SelectOption): boolean {
    return this.selectedValue() === option.value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.isOpen.set(false);
  }
}
