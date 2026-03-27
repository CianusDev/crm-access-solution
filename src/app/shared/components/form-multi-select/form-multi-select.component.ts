import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
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

export interface MultiSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

const ERROR_MESSAGES: Record<string, (params?: Record<string, unknown>) => string> = {
  required: () => 'Ce champ est requis.',
};

@Component({
  selector: 'app-form-multi-select',
  imports: [LabelDirective, ReactiveFormsModule, LucideAngularModule],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-multi-select.component.html',
})
export class FormMultiSelect implements OnInit {
  readonly icons = { ChevronDown, Search, X, Check };

  private el = inject(ElementRef);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private formGroupDirective = inject(FormGroupDirective);

  // ── Inputs ────────────────────────────────────────────────────────────────
  label = input<string | null>(null);
  name = input<string>('');
  placeholder = input<string>('Sélectionner…');
  options = input<MultiSelectOption[]>([]);
  searchPlaceholder = input<string>('Rechercher…');
  required = input(false, { transform: booleanAttribute });

  // ── State ─────────────────────────────────────────────────────────────────
  isOpen = signal(false);
  searchQuery = signal('');
  selectedValues = signal<(string | number)[]>([]);
  private readonly _tick = signal(0);

  ngOnInit() {
    const ctrl = this.control;
    if (!ctrl) return;

    // Initialise depuis la valeur actuelle du contrôle
    const initial = ctrl.value;
    this.selectedValues.set(Array.isArray(initial) ? initial : []);

    ctrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => {
        this.selectedValues.set(Array.isArray(v) ? v : []);
        this.cdr.markForCheck();
      });

    merge(ctrl.statusChanges, this.formGroupDirective.ngSubmit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this._tick.update((n) => n + 1));
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  filteredOptions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  /** Labels des éléments sélectionnés */
  selectedLabels = computed(() => {
    const vals = this.selectedValues();
    return this.options()
      .filter((o) => vals.includes(o.value))
      .map((o) => o.label);
  });

  /** Éléments sélectionnés avec value + label (pour les badges) */
  selectedItems = computed(() => {
    const vals = this.selectedValues();
    return this.options().filter((o) => vals.includes(o.value));
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

  isSelected(option: MultiSelectOption): boolean {
    return this.selectedValues().includes(option.value);
  }

  select(option: MultiSelectOption) {
    if (option.disabled) return;
    const current = [...this.selectedValues()];
    const idx = current.indexOf(option.value);
    if (idx === -1) {
      current.push(option.value);
    } else {
      current.splice(idx, 1);
    }
    this.control?.setValue(current);
    this.control?.markAsDirty();
  }

  removeOne(value: string | number, event: Event) {
    event.stopPropagation();
    const current = this.selectedValues().filter((v) => v !== value);
    this.control?.setValue(current);
    this.control?.markAsDirty();
  }

  clearAll(event: Event) {
    event.stopPropagation();
    this.control?.setValue([]);
    this.control?.markAsDirty();
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
