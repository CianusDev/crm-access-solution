import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { ChevronLeft, ChevronRight, LucideAngularModule, MoreHorizontal } from 'lucide-angular';

/**
 * Composant Pagination shadcn-ui like.
 *
 * Usage :
 *   <app-pagination
 *     [total]="200"
 *     [pageSize]="10"
 *     [currentPage]="page"
 *     (pageChange)="page = $event"
 *   />
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <nav role="navigation" aria-label="Pagination" class="flex items-center justify-center">
      <ul class="flex flex-row items-center gap-1">
        <!-- Précédent -->
        <li>
          <button
            (click)="goTo(currentPage - 1)"
            [disabled]="currentPage === 1"
            class="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-zinc-200 bg-background px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Page précédente"
          >
            <lucide-icon [img]="ChevronLeftIcon" [size]="16" />
            <span class="hidden sm:inline">Précédent</span>
          </button>
        </li>

        <!-- Pages -->
        @for (page of pages(); track page) {
          <li>
            @if (page === ELLIPSIS) {
              <!-- Ellipsis -->
              <span
                class="inline-flex h-9 w-9 items-center justify-center text-sm text-zinc-500"
                aria-hidden="true"
              >
                <lucide-icon [img]="MoreHorizontalIcon" [size]="16" />
              </span>
            } @else {
              <!-- Numéro de page -->
              <button
                (click)="goTo(+page)"
                [attr.aria-current]="currentPage === +page ? 'page' : null"
                class="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                [class]="
                  currentPage === +page
                    ? 'bg-primary text-background hover:bg-primary/80'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                "
              >
                {{ page }}
              </button>
            }
          </li>
        }

        <!-- Suivant -->
        <li>
          <button
            (click)="goTo(currentPage + 1)"
            [disabled]="currentPage === totalPages()"
            class="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-50"
            aria-label="Page suivante"
          >
            <span class="hidden sm:inline">Suivant</span>
            <lucide-icon [img]="ChevronRightIcon" [size]="16" />
          </button>
        </li>
      </ul>
    </nav>
  `,
})
export class PaginationComponent implements OnChanges {
  /** Nombre total d'éléments */
  @Input({ required: true }) total!: number;

  /** Nombre d'éléments par page */
  @Input() pageSize = 10;

  /** Page courante (1-indexed) */
  @Input() currentPage = 1;

  /** Nb de pages visibles autour de la page courante */
  @Input() siblingCount = 1;

  @Output() pageChange = new EventEmitter<number>();

  readonly ELLIPSIS = '...';
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly MoreHorizontalIcon = MoreHorizontal;

  totalPages = signal(1);
  pages = signal<(number | string)[]>([]);

  ngOnChanges() {
    const tp = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.totalPages.set(tp);
    this.pages.set(this.buildPages(this.currentPage, tp));
  }

  goTo(page: number) {
    const tp = this.totalPages();
    if (page < 1 || page > tp || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  private buildPages(current: number, total: number): (number | string)[] {
    const siblings = this.siblingCount;

    // Tout afficher si peu de pages
    if (total <= 5 + siblings * 2) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(current - siblings, 1);
    const rightSibling = Math.min(current + siblings, total);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < total - 1;

    if (!showLeftDots && showRightDots) {
      const leftRange = Array.from({ length: 3 + siblings * 2 }, (_, i) => i + 1);
      return [...leftRange, this.ELLIPSIS, total];
    }

    if (showLeftDots && !showRightDots) {
      const rightRange = Array.from(
        { length: 3 + siblings * 2 },
        (_, i) => total - (3 + siblings * 2) + i + 1,
      );
      return [1, this.ELLIPSIS, ...rightRange];
    }

    const middleRange = Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, i) => leftSibling + i,
    );
    return [1, this.ELLIPSIS, ...middleRange, this.ELLIPSIS, total];
  }
}
