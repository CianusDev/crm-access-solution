import { Component } from '@angular/core';
import { TabsComponent } from '@/shared/components/tabs/tabs.component';
import { TabComponent } from '@/shared/components/tabs/tab.component';
import { ConfigAgencesComponent } from './config-agences/config-agences.component';
import { ConfigAscComponent } from './config-asc/config-asc.component';
import { ConfigCreditComponent } from './config-credit/config-credit.component';
import { ConfigZonificationComponent } from './config-zonification/config-zonification.component';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  imports: [
    TabsComponent, TabComponent,
    ConfigAgencesComponent,
    ConfigAscComponent,
    ConfigCreditComponent,
    ConfigZonificationComponent,
  ],
})
export class ConfigurationComponent {}
