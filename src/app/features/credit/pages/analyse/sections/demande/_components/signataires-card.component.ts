import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideAngularModule, Users, User } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { CreditSignataire } from '../../../../../interfaces/credit.interface';

@Component({
  selector: 'app-signataires-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
  ],
  template: `
    <app-card>
      <app-card-header>
        <div class="flex items-center gap-2">
          <lucide-icon [img]="UsersIcon" [size]="16" class="text-muted-foreground" />
          <app-card-title>Signataires</app-card-title>
        </div>
      </app-card-header>
      <app-card-content>
        @if (signataires().length > 0) {
          <div class="flex flex-col gap-4">
            @for (s of signataires(); track $index) {
              <div class="rounded-lg border border-border bg-muted/20 p-4">
                <div class="flex items-center gap-2 mb-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <lucide-icon [img]="UserIcon" [size]="16" class="text-primary" />
                  </div>
                  <p class="text-sm font-semibold text-foreground">
                    {{ s.prenom }} {{ s.nom }}
                  </p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                  @if (s.numPiece) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">N° pièce</span>
                      <span class="text-xs font-medium font-mono text-foreground">{{ s.numPiece }}</span>
                    </div>
                  }
                  @if (s.nationalite?.nationalite) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Nationalité</span>
                      <span class="text-xs font-medium text-foreground">{{ s.nationalite!.nationalite }}</span>
                    </div>
                  }
                  @if (s.lieuNaiss) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Lieu de naissance</span>
                      <span class="text-xs font-medium text-foreground">{{ s.lieuNaiss }}</span>
                    </div>
                  }
                  @if (s.dateNaissance) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Date de naissance</span>
                      <span class="text-xs font-medium text-foreground">{{ s.dateNaissance | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                  @if (s.commune?.libelle) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Commune</span>
                      <span class="text-xs font-medium text-foreground">{{ s.commune!.libelle }}</span>
                    </div>
                  }
                  @if (s.rue) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Rue</span>
                      <span class="text-xs font-medium text-foreground">{{ s.rue }}</span>
                    </div>
                  }
                  @if (s.numTelephone) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Téléphone</span>
                      <span class="text-xs font-medium text-foreground">{{ s.numTelephone }}</span>
                    </div>
                  }
                  @if (s.dateDelivrancePiece) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Délivrance pièce</span>
                      <span class="text-xs font-medium text-foreground">{{ s.dateDelivrancePiece | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                  @if (s.dateExpirationPiece) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Expiration pièce</span>
                      <span class="text-xs font-medium text-foreground">{{ s.dateExpirationPiece | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                  @if (s.lieuDelivrance) {
                    <div class="flex justify-between py-1.5 border-b border-border/40">
                      <span class="text-xs text-muted-foreground">Lieu de délivrance</span>
                      <span class="text-xs font-medium text-foreground">{{ s.lieuDelivrance }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="flex flex-col items-center justify-center py-10 text-center">
            <lucide-icon [img]="UsersIcon" [size]="28" class="text-muted-foreground/40 mb-2" />
            <p class="text-sm text-muted-foreground">Aucun signataire enregistré.</p>
          </div>
        }
      </app-card-content>
    </app-card>
  `,
})
export class SignatairesCardComponent {
  readonly UsersIcon = Users;
  readonly UserIcon  = User;

  readonly signataires = input<CreditSignataire[]>([]);
}
