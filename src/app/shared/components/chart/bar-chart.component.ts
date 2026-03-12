import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  input,
  effect,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

export interface BarChartDataset {
  label: string;
  values: number[];
  colorVar?: string; // ex: '--color-chart-1'
}

export interface BarChartData {
  labels: string[];
  datasets: BarChartDataset[];
}

const FALLBACK_COLORS = [
  '--color-chart-1',
  '--color-chart-2',
  '--color-chart-3',
  '--color-chart-4',
  '--color-chart-5',
];

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `
    <div class="bg-card border border-border flex-1 h-full rounded-xl p-6 flex flex-col gap-4">

      <!-- Header -->
      <div class="flex flex-col gap-1">
        <h3 class="text-base font-semibold text-foreground">{{ title() }}</h3>
        <p class="text-sm text-muted-foreground">{{ subtitle() }}</p>
      </div>

      <!-- Legend -->
      @if (data().datasets.length > 0) {
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          @for (ds of data().datasets; track ds.label; let i = $index) {
            <button
              type="button"
              class="flex items-center gap-1.5 text-xs transition-opacity"
              [style.opacity]="hiddenSeries().has(i) ? '0.35' : '1'"
              (click)="toggleSeries(i)"
            >
              <span
                class="inline-block h-2.5 w-2.5 rounded-sm flex-shrink-0"
                [style.background-color]="seriesColors()[i]"
              ></span>
              <span class="text-muted-foreground">{{ ds.label }}</span>
            </button>
          }
        </div>
      }

      <!-- Chart or empty state -->
      <div class="relative w-full flex-1 min-h-[180px]">
        @if (isEmpty()) {
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.5" class="text-muted-foreground/25">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
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
export class BarChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  readonly title    = input('Bar Chart');
  readonly subtitle = input('');
  readonly unit     = input('dossiers');

  readonly data = input<BarChartData>({
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      { label: 'Validés', values: [186, 305, 237, 73, 209, 214], colorVar: '--color-chart-1' },
      { label: 'Rejetés', values: [40, 80, 60, 30, 50, 90],    colorVar: '--color-chart-2' },
    ],
  });

  readonly hiddenSeries = signal<Set<number>>(new Set());

  readonly isEmpty = computed(() =>
    this.data().datasets.every((ds) => ds.values.every((v) => v === 0)),
  );

  // Resolved hex/rgba colors per dataset index (used in legend dots)
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

  // ── Private ──────────────────────────────────────────────────────────────

  private syncChart() {
    const { labels, datasets } = this.data();
    const hidden = this.hiddenSeries();
    const gridColor = this.resolveCssColor('--color-border', 0.5);

    this.chart.data.labels = labels;
    this.chart.data.datasets = datasets.map((ds, i) => {
      const colorVar = ds.colorVar ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
      const bg    = this.resolveCssColor(colorVar, 0.85);
      const hover = this.resolveCssColor(colorVar, 1);
      return {
        label: ds.label,
        data: ds.values,
        backgroundColor: bg,
        hoverBackgroundColor: hover,
        borderRadius: 6,
        borderSkipped: false,
        hidden: hidden.has(i),
        barPercentage: 0.75,
        categoryPercentage: 0.7,
      };
    });

    // Update grid color in case theme changed
    if (this.chart.options.scales?.['y']?.grid) {
      (this.chart.options.scales['y'].grid as { color: string }).color = gridColor;
    }

    this.chart.update('active');
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

  private buildConfig(): ChartConfiguration {
    const { labels, datasets } = this.data();
    const unit = this.unit();
    const gridColor = this.resolveCssColor('--color-border', 0.5);
    const mutedColor = 'hsl(var(--muted-foreground))';

    const chartDatasets = datasets.map((ds, i) => {
      const colorVar = ds.colorVar ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
      const bg    = this.resolveCssColor(colorVar, 0.85);
      const hover = this.resolveCssColor(colorVar, 1);
      return {
        label: ds.label,
        data: ds.values,
        backgroundColor: bg,
        hoverBackgroundColor: hover,
        borderRadius: 6,
        borderSkipped: false as const,
        barPercentage: 0.75,
        categoryPercentage: 0.7,
      };
    });

    return {
      type: 'bar',
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
              title: (items) => items[0]?.label ?? '',
              label: (ctx) =>
                ` ${ctx.dataset.label} : ${(ctx.parsed.y ?? 0).toLocaleString('fr-FR')} ${unit}`,
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
}
