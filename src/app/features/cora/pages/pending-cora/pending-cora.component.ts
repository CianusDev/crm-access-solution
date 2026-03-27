import {
  AppTableComponent,
  TableBodyComponent,
  TableCellComponent,
  TableHeadComponent,
  TableHeaderComponent,
  TableRowComponent,
} from '@/shared/components/table/table.component';
import { BadgeComponent, BadgeVariant } from '@/shared/components/badge/badge.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, Eye, RefreshCw } from 'lucide-angular';
import { AgentEnAttente } from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { InitialesPipe } from '@/shared/pipes/initailes/initiales.pipe';

const PAGE_SIZE = 10;

const STATUT_LABEL: Record<number, string> = {
  1: 'Rejeté',
  2: "En attente d'évaluation",
  3: 'En attente de validation',
  4: "En attente d'approbation",
  5: 'En attente de création des accès',
  6: 'En attente de clôture',
  7: 'Clôturé',
};

const STATUT_VARIANT: Record<number, BadgeVariant> = {
  1: 'destructive',
  2: 'warning',
  3: 'warning',
  4: 'warning',
  5: 'secondary',
  6: 'secondary',
  7: 'success',
};

@Component({
  selector: 'app-pending-cora',
  templateUrl: './pending-cora.component.html',
  imports: [
    AppTableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    BadgeComponent,
    PaginationComponent,
    ButtonDirective,
    LucideAngularModule,
    InitialesPipe,
  ],
})
export class PendingCoraComponent implements OnInit {
  readonly SearchIcon = Search;
  readonly EyeIcon = Eye;
  readonly RefreshIcon = RefreshCw;

  private readonly router = inject(Router);
  private readonly coraService = inject(CoraService);
  private readonly toast = inject(ToastService);

  // Resolver data
  readonly agents = input<AgentEnAttente[]>([]);

  readonly agentList = signal<AgentEnAttente[]>([]);
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly isRefreshing = signal(false);

  ngOnInit() {
    this.agentList.set(this.agents() ?? []);
  }

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.agentList();
    if (!q) return list;
    return list.filter(
      (a) =>
        a.cora?.designation?.toLowerCase().includes(q) ||
        a.reference?.toLowerCase().includes(q) ||
        a.nomPrenom?.toLowerCase().includes(q) ||
        a.commune?.libelle?.toLowerCase().includes(q),
    );
  });

  readonly paginated = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  readonly totalCount = computed(() => this.filtered().length);

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  refresh() {
    this.isRefreshing.set(true);
    this.coraService.getAgentsEnAttente().subscribe({
      next: (data) => {
        this.agentList.set(data);
        this.searchQuery.set('');
        this.currentPage.set(1);
        this.isRefreshing.set(false);
      },
      error: (err) => {
        this.toast.error(err.message ?? "Erreur lors de l'actualisation.");
        this.isRefreshing.set(false);
      },
    });
  }

  viewDetail(agentId: number) {
    this.router.navigate(['/app/cora/agent', agentId]);
  }

  statutLabel(statut?: number): string {
    return STATUT_LABEL[statut ?? 0] ?? '—';
  }

  statutVariant(statut?: number): BadgeVariant {
    return STATUT_VARIANT[statut ?? 0] ?? 'secondary';
  }

  avatarColor(typeUser?: number): string {
    return typeUser === 1 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground';
  }
}
