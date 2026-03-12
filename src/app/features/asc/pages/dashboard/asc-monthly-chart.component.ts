import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  inject,
  input,
  signal,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { AscService } from '../../services/asc/asc.service';

Chart.register(...registerables);

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

@Component({
  selector: 'app-asc-monthly-chart',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 h-full">

      <!-- Header -->
      <div class="flex flex-col gap-0.5">
        <h3 class="text-base font-semibold text-foreground">
          Statistiques des montants déboursés par mois et par AGENCE
        </h3>
        <p class="text-sm text-muted-foreground">
          Pour l'agence {{ year() }}
        </p>
      </div>

      <!-- Controls -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">

        <!-- Agence select -->
        <div class="relative flex-1">
          <select
            [ngModel]="selectedAgenceId()"
            (ngModelChange)="onAgenceChange($event)"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-8"
          >
            <option [ngValue]="null" disabled>Sélectionner une agence</option>
            @for (ag of agences(); track ag.id) {
              <option [ngValue]="ag.id">{{ ag.libelle }}</option>
            }
          </select>
          <!-- Chevron -->
          <span class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
          <!-- Clear -->
          @if (selectedAgenceId() !== null) {
            <button
              type="button"
              (click)="onAgenceChange(null)"
              class="absolute right-7 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-destructive"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          }
        </div>

        <!-- Year badge -->
        <span class="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-primary/50 px-3 py-2 text-sm font-semibold text-primary">
          {{ year() }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>

      </div>

      <!-- Chart area -->
      <div class="relative flex-1 min-h-[240px]">

        @if (isLoading()) {
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
          </div>
        }

        @if (!isLoading() && selectedAgenceId() === null) {
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-muted-foreground/25">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <p class="text-sm text-muted-foreground">Sélectionnez une agence pour afficher les données</p>
          </div>
        }

        <canvas
          #chartCanvas
          class="w-full h-full transition-opacity duration-200"
          [style.opacity]="selectedAgenceId() !== null && !isLoading() ? '1' : '0'"
        ></canvas>

      </div>
    </div>
  `,
})
export class AscMonthlyChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  readonly agences = input<{ id: number; libelle: string }[]>([]);
  readonly year = input<number>(new Date().getFullYear());

  readonly selectedAgenceId = signal<number | null>(null);
  readonly isLoading = signal(false);

  private chart!: Chart;
  private readonly ascService = inject(AscService);

  constructor() {
    effect(() => {
      const y = this.year();
      const id = this.selectedAgenceId();
      if (id !== null) {
        this.fetchData(id, y);
      }
    });
  }

  ngOnInit() {
    this.chart = this.buildChart();
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  onAgenceChange(id: number | null) {
    this.selectedAgenceId.set(id !== null ? Number(id) : null);
    if (id === null) {
      this.updateChart(Array(12).fill(0));
    }
  }

  private fetchData(agenceId: number, annee: number) {
    this.isLoading.set(true);
    this.ascService.getDashboardMensuel(annee, agenceId).subscribe({
      next: (items) => {
        const values = Array(12).fill(0);
        items.forEach((item) => {
          if (item.mois >= 1 && item.mois <= 12) {
            values[item.mois - 1] = item.montant;
          }
        });
        this.updateChart(values);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private updateChart(values: number[]) {
    this.chart.data.datasets[0].data = values;
    this.chart.update();
  }

  private resolveCssColor(varName: string, alpha = 1): string {
    try {
      const raw =
        getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || varName;
      const el = Object.assign(document.createElement('span'), {
        style: `color:${raw};position:absolute;left:-9999px;opacity:0`,
      });
      document.body.appendChild(el);
      const computed = getComputedStyle(el).color;
      document.body.removeChild(el);
      const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return m ? `rgba(${m[1]},${m[2]},${m[3]},${alpha})` : computed;
    } catch {
      return varName;
    }
  }

  private buildChart(): Chart {
    const lineColor = this.resolveCssColor('--color-primary', 1);
    const fillColor = this.resolveCssColor('--color-primary', 0.07);
    const gridColor = this.resolveCssColor('--color-border', 0.6);

    return new Chart(this.canvas.nativeElement, {
      type: 'line',
      data: {
        labels: MOIS_LABELS,
        datasets: [
          {
            data: Array(12).fill(0),
            borderColor: lineColor,
            backgroundColor: fillColor,
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: lineColor,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            borderWidth: 1,
            titleColor: 'hsl(var(--foreground))',
            bodyColor: 'hsl(var(--muted-foreground))',
            padding: 10,
            callbacks: {
              label: (ctx) => ` ${(ctx.parsed.y ?? 0).toLocaleString('fr-FR')} FCFA`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            border: { display: false },
            ticks: { font: { size: 11 }, color: 'hsl(var(--muted-foreground))' },
          },
          y: {
            grid: { color: gridColor },
            border: { display: false },
            ticks: {
              font: { size: 11 },
              color: 'hsl(var(--muted-foreground))',
              callback: (v) => Number(v).toLocaleString('fr-FR'),
            },
          },
        },
      },
    });
  }
}
