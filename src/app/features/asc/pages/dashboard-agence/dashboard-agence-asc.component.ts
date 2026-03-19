import { Component, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
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
import { BarChartComponent, BarChartData } from '@/shared/components/chart/bar-chart.component';
import { AscService } from '../../services/asc/asc.service';
import { StatsCardComponent } from '@/shared/components/stats-card/stats-card.component';
import { AuthService } from '@/core/services/auth/auth.service';
import { AscDashboard, AscDashboardMensuelItem } from '../../interfaces/asc.interface';

const MOIS_LABELS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
];

const ASC_STATUTS: Record<number, { label: string; cls: string }> = {
  1: { label: 'En cours de création',         cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
  2: { label: 'En attente de Validation',      cls: 'bg-yellow-100 text-yellow-700 border border-yellow-300' },
  3: { label: "En attente d'Approbation",      cls: 'bg-orange-100 text-orange-700 border border-orange-300' },
  4: { label: 'Suivi du décaissement',         cls: 'bg-blue-100 text-blue-700 border border-blue-300' },
  5: { label: 'En attente de Décaissement',    cls: 'bg-purple-100 text-purple-700 border border-purple-300' },
  6: { label: 'Clôturé',                       cls: 'bg-green-100 text-green-700 border border-green-300' },
  7: { label: 'Rejeté',                        cls: 'bg-red-100 text-red-700 border border-red-300' },
  8: { label: 'Transfert inter agence',        cls: 'bg-indigo-100 text-indigo-700 border border-indigo-300' },
  9: { label: 'En attente de Validation (PME)',cls: 'bg-yellow-100 text-yellow-700 border border-yellow-300' },
  10: { label: 'Création dans PERFECT',        cls: 'bg-cyan-100 text-cyan-700 border border-cyan-300' },
  11: { label: 'Demande non aboutie',          cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

@Component({
  selector: 'app-dashboard-agence-asc',
  standalone: true,
  imports: [
    DecimalPipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BarChartComponent,
    StatsCardComponent,
  ],
  templateUrl: './dashboard-agence-asc.component.html',
})
export class DashboardAgenceAscComponent implements OnInit {
  readonly ArchiveIcon  = Archive;
  readonly ClockIcon    = Clock;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon  = XCircle;
  readonly XOctagonIcon = XOctagon;
  readonly TrendingUpIcon   = TrendingUp;
  readonly TrendingDownIcon = TrendingDown;
  readonly TrophyIcon   = Trophy;

  private readonly ascService  = inject(AscService);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  readonly currentYear = new Date().getFullYear();
  readonly years = [this.currentYear, this.currentYear - 1, this.currentYear - 2];
  readonly selectedYear = signal(this.currentYear);
  readonly isLoading    = signal(false);
  readonly dashboardData    = signal<AscDashboard | null>(null);
  readonly monthlyValues = signal<number[]>(Array(12).fill(0));

  // Resolved input
  readonly dashboard = input<AscDashboard>();

  readonly agenceId    = computed(() => this.authService.currentUser()?.agence?.id ?? null);
  readonly agenceLabel = computed(() => this.authService.currentUser()?.agence?.libelle ?? 'Agence');

  readonly topClients  = computed(() => this.dashboardData()?.topClients ?? []);
  readonly recentesAsc = computed(() => this.dashboardData()?.recentesAsc ?? []);

  readonly chartData = computed<BarChartData>(() => ({
    labels: MOIS_LABELS,
    datasets: [{ label: 'Montant déboursé (FCFA)', values: this.monthlyValues(), colorVar: '--color-chart-1' }],
  }));

  constructor() {
    effect(() => {
      const d = this.dashboard();
      if (d) this.dashboardData.set(d);
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Load mensuel data for the chart (requires agenceId from auth)
    const agId = this.agenceId();
    if (agId) {
      this.ascService.getDashboardMensuel(this.currentYear, agId).subscribe({
        next: (items) => this.monthlyValues.set(this.buildMonthlyValues(items)),
        error: () => {},
      });
    }
  }

  load(annee: number) {
    this.selectedYear.set(annee);
    this.isLoading.set(true);

    this.ascService.getDashboard(annee).subscribe({
      next: (d) => { this.dashboardData.set(d); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });

    const agId = this.agenceId();
    if (agId) {
      this.ascService.getDashboardMensuel(annee, agId).subscribe({
        next: (items) => this.monthlyValues.set(this.buildMonthlyValues(items)),
        error: () => {},
      });
    }
  }

  private buildMonthlyValues(items: AscDashboardMensuelItem[]): number[] {
    const values = Array(12).fill(0);
    items.forEach((item) => {
      if (item.mois >= 1 && item.mois <= 12) values[item.mois - 1] = item.montant;
    });
    return values;
  }

  goDetail(id: number) {
    this.router.navigate(['/app/asc/detail', id]);
  }

  statutLabel(s: number): string { return ASC_STATUTS[s]?.label ?? `Statut ${s}`; }
  statutClass(s: number): string { return ASC_STATUTS[s]?.cls ?? 'bg-muted text-muted-foreground border border-border'; }

  topBadgeClass(index: number): string {
    const classes = [
      'bg-yellow-100 text-yellow-700 border border-yellow-300',
      'bg-slate-100 text-slate-600 border border-slate-300',
      'bg-orange-100 text-orange-600 border border-orange-200',
    ];
    return classes[index] ?? 'bg-muted text-muted-foreground border border-border';
  }
}
