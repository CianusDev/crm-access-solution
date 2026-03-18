import {
  AppTableComponent,
  TableBodyComponent,
  TableCellComponent,
  TableHeadComponent,
  TableHeaderComponent,
  TableRowComponent,
} from '@/shared/components/table/table.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { ButtonComponent } from '@/shared/components/button/button.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { ToastService } from '@/core/services/toast/toast.service';
import { ExcelExportService, ExcelColumn } from '@/core/services/export/excel-export.service';
import { PdfExportService } from '@/core/services/export/pdf-export.service';
import type { TableCell } from 'pdfmake/interfaces';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus, Search, Eye, Filter, Download, RefreshCw, X } from 'lucide-angular';
import { Cora, CoraFiltre, ListCoraData } from '../../interfaces/cora.interface';
import { CoraService } from '../../services/cora/cora.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormSelect } from '@/shared/components/form-select/form-select.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { CoraMapComponent } from '../../components/cora-map/cora-map.component';

const PAGE_SIZE = 10;

// ── Statut helpers ──────────────────────────────────────────────────────────
const STATUT_COLORS: Record<number, string> = {
  0: 'bg-destructive/15 text-destructive',
  1: 'bg-muted text-muted-foreground',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-green-100 text-green-700',
  4: 'bg-destructive/15 text-destructive',
  5: 'bg-yellow-100 text-yellow-700',
};

const STATUT_LABELS: Record<number, string> = {
  0: 'Inactif',
  1: 'En attente',
  2: 'En cours',
  3: 'Actif',
  4: 'Suspendu',
  5: 'Fermé',
};

@Component({
  selector: 'app-list-cora',
  templateUrl: './list-cora.component.html',
  imports: [
    AppTableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    PaginationComponent,
    ButtonComponent,
    ButtonDirective,
    LucideAngularModule,
    ReactiveFormsModule,
    FormSelect,
    FormInput,
    CoraMapComponent,
  ],
})
export class ListCoraComponent implements OnInit {
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;
  readonly EyeIcon = Eye;
  readonly FilterIcon = Filter;
  readonly DownloadIcon = Download;
  readonly RefreshIcon = RefreshCw;
  readonly XIcon = X;

  // ── Services ───────────────────────────────────────────────────────────────
  private readonly router = inject(Router);
  private readonly coraService = inject(CoraService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly excelService = inject(ExcelExportService);
  private readonly pdfService = inject(PdfExportService);

  // ── Resolver data ──────────────────────────────────────────────────────────
  readonly listData = input<ListCoraData>();

  // ── Local cora list (can be replaced by search result) ────────────────────
  readonly coraList = signal<Cora[]>([]);

  ngOnInit() {
    this.coraList.set(this.listData()?.coras ?? []);
  }

  // ── Select options ─────────────────────────────────────────────────────────
  readonly communesOptions = computed(() =>
    (this.listData()?.communes ?? []).map((c) => ({ value: c.id, label: c.libelle })),
  );

  readonly gestionnairesOptions = computed(() =>
    (this.listData()?.gestionnaires ?? []).map((g) => ({
      value: g.id,
      label: `${g.nom} ${g.prenom}`,
    })),
  );

  // ── Filter form ────────────────────────────────────────────────────────────
  readonly filterForm = this.fb.group({
    gestionnaire: [null as number | null],
    commune: [null as number | null],
    quartier: [''],
    rue: [''],
  });

  // ── UI state ───────────────────────────────────────────────────────────────
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly isSearching = signal(false);
  readonly isRefreshing = signal(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.coraList();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.reference?.toLowerCase().includes(q) ||
        c.designation?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.perfect?.toLowerCase().includes(q) ||
        c.pmobile?.toLowerCase().includes(q) ||
        c.commune?.libelle?.toLowerCase().includes(q) ||
        c.quartier?.toLowerCase().includes(q) ||
        c.rue?.toLowerCase().includes(q) ||
        c.user?.nom?.toLowerCase().includes(q) ||
        c.user?.prenom?.toLowerCase().includes(q),
    );
  });

  readonly paginated = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  readonly totalCount = computed(() => this.filtered().length);

  // ── Actions ────────────────────────────────────────────────────────────────
  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  searchCoras() {
    const v = this.filterForm.value;
    const filtre: CoraFiltre = {
      gestionnaire: v.gestionnaire ?? null,
      commune: v.commune ?? null,
      quartier: v.quartier ?? '',
      rue: v.rue ?? '',
    };

    this.isSearching.set(true);
    this.coraService.searchCoras(filtre).subscribe({
      next: (coras) => {
        this.coraList.set(coras);
        this.currentPage.set(1);
        this.isSearching.set(false);
      },
      error: (err) => {
        this.toast.error(err.message ?? 'Erreur lors de la recherche.');
        this.isSearching.set(false);
      },
    });
  }

  resetFilter() {
    this.filterForm.reset();
    this.coraList.set(this.listData()?.coras ?? []);
    this.currentPage.set(1);
  }

  refresh() {
    this.isRefreshing.set(true);
    this.coraService.getListCoraData().subscribe({
      next: (data) => {
        this.coraList.set(data.coras);
        this.filterForm.reset();
        this.searchQuery.set('');
        this.currentPage.set(1);
        this.isRefreshing.set(false);
      },
      error: (err) => {
        this.toast.error(err.message ?? 'Erreur lors de l\'actualisation.');
        this.isRefreshing.set(false);
      },
    });
  }

  viewDetail(id: number) {
    this.router.navigate(['/app/cora', id]);
  }

  goToCreate() {
    this.router.navigate(['/app/cora/create']);
  }

  async exportExcel() {
    const columns: ExcelColumn[] = [
      { header: 'Référence', key: 'reference', width: 16 },
      { header: 'Désignation', key: 'designation', width: 30 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'N. PERFECT', key: 'perfect', width: 16 },
      { header: 'Téléphone', key: 'telephone', width: 16 },
      { header: 'Commune', key: 'commune', width: 18 },
      { header: 'Quartier', key: 'quartier', width: 18 },
      { header: 'Rue', key: 'rue', width: 22 },
      { header: 'Gestionnaire', key: 'gestionnaire', width: 24 },
      { header: 'Statut', key: 'statut', width: 14 },
    ];
    const data = this.filtered().map((c) => ({
      reference: c.reference ?? '',
      designation: c.designation ?? '',
      email: c.email ?? '',
      perfect: c.perfect ?? '',
      telephone: c.pmobile ?? '',
      commune: c.commune?.libelle ?? '',
      quartier: c.quartier ?? '',
      rue: c.rue ?? '',
      gestionnaire: c.user ? `${c.user.nom} ${c.user.prenom}` : '',
      statut: STATUT_LABELS[c.statut] ?? '',
    }));
    await this.excelService.export(data, columns, 'liste-coras', 'CORAs');
  }

  async exportPdf() {
    const rows = this.filtered();
    const tableBody: TableCell[][] = [
      [
        { text: 'Référence', style: 'tableHeader' },
        { text: 'Désignation', style: 'tableHeader' },
        { text: 'PERFECT', style: 'tableHeader' },
        { text: 'Téléphone', style: 'tableHeader' },
        { text: 'Commune', style: 'tableHeader' },
        { text: 'Gestionnaire', style: 'tableHeader' },
        { text: 'Statut', style: 'tableHeader' },
      ],
      ...rows.map((c, i) =>
        this.pdfService.tableRow(
          [
            c.reference ?? '',
            c.designation ?? '',
            c.perfect ?? '',
            c.pmobile ?? '',
            c.commune?.libelle ?? '',
            c.user ? `${c.user.nom} ${c.user.prenom}` : '',
            STATUT_LABELS[c.statut] ?? '',
          ],
          i % 2 === 1,
        ),
      ),
    ];

    await this.pdfService.download(
      {
        pageOrientation: 'landscape',
        pageMargins: [40, 70, 40, 50],
        header: this.pdfService.header('Liste des CORAs', `${rows.length} résultat(s) — ${new Date().toLocaleDateString('fr-FR')}`),
        footer: (currentPage, pageCount) => this.pdfService.footer(currentPage, pageCount),
        content: [
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto', '*', 'auto'],
              body: tableBody,
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0,
              hLineColor: () => '#e5e7eb',
            },
          },
        ],
        styles: this.pdfService.baseStyles,
      },
      'liste-coras',
    );
  }

  exportCSV() {
    const rows = this.filtered();
    const headers = ['Référence', 'Désignation', 'Email', 'N.Perfect', 'N.P-Mobile', 'Commune', 'Quartier', 'Rue', 'Gestionnaire', 'Nb Agences'];
    const lines = rows.map((c) => [
      c.reference,
      c.designation,
      c.email,
      c.perfect,
      c.pmobile,
      c.commune?.libelle ?? '',
      c.quartier,
      c.rue,
      c.user ? `${c.user.nom} ${c.user.prenom}` : '',
      c.agents?.length ?? 0,
    ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'));

    const csv = [headers.join(';'), ...lines].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coras_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  initiales(designation: string): string {
    return (designation ?? '')
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase();
  }

  avatarColor(statut: number): string {
    return STATUT_COLORS[statut] ?? 'bg-muted text-muted-foreground';
  }

  statutLabel(statut: number): string {
    return STATUT_LABELS[statut] ?? '—';
  }

  gestionnaire(cora: Cora): string {
    return cora.user ? `${cora.user.nom} ${cora.user.prenom}` : '—';
  }
}
