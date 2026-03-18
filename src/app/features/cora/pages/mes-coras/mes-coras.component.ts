import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, Eye, RefreshCw, MapPin } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { Cora } from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { InitialesPipe } from '@/shared/pipes/initiales.pipe';

const STATUT_LABELS: Record<number, string> = {
  0: 'Inactif',
  1: 'En attente',
  2: 'En cours',
  3: 'Actif',
  4: 'Suspendu',
  5: 'Fermé',
};

const STATUT_CLASSES: Record<number, string> = {
  0: 'bg-red-100 text-red-700',
  1: 'bg-gray-100 text-gray-700',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-green-100 text-green-700',
  4: 'bg-red-100 text-red-700',
  5: 'bg-yellow-100 text-yellow-700',
};

const PAGE_SIZE = 10;

@Component({
  selector: 'app-mes-coras',
  templateUrl: './mes-coras.component.html',
  imports: [
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    PaginationComponent,
    Avatar,
    InitialesPipe,
  ],
})
export class MesCoras implements OnInit {
  readonly SearchIcon  = Search;
  readonly EyeIcon     = Eye;
  readonly RefreshIcon = RefreshCw;
  readonly MapPinIcon  = MapPin;

  private readonly router      = inject(Router);
  private readonly coraService = inject(CoraService);
  private readonly toast       = inject(ToastService);

  readonly coras     = signal<Cora[]>([]);
  readonly isLoading = signal(false);
  readonly query     = signal('');
  readonly page      = signal(1);
  readonly pageSize  = PAGE_SIZE;

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.coras();
    return this.coras().filter(
      (c) =>
        c.reference?.toLowerCase().includes(q) ||
        c.designation?.toLowerCase().includes(q) ||
        c.perfect?.toLowerCase().includes(q) ||
        c.pmobile?.toLowerCase().includes(q) ||
        c.commune?.libelle?.toLowerCase().includes(q) ||
        c.quartier?.toLowerCase().includes(q),
    );
  });

  readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  ngOnInit() { this.load(); }

  load() {
    this.isLoading.set(true);
    this.coraService.getMesCoras().subscribe({
      next: (data) => { this.coras.set(data); this.isLoading.set(false); },
      error: (err) => {
        this.toast.error(err.message ?? 'Erreur lors du chargement.');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(value: string) {
    this.query.set(value);
    this.page.set(1);
  }

  viewDetail(id: number) { this.router.navigate(['/app/cora', id]); }


  statutLabel(s: number): string  { return STATUT_LABELS[s]  ?? '—'; }
  statutClass(s: number): string  { return STATUT_CLASSES[s] ?? 'bg-muted text-muted-foreground'; }
}
