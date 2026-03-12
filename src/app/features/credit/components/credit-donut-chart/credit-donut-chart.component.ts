import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  input,
  computed,
  effect,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-credit-donut-chart',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="flex flex-col items-center gap-5">

      <!-- Canvas with center text -->
      <div class="relative flex items-center justify-center">
        <canvas #canvas width="220" height="220"></canvas>
        @if (total() > 0) {
          <div class="absolute flex flex-col items-center pointer-events-none">
            <span class="text-2xl font-extrabold text-foreground leading-none">{{ total() | number }}</span>
            <span class="text-xs text-muted-foreground mt-0.5">dossiers</span>
          </div>
        } @else {
          <div class="absolute flex flex-col items-center pointer-events-none">
            <span class="text-sm text-muted-foreground">Aucune donnée</span>
          </div>
        }
      </div>

      <!-- Legend -->
      <div class="w-full flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full shrink-0" style="background:#fb923c"></span>
            <span class="text-xs text-muted-foreground">En cours</span>
          </div>
          <span class="text-xs font-semibold text-foreground">{{ enCours() | number }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full shrink-0" style="background:#22c55e"></span>
            <span class="text-xs text-muted-foreground">Clôturés</span>
          </div>
          <span class="text-xs font-semibold text-foreground">{{ clotures() | number }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full shrink-0" style="background:#ef4444"></span>
            <span class="text-xs text-muted-foreground">Rejetés</span>
          </div>
          <span class="text-xs font-semibold text-foreground">{{ rejetes() | number }}</span>
        </div>
      </div>

    </div>
  `,
})
export class CreditDonutChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly enCours  = input(0);
  readonly clotures = input(0);
  readonly rejetes  = input(0);

  readonly total = computed(() => this.enCours() + this.clotures() + this.rejetes());

  private chart?: Chart;

  constructor() {
    effect(() => {
      void this.enCours();
      void this.clotures();
      void this.rejetes();
      if (this.chart) this.syncChart();
    });
  }

  ngAfterViewInit() {
    this.buildChart();
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private buildChart() {
    const ctx = this.canvasRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['En cours', 'Clôturés', 'Rejetés'],
        datasets: [{
          data: [this.enCours(), this.clotures(), this.rejetes()],
          backgroundColor: ['#fb923c', '#22c55e', '#ef4444'],
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = (ctx.parsed as number) ?? 0;
                const total = (ctx.chart.data.datasets[0].data as number[])
                  .reduce((a: number, b) => a + (b as number), 0) || 1;
                const pct = ((val * 100) / total).toFixed(1);
                return `  ${val.toLocaleString('fr-FR')} dossiers (${pct}%)`;
              },
            },
          },
        },
      },
    });
  }

  private syncChart() {
    if (!this.chart) return;
    this.chart.data.datasets[0].data = [this.enCours(), this.clotures(), this.rejetes()];
    this.chart.update('none');
  }
}
