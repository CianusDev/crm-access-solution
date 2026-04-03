import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { CreditPreEvaluationAcjCe } from '../../../../../interfaces/credit.interface';

@Component({
  selector: 'app-pre-evaluation-ce-readonly',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent],
  template: `
    <app-card>
      <app-card-header>
        <app-card-title>Pré-évaluation du Chef d&apos;équipe (CE)</app-card-title>
        <p class="text-xs text-muted-foreground">Pré-évaluation</p>
      </app-card-header>
      <app-card-content class="space-y-4">
        @if (preEvaluation(); as e) {
          <section class="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-muted-foreground text-xs mb-1">
                  Nombre de collectes (2 derniers mois)
                </p>
                <p class="font-medium tabular-nums">{{ e.lastMonthCollect ?? '—' }}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs mb-1">Montant récurrent</p>
                <p class="font-medium tabular-nums">
                  @if (e.montRecurrent != null) {
                    {{ e.montRecurrent | number: '1.0-0' }} FCFA
                  } @else {
                    —
                  }
                </p>
              </div>
            </div>
            <div>
              <p class="text-muted-foreground text-xs mb-1">Enquête de voisinage</p>
              <div class="prose prose-sm dark:prose-invert max-w-none text-sm" [innerHTML]="safeHtml(enquetteHtml())"></div>
            </div>
          </section>

          <section class="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Sur la demande
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-muted-foreground text-xs mb-1">Avis CE sur la demande</p>
                <p class="font-medium">{{ display(e.avisCeDmde) }}</p>
              </div>
              <div>
                <p class="text-muted-foreground text-xs mb-1">Détail / autre avis</p>
                <p class="font-medium break-words">{{ display(e.avisAcjDmde) }}</p>
              </div>
            </div>
            <div>
              <p class="text-muted-foreground text-xs mb-1">Recommandations du CE</p>
              <div class="prose prose-sm dark:prose-invert max-w-none text-sm" [innerHTML]="safeHtml(recommandationHtml())"></div>
            </div>
          </section>
        } @else {
          <p class="text-sm text-muted-foreground">Aucune pré-évaluation CE enregistrée.</p>
        }
      </app-card-content>
    </app-card>
  `,
})
export class PreEvaluationCeReadonlyComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly preEvaluation = input<CreditPreEvaluationAcjCe | null | undefined>(null);

  readonly enquetteHtml = computed(() => this.preEvaluation()?.enquetteVoisinage ?? '');
  readonly recommandationHtml = computed(() => this.preEvaluation()?.recommandationCe ?? '');

  display(v: string | undefined): string {
    return v?.trim() ? v : '—';
  }

  safeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }
}
