import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { CreditPreEvaluationAcjCe } from '../../../../../interfaces/credit.interface';

@Component({
  selector: 'app-pre-evaluation-acj-readonly',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent],
  template: `
    <app-card>
      <app-card-header>
        <app-card-title>Avis de l&apos;Agent Commercial Junior (ACJ)</app-card-title>
        <p class="text-xs text-muted-foreground">Pré-évaluation</p>
      </app-card-header>
      <app-card-content class="space-y-4">
        @if (preEvaluation(); as e) {
          <section class="rounded-lg border border-border bg-muted/30 p-4">
            <h3 class="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
              Sur le demandeur et son environnement
            </h3>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              @for (row of envRows(); track row.label) {
                <div class="flex flex-col gap-0.5 py-1 border-b border-border/50 sm:col-span-2">
                  <dt class="text-muted-foreground">{{ row.label }}</dt>
                  <dd class="font-medium text-foreground">{{ row.value }}</dd>
                </div>
              }
            </dl>
          </section>

          <section class="rounded-lg border border-border bg-muted/30 p-4">
            <h3 class="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
              Sur l&apos;activité
            </h3>
            <dl class="grid grid-cols-1 gap-y-2 text-sm">
              @for (row of activiteRows(); track row.label) {
                <div class="flex flex-col gap-0.5 py-1 border-b border-border/50">
                  <dt class="text-muted-foreground">{{ row.label }}</dt>
                  <dd class="font-medium text-foreground">{{ row.value }}</dd>
                </div>
              }
            </dl>
          </section>

          <section class="rounded-lg border border-border bg-muted/30 p-4">
            <h3 class="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
              Sur le demandeur et l&apos;agent commercial
            </h3>
            <dl class="grid grid-cols-1 gap-y-2 text-sm">
              @for (row of agentRows(); track row.label) {
                <div class="flex flex-col gap-0.5 py-1 border-b border-border/50">
                  <dt class="text-muted-foreground">{{ row.label }}</dt>
                  <dd class="font-medium text-foreground">{{ row.value }}</dd>
                </div>
              }
            </dl>
          </section>

          <section class="rounded-lg border border-border bg-muted/30 p-4">
            <h3 class="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
              Sur la demande
            </h3>
            <div class="flex flex-col gap-0.5">
              <span class="text-muted-foreground text-sm">Avis ACJ sur la demande</span>
              <span class="font-medium text-foreground">{{ label(e.avisAcjDmde) }}</span>
            </div>
          </section>
        } @else {
          <p class="text-sm text-muted-foreground">Aucune pré-évaluation ACJ enregistrée.</p>
        }
      </app-card-content>
    </app-card>
  `,
})
export class PreEvaluationAcjReadonlyComponent {
  readonly preEvaluation = input<CreditPreEvaluationAcjCe | null | undefined>(null);

  label(v: string | undefined): string {
    return v?.trim() ? v : '—';
  }

  readonly envRows = computed(() => {
    const e = this.preEvaluation();
    if (!e) return [];
    return [
      { label: 'Relation avec ses clients', value: this.label(e.relationClt) },
      { label: 'Relation avec ses employés', value: this.label(e.relationEmploye) },
      { label: 'Son voisinage', value: this.label(e.relationVosinage) },
    ];
  });

  readonly activiteRows = computed(() => {
    const e = this.preEvaluation();
    if (!e) return [];
    return [
      { label: "Affluence sur le lieu d'activité", value: this.label(e.affluenceActivite) },
      { label: 'Quantité de stock', value: this.label(e.quantiteStock) },
      { label: 'Qualité du stock', value: this.label(e.qualiteStock) },
    ];
  });

  readonly agentRows = computed(() => {
    const e = this.preEvaluation();
    if (!e) return [];
    return [
      { label: "Relation avec l'agent commercial", value: this.label(e.relationCommercial) },
      { label: 'Évolution des montants collectés', value: this.label(e.evolutionMtCollect) },
      { label: 'Fréquence des collectes', value: this.label(e.frequenceMtCollect) },
    ];
  });
}
