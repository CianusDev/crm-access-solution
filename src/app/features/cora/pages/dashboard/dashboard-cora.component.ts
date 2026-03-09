import { Component, effect, input, OnInit } from '@angular/core';
import { DashboardCoraData } from '../../interfaces/dashbaord-cora.interface';

@Component({
  selector: 'app-dashboard-cora',
  templateUrl: './dashboard-cora.component.html',
})
export class DashboardCoraComponent {
  readonly dashboardCoraData = input<DashboardCoraData>();

  constructor() {
    effect(() => {
      console.log({
        data: this.dashboardCoraData(),
      });
    });
  }
}
