import { Component, effect, HostListener, input, OnDestroy, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';

// ─── DrawerTitle ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-drawer-title',
  standalone: true,
  template: `<h2 class="text-sm font-semibold text-foreground"><ng-content /></h2>`,
})
export class DrawerTitleComponent {}

// ─── DrawerHeader ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-drawer-header',
  standalone: true,
  template: `
    <div class="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
      <ng-content />
    </div>
  `,
})
export class DrawerHeaderComponent {}

// ─── DrawerContent ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-drawer-content',
  standalone: true,
  host: { class: 'flex-1 min-h-0 overflow-y-auto block' },
  template: `<div class="px-5 py-4"><ng-content /></div>`,
})
export class DrawerContentComponent {}

// ─── DrawerFooter ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-drawer-footer',
  standalone: true,
  template: `
    <div class="shrink-0 border-t border-border px-5 py-3">
      <ng-content />
    </div>
  `,
})
export class DrawerFooterComponent {}

// ─── Drawer ───────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [NgClass, LucideAngularModule],
  template: `
    @if (visible()) {
      <!-- Overlay -->
      <div
        class="fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ease-in-out"
        [style.opacity]="opened() ? '1' : '0'"
        (click)="onOverlayClick()"
        aria-hidden="true"
      ></div>

      <!-- Panel -->
      <aside
        role="dialog"
        aria-modal="true"
        class="fixed top-0 z-50 flex h-full w-full flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out"
        [class.right-0]="side() === 'right'"
        [class.left-0]="side() === 'left'"
        [class.border-l]="side() === 'right'"
        [class.border-r]="side() === 'left'"
        [class.border-border]="true"
        [style.transform]="panelTransform()"
        [ngClass]="panelClass() || 'max-w-md'"
      >
        <!-- Close button -->
        <button
          type="button"
          (click)="close()"
          class="absolute right-4 top-4 z-10 rounded-sm p-1 opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Fermer"
        >
          <lucide-icon [img]="XIcon" [size]="16" />
        </button>

        <ng-content />
      </aside>
    }
  `,
})
export class DrawerComponent implements OnDestroy {
  readonly open = input<boolean>(false);
  readonly side = input<'right' | 'left'>('right');
  readonly panelClass = input<string>('');
  readonly closeOnOverlay = input<boolean>(true);
  readonly openChange = output<boolean>();

  readonly visible = signal(false);
  readonly opened = signal(false);

  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  readonly XIcon = X;

  readonly panelTransform = () =>
    this.opened() ? 'translateX(0)' : this.side() === 'left' ? 'translateX(-100%)' : 'translateX(100%)';

  constructor() {
    effect(() => {
      const isOpen = this.open();

      if (isOpen) {
        if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }
        this.visible.set(true);
        this.openTimer = setTimeout(() => {
          this.opened.set(true);
          this.openTimer = null;
        }, 10);
      } else if (this.visible()) {
        this.opened.set(false);
        this.closeTimer = setTimeout(() => {
          this.visible.set(false);
          this.closeTimer = null;
        }, 300);
      }
    });
  }

  ngOnDestroy() {
    if (this.openTimer) clearTimeout(this.openTimer);
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }

  close() {
    this.openChange.emit(false);
  }

  onOverlayClick() {
    if (this.closeOnOverlay()) this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.open()) this.close();
  }
}
