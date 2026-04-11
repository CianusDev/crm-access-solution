import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import {
  LucideAngularModule,
  Building2,
  User,
  Upload,
  Send,
  ChevronDown,
  RotateCcw,
  Plus,
  Pencil,
  FileSearch,
  X,
  Eye,
} from 'lucide-angular';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { Dropdown } from '@/shared/components/dropdown/dropdown.component';
import { DropdownItem } from '@/shared/components/dropdown/dropdown.interface';
import { CreditFicheDemandeDetail } from '../../../interfaces/credit.interface';
import { RequiredDoc, getRequiredDocsForCACaa } from '../../../constants/required-documents';

const OBJETS_CREDIT: Record<string | number, string> = {
  1: 'Fonds de roulement',
  2: 'Investissement',
  3: 'Fonds de roulement et Investissement',
  4: 'Financement du pas-de-porte',
  5: 'Avance sur trésorerie',
};

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

@Component({
  selector: 'app-analyse-header-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    DecimalPipe,
    DatePipe,
    LucideAngularModule,
    BadgeComponent,
    ButtonDirective,
    Dropdown,
  ],
  template: `
    @if (fiche(); as d) {
      <div class="rounded-xl border border-border bg-card shadow-sm">
        <!-- Action buttons row -->
        <div
          class="flex items-center justify-end gap-2 px-4 py-2.5 border-b border-border bg-muted/30 flex-wrap"
        >
          @if (isSuperviseurRisqueZone() && d.statut === 24) {
            <button
              type="button"
              appButton
              variant="outline"
              size="sm"
              class="flex items-center gap-1.5 border-amber-500 text-amber-600 hover:bg-amber-50"
              (click)="ajournerDossier.emit()"
            >
              <lucide-icon [img]="RotateCcwIcon" [size]="14" />
              Ajourner
            </button>
            <button
              type="button"
              appButton
              variant="outline"
              size="sm"
              class="flex items-center gap-1.5"
              (click)="confirmationRejet.emit()"
            >
              <lucide-icon [img]="XIcon" [size]="14" />
              Confirmation du rejet
            </button>
          } @else if (isSuperviseurPME() && d.statut === 19) {
            <button
              type="button"
              appButton
              variant="outline"
              size="sm"
              class="flex items-center gap-1.5 border-amber-500 text-amber-600 hover:bg-amber-50"
              (click)="ajournerDossier.emit()"
            >
              <lucide-icon [img]="RotateCcwIcon" [size]="14" />
              Ajourner
            </button>
            @if (docTypeItems().length > 0) {
              <app-dropdown class="min-w-96!" [items]="docTypeItems()" align="start">
                <button
                  type="button"
                  appButton
                  variant="outline"
                  size="sm"
                  class="flex items-center min-w-96! gap-1.5"
                  dropdownTrigger
                >
                  <lucide-icon [img]="UploadIcon" [size]="14" />
                  Charger les documents
                  <lucide-icon [img]="ChevronDownIcon" [size]="12" />
                </button>
              </app-dropdown>
            }
            <button
              type="button"
              appButton
              size="sm"
              class="flex items-center gap-1.5"
              [disabled]="!canSendDossier()"
              (click)="envoyerDossier.emit()"
            >
              <lucide-icon [img]="SendIcon" [size]="14" />
              Envoyer le rapport
            </button>
          } @else if (showAnalysteBandeau() && fiche()?.statut === 5) {
            <button
              type="button"
              appButton
              variant="outline"
              size="sm"
              class="flex items-center gap-1.5 border-destructive text-destructive hover:bg-destructive/10"
              (click)="avisDefavorable.emit()"
            >
              <lucide-icon [img]="XIcon" [size]="14" />
              Avis défavorable
            </button>
            <button
              type="button"
              appButton
              variant="outline"
              size="sm"
              class="flex items-center gap-1.5 border-amber-500 text-amber-600 hover:bg-amber-50"
              (click)="ajournerDossier.emit()"
            >
              <lucide-icon [img]="RotateCcwIcon" [size]="14" />
              Ajourner
            </button>
            @if (docTypeItems().length > 0) {
              <app-dropdown class="min-w-96!" [items]="docTypeItems()" align="start">
                <button
                  type="button"
                  appButton
                  variant="outline"
                  size="sm"
                  class="flex items-center min-w-96! gap-1.5"
                  dropdownTrigger
                >
                  <lucide-icon [img]="UploadIcon" [size]="14" />
                  Charger les documents
                  <lucide-icon [img]="ChevronDownIcon" [size]="12" />
                </button>
              </app-dropdown>
            }
            <button
              type="button"
              appButton
              size="sm"
              class="flex items-center gap-1.5"
              (click)="faireResume.emit()"
            >
              <lucide-icon [img]="FileSearchIcon" [size]="14" />
              Faire le résumé
            </button>
          } @else if (isAR() && isPaused() && fiche()?.statut !== 5) {
            @if (docTypeItems().length > 0) {
              <app-dropdown class="min-w-96!" [items]="docTypeItems()" align="start">
                <button
                  type="button"
                  appButton
                  variant="outline"
                  size="sm"
                  class="flex items-center min-w-96! gap-1.5"
                  dropdownTrigger
                >
                  <lucide-icon [img]="UploadIcon" [size]="14" />
                  Charger les documents
                  <lucide-icon [img]="ChevronDownIcon" [size]="12" />
                </button>
              </app-dropdown>
            }
            <button
              type="button"
              appButton
              size="sm"
              class="flex items-center gap-1.5"
              (click)="faireResume.emit()"
            >
              <lucide-icon [img]="FileSearchIcon" [size]="14" />
              Faire le résumé
            </button>
          } @else if (isChefAgenceWorkflow() && d.statut === 4) {
            <button
              type="button"
              appButton
              variant="outline"
              size="sm"
              class="flex items-center gap-1.5 border-amber-500 text-amber-600 hover:bg-amber-50"
              (click)="ajournerDossier.emit()"
            >
              <lucide-icon [img]="RotateCcwIcon" [size]="14" />
              Ajourner
            </button>
            <button
              type="button"
              appButton
              size="sm"
              class="flex items-center gap-1.5"
              (click)="affecterAR.emit()"
            >
              <lucide-icon [img]="SendIcon" [size]="14" />
              {{
                !isAdmin() && (d.typeCredit.code === '032' || d.typeCredit.code === '033')
                  ? 'Affecter le dossier (Sup OP / CAA)'
                  : 'Affecter le dossier à un AR'
              }}
            </button>
          } @else if (isAdmin() && d.statut === 21) {
            <!-- Admin statut 21: Remettre dans le circuit -->
            <button
              type="button"
              appButton
              size="sm"
              class="flex items-center gap-1.5"
              (click)="remettreEnCircuit.emit()"
            >
              <lucide-icon [img]="RotateCcwIcon" [size]="14" />
              Remettre dans le circuit
            </button>
          } @else if (isRCCC()) {
            <!-- RC/CC: Ajourner -->
            <button
              type="button"
              appButton
              variant="outline"
              size="sm"
              class="flex items-center gap-1.5 border-amber-500 text-amber-600 hover:bg-amber-50"
              (click)="ajournerDossier.emit()"
            >
              <lucide-icon [img]="RotateCcwIcon" [size]="14" />
              Ajourner
            </button>

            <!-- RC/CC statut 3: Validation prêts OUF/Scolaire/Avance salaire -->
            @if (isRCCCValidationStatut3()) {
              <button
                type="button"
                appButton
                size="sm"
                class="flex items-center gap-1.5"
                (click)="validerDossierRCCC.emit()"
              >
                <lucide-icon [img]="SendIcon" [size]="14" />
                Valider le dossier
              </button>
            }

            <!-- RC/CC: N° Perfect -->
            @if (!d.numTransaction) {
              <button
                type="button"
                appButton
                variant="outline"
                size="sm"
                class="flex items-center gap-1.5"
                (click)="ajouterPerfect.emit()"
              >
                <lucide-icon [img]="PlusIcon" [size]="14" />
                Ajouter le N° demande Perfect
              </button>
            } @else {
              <button
                type="button"
                appButton
                variant="outline"
                size="sm"
                class="flex items-center gap-1.5"
                (click)="ajouterPerfect.emit()"
              >
                <lucide-icon [img]="PencilIcon" [size]="14" />
                Modifier N° Perfect
              </button>
            }

            <!-- RC/CC: Checkbox frais (non-DECOUVERT + numTransaction) -->
            @if (d.numTransaction && d.typeCredit.code !== '015') {
              <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  [ngModel]="confirmationFrais()"
                  (ngModelChange)="confirmationFraisChange.emit($event)"
                  class="h-4 w-4 rounded border-border text-primary accent-primary"
                />
                <span class="font-medium text-foreground text-xs"
                  >Avez-vous prélevé les frais de demande ?</span
                >
              </label>
            }

            <!-- RC/CC: Envoyer (visible si numTransaction existe) -->
            @if (d.numTransaction) {
              <!-- <button
                type="button"
                appButton
                size="sm"
                class="flex items-center gap-1.5"
                [disabled]="!canSendDossier()"
                (click)="envoyerDossier.emit()"
              >
                <lucide-icon [img]="SendIcon" [size]="14" />
                Envoyer le dossier
              </button> -->
              <button
                type="button"
                appButton
                size="sm"
                class="flex items-center gap-1.5"
                (click)="affecterAR.emit()"
                [disabled]="!canSendDossier()"
              >
                <lucide-icon [img]="SendIcon" [size]="14" />
                Affecter le dossier à un AR
              </button>
            }
          } @else {
            <!-- GP / Other: Charger docs + Envoyer -->
            @if (docTypeItems().length > 0) {
              <app-dropdown class="min-w-96!" [items]="docTypeItems()" align="start">
                <button
                  type="button"
                  appButton
                  variant="outline"
                  size="sm"
                  class="flex items-center min-w-96! gap-1.5"
                  dropdownTrigger
                  [disabled]="uploadingDocLibelle() !== null"
                >
                  @if (uploadingDocLibelle()) {
                    Chargement...
                  } @else {
                    <lucide-icon [img]="UploadIcon" [size]="14" />
                    Charger les documents
                    <lucide-icon [img]="ChevronDownIcon" [size]="12" />
                  }
                </button>
              </app-dropdown>
            }
            <button
              type="button"
              appButton
              size="sm"
              class="flex items-center gap-1.5"
              [disabled]="isGP() ? false : !canSendDossier()"
              (click)="envoyerDossier.emit()"
            >
              <lucide-icon [img]="SendIcon" [size]="14" />
              {{ statusOneGpPrimaryLabel() }}
            </button>
          }
          @if (showVoirResume()) {
            <button
              type="button"
              appButton
              variant="outline"
              size="sm"
              class="flex items-center gap-1.5"
              (click)="voirResume.emit()"
            >
              <lucide-icon [img]="EyeIcon" [size]="14" />
              Voir le résumé
            </button>
          }
        </div>

        <!-- Main summary -->
        <div
          class="flex flex-col md:flex-row gap-0 divide-y md:divide-y-0 md:divide-x divide-border"
        >
          <!-- ── Client section ───────────────────────────────────────── -->
          <div class="flex gap-4 p-5 flex-1 min-w-0">
            <!-- Avatar -->
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-muted shrink-0">
              @if (isPersonneMorale()) {
                <lucide-icon [img]="Building2Icon" [size]="28" class="text-muted-foreground" />
              } @else {
                <lucide-icon [img]="UserIcon" [size]="28" class="text-muted-foreground" />
              }
            </div>

            <!-- Identity + Details -->
            <div class="flex-1 min-w-0">
              <p class="text-base font-bold text-foreground truncate">{{ d.client.nomPrenom }}</p>
              <p class="text-xs text-muted-foreground mb-1.5">{{ d.client.codeClient }}</p>
              <app-badge variant="secondary" class="text-[11px]">
                {{ isPersonneMorale() ? 'Personne morale' : 'Personne physique' }}
              </app-badge>

              <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                @if (isPersonneMorale()) {
                  @if (d.client.entreprise?.nomDirigeant) {
                    <div class="flex items-center gap-1 py-1 border-b border-border/40">
                      <span class="text-xs text-muted-foreground shrink-0">Mandataire social</span>
                      <span class="text-xs font-medium text-foreground ml-auto truncate">{{
                        d.client.entreprise!.nomDirigeant
                      }}</span>
                    </div>
                  }
                  @if (statutJuridiqueLabel()) {
                    <div class="flex items-center gap-1 py-1 border-b border-border/40">
                      <span class="text-xs text-muted-foreground shrink-0">Statut juridique</span>
                      <span class="text-xs font-medium text-foreground ml-auto">{{
                        statutJuridiqueLabel()
                      }}</span>
                    </div>
                  }
                  @if (d.client.entreprise?.dateCreation) {
                    <div class="flex items-center gap-1 py-1 border-b border-border/40">
                      <span class="text-xs text-muted-foreground shrink-0"
                        >Date de création de l'entreprise
                      </span>
                      <span class="text-xs font-medium text-foreground ml-auto">{{
                        d.client.entreprise!.dateCreation | date: 'dd/MM/yyyy'
                      }}</span>
                    </div>
                  }
                } @else {
                  @if (d.client.dataNaiss) {
                    <div class="flex items-center gap-1 py-1 border-b border-border/40">
                      <span class="text-xs text-muted-foreground shrink-0">Date de naissance</span>
                      <span class="text-xs font-medium text-foreground ml-auto">{{
                        d.client.dataNaiss | date: 'dd/MM/yyyy'
                      }}</span>
                    </div>
                  }
                }
                @if (d.client.telPortable || d.client.numCel) {
                  <div class="flex items-center gap-1 py-1 border-b border-border/40">
                    <span class="text-xs text-muted-foreground shrink-0">Téléphone Mobile</span>
                    <span class="text-xs font-medium text-foreground ml-auto">
                      @if (d.client.indicatifCel) {
                        +{{ d.client.indicatifCel }}&nbsp;
                      }
                      {{ d.client.telPortable ?? d.client.numCel }}
                    </span>
                  </div>
                }
                @if (d.client.agence) {
                  <div class="flex items-center gap-1 py-1 border-b border-border/40">
                    <span class="text-xs text-muted-foreground shrink-0">Agence</span>
                    <span class="text-xs font-medium text-foreground ml-auto">{{
                      d.client.agence.libelle
                    }}</span>
                  </div>
                }
                @if (d.client.commune?.libelle) {
                  <div class="flex items-center gap-1 py-1 border-b border-border/40">
                    <span class="text-xs text-muted-foreground shrink-0">Commune</span>
                    <span class="text-xs font-medium text-foreground ml-auto">{{
                      d.client.commune!.libelle
                    }}</span>
                  </div>
                }
                @if (!isPersonneMorale() && d.client.villa) {
                  <div class="flex items-center gap-1 py-1 border-b border-border/40">
                    <span class="text-xs text-muted-foreground shrink-0">Adresse</span>
                    <span class="text-xs font-medium text-foreground ml-auto truncate">{{
                      d.client.villa
                    }}</span>
                  </div>
                }
                @if (d.dateDemande) {
                  <div class="flex items-center gap-1 py-1 border-b border-border/40">
                    <span class="text-xs text-muted-foreground shrink-0"
                      >Date de creation de dossier</span
                    >
                    <span class="text-xs font-medium text-foreground ml-auto truncate">{{
                      d.dateDemande | date: 'dd/MM/yyyy'
                    }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- ── Crédit summary ───────────────────────────────────────── -->
          <div class="p-5 md:w-72 shrink-0 bg-muted/20">
            <p class="text-xs font-bold text-foreground uppercase tracking-wide mb-3">
              Demande de crédit
            </p>
            <div class="flex flex-col gap-0">
              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">Type crédit</span>
                <span class="text-xs font-medium text-foreground text-right max-w-[160px]">{{
                  d.typeCredit.libelle
                }}</span>
              </div>

              @if (objetLabel()) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Objet du crédit</span>
                  <span class="text-xs font-medium text-foreground text-right max-w-[160px]">{{
                    objetLabel()
                  }}</span>
                </div>
              }

              @if (d.typeActivite) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Secteur d'activité</span>
                  <span class="text-xs font-medium text-foreground text-right max-w-[160px]">{{
                    d.typeActivite.libelle
                  }}</span>
                </div>
              }

              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">Montant demandé</span>
                <span class="text-xs font-semibold text-primary"
                  >{{ d.montantSollicite | number: '1.0-0' : 'fr-FR' }} FCFA</span
                >
              </div>

              <div class="flex justify-between py-1.5 border-b border-border/40">
                <span class="text-xs text-muted-foreground">Durée de remboursement</span>
                <span class="text-xs font-semibold text-green-600 dark:text-green-400"
                  >{{ d.nbreEcheanceSollicite }} Mois</span
                >
              </div>

              @if (d.nbreEcheDiffere) {
                <div class="flex justify-between py-1.5 border-b border-border/40">
                  <span class="text-xs text-muted-foreground">Échéances différées</span>
                  <span class="text-xs font-semibold text-amber-600 dark:text-amber-400"
                    >{{ d.nbreEcheDiffere }} Mois</span
                  >
                </div>
              }

              <div class="flex justify-between py-1.5">
                <span class="text-xs text-muted-foreground">Mt souhaité / échéance</span>
                <span class="text-xs font-semibold text-primary">
                  {{ d.montantEcheSouhaite | number: '1.0-0' : 'fr-FR' }} FCFA
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AnalyseHeaderCardComponent {
  readonly Building2Icon = Building2;
  readonly UserIcon = User;
  readonly UploadIcon = Upload;
  readonly SendIcon = Send;
  readonly ChevronDownIcon = ChevronDown;
  readonly RotateCcwIcon = RotateCcw;
  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly FileSearchIcon = FileSearch;
  readonly XIcon = X;
  readonly EyeIcon = Eye;

  readonly fiche = input<CreditFicheDemandeDetail | null>(null);
  readonly requiredDocs = input<RequiredDoc[]>([]);
  readonly uploadedDocLibelles = input<string[]>([]);
  readonly canSendDossier = input<boolean>(true);
  readonly isGP = input<boolean>(false);
  readonly canFaireResume = input<boolean>(true);
  readonly isRCCC = input<boolean>(false);
  readonly isChefAgenceWorkflow = input<boolean>(false);
  readonly isAR = input<boolean>(false);
  readonly showAnalysteBandeau = input<boolean>(false);
  readonly isSuperviseurPME = input<boolean>(false);
  readonly isSuperviseurRisqueZone = input<boolean>(false);
  readonly isAdmin = input<boolean>(false);
  readonly isPaused = input<boolean>(false);
  readonly confirmationFrais = input<boolean>(false);
  readonly showVoirResume = input<boolean>(false);

  readonly chargerDocuments = output<string | null>();
  readonly envoyerDossier = output<void>();
  readonly ajournerDossier = output<void>();
  readonly ajouterPerfect = output<void>();
  readonly affecterAR = output<void>();
  readonly faireResume = output<void>();
  readonly avisDefavorable = output<void>();
  readonly confirmationRejet = output<void>();
  readonly voirResume = output<void>();
  readonly confirmationFraisChange = output<boolean>();
  readonly validerDossierRCCC = output<void>();
  readonly remettreEnCircuit = output<void>();

  readonly isPersonneMorale = computed(() => this.fiche()?.client?.typeAgent !== 'PP');

  /**
   * RC/CC statut 3 — Validation prêts spéciaux
   * Codes: 014 (OUF), 001 (Scolaire), 008 (Avance salaire)
   */
  readonly isRCCCValidationStatut3 = computed(() => {
    const f = this.fiche();
    if (!f || !this.isRCCC()) return false;
    if (f.statut !== 3) return false;
    const code = f.typeCredit?.code;
    return code === '014' || code === '001' || code === '008';
  });

  readonly objetLabel = computed(() => {
    const obj = this.fiche()?.objetCredit;
    if (!obj) return null;
    return OBJETS_CREDIT[obj] ?? String(obj);
  });

  readonly statutJuridiqueLabel = computed(() => {
    const sj = this.fiche()?.client?.entreprise?.statutJuridique;
    if (!sj) return null;
    const key = typeof sj === 'string' ? parseInt(sj, 10) : sj;
    return STATUT_JURIDIQUE[key] ?? String(sj);
  });

  /** Dropdown items : docs requis selon le type de crédit. */
  readonly docTypeItems = computed<DropdownItem[]>(() => {
    const f = this.fiche();
    const code = f?.typeCredit?.code;

    /** Legacy : pas de menu « Charger les documents » pour AR sur avance BC / facture (032, 033). */
    if (this.showAnalysteBandeau() && (code === '032' || code === '033')) {
      return [];
    }

    /** CA/CAA statut 4 codes 032/033 : dropdown docs spécifiques */
    if (this.isChefAgenceWorkflow() && f?.statut === 4 && (code === '032' || code === '033')) {
      const statutJuridique = f.client?.entreprise?.statutJuridique;
      const sj =
        typeof statutJuridique === 'string' ? parseInt(statutJuridique, 10) : statutJuridique;
      const caCaaDocs = getRequiredDocsForCACaa(code, sj);
      const uploaded = this.uploadedDocLibelles().map((l) => l.trim().toLowerCase());

      return caCaaDocs.map((doc) => {
        const alreadyUploaded = uploaded.some((u) => u === doc.libelle.trim().toLowerCase());
        return {
          label: doc.libelle,
          required: doc.obligation,
          disabled: alreadyUploaded,
          action: () => this.chargerDocuments.emit(doc.libelle),
        };
      });
    }

    const required = this.requiredDocs();
    const uploaded = this.uploadedDocLibelles().map((l) => l.trim().toLowerCase());

    if (required.length > 0) {
      return required.map((doc) => {
        const alreadyUploaded = uploaded.some((u) => u === doc.libelle.trim().toLowerCase());
        return {
          label: doc.libelle,
          required: doc.obligation,
          disabled: alreadyUploaded,
          action: () => this.chargerDocuments.emit(doc.libelle),
        };
      });
    }

    return [];
  });

  readonly uploadingDocLibelle = input<string | null>(null);

  readonly statusOneGpPrimaryLabel = computed(() => {
    const f = this.fiche();
    if (!f || !this.isGP() || f.statut !== 1) {
      return 'Envoyer le dossier';
    }
    const code = f.typeCredit?.code;
    if (code === '002') {
      return 'Avis ACJ';
    }
    if (code === '011') {
      return 'Envoyer au CA';
    }
    return 'Envoyer le dossier';
  });
}
