import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant Badge shadcn-ui like.
 *
 * Variantes : default | secondary | destructive | outline | success | warning
 *
 * Usage :
 *   <app-badge>Default</app-badge>
 *   <app-badge variant="secondary">Secondary</app-badge>
 *   <app-badge variant="destructive">Erreur</app-badge>
 *   <app-badge variant="outline">Outline</app-badge>
 *   <app-badge variant="success">Succès</app-badge>
 *   <app-badge variant="warning">Attention</app-badge>
 */

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
      [class]="variantClasses[variant]"
    >
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';

  readonly variantClasses: Record<BadgeVariant, string> = {
    default: 'border-transparent bg-blue-500 text-background hover:bg-blue-600',
    secondary: 'border-transparent bg-secondary hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-background hover:bg-destructive/60',
    outline: 'border-zinc-300 text-zinc-700 bg-transparent hover:bg-zinc-50',
    success: 'border-transparent bg-green-100 text-green-700 hover:bg-green-200',
    warning: 'border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  };
}
