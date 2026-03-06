import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { DropdownAlign, DropdownItem } from './dropdown.interface';

@Component({
  selector: 'app-dropdown',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative inline-block',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  template: `
    <div #trigger (click)="toggle()" (keydown)="onTriggerKeydown($event)">
      <ng-content select="[dropdownTrigger]" />
    </div>

    @if (isOpen()) {
      <div #menu role="menu" [attr.aria-label]="ariaLabel()" [class]="menuClasses()">
        @for (item of items(); track item.label) {
          @if (item.separator) {
            <div role="separator" class="my-1 h-px bg-border"></div>
          } @else {
            <button
              type="button"
              role="menuitem"
              [attr.tabindex]="focusedIndex() === $index ? 0 : -1"
              [attr.aria-disabled]="item.disabled || null"
              [class]="itemClasses(item, $index)"
              (click)="onItemClick(item, $event)"
              (mouseenter)="focusedIndex.set($index)"
            >
              @if (item.icon) {
                <lucide-icon [img]="item.icon" size="16" aria-hidden="true" />
              }
              <span>{{ item.label }}</span>
            </button>
          }
        }
      </div>
    }
  `,
})
export class Dropdown {
  readonly items = input.required<DropdownItem[]>();
  readonly align = input<DropdownAlign>('end');
  readonly ariaLabel = input('Menu');

  readonly closed = output<void>();
  readonly opened = output<void>();
  readonly itemSelected = output<DropdownItem>();

  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly menuRef = viewChild<ElementRef<HTMLElement>>('menu');

  readonly isOpen = signal(false);
  readonly focusedIndex = signal(-1);

  readonly menuClasses = computed(() => {
    const base =
      'absolute z-50 mt-1 min-w-48 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95';
    const alignment = this.align() === 'start' ? 'left-0' : 'right-0';
    return `${base} ${alignment}`;
  });

  itemClasses(item: DropdownItem, index: number): string {
    const base =
      'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors';
    const focused = this.focusedIndex() === index ? 'bg-accent text-accent-foreground' : '';
    const disabled = item.disabled ? 'pointer-events-none opacity-50' : '';
    return `${base} ${focused} ${disabled}`.trim();
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.isOpen.set(true);
    this.focusedIndex.set(-1);
    this.opened.emit();
  }

  close(): void {
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
    this.closed.emit();
  }

  onItemClick(item: DropdownItem, event: MouseEvent): void {
    event.stopPropagation();
    if (item.disabled) return;

    this.itemSelected.emit(item);
    item.action?.();
    this.close();
  }

  onDocumentClick(event: Event): void {
    const target = event.target as Node;
    const triggerEl = this.triggerRef()?.nativeElement;
    const menuEl = this.menuRef()?.nativeElement;

    if (triggerEl?.contains(target) || menuEl?.contains(target)) return;

    if (this.isOpen()) {
      this.close();
    }
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (!this.isOpen()) {
        this.open();
        this.focusedIndex.set(this.findNextEnabledIndex(-1));
      }
    }
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        (
          this.triggerRef()?.nativeElement.querySelector('button, [tabindex]') as HTMLElement | null
        )?.focus();
        break;

      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex.set(this.findNextEnabledIndex(this.focusedIndex()));
        this.focusCurrentItem();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex.set(this.findPrevEnabledIndex(this.focusedIndex()));
        this.focusCurrentItem();
        break;

      case 'Home':
        event.preventDefault();
        this.focusedIndex.set(this.findNextEnabledIndex(-1));
        this.focusCurrentItem();
        break;

      case 'End':
        event.preventDefault();
        this.focusedIndex.set(this.findPrevEnabledIndex(this.items().length));
        this.focusCurrentItem();
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        {
          const idx = this.focusedIndex();
          const items = this.items();
          if (idx >= 0 && idx < items.length && !items[idx].disabled) {
            this.itemSelected.emit(items[idx]);
            items[idx].action?.();
            this.close();
          }
        }
        break;

      case 'Tab':
        this.close();
        break;
    }
  }

  private findNextEnabledIndex(currentIndex: number): number {
    const items = this.items();
    for (let i = currentIndex + 1; i < items.length; i++) {
      if (!items[i].disabled) return i;
    }
    // Wrap around
    for (let i = 0; i <= currentIndex; i++) {
      if (!items[i].disabled) return i;
    }
    return -1;
  }

  private findPrevEnabledIndex(currentIndex: number): number {
    const items = this.items();
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!items[i].disabled) return i;
    }
    // Wrap around
    for (let i = items.length - 1; i >= currentIndex; i--) {
      if (!items[i].disabled) return i;
    }
    return -1;
  }

  private focusCurrentItem(): void {
    const idx = this.focusedIndex();
    if (idx < 0) return;

    requestAnimationFrame(() => {
      const menuEl = this.menuRef()?.nativeElement;
      const buttons = menuEl?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
      buttons?.[idx]?.focus();
    });
  }
}
