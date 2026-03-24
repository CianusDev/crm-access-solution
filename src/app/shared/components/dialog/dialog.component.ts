import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

/**
 * Composant Dialog shadcn-ui like.
 *
 * Usage :
 *   <app-dialog [(open)]="isOpen">
 *     <app-dialog-header>
 *       <app-dialog-title>Titre</app-dialog-title>
 *       <app-dialog-description>Description</app-dialog-description>
 *     </app-dialog-header>
 *     <app-dialog-content>Contenu</app-dialog-content>
 *     <app-dialog-footer>
 *       <button (click)="isOpen = false">Annuler</button>
 *       <button (click)="confirm()">Confirmer</button>
 *     </app-dialog-footer>
 *   </app-dialog>
 */

// ─── Dialog Title ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-dialog-title',
  standalone: true,
  template: `
    <h2 class="text-lg font-semibold leading-none tracking-tight text-zinc-900">
      <ng-content />
    </h2>
  `,
})
export class DialogTitleComponent {}

// ─── Dialog Description ───────────────────────────────────────────────────────
@Component({
  selector: 'app-dialog-description',
  standalone: true,
  template: `
    <p class="text-sm text-zinc-500">
      <ng-content />
    </p>
  `,
})
export class DialogDescriptionComponent {}

// ─── Dialog Header ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-dialog-header',
  standalone: true,
  template: `
    <div class="flex flex-col space-y-1.5 text-center sm:text-left">
      <ng-content />
    </div>
  `,
})
export class DialogHeaderComponent {}

// ─── Dialog Footer ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-dialog-footer',
  standalone: true,
  template: `
    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <ng-content />
    </div>
  `,
})
export class DialogFooterComponent {}

// ─── Dialog Content ───────────────────────────────────────────────────────────
@Component({
  selector: 'app-dialog-content',
  standalone: true,
  template: `
    <div class="py-2 text-sm text-zinc-700">
      <ng-content />
    </div>
  `,
})
export class DialogContentComponent {}

// ─── Dialog (wrapper principal) ───────────────────────────────────────────────
@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (open) {
      <!-- Overlay -->
      <div
        class="fixed inset-0 z-50 bg-black/20 animate-in fade-in-0"
        (click)="onOverlayClick()"
        aria-hidden="true"
      ></div>

      <!-- Panel -->
      <div
        role="dialog"
        aria-modal="true"
        class="fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-lg border border-zinc-200 bg-background p-6 shadow-lg
               animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-48"
        [ngClass]="classContainer || 'max-w-xl'"
      >
        <!-- Bouton fermer -->
        <button
          (click)="close()"
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 cursor-pointer"
          aria-label="Fermer"
        >
          <lucide-icon [img]="XIcon" [size]="16" />
        </button>

        <!-- Contenu projeté -->
        <div class="flex flex-col gap-4">
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class DialogComponent {
  @Input() open = false;
  @Input() classContainer = '';
  @Output() openChange = new EventEmitter<boolean>();

  /** Fermer en cliquant sur l'overlay */
  @Input() closeOnOverlay = true;

  readonly XIcon = X;

  close() {
    this.open = false;
    this.openChange.emit(false);
  }

  onOverlayClick() {
    if (this.closeOnOverlay) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.open) {
      this.close();
    }
  }
}
