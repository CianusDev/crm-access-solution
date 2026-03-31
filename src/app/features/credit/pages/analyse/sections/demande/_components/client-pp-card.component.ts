import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { LucideAngularModule, User, Pencil, X, Save } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { CreditService } from '../../../../../services/credit/credit.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditClient } from '../../../../../interfaces/credit.interface';

@Component({
  selector: 'app-client-pp-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    BadgeComponent,
    ButtonDirective,
    FormInput,
  ],
  template: `
    @if (client(); as c) {
      <app-card>
        <app-card-header>
          <div class="flex items-center justify-between w-full">
            <app-card-title>Personne physique</app-card-title>
            @if (!editing()) {
              <button type="button" appButton variant="outline" size="sm"
                class="flex items-center gap-1.5" (click)="startEdit()">
                <lucide-icon [img]="PencilIcon" [size]="13" /> Modifier
              </button>
            }
          </div>
        </app-card-header>
        <app-card-content>

          <!-- Avatar + identité -->
          <div class="flex flex-col items-center gap-2 pb-4 mb-4 border-b border-border">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <lucide-icon [img]="UserIcon" [size]="24" class="text-primary" />
            </div>
            <div class="text-center">
              <p class="text-base font-bold text-foreground">{{ c.nomPrenom }}</p>
              <p class="text-xs text-muted-foreground">{{ c.codeClient }}</p>
              <div class="flex flex-wrap justify-center gap-1.5 mt-1.5">
                <app-badge variant="secondary">PP</app-badge>
                @if (c.agence) {
                  <app-badge variant="outline">Agence {{ c.agence.libelle }}</app-badge>
                }
              </div>
            </div>
          </div>

          <!-- ── Mode lecture ─────────────────────────────────────── -->
          @if (!editing()) {
            <p class="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Identification</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-4">
              @if (c.dataNaiss) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Date de naissance</span>
                  <span class="text-xs font-medium text-foreground">{{ c.dataNaiss | date:'dd/MM/yyyy' }}</span>
                </div>
              }
              @if (c.lieuNaiss) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Lieu de naissance</span>
                  <span class="text-xs font-medium text-foreground">{{ c.lieuNaiss }}</span>
                </div>
              }
              @if (c.profession) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Profession</span>
                  <span class="text-xs font-medium text-foreground">{{ c.profession }}</span>
                </div>
              }
              @if (c.nationalite?.nationalite) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Nationalité</span>
                  <span class="text-xs font-medium text-foreground">{{ c.nationalite!.nationalite }}</span>
                </div>
              }
              @if (c.dateInscription) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Date d'inscription</span>
                  <span class="text-xs font-medium text-foreground">{{ c.dateInscription | date:'dd/MM/yyyy' }}</span>
                </div>
              }
            </div>

            <p class="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Contact</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              @if (c.telFixe) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Téléphone fixe</span>
                  <span class="text-xs font-medium text-foreground">{{ c.telFixe }}</span>
                </div>
              }
              @if (c.telPortable || c.numCel) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Téléphone mobile</span>
                  <span class="text-xs font-medium text-foreground">
                    @if (c.indicatifCel) { +{{ c.indicatifCel }}&nbsp; }{{ c.telPortable ?? c.numCel }}
                  </span>
                </div>
              }
              @if (c.email) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Email</span>
                  <span class="text-xs font-medium text-foreground">{{ c.email }}</span>
                </div>
              }
              @if (c.lot) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Lot N°</span>
                  <span class="text-xs font-medium text-foreground">{{ c.lot }}</span>
                </div>
              }
              @if (c.villa) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Villa N°</span>
                  <span class="text-xs font-medium text-foreground">{{ c.villa }}</span>
                </div>
              }
              @if (c.facture) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Adresse CIE / SODECI</span>
                  <span class="text-xs font-medium text-foreground">{{ c.facture }}</span>
                </div>
              }
              @if (c.commune?.libelle) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Commune</span>
                  <span class="text-xs font-medium text-foreground">{{ c.commune!.libelle }}</span>
                </div>
              }
              @if (c.quartier) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Quartier</span>
                  <span class="text-xs font-medium text-foreground">{{ c.quartier }}</span>
                </div>
              }
              @if (c.adresse) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Adr. Postale</span>
                  <span class="text-xs font-medium text-foreground">{{ c.adresse }}</span>
                </div>
              }
              @if (c.rue) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Rue</span>
                  <span class="text-xs font-medium text-foreground">{{ c.rue }}</span>
                </div>
              }
              @if (c.batimentProche) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Bâtiment / Repère</span>
                  <span class="text-xs font-medium text-foreground">{{ c.batimentProche }}</span>
                </div>
              }
            </div>

          <!-- ── Mode édition ─────────────────────────────────────── -->
          } @else {
            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-5">

              <div>
                <p class="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Identification</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <app-form-input name="dataNaiss"   label="Date de naissance" type="date" />
                  <app-form-input name="lieuNaiss"   label="Lieu de naissance" type="text" />
                  <app-form-input name="profession"  label="Profession"        type="text" />
                </div>
              </div>

              <div>
                <p class="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Contact</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <app-form-input name="telFixe"      label="Téléphone fixe"   type="text" />
                  <app-form-input name="telPortable"  label="Téléphone mobile" type="text" required />
                  <app-form-input name="email"        label="Email"            type="email" />
                  <app-form-input name="lot"          label="Lot N°"           type="text" />
                  <app-form-input name="villa"        label="Villa N°"         type="text" />
                  <app-form-input name="facture"      label="Adresse CIE / SODECI" type="text" />
                  <app-form-input name="quartier"     label="Quartier"         type="text" />
                  <app-form-input name="adresse"      label="Adresse postale"  type="text" />
                  <app-form-input name="rue"          label="Rue"              type="text" />
                  <app-form-input name="batimentProche" label="Bâtiment / Repère" type="text" />
                </div>
              </div>

              <div class="flex justify-end gap-2 pt-2">
                <button type="button" appButton variant="outline" size="sm"
                  class="flex items-center gap-1.5" [disabled]="saving()" (click)="cancelEdit()">
                  <lucide-icon [img]="XIcon" [size]="13" /> Annuler
                </button>
                <button type="submit" appButton size="sm"
                  class="flex items-center gap-1.5" [disabled]="saving()">
                  <lucide-icon [img]="SaveIcon" [size]="13" />
                  {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
                </button>
              </div>

            </form>
          }

        </app-card-content>
      </app-card>
    }
  `,
})
export class ClientPpCardComponent {
  readonly UserIcon   = User;
  readonly PencilIcon = Pencil;
  readonly XIcon      = X;
  readonly SaveIcon   = Save;

  private readonly creditService = inject(CreditService);
  private readonly toast         = inject(ToastService);

  readonly client  = input<CreditClient | null>(null);
  readonly editing = signal(false);
  readonly saving  = signal(false);

  readonly form = new FormGroup({
    dataNaiss:      new FormControl<string | null>(null),
    lieuNaiss:      new FormControl<string | null>(null),
    profession:     new FormControl<string | null>(null),
    telFixe:        new FormControl<string | null>(null),
    telPortable:    new FormControl<string | null>(null, Validators.required),
    email:          new FormControl<string | null>(null),
    lot:            new FormControl<string | null>(null),
    villa:          new FormControl<string | null>(null),
    facture:        new FormControl<string | null>(null),
    quartier:       new FormControl<string | null>(null),
    adresse:        new FormControl<string | null>(null),
    rue:            new FormControl<string | null>(null),
    batimentProche: new FormControl<string | null>(null),
  });

  startEdit() {
    const c = this.client();
    if (!c) return;
    const toDateInput = (d?: string | null) => d ? d.substring(0, 10) : null;
    this.form.reset({
      dataNaiss:      toDateInput(c.dataNaiss),
      lieuNaiss:      c.lieuNaiss ?? null,
      profession:     c.profession ?? null,
      telFixe:        c.telFixe ?? null,
      telPortable:    c.telPortable ?? c.numCel ?? null,
      email:          c.email ?? null,
      lot:            c.lot ?? null,
      villa:          c.villa ?? null,
      facture:        c.facture ?? null,
      quartier:       c.quartier ?? null,
      adresse:        c.adresse ?? null,
      rue:            c.rue ?? null,
      batimentProche: c.batimentProche ?? null,
    });
    this.editing.set(true);
  }

  cancelEdit() { this.editing.set(false); }

  save() {
    if (this.form.invalid) return;
    const c = this.client();
    if (!c) return;
    const v = this.form.value;
    this.saving.set(true);

    this.creditService.updateClientPP({
      codeClient:     c.codeClient,
      nomPrenom:      c.nomPrenom,
      dataNaiss:      v.dataNaiss,
      lieuNaiss:      v.lieuNaiss,
      profession:     v.profession,
      telFixe:        v.telFixe,
      telPortable:    v.telPortable,
      email:          v.email,
      lot:            v.lot,
      villa:          v.villa,
      facture:        v.facture,
      quartier:       v.quartier,
      adresse:        v.adresse,
      rue:            v.rue,
      batimentProche: v.batimentProche,
    }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.status === 1) {
          this.toast.success('Informations mises à jour.');
          this.editing.set(false);
        } else {
          this.toast.error(res.message ?? 'Échec de la mise à jour.');
        }
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Erreur lors de la mise à jour.');
      },
    });
  }
}
