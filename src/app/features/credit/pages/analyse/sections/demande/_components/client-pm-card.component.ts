import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { LucideAngularModule, Building2, Pencil, X, Save } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
// import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect, SelectOption } from '@/shared/components/form-select/form-select.component';
import { CreditService } from '../../../../../services/credit/credit.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { CreditClient } from '../../../../../interfaces/credit.interface';

const STATUT_JURIDIQUE: Record<number, string> = {
  1: 'Entreprise Individuelle',
  2: 'SARL',
  3: 'SA',
  4: 'SASU',
  5: 'Association',
  6: 'Coopérative',
  7: 'SAS',
  8: 'Informel',
  9: 'SARLU',
  10: 'SCOOPS',
  11: 'COOP-CA',
};

const TYPE_CLIENTELE: Record<number, string> = {
  1: 'Particuliers',
  2: 'Entreprises',
  3: 'Les deux',
};

const IMPACT_ENV: Record<number, string> = {
  1: 'Forte',
  2: 'Modérée',
  3: 'Faible',
  4: 'Nulle',
};

const TYPE_LOCAL: Record<number, string> = {
  1: 'Local en dur',
  2: 'Semi-dur',
  3: 'Précaire',
  4: 'Marché',
};

const CONCURRENCE: Record<number, string> = {
  1: 'Très forte',
  2: 'Forte',
  3: 'Moyenne',
  4: 'Faible',
};

function labelOf(map: Record<number, string>, val?: number | string | null): string {
  if (val == null) return '—';
  return map[Number(val)] ?? String(val);
}

@Component({
  selector: 'app-client-pm-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    // BadgeComponent,
    ButtonDirective,
    FormInput,
    FormSelect,
  ],
  template: `
    @if (client(); as c) {
      <app-card>
        <app-card-header>
          <div class="flex items-center justify-between w-full">
            <app-card-title>Personne morale</app-card-title>
            @if (!editing() && !readOnly()) {
              <button
                type="button"
                appButton
                variant="outline"
                size="sm"
                class="flex items-center gap-1.5"
                (click)="startEdit()"
              >
                <lucide-icon [img]="PencilIcon" [size]="13" /> Modifier
              </button>
            }
          </div>
        </app-card-header>
        <app-card-content class="gap-4! pt-0!">
          <!-- Avatar + identité -->
          <!-- <div class="flex flex-col items-center gap-2 pb-4 border-b border-border">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <lucide-icon [img]="Building2Icon" [size]="24" class="text-primary" />
            </div>
            <div class="text-center">
              <p class="text-base font-bold text-foreground">{{ c.nomPrenom }}</p>
              <p class="text-xs text-muted-foreground">{{ c.codeClient }}</p>
              <div class="flex flex-wrap justify-center gap-1.5 mt-1.5">
                <app-badge variant="secondary">{{ c.tpePme ?? 'PM' }}</app-badge>
                @if (c.agence) {
                  <app-badge variant="outline">Agence {{ c.agence.libelle }}</app-badge>
                }
              </div>
            </div>
          </div> -->

          <!-- ── Mode lecture ─────────────────────────────────────── -->
          @if (!editing()) {
            <!-- IDENTIFICATION -->
            <p class="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Identification
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-4">
              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">Raison sociale</span>
                <span class="text-xs font-medium text-foreground">{{ c.nomPrenom }}</span>
              </div>
              @if (c.entreprise?.statutJuridique != null) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Statut juridique</span>
                  <span class="text-xs font-medium text-foreground">{{
                    statutJuridiqueLabel()
                  }}</span>
                </div>
              }
              @if (c.tpePme) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Catégorie</span>
                  <span class="text-xs font-medium text-foreground">{{ c.tpePme }}</span>
                </div>
              }
              @if (c.entreprise?.capitalSocial) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Capital</span>
                  <span class="text-xs font-medium text-foreground"
                    >{{ c.entreprise!.capitalSocial | number: '1.0-0' : 'fr-FR' }} FCFA</span
                  >
                </div>
              }
              @if (c.entreprise?.rccm) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">N° RCCM</span>
                  <span class="text-xs font-medium font-mono text-foreground">{{
                    c.entreprise!.rccm
                  }}</span>
                </div>
              }
              @if (c.entreprise?.ncc) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">N° CC</span>
                  <span class="text-xs font-medium font-mono text-foreground">{{
                    c.entreprise!.ncc
                  }}</span>
                </div>
              }
              @if (c.entreprise?.impots != null) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Impôts (à jour)</span>
                  <span class="text-xs font-medium text-foreground">{{
                    c.entreprise!.impots === 1 ? 'OUI' : 'NON'
                  }}</span>
                </div>
              }
              @if (c.entreprise?.dateCreation) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Date de création</span>
                  <span class="text-xs font-medium text-foreground">{{
                    c.entreprise!.dateCreation | date: 'dd/MM/yyyy'
                  }}</span>
                </div>
              }
            </div>

            <!-- ACTIVITÉ -->
            <p class="text-xs font-bold text-muted-foreground uppercase tracking-wide">Activité</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-4">
              @if (typeActiviteLabel()) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Type d'activité</span>
                  <span class="text-xs font-medium text-foreground">{{ typeActiviteLabel() }}</span>
                </div>
              }
              @if (c.entreprise?.typeClientele != null) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Type clientèle</span>
                  <span class="text-xs font-medium text-foreground">{{
                    typeClienteleLabel()
                  }}</span>
                </div>
              }
              @if (c.entreprise?.impactEnvironnement != null) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Impact sur l'envt.</span>
                  <span class="text-xs font-medium text-foreground">{{ impactEnvLabel() }}</span>
                </div>
              }
              @if (c.entreprise?.typeLocal != null) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Type de local</span>
                  <span class="text-xs font-medium text-foreground">{{ typeLocalLabel() }}</span>
                </div>
              }
              @if (c.entreprise?.ancienneteSecteur) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Ancienneté secteur</span>
                  <span class="text-xs font-medium text-foreground"
                    >{{ c.entreprise!.ancienneteSecteur }} ans</span
                  >
                </div>
              }
              @if (c.entreprise?.concurence != null) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Concurrence</span>
                  <span class="text-xs font-medium text-foreground">{{ concurrenceLabel() }}</span>
                </div>
              }
            </div>

            <!-- CONTACT -->
            <p class="text-xs font-bold text-muted-foreground uppercase tracking-wide">Contact</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              @if (c.telFixe) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Téléphone fixe</span>
                  <span class="text-xs font-medium text-foreground">{{ c.telFixe }}</span>
                </div>
              }
              @if (c.telPortable) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Téléphone mobile</span>
                  <span class="text-xs font-medium text-foreground">{{ c.telPortable }}</span>
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
                <p class="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                  Identification
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <app-form-select
                    name="statutJuridique"
                    label="Statut juridique"
                    [options]="statutJuridiqueOptions"
                    required
                  />
                  <app-form-select name="tpePme" label="Catégorie" [options]="tpePmeOptions" />
                  <app-form-input
                    name="capitalSocial"
                    label="Capital (FCFA)"
                    type="number"
                    [min]="0"
                  />
                  <app-form-input name="rccm" label="N° RCCM" type="text" />
                  <app-form-input name="ncc" label="N° CC" type="text" />
                  <app-form-select
                    name="impots"
                    label="Impôts (à jour)"
                    [options]="impotsOptions"
                  />
                  <app-form-input name="dateCreation" label="Date de création" type="date" />
                </div>
              </div>

              <div>
                <p class="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                  Activité
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <app-form-select
                    name="typeActivite"
                    label="Type d'activité"
                    [options]="typeActiviteOptions()"
                  />
                  <app-form-select
                    name="typeClientele"
                    label="Type clientèle"
                    [options]="typeClienteleOptions"
                  />
                  <app-form-select
                    name="impactEnvironnement"
                    label="Impact sur l'envt."
                    [options]="impactEnvOptions"
                  />
                  <app-form-select
                    name="typeLocal"
                    label="Type de local"
                    [options]="typeLocalOptions"
                  />
                  <app-form-input
                    name="ancienneteSecteur"
                    label="Ancienneté secteur (ans)"
                    type="number"
                    [min]="0"
                  />
                  <app-form-select
                    name="concurence"
                    label="Concurrence"
                    [options]="concurrenceOptions"
                  />
                </div>
              </div>

              <div>
                <p class="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                  Contact
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <app-form-input name="telFixe" label="Téléphone fixe" type="text" />
                  <app-form-input
                    name="telPortable"
                    label="Téléphone mobile"
                    type="text"
                    required
                  />
                  <app-form-input name="email" label="Email" type="email" />
                  <app-form-input name="lot" label="Lot N°" type="text" />
                  <app-form-input name="villa" label="Villa N°" type="text" />
                  <app-form-input name="facture" label="Adresse CIE / SODECI" type="text" />
                  <app-form-input name="quartier" label="Quartier" type="text" />
                  <app-form-input name="adresse" label="Adresse postale" type="text" />
                  <app-form-input name="rue" label="Rue" type="text" />
                  <app-form-input name="batimentProche" label="Bâtiment / Repère" type="text" />
                </div>
              </div>

              <div class="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  appButton
                  variant="outline"
                  size="sm"
                  class="flex items-center gap-1.5"
                  [disabled]="saving()"
                  (click)="cancelEdit()"
                >
                  <lucide-icon [img]="XIcon" [size]="13" /> Annuler
                </button>
                <button
                  type="submit"
                  appButton
                  size="sm"
                  class="flex items-center gap-1.5"
                  [disabled]="saving()"
                >
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
export class ClientPmCardComponent implements OnInit {
  readonly Building2Icon = Building2;
  readonly PencilIcon = Pencil;
  readonly XIcon = X;
  readonly SaveIcon = Save;

  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  readonly client   = input<CreditClient | null>(null);
  readonly readOnly = input<boolean>(false);

  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly typeActiviteOptions = signal<SelectOption[]>([]);

  // ── Options statiques ────────────────────────────────────────────────
  readonly statutJuridiqueOptions: SelectOption[] = Object.entries(STATUT_JURIDIQUE).map(
    ([v, l]) => ({ value: Number(v), label: l }),
  );

  readonly tpePmeOptions: SelectOption[] = [
    { value: 'PME', label: 'PME' },
    { value: 'TPE', label: 'TPE' },
  ];

  readonly impotsOptions: SelectOption[] = [
    { value: 1, label: 'OUI' },
    { value: 0, label: 'NON' },
  ];

  readonly typeClienteleOptions: SelectOption[] = Object.entries(TYPE_CLIENTELE).map(([v, l]) => ({
    value: Number(v),
    label: l,
  }));

  readonly impactEnvOptions: SelectOption[] = Object.entries(IMPACT_ENV).map(([v, l]) => ({
    value: Number(v),
    label: l,
  }));

  readonly typeLocalOptions: SelectOption[] = Object.entries(TYPE_LOCAL).map(([v, l]) => ({
    value: Number(v),
    label: l,
  }));

  readonly concurrenceOptions: SelectOption[] = Object.entries(CONCURRENCE).map(([v, l]) => ({
    value: Number(v),
    label: l,
  }));

  // ── Computed labels ──────────────────────────────────────────────────
  readonly statutJuridiqueLabel = computed(() =>
    labelOf(STATUT_JURIDIQUE, this.client()?.entreprise?.statutJuridique),
  );
  readonly typeClienteleLabel = computed(() =>
    labelOf(TYPE_CLIENTELE, this.client()?.entreprise?.typeClientele),
  );
  readonly impactEnvLabel = computed(() =>
    labelOf(IMPACT_ENV, this.client()?.entreprise?.impactEnvironnement),
  );
  readonly typeLocalLabel = computed(() =>
    labelOf(TYPE_LOCAL, this.client()?.entreprise?.typeLocal),
  );
  readonly concurrenceLabel = computed(() =>
    labelOf(CONCURRENCE, this.client()?.entreprise?.concurence),
  );
  readonly typeActiviteLabel = computed(() => {
    const id = this.client()?.entreprise?.typeActivite;
    if (!id) return null;
    return this.typeActiviteOptions().find((o) => o.value === id)?.label ?? String(id);
  });

  readonly form = new FormGroup({
    statutJuridique: new FormControl<number | null>(null, Validators.required),
    tpePme: new FormControl<string | null>(null),
    capitalSocial: new FormControl<number | null>(null),
    rccm: new FormControl<string | null>(null),
    ncc: new FormControl<string | null>(null),
    impots: new FormControl<number | null>(null),
    dateCreation: new FormControl<string | null>(null),
    typeActivite: new FormControl<number | null>(null),
    typeClientele: new FormControl<number | null>(null),
    impactEnvironnement: new FormControl<number | null>(null),
    typeLocal: new FormControl<number | null>(null),
    ancienneteSecteur: new FormControl<string | null>(null),
    concurence: new FormControl<number | null>(null),
    telFixe: new FormControl<string | null>(null),
    telPortable: new FormControl<string | null>(null, Validators.required),
    email: new FormControl<string | null>(null),
    lot: new FormControl<string | null>(null),
    villa: new FormControl<string | null>(null),
    facture: new FormControl<string | null>(null),
    quartier: new FormControl<string | null>(null),
    adresse: new FormControl<string | null>(null),
    rue: new FormControl<string | null>(null),
    batimentProche: new FormControl<string | null>(null),
  });

  ngOnInit() {
    this.creditService.getTypesActivite().subscribe({
      next: (list) =>
        this.typeActiviteOptions.set(list.map((t) => ({ value: t.id, label: t.libelle }))),
      error: () => {},
    });
  }

  startEdit() {
    const c = this.client();
    if (!c) return;
    const e = c.entreprise;
    // Convert dateCreation to input[date] format yyyy-MM-dd
    const toDateInput = (d?: string | null) => (d ? d.substring(0, 10) : null);
    this.form.reset({
      statutJuridique: e?.statutJuridique != null ? Number(e.statutJuridique) : null,
      tpePme: c.tpePme ?? null,
      capitalSocial: e?.capitalSocial ?? null,
      rccm: e?.rccm ?? null,
      ncc: e?.ncc ?? null,
      impots: e?.impots ?? null,
      dateCreation: toDateInput(e?.dateCreation),
      typeActivite: e?.typeActivite ?? null,
      typeClientele: e?.typeClientele ?? null,
      impactEnvironnement: e?.impactEnvironnement ?? null,
      typeLocal: e?.typeLocal ?? null,
      ancienneteSecteur: e?.ancienneteSecteur ?? null,
      concurence: e?.concurence ?? null,
      telFixe: c.telFixe ?? null,
      telPortable: c.telPortable ?? null,
      email: c.email ?? null,
      lot: c.lot ?? null,
      villa: c.villa ?? null,
      facture: c.facture ?? null,
      quartier: c.quartier ?? null,
      adresse: c.adresse ?? null,
      rue: c.rue ?? null,
      batimentProche: c.batimentProche ?? null,
    });
    this.editing.set(true);
  }

  cancelEdit() {
    this.editing.set(false);
  }

  save() {
    if (this.form.invalid) return;
    const c = this.client();
    if (!c) return;
    const v = this.form.value;
    this.saving.set(true);

    this.creditService
      .updateClientPM({
        codeClient: c.codeClient,
        nomPrenom: c.nomPrenom,
        tpePme: v.tpePme,
        statutJuridique: v.statutJuridique,
        capitalSocial: v.capitalSocial,
        rccm: v.rccm,
        ncc: v.ncc,
        impots: v.impots,
        dateCreation: v.dateCreation,
        typeActivite: v.typeActivite,
        typeClientele: v.typeClientele,
        impactEnvironnement: v.impactEnvironnement,
        typeLocal: v.typeLocal,
        ancienneteSecteur: v.ancienneteSecteur,
        concurence: v.concurence,
        telFixe: v.telFixe,
        telPortable: v.telPortable,
        email: v.email,
        lot: v.lot,
        villa: v.villa,
        facture: v.facture,
        quartier: v.quartier,
        adresse: v.adresse,
        rue: v.rue,
        batimentProche: v.batimentProche,
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          if (res.status === 1 || res.message?.toLowerCase() === 'success') {
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
