import {
  Component,
  ElementRef,
  HostListener,
  OnChanges,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ChevronDown, Check, Search, LucideAngularModule } from 'lucide-angular';

export interface SelectOption {
  value: string | number | null;
  label: string;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="relative w-full">
      <!-- Trigger -->
      <button
        type="button"
        (click)="toggle()"
        class="flex h-8 w-full items-center justify-between gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        [class.border-blue-400]="open()"
        [class.ring-1]="open()"
        [class.ring-blue-400]="open()"
      >
        <span [class.text-gray-400]="!selectedLabel()">
          {{ selectedLabel() || placeholder() }}
        </span>
        <lucide-icon [img]="ChevronDown" [size]="12" class="text-gray-400 shrink-0 transition-transform duration-150" [class.rotate-180]="open()" />
      </button>

      <!-- Dropdown -->
      @if (open()) {
        <div class="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <!-- Search input -->
          <div class="flex items-center gap-2 border-b border-gray-100 px-2.5 py-1.5">
            <lucide-icon [img]="Search" [size]="12" class="text-gray-400 shrink-0" />
            <input
              #searchInput
              type="text"
              [placeholder]="searchPlaceholder()"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
              class="w-full text-xs text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
              (click)="$event.stopPropagation()"
            />
          </div>
          <!-- Options -->
          <ul class="max-h-48 overflow-y-auto py-1">
            @for (opt of filtered(); track opt.value) {
              <li>
                <button
                  type="button"
                  (click)="select(opt)"
                  class="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  [class.text-blue-600]="opt.value === value()"
                  [class.font-medium]="opt.value === value()"
                >
                  <span class="flex-1 text-left">{{ opt.label }}</span>
                  @if (opt.value === value()) {
                    <lucide-icon [img]="Check" [size]="12" class="text-blue-600 shrink-0" />
                  }
                </button>
              </li>
            } @empty {
              <li class="px-3 py-2 text-xs text-gray-400 text-center">Aucun résultat</li>
            }
          </ul>
        </div>
      }
    </div>
  `,
})
export class SearchableSelectComponent implements OnChanges {
  readonly ChevronDown = ChevronDown;
  readonly Search = Search;
  readonly Check = Check;

  readonly options = input<SelectOption[]>([]);
  readonly value = input<string | number | null>(null);
  readonly placeholder = input('Sélectionner…');
  readonly searchPlaceholder = input('Rechercher…');
  readonly valueChange = output<string | number | null>();

  readonly open = signal(false);
  readonly query = signal('');

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  readonly selectedLabel = computed(() => {
    const v = this.value();
    if (v === null || v === undefined || v === '') return '';
    return this.options().find((o) => o.value === v)?.label ?? '';
  });

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    // reset query when options change
    this.query.set('');
  }

  toggle() {
    this.open.update((v) => !v);
    if (this.open()) this.query.set('');
  }

  select(opt: SelectOption) {
    const newVal = opt.value === this.value() ? null : opt.value;
    this.valueChange.emit(newVal);
    this.open.set(false);
    this.query.set('');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.open() && !this.el.nativeElement.contains(event.target)) {
      this.open.set(false);
      this.query.set('');
    }
  }
}
