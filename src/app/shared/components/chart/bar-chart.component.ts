import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  input,
  effect,
  OnDestroy,
  signal,
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

      <!-- Toggle datasets -->
      @if (data().datasets.length > 1) {
        <div class="flex gap-2 flex-wrap">
          @for (ds of data().datasets; track ds.label; let i = $index) {
            <button
              class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              [class]="
                activeIndex() === i
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:border-primary'
              "
              (click)="setActive(i)"
            >
              {{ ds.label }}
            </button>
          }
        </div>
      }

      <!-- Chart -->
      <div class="relative w-full flex-1 min-h-0">
        <canvas #chartCanvas class="absolute inset-0 w-full h-full"></canvas>
      </div>
    </div>
  `,
})
export class BarChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  title = input('Bar Chart');
  subtitle = input('Janvier - Juin 2024');

  data = input<BarChartData>({
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      { label: 'Validés', values: [186, 305, 237, 73, 209, 214], colorVar: '--color-chart-1' },
      { label: 'Rejetés', values: [40, 80, 60, 30, 50, 90], colorVar: '--color-chart-2' },
    ],
  });

  activeIndex = signal(0);
  private chart!: Chart;

  constructor() {
    effect(() => {
      // Réagit à tout changement : data() OU activeIndex()
      const ds = this.data().datasets[this.activeIndex()];
      if (!this.chart || !ds) return;

      const bg = this.resolveCssColor(ds.colorVar ?? '--color-chart-1', 0.85);
      const hover = this.resolveCssColor(ds.colorVar ?? '--color-chart-1', 1);

      this.chart.data.labels = this.data().labels;
      this.chart.data.datasets[0].data = ds.values;
      this.chart.data.datasets[0].backgroundColor = ds.values.map(() => bg);
      this.chart.data.datasets[0].hoverBackgroundColor = ds.values.map(() => hover);
      this.chart.update();
    });
  }

  ngOnInit() {
    this.chart = new Chart(this.canvas.nativeElement, this.buildConfig());
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  setActive(index: number) {
    this.activeIndex.set(index);
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
    const ds = this.data().datasets[0];
    const bg = this.resolveCssColor(ds.colorVar ?? '--color-chart-1', 0.85);
    const hover = this.resolveCssColor(ds.colorVar ?? '--color-chart-1', 1);

    return {
      type: 'bar',
      data: {
        labels: this.data().labels,
        datasets: [
          {
            data: ds.values,
            backgroundColor: ds.values.map(() => bg),
            hoverBackgroundColor: ds.values.map(() => hover),
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { title: () => '', label: (ctx) => ` ${ctx.parsed.y} dossiers` },
          },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: {
            grid: { color: this.resolveCssColor('--color-border', 0.5) },
            border: { display: false },
          },
        },
      },
    };
  }
}
