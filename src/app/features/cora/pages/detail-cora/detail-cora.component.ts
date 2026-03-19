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
import { PdfExportService } from '@/core/services/export/pdf-export.service';
import type { TableCell } from 'pdfmake/interfaces';
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
import { DatePipe, DecimalPipe } from '@angular/common';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { getInitiales, InitialesPipe } from '@/shared/pipes/initiales.pipe';

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
    Avatar,
    InitialesPipe,
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
  private readonly pdfService = inject(PdfExportService);

  // Resolver data
  readonly cora = input<Cora>();

  readonly initiales = computed(() => getInitiales(this.cora()?.designation));

  readonly formeJuridique = computed(() =>
    FORME_JURIDIQUE[this.cora()?.formuleJuridique ?? 0] ?? '—',
  );

  goBack() {
    this.router.navigate(['/app/cora/list']);
  }

  async exportPdf() {
    const c = this.cora();
    if (!c) return;

    const infos: [string, string][] = [
      ['Référence', c.reference ?? '—'],
      ['Désignation', c.designation ?? '—'],
      ['Email', c.email ?? '—'],
      ['N. PERFECT', c.perfect ?? '—'],
      ['N. P-Mobile', c.pmobile ?? '—'],
      ['Mobile', c.mobile ?? '—'],
      ['Fixe', c.fixe ?? '—'],
      ['Commune', c.commune?.libelle ?? '—'],
      ['Quartier', c.quartier ?? '—'],
      ['Rue', c.rue ?? '—'],
      ['Forme juridique', this.formeJuridique() ?? '—'],
      ['Capital social', c.capital ? `${c.capital.toLocaleString('fr-FR')} FCFA` : '—'],
      ['RCCM', c.rccm ?? '—'],
      ['NCC', c.ncc ?? '—'],
      ['Gestionnaire', c.user ? `${c.user.nom} ${c.user.prenom}` : '—'],
    ];

    const agentRows: TableCell[][] = [
      [
        { text: 'Référence', style: 'tableHeader' },
        { text: 'Nom / Prénom', style: 'tableHeader' },
        { text: 'Commune', style: 'tableHeader' },
        { text: 'Type', style: 'tableHeader' },
        { text: 'Statut', style: 'tableHeader' },
      ],
      ...(c.agents ?? []).map((a, i) =>
        this.pdfService.tableRow(
          [
            a.reference ?? '—',
            a.nomPrenom ?? '—',
            a.commune?.libelle ?? '—',
            AGENT_TYPE_LABEL[a.typeUser ?? 0] ?? '—',
            AGENT_STATUT_LABEL[a.statut ?? 0] ?? '—',
          ],
          i % 2 === 1,
        ),
      ),
    ];

    await this.pdfService.download(
      {
        pageMargins: [40, 70, 40, 50],
        header: this.pdfService.header('Fiche CORA', c.reference),
        footer: (currentPage, pageCount) => this.pdfService.footer(currentPage, pageCount),
        content: [
          { text: c.designation, style: 'sectionTitle', fontSize: 14 },
          { text: '\n' },
          { text: 'Informations générales', style: 'sectionTitle' },
          {
            table: {
              widths: [140, '*'],
              body: infos.map(([label, value], i) => [
                { text: label, style: i % 2 === 0 ? 'tableCell' : 'tableCellAlt', bold: true },
                { text: value, style: i % 2 === 0 ? 'tableCell' : 'tableCellAlt' },
              ]),
            },
            layout: { hLineWidth: () => 0.5, vLineWidth: () => 0, hLineColor: () => '#e5e7eb' },
          },
          { text: '\n' },
          { text: `Agents (${(c.agents ?? []).length})`, style: 'sectionTitle' },
          (c.agents ?? []).length === 0
            ? { text: 'Aucun agent enregistré.', style: 'tableCell', italics: true }
            : {
                table: {
                  headerRows: 1,
                  widths: ['auto', '*', 'auto', 'auto', '*'],
                  body: agentRows,
                },
                layout: { hLineWidth: () => 0.5, vLineWidth: () => 0, hLineColor: () => '#e5e7eb' },
              },
        ],
        styles: this.pdfService.baseStyles,
      },
      `fiche-cora-${c.reference ?? c.id}`,
    );
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
