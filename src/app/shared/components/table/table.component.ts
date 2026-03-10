import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant Table shadcn-ui like.
 *
 * Les sélecteurs sont des ATTRIBUTS (et non des balises custom) pour éviter
 * que le navigateur casse la structure HTML native des tableaux.
 *
 * Usage :
 *   <table appTable>
 *     <thead appTableHeader>
 *       <tr appTableRow>
 *         <th appTableHead>Nom</th>
 *         <th appTableHead align="right">Montant</th>
 *       </tr>
 *     </thead>
 *     <tbody appTableBody>
 *       <tr appTableRow>
 *         <td appTableCell>John</td>
 *         <td appTableCell align="right">100 €</td>
 *       </tr>
 *     </tbody>
 *     <tfoot appTableFooter>
 *       <tr appTableRow>
 *         <td appTableCell>Total</td>
 *         <td appTableCell align="right">100 €</td>
 *       </tr>
 *     </tfoot>
 *   </table>
 */

// ─── Table wrapper ────────────────────────────────────────────────────────────
@Component({
  selector: 'table[appTable]',
  standalone: true,
  host: {
    class: 'w-full caption-bottom text-sm',
  },
  template: `<ng-content />`,
})
export class TableComponent {}

// ─── Wrapper avec scroll horizontal ──────────────────────────────────────────
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <div class="relative w-full overflow-auto bg-background rounded-md border border-zinc-200">
      <table appTable>
        <ng-content />
      </table>
    </div>
  `,
})
export class AppTableComponent {}

// ─── Caption ──────────────────────────────────────────────────────────────────
@Component({
  selector: 'caption[appTableCaption]',
  standalone: true,
  host: {
    class: 'mt-4 text-sm text-zinc-500',
  },
  template: `<ng-content />`,
})
export class TableCaptionComponent {}

// ─── Header (<thead>) ─────────────────────────────────────────────────────────
@Component({
  selector: 'thead[appTableHeader]',
  standalone: true,
  host: {
    class: '[&_tr]:border-b [&_tr]:border-zinc-200',
  },
  template: `<ng-content />`,
})
export class TableHeaderComponent {}

// ─── Body (<tbody>) ───────────────────────────────────────────────────────────
@Component({
  selector: 'tbody[appTableBody]',
  standalone: true,
  host: {
    class: '[&_tr:last-child]:border-0',
  },
  template: `<ng-content />`,
})
export class TableBodyComponent {}

// ─── Footer (<tfoot>) ─────────────────────────────────────────────────────────
@Component({
  selector: 'tfoot[appTableFooter]',
  standalone: true,
  host: {
    class: 'border-t border-zinc-200 bg-zinc-50 font-medium [&>tr]:last:border-b-0',
  },
  template: `<ng-content />`,
})
export class TableFooterComponent {}

// ─── Row (<tr>) ───────────────────────────────────────────────────────────────
@Component({
  selector: 'tr[appTableRow]',
  standalone: true,
  host: {
    class:
      'border-b border-zinc-200 transition-colors hover:bg-zinc-50 data-[state=selected]:bg-zinc-100',
  },
  template: `<ng-content />`,
})
export class TableRowComponent {}

// ─── Head (<th>) ──────────────────────────────────────────────────────────────
@Component({
  selector: 'th[appTableHead]',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'h-10 px-4 align-middle font-medium text-zinc-500 [&:has([role=checkbox])]:pr-0',
    '[class.text-right]': `align === 'right'`,
    '[class.text-center]': `align === 'center'`,
    '[class.text-left]': `align === 'left'`,
  },
  template: `<ng-content />`,
})
export class TableHeadComponent {
  @Input() align: 'left' | 'center' | 'right' = 'left';
}

// ─── Cell (<td>) ──────────────────────────────────────────────────────────────
@Component({
  selector: 'td[appTableCell]',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'p-4 align-middle [&:has([role=checkbox])]:pr-0',
    '[class.text-right]': `align === 'right'`,
    '[class.text-center]': `align === 'center'`,
    '[class.text-left]': `align === 'left'`,
  },
  template: `<ng-content />`,
})
export class TableCellComponent {
  @Input() align: 'left' | 'center' | 'right' = 'left';
}
