import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { Employeur } from '../../../../../interfaces/credit.interface';

@Component({
  selector: 'app-employeur-demande-readonly',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
  ],
  template: `
    @if (employeur(); as emp) {
      <app-card>
        <app-card-header>
          <div class="flex items-start gap-3">
            <div
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {{ initials(emp.nomEntreprise) }}
            </div>
            <div>
              <app-card-title>{{ emp.nomEntreprise ?? '—' }}</app-card-title>
              @if (emp.codeAdh) {
                <p class="text-xs text-muted-foreground">{{ emp.codeAdh }}</p>
              }
            </div>
          </div>
        </app-card-header>
        <app-card-content class="space-y-4">
          <section class="rounded-lg border border-border p-4">
            <h3 class="text-sm font-bold mb-3">Renseignements sur l&apos;entreprise</h3>
            <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div>
                <dt class="text-muted-foreground text-xs">Secteur d&apos;activité</dt>
                <dd class="font-medium">{{ secteurLibelle() }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">Date de création</dt>
                <dd class="font-medium">
                  @if (emp.dateCreation) {
                    {{ emp.dateCreation | date: 'dd/MM/yyyy' }}
                  } @else {
                    —
                  }
                </dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">Capital social</dt>
                <dd class="font-medium tabular-nums">
                  @if (emp.capitalSocial != null) {
                    {{ emp.capitalSocial | number: '1.0-0' }} FCFA
                  } @else {
                    —
                  }
                </dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">Forme juridique</dt>
                <dd class="font-medium">{{ formuleJuridiqueLabel(emp.formuleJuridique) }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">Actionnariat / associés</dt>
                <dd class="font-medium">{{ emp.associes ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">Masse salariale mensuelle</dt>
                <dd class="font-medium tabular-nums">
                  @if (emp.masseSalariale != null) {
                    {{ emp.masseSalariale | number: '1.0-0' }} FCFA
                  } @else {
                    —
                  }
                </dd>
              </div>
              @if (emp.codeAdh) {
                <div>
                  <dt class="text-muted-foreground text-xs">Numéro Perfect</dt>
                  <dd class="font-medium">{{ emp.codeAdh }}</dd>
                </div>
              }
            </dl>
          </section>

          <section class="rounded-lg border border-border p-4">
            <h3 class="text-sm font-bold mb-3">Renseignements sur les employés</h3>
            <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div>
                <dt class="text-muted-foreground text-xs">CDD entreprise</dt>
                <dd class="font-medium tabular-nums">{{ emp.nbreCddEnt ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">CDD client CREDIT ACCESS</dt>
                <dd class="font-medium tabular-nums">{{ emp.nbreCddCA ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">CDI entreprise</dt>
                <dd class="font-medium tabular-nums">{{ emp.nbreCdiEnt ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">CDI client CREDIT ACCESS</dt>
                <dd class="font-medium tabular-nums">{{ emp.nbreCdiCA ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">Agents de maîtrise entreprise</dt>
                <dd class="font-medium tabular-nums">{{ emp.nbreAgentmEnt ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">Agents de maîtrise CREDIT ACCESS</dt>
                <dd class="font-medium tabular-nums">{{ emp.nbreAgentmCA ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">Cadres entreprise</dt>
                <dd class="font-medium tabular-nums">{{ emp.nbreCadreEnt ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">Cadres CREDIT ACCESS</dt>
                <dd class="font-medium tabular-nums">{{ emp.nbreCadreCA ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">Employés avec compte bancaire</dt>
                <dd class="font-medium tabular-nums">{{ emp.nbreEmplBacarise ?? '—' }}</dd>
              </div>
            </dl>
          </section>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <section class="rounded-lg border border-border p-4">
              <h4 class="text-xs font-bold text-muted-foreground mb-2">Banque(s)</h4>
              <div class="flex flex-wrap gap-1.5">
                @for (b of banqueItems(); track $index) {
                  <app-badge variant="secondary">{{ b }}</app-badge>
                } @empty {
                  <span class="text-sm text-muted-foreground">—</span>
                }
              </div>
            </section>
            <section class="rounded-lg border border-border p-4">
              <h4 class="text-xs font-bold text-muted-foreground mb-2">Principaux clients</h4>
              <div class="flex flex-wrap gap-1.5">
                @for (c of emp.clients ?? []; track $index) {
                  <app-badge variant="outline">{{ c }}</app-badge>
                } @empty {
                  <span class="text-sm text-muted-foreground">—</span>
                }
              </div>
            </section>
            <section class="rounded-lg border border-border p-4">
              <h4 class="text-xs font-bold text-muted-foreground mb-2">Fournisseurs</h4>
              <div class="flex flex-wrap gap-1.5">
                @for (f of emp.fournisseurs ?? []; track $index) {
                  <app-badge variant="outline">{{ f }}</app-badge>
                } @empty {
                  <span class="text-sm text-muted-foreground">—</span>
                }
              </div>
            </section>
          </div>
        </app-card-content>
      </app-card>
    } @else {
      <p class="text-sm text-muted-foreground">Aucun employeur lié à cette demande.</p>
    }
  `,
})
export class EmployeurDemandeReadonlyComponent {
  readonly employeur = input<Employeur | null | undefined>(null);

  formuleJuridiqueLabel(n: number | undefined): string {
    if (n == null) return '—';
    const map: Record<number, string> = {
      1: 'ENTREPRISE INDIVIDUELLE',
      2: 'SARL',
      3: 'SA',
      4: 'SASU',
      5: 'ASSOCIATION',
      6: 'COOPERATIVE',
      7: 'SAS',
      8: 'INFORMEL',
      9: 'SARLU',
      10: 'SCOOPS',
      11: 'COOP-CA',
    };
    return map[n] ?? '—';
  }

  readonly secteurLibelle = computed(() => {
    const s = this.employeur()?.secteurActivite;
    if (!s) return '—';
    if (Array.isArray(s)) return s[0]?.libelle ?? '—';
    return s.libelle ?? '—';
  });

  readonly banqueItems = computed(() => {
    const b = this.employeur()?.banque;
    if (!b) return [];
    if (Array.isArray(b)) {
      return b.map((item) => (typeof item === 'string' ? item : item?.libelle ?? '')).filter(Boolean);
    }
    return [b];
  });

  initials(name: string | undefined): string {
    if (!name?.trim()) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
