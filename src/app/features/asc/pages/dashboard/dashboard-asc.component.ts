import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  LucideAngularModule,
  Archive, Clock, CheckCircle, XCircle, XOctagon,
  TrendingUp, TrendingDown, Trophy,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { BarChartComponent, BarChartData } from '@/shared/components/chart/bar-chart.component';
import { AscDashboard } from '../../interfaces/asc.interface';
import { AscService } from '../../services/asc/asc.service';

@Component({
  selector: 'app-dashboard-asc',
  templateUrl: './dashboard-asc.component.html',
  imports: [
    DecimalPipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    PaginationComponent,
    BarChartComponent,
  ],
})
export class DashboardAscComponent implements OnInit {
  readonly ArchiveIcon = Archive;
  readonly ClockIcon = Clock;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly XOctagonIcon = XOctagon;
  readonly TrendingUpIcon = TrendingUp;
  readonly TrendingDownIcon = TrendingDown;
  readonly TrophyIcon = Trophy;

  private readonly ascService = inject(AscService);

  readonly currentYear = new Date().getFullYear();
  readonly years = [this.currentYear, this.currentYear - 1, this.currentYear - 2];
  readonly selectedYear = signal(this.currentYear);
  readonly isLoading = signal(false);
  readonly dashboard = signal<AscDashboard | null>(null);

  // Pagination agences table
  readonly page = signal(1);
  readonly pageSize = 8;

  readonly pagedAgences = computed(() => {
    const agences = this.dashboard()?.agences ?? [];
    const start = (this.page() - 1) * this.pageSize;
    return agences.slice(start, start + this.pageSize);
  });

  readonly chartData = computed<BarChartData>(() => {
    const agences = this.dashboard()?.agences ?? [];
    return {
      labels: agences.map((a) => a.libelle),
      datasets: [
        { label: 'En attente', values: agences.map((a) => a.avcAttente), colorVar: '--color-chart-1' },
        { label: 'Validées',   values: agences.map((a) => a.avcValide),  colorVar: '--color-chart-2' },
      ],
    };
  });

  ngOnInit() {
    this.load(this.currentYear);
  }

  load(annee: number) {
    this.selectedYear.set(annee);
    this.page.set(1);
    this.isLoading.set(true);
    this.ascService.getDashboard(annee).subscribe({
      next: (d) => { this.dashboard.set(d); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  topAgenceBadge(index: number): string {
    const badges = [
      'bg-yellow-100 text-yellow-700 border border-yellow-300',
      'bg-slate-100 text-slate-600 border border-slate-300',
      'bg-orange-100 text-orange-600 border border-orange-200',
    ];
    return badges[index] ?? 'bg-muted text-muted-foreground border border-border';
  }
}
