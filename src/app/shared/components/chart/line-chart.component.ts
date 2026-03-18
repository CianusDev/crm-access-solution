import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  input,
  effect,
  signal,
  computed,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

export interface LineChartDataset {
  label: string;
  values: number[];
  colorVar?: string; // ex: '--color-chart-1'
  fill?: boolean;
}

export interface LineChartData {
  labels: string[];
  datasets: LineChartDataset[];
}

const FALLBACK_COLORS = [
  '--color-chart-1',
  '--color-chart-2',
  '--color-chart-3',
  '--color-chart-4',
  '--color-chart-5',
];

@Component({
  selector: 'app-line-chart',
  standalone: true,
  template: `
    <div class="bg-card border border-border flex-1 h-full rounded-xl p-6 flex flex-col gap-4">

      <!-- Header -->
      <div class="flex flex-col gap-1">
        <h3 class="text-base font-semibold text-foreground">{{ title() }}</h3>
        @if (subtitle()) {
          <p class="text-sm text-muted-foreground">{{ subtitle() }}</p>
        }
      </div>

      <!-- Legend -->
      @if (data().datasets.length > 1) {
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          @for (ds of data().datasets; track ds.label; let i = $index) {
            <button
              type="button"
              class="flex items-center gap-1.5 text-xs transition-opacity"
              [style.opacity]="hiddenSeries().has(i) ? '0.35' : '1'"
              (click)="toggleSeries(i)"
            >
              <span class="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                [style.background-color]="seriesColors()[i]"></span>
              <span class="text-muted-foreground">{{ ds.label }}</span>
            </button>
          }
        </div>
      }

      <!-- Chart -->
      <div class="relative w-full flex-1 min-h-[180px]">
        @if (isEmpty()) {
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.5" class="text-muted-foreground/25">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <p class="text-sm text-muted-foreground">Aucune donnée à afficher</p>
          </div>
        }
        <canvas
          #chartCanvas
          class="w-full h-full transition-opacity duration-300"
          [style.opacity]="isEmpty() ? '0' : '1'"
        ></canvas>
      </div>

    </div>
  `,
})
export class LineChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  readonly title    = input('Line Chart');
  readonly subtitle = input('');
  readonly unit     = input('');
  readonly tension  = input(0.35);

  readonly data = input<LineChartData>({ labels: [], datasets: [] });

  readonly hiddenSeries = signal<Set<number>>(new Set());

  readonly isEmpty = computed(() =>
    this.data().datasets.every((ds) => ds.values.every((v) => v === 0)),
  );

  readonly seriesColors = computed(() =>
    this.data().datasets.map((ds, i) =>
      this.resolveCssColor(ds.colorVar ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length], 1),
    ),
  );

  private chart!: Chart;

  constructor() {
    effect(() => {
      if (!this.chart) return;
      this.syncChart();
    });
  }

  ngOnInit() {
    this.chart = new Chart(this.canvas.nativeElement, this.buildConfig());
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  toggleSeries(index: number) {
    const next = new Set(this.hiddenSeries());
    next.has(index) ? next.delete(index) : next.add(index);
    this.hiddenSeries.set(next);
  }

  private syncChart() {
    const { labels, datasets } = this.data();
    const hidden = this.hiddenSeries();

    this.chart.data.labels = labels;
    this.chart.data.datasets = datasets.map((ds, i) => {
      const colorVar = ds.colorVar ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
      const color    = this.resolveCssColor(colorVar, 1);
      const fill     = ds.fill ?? datasets.length === 1;
      return {
        label: ds.label,
        data: ds.values,
        borderColor: color,
        backgroundColor: fill ? this.resolveCssColor(colorVar, 0.08) : 'transparent',
        borderWidth: 2,
        fill,
        tension: this.tension(),
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        hidden: hidden.has(i),
      };
    });
    this.chart.update('active');
  }

  private buildConfig(): ChartConfiguration {
    const { labels, datasets } = this.data();
    const unit      = this.unit();
    const gridColor = this.resolveCssColor('--color-border', 0.5);
    const mutedColor = 'hsl(var(--muted-foreground))';

    const chartDatasets = datasets.map((ds, i) => {
      const colorVar = ds.colorVar ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
      const color    = this.resolveCssColor(colorVar, 1);
      const fill     = ds.fill ?? datasets.length === 1;
      return {
        label: ds.label,
        data: ds.values,
        borderColor: color,
        backgroundColor: fill ? this.resolveCssColor(colorVar, 0.08) : 'transparent',
        borderWidth: 2,
        fill,
        tension: this.tension(),
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    return {
      type: 'line',
      data: { labels, datasets: chartDatasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400, easing: 'easeInOutQuart' },
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
            boxPadding: 4,
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label} : ${(ctx.parsed.y ?? 0).toLocaleString('fr-FR')}${unit ? ' ' + unit : ''}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: mutedColor, font: { size: 11 } },
          },
          y: {
            grid: { color: gridColor },
            border: { display: false },
            ticks: {
              color: mutedColor,
              font: { size: 11 },
              callback: (v) => Number(v).toLocaleString('fr-FR'),
            },
          },
        },
      },
    };
  }

  private resolveCssColor(varName: string, alpha = 1): string {
    try {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || varName;
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
}
