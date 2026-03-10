import { Directive, HostBinding, Input, Component } from '@angular/core';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

/**
 * Select shadcn-ui like — directive + wrapper avec icône flèche.
 *
 * Usage :
 *   <app-select-field>
 *     <select appSelect [(ngModel)]="value">
 *       <option value="a">Option A</option>
 *     </select>
 *   </app-select-field>
 *
 *   <app-select-field [error]="true">
 *     <select appSelect formControlName="role">...</select>
 *   </app-select-field>
 */

export type SelectVariant = 'default' | 'outline';

// ─── Directive (styles natifs sur <select>) ───────────────────────────────────
@Directive({
  selector: 'select[appSelect]',
  standalone: true,
})
export class SelectDirective {
  @Input() variant: SelectVariant = 'default';
  @Input() error = false;

  private readonly base =
    'flex h-9 w-full appearance-none rounded-md border focus-visible:ring-ring bg-background pl-3 pr-8 py-1 text-sm transition-colors focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer';

  private readonly variants: Record<SelectVariant, string> = {
    default: 'border-zinc-200 text-zinc-900 focus:ring-zinc-950',
    outline: 'border-zinc-400 text-zinc-900 focus:ring-zinc-950',
  };

  private readonly errorClasses = 'border-red-500 focus:ring-red-500 text-red-600';

  @HostBinding('class')
  get classes(): string {
    return [this.base, this.error ? this.errorClasses : this.variants[this.variant]].join(' ');
  }
}

// ─── Wrapper avec icône ChevronDown ───────────────────────────────────────────
@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="relative w-full">
      <!-- <select appSelect> projeté ici -->
      <ng-content />

      <!-- Icône flèche — pointer-events-none pour ne pas bloquer le clic natif -->
      <lucide-icon
        [img]="ChevronDownIcon"
        [size]="15"
        [strokeWidth]="2"
        class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
      />
    </div>
  `,
})
export class SelectFieldComponent {
  readonly ChevronDownIcon = ChevronDown;
}
