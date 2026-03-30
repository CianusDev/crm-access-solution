import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { LucideAngularModule, CirclePause, ShieldAlert, Award, Clock } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { CreditFicheDemandeDetail, CreditResume } from '../../../interfaces/credit.interface';

@Component({
  selector: 'app-tirage-dossier-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    DatePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
  ],
  template: `
    @if (demande(); as d) {
      <app-card>
        <app-card-header>
          <div class="flex items-center justify-between w-full flex-wrap gap-2">
            <app-card-title>Informations du tirage</app-card-title>
            <!-- Badges d'état -->
            <div class="flex items-center gap-1.5 flex-wrap">
              @if (d.pause === 1) {
                <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <lucide-icon [img]="CirclePauseIcon" [size]="11" />
                  En pause
                </span>
              }
              @if (d.derogation === 1) {
                <span class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  <lucide-icon [img]="ShieldAlertIcon" [size]="11" />
                  En dérogation
                </span>
              }
              @if (d.derogation === 2) {
                <span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <lucide-icon [img]="ShieldAlertIcon" [size]="11" />
                  Dérogation validée
                </span>
              }
            </div>
          </div>
        </app-card-header>
        <app-card-content>
          <div class="flex flex-col gap-0">

            <div class="flex justify-between py-1.5 border-b border-border/40">
              <span class="text-xs text-muted-foreground">Référence tirage</span>
              <span class="text-xs font-medium font-mono text-foreground">{{ d.refDemande }}</span>
            </div>

            <div class="flex justify-between py-1.5 border-b border-border/40">
              <span class="text-xs text-muted-foreground">Type de crédit</span>
              <span class="text-xs font-medium text-foreground">{{ d.typeCredit.libelle }}</span>
            </div>

            @if (d.objetCredit) {
              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">Objet du crédit</span>
                <span class="text-xs font-medium text-foreground max-w-[180px] text-right">{{ d.objetCredit }}</span>
              </div>
            }

            @if (d.typeActivite) {
              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">Secteur d'activité</span>
                <span class="text-xs font-medium text-foreground">{{ d.typeActivite.libelle }}</span>
              </div>
            }

            <div class="flex justify-between py-1.5 border-b border-border/40">
              <span class="text-xs text-muted-foreground">Montant sollicité</span>
              <span class="text-xs font-semibold text-primary">
                {{ d.montantSollicite | number:'1.0-0':'fr-FR' }} FCFA
              </span>
            </div>

            <div class="flex justify-between py-1.5 border-b border-border/40">
              <span class="text-xs text-muted-foreground">Durée souhaitée</span>
              <span class="text-xs font-medium text-foreground">{{ d.nbreEcheanceSollicite }} mois</span>
            </div>

            <div class="flex justify-between py-1.5 border-b border-border/40">
              <span class="text-xs text-muted-foreground">Échéance souhaitée</span>
              <span class="text-xs font-medium text-foreground">
                {{ d.montantEcheSouhaite | number:'1.0-0':'fr-FR' }} FCFA
              </span>
            </div>

            @if (d.ar?.nomPrenom) {
              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">Analyste risque</span>
                <span class="text-xs font-medium text-foreground">{{ d.ar!.nomPrenom }}</span>
              </div>
            }

            @if (d.numTransaction) {
              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">N° Perfect</span>
                <span class="text-xs font-medium font-mono text-foreground">{{ d.numTransaction }}</span>
              </div>
            }

            <div class="flex justify-between py-1.5">
              <span class="text-xs text-muted-foreground">Date de demande</span>
              <span class="text-xs font-medium text-foreground">{{ d.dateDemande | date:'dd/MM/yyyy' }}</span>
            </div>

          </div>

          @if (d.description) {
            <div class="mt-3 pt-3 border-t border-border/40">
              <p class="text-xs text-muted-foreground mb-1.5">Description</p>
              <p class="text-xs text-foreground/80 leading-relaxed">{{ d.description }}</p>
            </div>
          }

          <!-- Résumé du vote comité si disponible -->
          @if (resume()?.comites?.length) {
            <div class="mt-3 pt-3 border-t border-border/40">
              <div class="flex items-center gap-1.5 mb-2">
                <lucide-icon [img]="AwardIcon" [size]="13" class="text-primary" />
                <p class="text-xs font-semibold text-foreground">Décision comité</p>
              </div>
              @for (c of resume()!.comites!; track $index) {
                <div class="flex justify-between py-1 text-xs">
                  <span class="text-muted-foreground">{{ c.user?.nomPrenom ?? 'Membre' }}</span>
                  <span class="font-semibold text-foreground">
                    {{ (c.montantPropose ?? 0).toLocaleString('fr-FR') }} FCFA
                  </span>
                </div>
              }
            </div>
          }

        </app-card-content>
      </app-card>
    }
  `,
})
export class TirageDossierCardComponent {
  readonly CirclePauseIcon = CirclePause;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly AwardIcon = Award;
  readonly ClockIcon = Clock;

  readonly demande = input<CreditFicheDemandeDetail | null>(null);
  readonly resume = input<CreditResume | null>(null);
}
