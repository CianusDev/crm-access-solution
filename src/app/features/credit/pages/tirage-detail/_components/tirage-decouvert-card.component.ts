import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Building2, User, ExternalLink } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { CREDIT_STATUTS, CreditFiche } from '../../../interfaces/credit.interface';

@Component({
  selector: 'app-tirage-decouvert-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
  ],
  template: `
    @if (fiche(); as f) {
      <app-card>
        <app-card-header>
          <div class="flex items-center justify-between w-full">
            <app-card-title>Découvert parent</app-card-title>
            <app-badge [variant]="statutDecouvert().variant" class="text-xs">
              {{ statutDecouvert().label }}
            </app-badge>
          </div>
        </app-card-header>
        <app-card-content>

          <!-- Client -->
          <div class="flex items-center gap-3 pb-4 border-b border-border/60">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
              @if (isPersonneMorale()) {
                <lucide-icon [img]="Building2Icon" [size]="18" class="text-primary" />
              } @else {
                <lucide-icon [img]="UserIcon" [size]="18" class="text-primary" />
              }
            </div>
            <div>
              <p class="text-sm font-semibold text-foreground">{{ f.demande.client.nomPrenom }}</p>
              <p class="text-xs text-muted-foreground font-mono">{{ f.demande.client.codeClient }}</p>
            </div>
          </div>

          <!-- Infos clés -->
          <div class="flex flex-col gap-0 pt-3">

            <div class="flex justify-between py-1.5 border-b border-border/40">
              <span class="text-xs text-muted-foreground">Référence découvert</span>
              <span class="text-xs font-medium font-mono text-foreground">{{ f.demande.refDemande }}</span>
            </div>

            @if (f.demande.numTransaction) {
              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">N° Perfect</span>
                <span class="text-xs font-medium font-mono text-foreground">{{ f.demande.numTransaction }}</span>
              </div>
            }

            @if (f.demande.client.agence) {
              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">Agence</span>
                <span class="text-xs font-medium text-foreground">{{ f.demande.client.agence.libelle }}</span>
              </div>
            }

            @if (f.demande.ar?.nomPrenom) {
              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">Analyste risque</span>
                <span class="text-xs font-medium text-foreground">{{ f.demande.ar!.nomPrenom }}</span>
              </div>
            }

            @if (f.decision?.montantEmprunte) {
              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">Montant accordé</span>
                <span class="text-xs font-semibold text-green-600 dark:text-green-400">
                  {{ f.decision!.montantEmprunte!.toLocaleString('fr-FR') }} FCFA
                </span>
              </div>
            }

            @if (f.decision?.duree) {
              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">Durée accordée</span>
                <span class="text-xs font-medium text-foreground">{{ f.decision!.duree }} mois</span>
              </div>
            }

            <div class="flex justify-between py-1.5">
              <span class="text-xs text-muted-foreground">Date de demande</span>
              <span class="text-xs font-medium text-foreground">
                {{ f.demande.dateDemande | date:'dd/MM/yyyy' }}
              </span>
            </div>

          </div>

          <!-- Liens de navigation -->
          <div class="flex gap-2 pt-3 border-t border-border/60 mt-1">
            <a
              [routerLink]="['/app/credit/analyse', f.demande.refDemande]"
              class="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-border px-3 h-8 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <lucide-icon [img]="ExternalLinkIcon" [size]="11" />
              Analyse
            </a>
            <a
              [routerLink]="['/app/credit/resume', f.demande.refDemande]"
              class="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-border px-3 h-8 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <lucide-icon [img]="ExternalLinkIcon" [size]="11" />
              Résumé
            </a>
          </div>

        </app-card-content>
      </app-card>
    }
  `,
})
export class TirageDecouvertCardComponent {
  readonly Building2Icon = Building2;
  readonly UserIcon = User;
  readonly ExternalLinkIcon = ExternalLink;

  readonly fiche = input<CreditFiche | null>(null);

  readonly isPersonneMorale = computed(() => this.fiche()?.demande?.client?.typeAgent !== 'PP');

  readonly statutDecouvert = computed(() => {
    const s = this.fiche()?.demande?.statut ?? 0;
    return CREDIT_STATUTS[s] ?? { label: `Statut ${s}`, variant: 'default' as const };
  });
}
