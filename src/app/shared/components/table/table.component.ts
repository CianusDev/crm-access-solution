import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant Table shadcn-ui like.
 *
 * Usage :
 *   <app-table>
 *     <app-table-header>
 *       <app-table-row>
 *         <app-table-head>Nom</app-table-head>
 *         <app-table-head>Email</app-table-head>
 *       </app-table-row>
 *     </app-table-header>
 *     <app-table-body>
 *       <app-table-row>
 *         <app-table-cell>John Doe</app-table-cell>
 *         <app-table-cell>john@example.com</app-table-cell>
 *       </app-table-row>
 *     </app-table-body>
 *     <app-table-footer>
 *       <app-table-row>
 *         <app-table-cell>Total</app-table-cell>
 *         <app-table-cell>100</app-table-cell>
 *       </app-table-row>
 *     </app-table-footer>
 *   </app-table>
 */

// ─── Table (wrapper avec scroll horizontal) ───────────────────────────────────
@Component({
  selector: 'app-table',
  standalone: true,
  template: `
    <div class="relative w-full overflow-auto rounded-md border border-zinc-200">
      <table class="w-full caption-bottom text-sm">
        <ng-content />
      </table>
    </div>
  `,
})
export class TableComponent {}

// ─── Table Caption ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-table-caption',
  standalone: true,
  template: `
    <caption class="mt-4 text-sm text-zinc-500">
      <ng-content />
    </caption>
  `,
})
export class TableCaptionComponent {}

// ─── Table Header (<thead>) ───────────────────────────────────────────────────
@Component({
  selector: 'app-table-header',
  standalone: true,
  template: `
    <thead class="[&_tr]:border-b [&_tr]:border-zinc-200">
      <ng-content />
    </thead>
  `,
})
export class TableHeaderComponent {}

// ─── Table Body (<tbody>) ─────────────────────────────────────────────────────
@Component({
  selector: 'app-table-body',
  standalone: true,
  template: `
    <tbody class="[&_tr:last-child]:border-0">
      <ng-content />
    </tbody>
  `,
})
export class TableBodyComponent {}

// ─── Table Footer (<tfoot>) ───────────────────────────────────────────────────
@Component({
  selector: 'app-table-footer',
  standalone: true,
  template: `
    <tfoot class="border-t border-zinc-200 bg-zinc-50 font-medium [&>tr]:last:border-b-0">
      <ng-content />
    </tfoot>
  `,
})
export class TableFooterComponent {}

// ─── Table Row (<tr>) ─────────────────────────────────────────────────────────
@Component({
  selector: 'app-table-row',
  standalone: true,
  template: `
    <tr
      class="border-b border-zinc-200 transition-colors hover:bg-zinc-50 data-[state=selected]:bg-zinc-100"
    >
      <ng-content />
    </tr>
  `,
})
export class TableRowComponent {}

// ─── Table Head (<th>) ────────────────────────────────────────────────────────
@Component({
  selector: 'app-table-head',
  standalone: true,
  imports: [CommonModule],
  template: `
    <th
      class="h-10 px-4 text-left align-middle font-medium text-zinc-500 [&:has([role=checkbox])]:pr-0"
      [class.text-right]="align === 'right'"
      [class.text-center]="align === 'center'"
    >
      <ng-content />
    </th>
  `,
})
export class TableHeadComponent {
  @Input() align: 'left' | 'center' | 'right' = 'left';
}

// ─── Table Cell (<td>) ────────────────────────────────────────────────────────
@Component({
  selector: 'app-table-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <td
      class="p-4 align-middle [&:has([role=checkbox])]:pr-0"
      [class.text-right]="align === 'right'"
      [class.text-center]="align === 'center'"
    >
      <ng-content />
    </td>
  `,
})
export class TableCellComponent {
  @Input() align: 'left' | 'center' | 'right' = 'left';
}
