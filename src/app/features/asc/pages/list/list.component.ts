import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Eye, Search, FileText, Filter, X } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { AscDemande } from '../../interfaces/asc.interface';

const STATUT_LABELS: Record<number, { label: string; class: string }> = {
  1: { label: 'En cours de création', class: 'bg-gray-100 text-gray-700' },
  2: { label: 'En attente validation', class: 'bg-yellow-100 text-yellow-700' },
  3: { label: "En attente d'approbation", class: 'bg-orange-100 text-orange-700' },
  4: { label: 'Suivi décaissement', class: 'bg-blue-100 text-blue-700' },
  5: { label: 'En attente décaissement', class: 'bg-purple-100 text-purple-700' },
  6: { label: 'Clôturé', class: 'bg-green-100 text-green-700' },
  7: { label: 'Rejeté', class: 'bg-red-100 text-red-700' },
  8: { label: 'Transfert inter-agence', class: 'bg-pink-100 text-pink-700' },
  9: { label: 'En attente validation', class: 'bg-yellow-100 text-yellow-700' },
  10: { label: 'Création dans Perfect', class: 'bg-blue-100 text-blue-700' },
  11: { label: 'Demande non aboutie', class: 'bg-red-100 text-red-700' },
};

@Component({
  selector: 'app-liste-cheques',
  templateUrl: './list.component.html',
  imports: [
    DecimalPipe,
    DatePipe,
    NgClass,
    FormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    PaginationComponent,
  ],
})
export class ListComponent {
  readonly EyeIcon     = Eye;
  readonly SearchIcon  = Search;
  readonly FileTextIcon = FileText;
  readonly FilterIcon  = Filter;
  readonly XIcon = X;

  private readonly router = inject(Router);

  readonly demandes = input<AscDemande[]>([]);
  readonly agences = input<{ id: number; libelle: string }[]>([]);

  // Filters
  readonly filterClient = signal('');
  readonly filterAgence = signal('');
  readonly filterDateDebut = signal('');
  readonly filterDateFin = signal('');

  // Pagination
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly filtered = computed(() => {
    const items = this.demandes();
    const client = this.filterClient().toLowerCase().trim();
    const agence = this.filterAgence();
    const debut = this.filterDateDebut();
    const fin = this.filterDateFin();

    return items.filter((d) => {
      if (client) {
        const match =
          d.client?.nomPrenom?.toLowerCase().includes(client) ||
          d.client?.codeClient?.toLowerCase().includes(client) ||
          d.cheque?.tireur?.toLowerCase().includes(client) ||
          d.numDemandeAsc?.toLowerCase().includes(client);
        if (!match) return false;
      }

      if (agence) {
        const ag = d.client?.agence?.libelle ?? d.agence?.libelle ?? '';
        if (!ag.includes(agence)) return false;
      }

      const rawDate = d.dateRemise ?? d.dateDemande ?? d.datedemande;
      if (rawDate) {
        const date = new Date(rawDate);
        if (debut && date < new Date(debut)) return false;
        if (fin && date > new Date(fin + 'T23:59:59')) return false;
      }

      return true;
    });
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly hasActiveFilters = computed(
    () =>
      !!this.filterClient() ||
      !!this.filterAgence() ||
      !!this.filterDateDebut() ||
      !!this.filterDateFin(),
  );

  resetFilters() {
    this.filterClient.set('');
    this.filterAgence.set('');
    this.filterDateDebut.set('');
    this.filterDateFin.set('');
    this.page.set(1);
  }

  onFilterChange() {
    this.page.set(1);
  }

  statutInfo(statut: number) {
    return STATUT_LABELS[statut] ?? { label: String(statut), class: 'bg-muted text-muted-foreground' };
  }

  goDetail(id: number)              { this.router.navigate(['/app/asc/detail', id]); }
  goChequeDetail(numcheque: string) { this.router.navigate(['/app/asc/cheque', numcheque]); }
}
