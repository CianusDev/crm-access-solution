import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { LucideAngularModule, Search, FileText, Eye, Clock } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { AscDemande } from '../../interfaces/asc.interface';

@Component({
  selector: 'app-cheques-attente',
  templateUrl: './cheques-attente.component.html',
  imports: [
    DecimalPipe,
    DatePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    PaginationComponent,
  ],
})
export class ChequesAttenteComponent {
  readonly SearchIcon = Search;
  readonly FileTextIcon = FileText;
  readonly EyeIcon = Eye;
  readonly ClockIcon = Clock;

  private readonly router = inject(Router);

  readonly cheques = input<AscDemande[]>([]);

  readonly query = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly filtered = computed(() => {
    const items = this.cheques();
    const q = this.query().toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (d) =>
        d.client?.nomPrenom?.toLowerCase().includes(q) ||
        d.client?.codeClient?.toLowerCase().includes(q) ||
        d.cheque.numcheque.toLowerCase().includes(q) ||
        d.cheque.numTransaction.toLowerCase().includes(q) ||
        d.cheque.tireur.toLowerCase().includes(q),
    );
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  onSearch(value: string) {
    this.query.set(value);
    this.page.set(1);
  }

  goDetail(id: number)              { this.router.navigate(['/app/asc/detail', id]); }
  goChequeDetail(numcheque: string) { this.router.navigate(['/app/asc/cheque', numcheque]); }
}
