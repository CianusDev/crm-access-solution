import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { LucideAngularModule, LoaderCircle } from 'lucide-angular';
import { buttonVariants, ButtonVariant, ButtonSize } from '@/shared/directives/ui/button/button';

@Component({
  selector: 'button[appLoadingButton], a[appLoadingButton]',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.disabled]': 'isDisabled()',
    '[attr.aria-busy]': 'loading()',
    '[attr.aria-disabled]': 'isDisabled()',
  },
  template: `
    @if (loading()) {
      <lucide-icon [img]="icons.LoaderCircle" size="16" class="animate-spin" aria-hidden="true" />
    }
    @if (loading() && loadingText()) {
      <span>{{ loadingText() }}</span>
    } @else {
      <span class="inline-flex items-center gap-2" [class.sr-only]="loading()">
        <ng-content />
      </span>
    }
  `,
  providers: [
    {
      provide: 'icons',
      useValue: { LoaderCircle },
    },
  ],
})
export class ButtonComponent {
  readonly icons = { LoaderCircle };

  variant = input<ButtonVariant>('default');
  size = input<ButtonSize>('default');
  disabled = input(false, { transform: booleanAttribute });
  loading = input(false, { transform: booleanAttribute });
  loadingText = input<string | null>(null);

  isDisabled = computed(() => (this.disabled() || this.loading() ? true : null));

  hostClasses = computed(() => buttonVariants({ variant: this.variant(), size: this.size() }));
}
