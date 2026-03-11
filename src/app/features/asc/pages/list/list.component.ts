import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe, NgClass } from '@angular/common';
import { LucideAngularModule, Eye, Search, FileText } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { AscDemande } from '../../interfaces/asc.interface';

const STATUT_LABELS: Record<number, { label: string; class: string }> = {
  0: { label: 'En attente', class: 'bg-yellow-100 text-yellow-700' },
  1: { label: 'Accordé', class: 'bg-green-100 text-green-700' },
  2: { label: 'Refusé', class: 'bg-red-100 text-red-700' },
  3: { label: 'Annulé', class: 'bg-gray-100 text-gray-600' },
};

@Component({
  selector: 'app-liste-cheques',
  templateUrl: './list.component.html',
  imports: [DecimalPipe, DatePipe, NgClass, LucideAngularModule, CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent],
})
export class ListComponent {
  readonly EyeIcon = Eye;
  readonly SearchIcon = Search;
  readonly FileTextIcon = FileText;

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

  statutInfo(statut: number) {
    return STATUT_LABELS[statut] ?? { label: String(statut), class: 'bg-muted text-muted-foreground' };
  }

  goDetail(id: number) {
    this.router.navigate(['/app/asc/detail', id]);
  }
}
