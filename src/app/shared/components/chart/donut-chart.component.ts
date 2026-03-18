import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  input,
  effect,
  computed,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

export interface DonutChartSlice {
  label: string;
  value: number;
  colorVar?: string; // ex: '--color-chart-1'
}

const FALLBACK_COLORS = [
  '--color-chart-1',
  '--color-chart-2',
  '--color-chart-3',
  '--color-chart-4',
  '--color-chart-5',
];

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 h-full">

      <!-- Header -->
      <div class="flex flex-col gap-1">
        <h3 class="text-base font-semibold text-foreground">{{ title() }}</h3>
        @if (subtitle()) {
          <p class="text-sm text-muted-foreground">{{ subtitle() }}</p>
        }
      </div>

      @if (isEmpty()) {
        <div class="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.5" class="text-muted-foreground/25">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
          <p class="text-sm text-muted-foreground">Aucune donnée à afficher</p>
        </div>
      } @else {
        <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">

          <!-- Canvas -->
          <div class="relative shrink-0" style="width:160px;height:160px">
            <canvas #chartCanvas style="width:160px;height:160px"></canvas>
            <!-- Total centré -->
            @if (centerLabel()) {
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p class="text-lg font-bold text-foreground leading-none">{{ total() | number }}</p>
                <p class="text-xs text-muted-foreground">{{ centerLabel() }}</p>
              </div>
            }
          </div>

          <!-- Légende -->
          <div class="flex flex-col gap-2 flex-1 min-w-0">
            @for (slice of slices(); track slice.label; let i = $index) {
              <div class="flex items-center gap-2 min-w-0">
                <span class="shrink-0 h-2.5 w-2.5 rounded-full" [style.background-color]="resolvedColors()[i]"></span>
                <span class="flex-1 min-w-0 text-xs text-muted-foreground truncate">{{ slice.label }}</span>
                <span class="shrink-0 text-xs font-semibold text-foreground tabular-nums">{{ slice.value | number }}</span>
                <span class="shrink-0 text-xs text-muted-foreground tabular-nums">
                  ({{ total() > 0 ? ((slice.value / total()) * 100).toFixed(1) : '0' }}%)
                </span>
              </div>
            }
          </div>

        </div>
      }

    </div>
  `,
})
export class DonutChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: false }) canvas?: ElementRef<HTMLCanvasElement>;

  readonly title       = input('Donut Chart');
  readonly subtitle    = input('');
  readonly centerLabel = input('');
  readonly slices      = input<DonutChartSlice[]>([]);

  readonly isEmpty  = computed(() => this.slices().every((s) => s.value === 0));
  readonly total    = computed(() => this.slices().reduce((acc, s) => acc + s.value, 0));

  readonly resolvedColors = computed(() =>
    this.slices().map((s, i) =>
      this.resolveCssColor(s.colorVar ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length], 1),
    ),
  );

  private chart?: Chart<'doughnut'>;

  constructor() {
    effect(() => {
      const _ = this.slices(); // track
      if (this.chart) this.syncChart();
    });
  }

  ngOnInit() {
    if (this.canvas) this.initChart();
  }

  ngAfterViewInit() {
    if (!this.chart && this.canvas) this.initChart();
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private initChart() {
    if (!this.canvas) return;
    this.chart = new Chart<'doughnut'>(this.canvas.nativeElement, this.buildConfig());
  }

  private syncChart() {
    if (!this.chart) return;
    const colors = this.resolvedColors();
    this.chart.data.labels  = this.slices().map((s) => s.label);
    this.chart.data.datasets[0].data = this.slices().map((s) => s.value);
    this.chart.data.datasets[0].backgroundColor = colors;
    this.chart.update('active');
  }

  private buildConfig(): ChartConfiguration<'doughnut'> {
    const colors = this.resolvedColors();
    return {
      type: 'doughnut',
      data: {
        labels: this.slices().map((s) => s.label),
        datasets: [
          {
            data: this.slices().map((s) => s.value),
            backgroundColor: colors,
            hoverOffset: 6,
            borderWidth: 2,
            borderColor: 'hsl(var(--card))',
          },
        ],
      },
      options: {
        responsive: false,
        cutout: '68%',
        animation: { duration: 400 },
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
              label: (ctx) => ` ${(ctx.parsed ?? 0).toLocaleString('fr-FR')}`,
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
