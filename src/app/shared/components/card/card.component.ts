import { Component } from '@angular/core';

/**
 * Composant Card shadcn-ui like.
 *
 * Sous-composants disponibles :
 *   <app-card>
 *     <app-card-header>
 *       <app-card-title>Titre</app-card-title>
 *       <app-card-description>Description</app-card-description>
 *     </app-card-header>
 *     <app-card-content>Contenu</app-card-content>
 *     <app-card-footer>Footer</app-card-footer>
 *   </app-card>
 */

// ─── Card (wrapper) ───────────────────────────────────────────────────────────
@Component({
  selector: 'app-card',
  standalone: true,
  host: {
    class: 'block rounded-md border border-border bg-background',
  },
  template: `<ng-content />`,
})
export class CardComponent {}

// ─── Card Header ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-card-header',
  standalone: true,
  template: `
    <div class="flex flex-col space-y-1.5 p-6">
      <ng-content />
    </div>
  `,
})
export class CardHeaderComponent {}

// ─── Card Title ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-card-title',
  standalone: true,
  template: `
    <h3 class="font-semibold leading-none tracking-tight">
      <ng-content />
    </h3>
  `,
})
export class CardTitleComponent {}

// ─── Card Description ────────────────────────────────────────────────────────
@Component({
  selector: 'app-card-description',
  standalone: true,
  template: `
    <p class="text-sm text-muted-foreground">
      <ng-content />
    </p>
  `,
})
export class CardDescriptionComponent {}

// ─── Card Content ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-card-content',
  standalone: true,
  host: { class: 'block p-6 pt-0! flex flex-col gap-6' },
  template: `<ng-content />`,
})
export class CardContentComponent {}

// ─── Card Footer ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-card-footer',
  standalone: true,
  template: `
    <div class="flex items-center p-6">
      <ng-content />
    </div>
  `,
})
export class CardFooterComponent {}
