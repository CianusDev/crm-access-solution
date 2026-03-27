import { TabComponent } from '@/shared/components/tabs/tab.component';
import { TabsComponent } from '@/shared/components/tabs/tabs.component';
import { Component } from '@angular/core';
import {
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardFooterComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { POWER_BI_LINKS } from '@/core/constants/power-bi-links';
import { SafeUrlPipe } from '@/shared/pipes/safe-url/safe-url.pipe';
import { IframeComponent } from '@/shared/components/iframe/iframe.component';
import {
  ChartNoAxesCombinedIcon,
  CreditCardIcon,
  GiftIcon,
  LandmarkIcon,
  UsersIcon,
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard-power-bi',
  templateUrl: './dashboard-power-bi.component.html',
  imports: [
    TabsComponent,
    TabComponent,
    // CardComponent,
    // CardHeaderComponent,
    // CardTitleComponent,
    // CardDescriptionComponent,
    // CardContentComponent,
    // CardFooterComponent,
    SafeUrlPipe,
    IframeComponent,
  ],
})
export class DashboardPowerBi {
  readonly powerBiLinks = POWER_BI_LINKS;
  readonly UsersIcon = UsersIcon;
  readonly LandmarkIcon = LandmarkIcon;
  readonly CreditCardIcon = CreditCardIcon;
  readonly ChartNoAxesCombinedIcon = ChartNoAxesCombinedIcon;

  constructor() {}
}
