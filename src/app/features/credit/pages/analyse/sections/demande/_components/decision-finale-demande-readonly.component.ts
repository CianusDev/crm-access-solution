import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { CreditDecisionFinale } from '../../../../../interfaces/credit.interface';

@Component({
  selector: 'app-decision-finale-demande-readonly',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
  ],
  template: `
    @if (decision(); as d) {
      <app-card>
        <app-card-header>
          <app-card-title>Décision finale (pré-comité)</app-card-title>
          @if (d.dateDecision) {
            <p class="text-xs text-muted-foreground">
              le {{ d.dateDecision | date: 'longDate' }}
            </p>
          }
        </app-card-header>
        <app-card-content>
          <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <div>
              <dt class="text-muted-foreground text-xs">Montant proposé</dt>
              <dd class="font-semibold tabular-nums text-primary">
                @if (d.montantPropose != null) {
                  {{ d.montantPropose | number: '1.0-0' }} FCFA
                } @else {
                  —
                }
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Montant emprunté</dt>
              <dd class="font-medium tabular-nums">
                @if (d.montantEmprunte != null) {
                  {{ d.montantEmprunte | number: '1.0-0' }} FCFA
                } @else {
                  —
                }
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Mensualité</dt>
              <dd class="font-medium tabular-nums">
                @if (d.mensualite != null) {
                  {{ d.mensualite | number: '1.0-0' }} FCFA
                } @else {
                  —
                }
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Durée</dt>
              <dd class="font-medium">
                @if (d.duree != null) {
                  {{ d.duree }} mois
                } @else {
                  —
                }
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Montant acte notarié</dt>
              <dd class="font-medium tabular-nums">
                @if (d.montantActeNotarie != null) {
                  {{ d.montantActeNotarie | number: '1.0-0' }} FCFA
                } @else {
                  —
                }
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Frais de dossier</dt>
              <dd class="font-medium tabular-nums">
                @if (d.fraisDossier != null) {
                  {{ d.fraisDossier | number: '1.0-0' }} FCFA
                } @else {
                  —
                }
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Commission déboursement</dt>
              <dd class="font-medium tabular-nums">
                @if (d.commissionDeboursement != null) {
                  {{ d.commissionDeboursement | number: '1.0-0' }} FCFA
                } @else {
                  —
                }
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Assurance décès / invalidité</dt>
              <dd class="font-medium tabular-nums">
                @if (d.assurDecesInvalidite != null) {
                  {{ d.assurDecesInvalidite | number: '1.0-0' }} FCFA
                } @else {
                  —
                }
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Hypothèque</dt>
              <dd class="font-medium">{{ hypothequeLabel(d.hypotheque) }}</dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Dépôt (%)</dt>
              <dd class="font-medium tabular-nums">{{ d.deposit ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Taux de couverture</dt>
              <dd class="font-medium tabular-nums">
                {{ d.tauxCouverture != null ? d.tauxCouverture + ' %' : '—' }}
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Période de grâce</dt>
              <dd class="font-medium">{{ periodeGraceLabel(d.periodeGrace, d.nbreMoisGrace) }}</dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Échéance souhaitée</dt>
              <dd class="font-medium">
                @if (d.dateEcheanceSouhaite != null) {
                  Chaque {{ d.dateEcheanceSouhaite }} du mois
                } @else {
                  —
                }
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Acte notarié</dt>
              <dd class="font-medium">{{ ouiNon(d.acteNotarie) }}</dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Assurance multirisque</dt>
              <dd class="font-medium">{{ ouiNon(d.assurMultiRisk) }}</dd>
            </div>
          </dl>
        </app-card-content>
      </app-card>
    } @else {
      <p class="text-sm text-muted-foreground">Aucune décision finale enregistrée.</p>
    }
  `,
})
export class DecisionFinaleDemandeReadonlyComponent {
  readonly decision = input<CreditDecisionFinale | null | undefined>(null);

  hypothequeLabel(v: number | undefined): string {
    if (v === 1) return 'Oui';
    if (v === 2) return 'Non';
    return '—';
  }

  periodeGraceLabel(periode: number | undefined, mois: number | undefined): string {
    if (periode === 2) return 'Non';
    if (periode === 1 && mois != null) return `${mois} mois`;
    if (periode === 1) return 'Oui';
    return '—';
  }

  ouiNon(v: number | undefined): string {
    if (v === 1) return 'Oui';
    if (v === 0 || v === 2) return 'Non';
    return '—';
  }
}
