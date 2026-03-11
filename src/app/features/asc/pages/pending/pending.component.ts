import { Component, computed, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { LucideAngularModule, Eye, Search, Clock } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { AscDemande } from '../../interfaces/asc.interface';

@Component({
  selector: 'app-demande-attente',
  templateUrl: './pending.component.html',
  imports: [DecimalPipe, DatePipe, LucideAngularModule, CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent],
})
export class PendingComponent {
  readonly EyeIcon = Eye;
  readonly SearchIcon = Search;
  readonly ClockIcon = Clock;

  private readonly router = inject(Router);

  readonly demandes = input<AscDemande[]>([]);
  readonly query = signal('');

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.demandes();
    return this.demandes().filter(
      (d) =>
        d.client?.nomPrenom.toLowerCase().includes(q) ||
        d.client?.codeClient.toLowerCase().includes(q) ||
        d.cheque?.tireur?.toLowerCase().includes(q) ||
        d.numDemandeAsc?.toLowerCase().includes(q),
    );
  });

  goDetail(id: number) {
    this.router.navigate(['/app/asc/detail', id]);
  }
}
