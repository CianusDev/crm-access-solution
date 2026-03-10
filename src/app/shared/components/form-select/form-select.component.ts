import {
  ChangeDetectionStrategy,
  Component,
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
  private formGroupDirective = inject(FormGroupDirective);

  // ── Inputs ────────────────────────────────────────────────────────────────
  label = input<string | null>(null);
  name = input<string>('');
  placeholder = input<string>('Sélectionner…');
  options = input<SelectOption[]>([]);
  searchPlaceholder = input<string>('Rechercher…');

  // ── State ─────────────────────────────────────────────────────────────────
  isOpen = signal(false);
  searchQuery = signal('');

  /**
   * Signal alimenté par valueChanges du FormControl.
   * Nécessaire avec OnPush : un simple getter ne déclenche pas la détection
   * de changement — le signal si.
   */
  selectedValue = signal<string | number | null>(null);

  ngOnInit() {
    const ctrl = this.control;
    if (!ctrl) return;

    // Valeur initiale (ex: formulaire pré-rempli)
    this.selectedValue.set(ctrl.value ?? null);

    // Synchronisation à chaque changement du FormControl
    ctrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.selectedValue.set(v ?? null));
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  filteredOptions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  /** Label affiché dans le trigger — réactif grâce au signal selectedValue */
  selectedLabel = computed(() => {
    const v = this.selectedValue();
    if (v === null || v === '' || v === undefined) return null;
    return this.options().find((o) => o.value === v)?.label ?? null;
  });

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
