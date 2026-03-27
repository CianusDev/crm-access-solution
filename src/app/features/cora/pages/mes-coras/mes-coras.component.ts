import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { LucideAngularModule, Search, Eye, RefreshCw, MapPin, FileText } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { Cora } from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';
import { CoraPdfService } from '../../services/pdf/cora-pdf.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { AuthService } from '@/core/services/auth/auth.service';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { InitialesPipe } from '@/shared/pipes/initiales.pipe';
import { CoraMapComponent } from '../../components/cora-map/cora-map.component';

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
    UpperCasePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    PaginationComponent,
    Avatar,
    InitialesPipe,
    CoraMapComponent,
  ],
})
export class MesCoras implements OnInit {
  readonly SearchIcon  = Search;
  readonly EyeIcon     = Eye;
  readonly RefreshIcon = RefreshCw;
  readonly MapPinIcon  = MapPin;
  readonly FileTextIcon = FileText;

  private readonly router      = inject(Router);
  private readonly coraService = inject(CoraService);
  private readonly coraPdf     = inject(CoraPdfService);
  private readonly toast       = inject(ToastService);
  private readonly auth        = inject(AuthService);

  readonly coras          = signal<Cora[]>([]);
  readonly isLoading      = signal(false);
  readonly isExportingCsv = signal(false);
  readonly isExportingPdf = signal(false);
  readonly query          = signal('');
  readonly page           = signal(1);
  readonly pageSize       = PAGE_SIZE;

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
        c.quartier?.toLowerCase().includes(q) ||
        c.user?.nom?.toLowerCase().includes(q) ||
        c.user?.prenom?.toLowerCase().includes(q),
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

  async exportPDF() {
    this.isExportingPdf.set(true);
    try {
      const u = this.auth.currentUser();
      const userName = u ? `${u.nom ?? ''} ${u.prenom ?? ''}`.trim() : '';
      await this.coraPdf.exportListePDF(this.filtered(), userName);
    } finally {
      this.isExportingPdf.set(false);
    }
  }

  exportCSV() {
    this.isExportingCsv.set(true);
    try {
      const headers = ['Réf.', 'N. Perfect', 'N. P-Mobile', 'Désignation', 'Email', 'Commune', 'Quartier', 'Rue', 'Gestionnaire', 'Nombre agence'];
      const rows = this.filtered().map(c => [
        `AG-${c.reference ?? ''}`,
        c.perfect ?? '',
        c.pmobile ?? '',
        c.designation ?? '',
        c.email ?? '',
        c.commune?.libelle ?? '',
        c.quartier ?? '',
        c.rue ?? '',
        c.user ? `${c.user.nom ?? ''} ${c.user.prenom ?? ''}`.trim() : '',
        String(c.agents?.length ?? 0),
      ]);

      const csv = [headers, ...rows]
        .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mes-coras-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      this.isExportingCsv.set(false);
    }
  }

  statutLabel(s: number): string  { return STATUT_LABELS[s]  ?? '—'; }
  statutClass(s: number): string  { return STATUT_CLASSES[s] ?? 'bg-muted text-muted-foreground'; }
}
