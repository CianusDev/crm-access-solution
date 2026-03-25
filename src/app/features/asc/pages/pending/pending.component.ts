import { Component, computed, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { DecimalPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { LucideAngularModule, Eye, Search, Clock } from 'lucide-angular';
import { CardComponent, CardContentComponent } from '@/shared/components/card/card.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { AscDemande } from '../../interfaces/asc.interface';

@Component({
  selector: 'app-demande-attente',
  templateUrl: './pending.component.html',
  imports: [
    DecimalPipe,
    DatePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    PaginationComponent,
    UpperCasePipe,
  ],
})
export class PendingComponent {
  readonly EyeIcon = Eye;
  readonly SearchIcon = Search;
  readonly ClockIcon = Clock;

  private readonly router = inject(Router);

  readonly demandes = input<AscDemande[]>([]);
  readonly query = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly filtered = computed(() => {
    const items = this.demandes();
    const q = this.query().toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (d) =>
        d.client?.nomPrenom.toLowerCase().includes(q) ||
        d.client?.codeClient.toLowerCase().includes(q) ||
        d.cheque?.tireur?.toLowerCase().includes(q) ||
        d.numDemandeAsc?.toLowerCase().includes(q) ||
        d.cheque?.numTransaction?.toLowerCase().includes(q),
    );
  });

  setQuery(value: string) {
    this.query.set(value);
    this.page.set(1);
  }

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  goDetail(id: number) {
    this.router.navigate(['/app/asc/detail', id]);
  }
}
