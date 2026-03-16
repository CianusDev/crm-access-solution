import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { LucideAngularModule, Search, History, CreditCard, CheckCircle, DollarSign } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import {
  TableDirective,
  TableHeaderDirective,
  TableBodyDirective,
  TableRowDirective,
  TableHeadDirective,
  TableCellDirective,
} from '@/shared/directives/ui/table/table';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { AscClient, AscDemande } from '../../interfaces/asc.interface';
import { AscService } from '../../services/asc/asc.service';

const STATUT_LABELS: Record<number, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' }> = {
  1:  { label: 'En cours de création',    variant: 'secondary'  },
  2:  { label: 'En attente validation',   variant: 'warning'    },
  3:  { label: "En attente d'approbation", variant: 'warning'   },
  4:  { label: 'Suivi décaissement',      variant: 'default'    },
  5:  { label: 'En att. décaissement',    variant: 'default'    },
  6:  { label: 'Clôturé',                 variant: 'success'    },
  7:  { label: 'Rejeté',                  variant: 'destructive'},
  8:  { label: 'Transfert inter-agence',  variant: 'outline'    },
  9:  { label: 'En attente validation',   variant: 'warning'    },
  10: { label: 'Création dans Perfect',   variant: 'default'    },
  11: { label: 'Demande non aboutie',     variant: 'destructive'},
};

@Component({
  selector: 'app-recherche-client',
  templateUrl: './client-search.component.html',
  imports: [
    FormsModule,
    DecimalPipe,
    DatePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    ButtonDirective,
    TableDirective,
    TableHeaderDirective,
    TableBodyDirective,
    TableRowDirective,
    TableHeadDirective,
    TableCellDirective,
    PaginationComponent,
  ],
})
export class ClientSearchComponent {
  readonly SearchIcon = Search;
  readonly HistoryIcon = History;
  readonly CreditCardIcon = CreditCard;
  readonly CheckCircleIcon = CheckCircle;
  readonly DollarSignIcon = DollarSign;

  private readonly ascService = inject(AscService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly codeClient  = signal('');
  readonly isSearching = signal(false);
  readonly client      = signal<AscClient | null>(null);

  readonly historiquePage     = signal(1);
  readonly historiquePageSize = 8;

  readonly historique = computed(() => this.client()?.historiqueAvCheque ?? []);

  readonly pagedHistorique = computed(() => {
    const start = (this.historiquePage() - 1) * this.historiquePageSize;
    return this.historique().slice(start, start + this.historiquePageSize);
  });

  search() {
    const code = this.codeClient().trim();
    if (!code) return;
    this.isSearching.set(true);
    this.client.set(null);
    this.ascService.searchClient(code).subscribe({
      next: (c) => {
        this.client.set(c);
        this.historiquePage.set(1);
        this.isSearching.set(false);
      },
      error: () => {
        this.toast.error('Client introuvable. Vérifiez le code client.');
        this.isSearching.set(false);
      },
    });
  }

  goNewCheque() {
    const c = this.client();
    if (!c) return;
    this.router.navigate(['/app/asc/create'], {
      queryParams: { codeClient: c.codeClient },
    });
  }

  clientInitials(client: AscClient): string {
    const parts = client.nomPrenom.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }

  typeAgentLabel(type: string): string {
    return type === 'SC' ? 'Personne morale' : type === 'PP' ? 'Personne physique' : type;
  }

  statutInfo(statut: number) {
    return STATUT_LABELS[statut] ?? { label: String(statut), variant: 'secondary' as const };
  }

  goDetail(d: AscDemande) {
    this.router.navigate(['/app/asc/detail', d.id]);
  }
}
