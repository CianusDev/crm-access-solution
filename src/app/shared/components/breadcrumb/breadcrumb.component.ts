import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronRight, Home, MoreHorizontal } from 'lucide-angular';
import { BreadcrumbItem } from './breadcrumb.interface';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  providers: [],
  template: `
    <nav aria-label="Breadcrumb">
      <ol
        class="flex flex-wrap items-center gap-1.5 wrap-break-words text-sm text-zinc-500 sm:gap-2.5"
      >
        @for (item of visibleItems(); track item.label; let i = $index; let last = $last) {
          <!-- Separator (sauf avant le premier) -->
          @if (i > 0) {
            <li role="presentation" aria-hidden="true" class="flex items-center">
              <lucide-icon [img]="ChevronRightIcon" [size]="14" class="text-zinc-400" />
            </li>
          }

          <!-- Ellipsis si tronqué -->
          @if (item.label === '__ellipsis__') {
            <li>
              <button
                (click)="expand()"
                class="flex items-center gap-1 rounded px-1 py-0.5 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                aria-label="Afficher tout le chemin"
              >
                <lucide-icon [img]="MoreHorizontal" [size]="16" />
              </button>
            </li>
          } @else {
            <li class="flex items-center">
              @if (!last && 'link' in item && item.link) {
                <!-- Lien cliquable -->
                <a
                  [routerLink]="item.link"
                  class="flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-zinc-100 hover:text-zinc-700 font-medium"
                >
                  @if ('icon' in item && item.icon) {
                    <lucide-icon [img]="item.icon" [size]="14" />
                  }
                  {{ item.label }}
                </a>
              } @else {
                <!-- Élément courant (dernier) -->
                <span
                  class="flex items-center gap-1.5 px-1 py-0.5 font-medium text-zinc-900"
                  aria-current="page"
                >
                  <!-- @if ('icon' in item && item.icon) {
                    <lucide-icon [img]="item.icon" [size]="14" />
                  } -->
                  {{ item.label }}
                </span>
              }
            </li>
          }
        }
      </ol>
    </nav>
  `,
})
export class Breadcrumb {
  /** Liste des éléments du fil d'Ariane */
  @Input({ required: true }) items: BreadcrumbItem[] = [];

  /** Nb max d'items visibles avant ellipsis (0 = tous affichés) */
  @Input() maxItems: number = 0;

  expanded = false;

  readonly ChevronRight = ChevronRight;
  readonly Home = Home;
  readonly MoreHorizontal = MoreHorizontal;
  readonly ChevronRightIcon = ChevronRight;

  expand() {
    this.expanded = true;
  }

  visibleItems(): (BreadcrumbItem | { label: '__ellipsis__' })[] {
    const { items, maxItems, expanded } = this;

    if (!maxItems || expanded || items.length <= maxItems) {
      return items;
    }

    // Toujours garder le premier et le dernier, ellipsis au milieu
    return [
      items[0],
      { label: '__ellipsis__' as const },
      ...items.slice(items.length - (maxItems - 2)),
    ];
  }
}
