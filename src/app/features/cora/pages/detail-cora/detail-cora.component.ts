import {
  AppTableComponent,
  TableBodyComponent,
  TableCellComponent,
  TableHeadComponent,
  TableHeaderComponent,
  TableRowComponent,
} from '@/shared/components/table/table.component';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { BadgeVariant } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  FileText,
  Users,
  Layers,
  Eye,
  LucideAngularModule,
} from 'lucide-angular';
import { Cora, CoraAgent } from '../../interfaces/cora.interface';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';

const FORME_JURIDIQUE: Record<number, string> = {
  1: 'ENTREPRISE INDIVIDUELLE',
  2: 'SARL',
  3: 'SA',
  4: 'SASU',
  5: 'SAS',
  6: 'INFORMEL',
};

const AGENT_TYPE_LABEL: Record<number, string> = {
  1: 'Agent principal',
  2: 'Sous utilisateur',
  3: 'Sous agent',
};

const AGENT_STATUT_LABEL: Record<number, string> = {
  1: 'Rejeté',
  2: "En attente d'évaluation",
  3: 'En attente de validation',
  4: "En attente d'approbation",
  5: "En attente de création des accès",
  6: 'En attente de clôture',
  7: 'Clôturé',
};

const AGENT_STATUT_VARIANT: Record<number, BadgeVariant> = {
  1: 'destructive',
  2: 'warning',
  3: 'warning',
  4: 'warning',
  5: 'secondary',
  6: 'secondary',
  7: 'success',
};

@Component({
  selector: 'app-detail-cora',
  templateUrl: './detail-cora.component.html',
  imports: [
    AppTableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    BadgeComponent,
    ButtonDirective,
    LucideAngularModule,
    DatePipe,
    DecimalPipe,
    UpperCasePipe,
  ],
})
export class DetailCoraComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly Building2Icon = Building2;
  readonly MapPinIcon = MapPin;
  readonly PhoneIcon = Phone;
  readonly FileTextIcon = FileText;
  readonly UsersIcon = Users;
  readonly LayersIcon = Layers;
  readonly EyeIcon = Eye;

  private readonly router = inject(Router);

  // Resolver data
  readonly cora = input<Cora>();

  readonly initiales = computed(() => {
    return (this.cora()?.designation ?? '')
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase();
  });

  readonly formeJuridique = computed(() =>
    FORME_JURIDIQUE[this.cora()?.formuleJuridique ?? 0] ?? '—',
  );

  goBack() {
    this.router.navigate(['/app/cora/list']);
  }

  agentTypeLabel(agent: CoraAgent): string {
    return AGENT_TYPE_LABEL[agent.typeUser ?? 0] ?? '—';
  }

  agentTypeBadgeVariant(agent: CoraAgent): BadgeVariant {
    return agent.typeUser === 1 ? 'default' : 'secondary';
  }

  agentStatutLabel(agent: CoraAgent): string {
    return AGENT_STATUT_LABEL[agent.statut ?? 0] ?? '—';
  }

  agentStatutVariant(agent: CoraAgent): BadgeVariant {
    return AGENT_STATUT_VARIANT[agent.statut ?? 0] ?? 'secondary';
  }

  viewAgent(agentId: number) {
    this.router.navigate(['/app/cora/agent', agentId]);
  }
}
