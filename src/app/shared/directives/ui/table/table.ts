import { Directive, Input } from '@angular/core';

// ─── Table wrapper ────────────────────────────────────────────────────────────
@Directive({
  selector: 'table[appTable]',
  host: {
    class: 'w-full text-sm caption-bottom bg-background',
  },
})
export class TableDirective {}

// ─── Table body ───────────────────────────────────────────────────────────────
@Directive({
  selector: 'tbody[appTableBody]',
  host: {
    class: '[&_tr:last-child]:border-0',
  },
})
export class TableBodyDirective {}

// ─── Table head ───────────────────────────────────────────────────────────────
@Directive({
  selector: 'th[appTableHead]',
  host: {
    class: 'h-10 px-4 align-middle font-medium text-zinc-500 [&:has([role=checkbox])]:pr-0',
    '[class.text-right]': `align === 'right'`,
    '[class.text-center]': `align === 'center'`,
    '[class.text-left]': `align === 'left'`,
  },
})
export class TableHeadDirective {
  @Input() align: 'left' | 'center' | 'right' = 'left';
}

// ─── Table header ─────────────────────────────────────────────────────────────
@Directive({
  selector: 'thead[appTableHeader]',
  host: {
    class: '[&_tr]:border-b border-border',
  },
})
export class TableHeaderDirective {}

// ─── Table row ────────────────────────────────────────────────────────────────
@Directive({
  selector: 'tr[appTableRow]',
  host: {
    class:
      'hover:bg-muted/50 data-[state=selected]:bg-muted border-b border-border transition-colors',
  },
})
export class TableRowDirective {}

// ─── Table cell ───────────────────────────────────────────────────────────────
@Directive({
  selector: 'td[appTableCell]',
  host: {
    class: 'p-2 pl-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0',
  },
})
export class TableCellDirective {}

// ─── Table footer ─────────────────────────────────────────────────────────────
@Directive({
  selector: 'tfoot[appTableFooter]',
  host: {
    class: 'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
  },
})
export class TableFooterDirective {}
