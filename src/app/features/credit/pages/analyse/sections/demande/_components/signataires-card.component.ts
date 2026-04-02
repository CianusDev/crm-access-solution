import { ToastService } from '@/core/services/toast/toast.service';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormSelect, SelectOption } from '@/shared/components/form-select/form-select.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Camera, Loader2, LucideAngularModule, Pencil, User, Users, X } from 'lucide-angular';
import { CreditSignataire } from '../../../../../interfaces/credit.interface';
import { CreditService } from '../../../../../services/credit/credit.service';

const SEXE_OPTIONS: SelectOption[] = [
  { value: '1', label: 'Féminin' },
  { value: '2', label: 'Masculin' },
];

const SITUATION_MATRI_OPTIONS: SelectOption[] = [
  { value: '1', label: 'Célibataire' },
  { value: '2', label: 'Concubinage' },
  { value: '3', label: 'Marié(e)' },
  { value: '4', label: 'Divorcé' },
  { value: '5', label: 'Veuf / Veuve' },
];

const TYPE_PIECE_OPTIONS: SelectOption[] = [
  { value: '1', label: 'CNI' },
  { value: '2', label: 'Passeport' },
  { value: '3', label: 'Carte consulaire' },
  { value: '4', label: 'Permis de conduit' },
  { value: '5', label: "Attestation d'identité" },
  { value: '6', label: 'Carte de résident' },
];

function toDateInput(d: string | undefined | null): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().substring(0, 10);
}

function formatDateForApi(val: string): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

@Component({
  selector: 'app-signataires-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    ButtonDirective,
    FormInput,
    FormSelect,
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
              @if (editingIndex() === $index) {
                <!-- ── Edit mode ─────────────────────────────────────── -->
                <div class="rounded-lg p-4">
                  <div class="flex items-center justify-between mb-6">
                    <p class="text-sm font-semibold text-foreground">Modifier le signataire</p>
                  </div>
                  <form [formGroup]="form" (ngSubmit)="save()">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <app-form-input label="Nom" name="nom" [required]="true" />
                      <app-form-input label="Prénom" name="prenom" [required]="true" />
                      <app-form-select
                        label="Sexe"
                        name="sexe"
                        [options]="sexeOptions"
                        [required]="true"
                      />
                      <app-form-select
                        label="Situation matrimoniale"
                        name="situationMatri"
                        [options]="situationMatriOptions"
                        [required]="true"
                      />
                      <app-form-input label="Téléphone" name="telephone" [required]="true" />
                      <app-form-input label="Email" name="email" />
                      <app-form-input
                        label="Date de naissance"
                        name="dateNaiss"
                        type="date"
                        [required]="true"
                      />
                      <app-form-input
                        label="Lieu de naissance"
                        name="lieuNaiss"
                        [required]="true"
                      />
                      <app-form-select
                        label="Nationalité"
                        name="nationalite"
                        [options]="nationaliteOptions()"
                        [required]="true"
                      />
                      <app-form-select
                        label="Type de pièce"
                        name="typePiece"
                        [options]="typePieceOptions"
                        [required]="true"
                      />
                      <app-form-input label="N° pièce" name="numPiece" [required]="true" />
                      <app-form-input
                        label="Date de délivrance"
                        name="dateDelivrancePiece"
                        type="date"
                        [required]="true"
                      />
                      <app-form-input
                        label="Date d'expiration"
                        name="dateExpirationPiece"
                        type="date"
                        [required]="true"
                      />
                      <app-form-input
                        label="Lieu de délivrance"
                        name="lieuDelivrance"
                        [required]="true"
                      />
                      <app-form-input
                        label="Date du statut"
                        name="dateStatut"
                        type="date"
                        [required]="true"
                      />
                      <app-form-select
                        label="Commune"
                        name="commune"
                        [options]="communeOptions()"
                        [required]="true"
                      />
                      <app-form-input label="Quartier" name="quartier" [required]="true" />
                      <app-form-input label="Rue" name="rue" />
                    </div>
                    <div class="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        appButton
                        variant="outline"
                        size="sm"
                        (click)="cancelEdit()"
                        [disabled]="saving()"
                      >
                        Annuler
                      </button>
                      <button type="submit" appButton size="sm" [disabled]="saving()">
                        {{ saving() ? 'Enregistrement…' : 'Enregistrer' }}
                      </button>
                    </div>
                  </form>
                </div>
              } @else {
                <!-- ── View mode ─────────────────────────────────────── -->
                <div class="rounded-lg border border-border bg-muted/20 p-4">
                  <div class="flex items-start gap-3 mb-3">
                    <!-- Photo de profil -->
                    <div class="relative shrink-0">
                      <div
                        class="h-16 w-16 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center"
                      >
                        @if (s.photoProfil) {
                          <img
                            [src]="getPhotoUrl(s.photoProfil)"
                            alt="Photo de profil"
                            class="h-full w-full object-cover"
                          />
                        } @else {
                          <lucide-icon [img]="UserIcon" [size]="24" class="text-muted-foreground" />
                        }
                      </div>
                      <!-- Bouton upload photo -->
                      @if (!readOnly()) {
                        <button
                          type="button"
                          appButton
                          variant="ghost"
                          size="sm"
                          class="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary p-0 hover:bg-primary/90"
                          (click)="photoInput.click()"
                          [disabled]="uploadingPhoto()"
                        >
                          @if (uploadingPhoto()) {
                            <lucide-icon
                              [img]="Loader2"
                              [size]="14"
                              class="text-primary-foreground animate-spin"
                            />
                          } @else {
                            <lucide-icon
                              [img]="CameraIcon"
                              [size]="14"
                              class="text-primary-foreground"
                            />
                          }
                        </button>
                        <input
                          #photoInput
                          type="file"
                          class="hidden"
                          accept="image/*"
                          (change)="onPhotoChange($event, s)"
                        />
                      }
                    </div>

                    <div class="flex-1">
                      <p class="text-sm font-semibold text-foreground">
                        {{ s.prenom }} {{ s.nom }}
                      </p>
                      @if (s.email) {
                        <p class="text-xs text-muted-foreground mt-0.5">{{ s.email }}</p>
                      }
                    </div>

                    @if (!readOnly()) {
                      <button
                        type="button"
                        appButton
                        variant="ghost"
                        size="sm"
                        (click)="startEdit($index, s)"
                        class="shrink-0"
                      >
                        <lucide-icon [img]="PencilIcon" [size]="14" />
                      </button>
                    }
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                    @if (s.sexe) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Sexe</span>
                        <span class="text-xs font-medium text-foreground">{{
                          getSexeLabel(s.sexe)
                        }}</span>
                      </div>
                    }
                    @if (s.situationMatri) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Situation matrimoniale</span>
                        <span class="text-xs font-medium text-foreground">{{
                          getSituationMatriLabel(s.situationMatri)
                        }}</span>
                      </div>
                    }
                    @if (s.numTelephone) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Téléphone</span>
                        <span class="text-xs font-medium text-foreground">{{
                          s.numTelephone
                        }}</span>
                      </div>
                    }
                    @if (s.dateNaissance) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Date de naissance</span>
                        <span class="text-xs font-medium text-foreground">{{
                          s.dateNaissance | date: 'dd/MM/yyyy'
                        }}</span>
                      </div>
                    }
                    @if (s.lieuNaiss) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Lieu de naissance</span>
                        <span class="text-xs font-medium text-foreground">{{ s.lieuNaiss }}</span>
                      </div>
                    }
                    @if (s.nationalite?.nationalite) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Nationalité</span>
                        <span class="text-xs font-medium text-foreground">{{
                          s.nationalite!.nationalite
                        }}</span>
                      </div>
                    }
                    @if (s.codTypePiece) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Type de pièce</span>
                        <span class="text-xs font-medium text-foreground">{{
                          getTypePieceLabel(s.codTypePiece)
                        }}</span>
                      </div>
                    }
                    @if (s.numPiece) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">N° pièce</span>
                        <span class="text-xs font-medium font-mono text-foreground">{{
                          s.numPiece
                        }}</span>
                      </div>
                    }
                    @if (s.dateDelivrancePiece) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Délivrance pièce</span>
                        <span class="text-xs font-medium text-foreground">{{
                          s.dateDelivrancePiece | date: 'dd/MM/yyyy'
                        }}</span>
                      </div>
                    }
                    @if (s.dateExpirationPiece) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Expiration pièce</span>
                        <span class="text-xs font-medium text-foreground">{{
                          s.dateExpirationPiece | date: 'dd/MM/yyyy'
                        }}</span>
                      </div>
                    }
                    @if (s.lieuDelivrance) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Lieu de délivrance</span>
                        <span class="text-xs font-medium text-foreground">{{
                          s.lieuDelivrance
                        }}</span>
                      </div>
                    }
                    @if (s.commune?.libelle) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Commune</span>
                        <span class="text-xs font-medium text-foreground">{{
                          s.commune!.libelle
                        }}</span>
                      </div>
                    }
                    @if (s.quartier) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Quartier</span>
                        <span class="text-xs font-medium text-foreground">{{ s.quartier }}</span>
                      </div>
                    }
                    @if (s.rue) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Rue</span>
                        <span class="text-xs font-medium text-foreground">{{ s.rue }}</span>
                      </div>
                    }
                    @if (s.dateStatut) {
                      <div class="flex justify-between py-1.5 border-b border-border/40">
                        <span class="text-xs text-muted-foreground">Date du statut</span>
                        <span class="text-xs font-medium text-foreground">{{
                          s.dateStatut | date: 'dd/MM/yyyy'
                        }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
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
export class SignatairesCardComponent implements OnInit {
  readonly UsersIcon = Users;
  readonly UserIcon = User;
  readonly PencilIcon = Pencil;
  readonly XIcon = X;
  readonly CameraIcon = Camera;
  readonly Loader2 = Loader2;

  readonly sexeOptions = SEXE_OPTIONS;
  readonly situationMatriOptions = SITUATION_MATRI_OPTIONS;
  readonly typePieceOptions = TYPE_PIECE_OPTIONS;

  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly toast = inject(ToastService);

  readonly signataires = input<CreditSignataire[]>([]);
  readonly readOnly = input<boolean>(false);
  readonly signatairesUpdated = output<void>();

  // ── Dropdown options (loaded once) ────────────────────────────────────
  readonly nationaliteOptions = signal<SelectOption[]>([]);
  readonly communeOptions = signal<SelectOption[]>([]);

  // ── Edit state ────────────────────────────────────────────────────────
  readonly editingIndex = signal<number | null>(null);
  readonly saving = signal(false);
  readonly uploadingPhoto = signal(false);
  private editingSignataire: CreditSignataire | null = null;

  readonly form = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    sexe: ['', Validators.required],
    situationMatri: ['', Validators.required],
    telephone: ['', Validators.required],
    email: [''],
    dateNaiss: ['', Validators.required],
    lieuNaiss: ['', Validators.required],
    nationalite: [null as number | null, Validators.required],
    typePiece: ['', Validators.required],
    numPiece: ['', Validators.required],
    dateDelivrancePiece: ['', Validators.required],
    dateExpirationPiece: ['', Validators.required],
    lieuDelivrance: ['', Validators.required],
    dateStatut: ['', Validators.required],
    commune: [null as number | null, Validators.required],
    quartier: ['', Validators.required],
    rue: [''],
  });

  ngOnInit() {
    this.loadReferenceData();
  }

  private loadReferenceData() {
    this.creditService.getPaysCommuneData().subscribe({
      next: (data) => {
        this.nationaliteOptions.set(
          (data.pays ?? []).map((p) => ({ value: p.id, label: p.nationalite })),
        );
        this.communeOptions.set(
          (data.communes ?? []).map((c) => ({ value: c.id, label: c.libelle })),
        );
      },
      error: () => {},
    });
  }

  startEdit(index: number, s: CreditSignataire) {
    this.editingSignataire = s;
    this.form.reset({
      nom: s.nom ?? '',
      prenom: s.prenom ?? '',
      sexe: s.sexe?.toString() ?? '',
      situationMatri: s.situationMatri?.toString() ?? '',
      telephone: s.numTelephone ?? '',
      email: s.email ?? '',
      dateNaiss: toDateInput(s.dateNaissance),
      lieuNaiss: s.lieuNaiss ?? '',
      nationalite: s.nationalite?.id ?? null,
      typePiece: s.codTypePiece?.toString() ?? '',
      numPiece: s.numPiece ?? '',
      dateDelivrancePiece: toDateInput(s.dateDelivrancePiece),
      dateExpirationPiece: toDateInput(s.dateExpirationPiece),
      lieuDelivrance: s.lieuDelivrance ?? '',
      dateStatut: toDateInput(s.dateStatut),
      commune: s.commune?.id ?? null,
      quartier: s.quartier ?? '',
      rue: s.rue ?? '',
    });
    this.editingIndex.set(index);
  }

  cancelEdit() {
    this.editingIndex.set(null);
    this.editingSignataire = null;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.editingSignataire?.id) return;

    const val = this.form.value;
    this.saving.set(true);

    this.creditService
      .updateSignataire({
        signataire: this.editingSignataire.id,
        email: val.email || '',
        nom: val.nom,
        prenom: val.prenom,
        sexe: val.sexe,
        situationMatri: val.situationMatri,
        telephone: val.telephone,
        dateNaiss: formatDateForApi(val.dateNaiss!),
        lieuNaiss: val.lieuNaiss,
        nationalite: val.nationalite,
        typePiece: val.typePiece,
        numPiece: val.numPiece,
        dateDelivrancePiece: formatDateForApi(val.dateDelivrancePiece!),
        dateExpirationPiece: formatDateForApi(val.dateExpirationPiece!),
        lieuDelivrance: val.lieuDelivrance,
        dateStatut: formatDateForApi(val.dateStatut!),
        commune: val.commune,
        quartier: val.quartier,
        rue: val.rue || '',
      })
      .subscribe({
        next: () => {
          this.toast.success('Signataire modifié avec succès.');
          this.saving.set(false);
          this.editingIndex.set(null);
          this.editingSignataire = null;
          this.signatairesUpdated.emit();
        },
        error: () => {
          this.toast.error('Erreur lors de la modification du signataire.');
          this.saving.set(false);
        },
      });
  }

  getPhotoUrl(photoPath: string): string {
    if (!photoPath) return '';
    if (photoPath.startsWith('http')) return photoPath;
    return `https://crm-fichiers.creditaccess.ci/crm/credit-ca/${photoPath}`;
  }

  getSexeLabel(sexe: string): string {
    const option = SEXE_OPTIONS.find((o) => o.value === sexe?.toString());
    return option ? option.label : sexe;
  }

  getSituationMatriLabel(situationMatri: string): string {
    const option = SITUATION_MATRI_OPTIONS.find((o) => o.value === situationMatri?.toString());
    return option ? option.label : situationMatri;
  }

  getTypePieceLabel(typePiece: string): string {
    const option = TYPE_PIECE_OPTIONS.find((o) => o.value === typePiece?.toString());
    return option ? option.label : typePiece;
  }

  onPhotoChange(event: Event, signataire: CreditSignataire) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !signataire.id) return;

    const file = input.files[0];
    this.uploadingPhoto.set(true);

    const formData = new FormData();
    formData.append('signataire', signataire.id.toString());
    formData.append('photoProfil', file);
    formData.append('email', signataire.email || '');
    formData.append('nom', signataire.nom || '');
    formData.append('prenom', signataire.prenom || '');
    formData.append('sexe', signataire.sexe || '');
    formData.append('situationMatri', signataire.situationMatri || '');
    formData.append('telephone', signataire.numTelephone || '');
    formData.append('dateNaiss', signataire.dateNaissance || '');
    formData.append('lieuNaiss', signataire.lieuNaiss || '');
    formData.append('nationalite', signataire.nationalite?.id?.toString() || '');
    formData.append('typePiece', signataire.codTypePiece || '');
    formData.append('numPiece', signataire.numPiece || '');
    formData.append('dateDelivrancePiece', signataire.dateDelivrancePiece || '');
    formData.append('dateExpirationPiece', signataire.dateExpirationPiece || '');
    formData.append('lieuDelivrance', signataire.lieuDelivrance || '');
    formData.append('dateStatut', signataire.dateStatut || '');
    formData.append('commune', signataire.commune?.id?.toString() || '');
    formData.append('quartier', signataire.quartier || '');
    formData.append('rue', signataire.rue || '');

    this.creditService.updateSignataireAvecPhoto(formData).subscribe({
      next: () => {
        this.toast.success('Photo de profil mise à jour avec succès.');
        this.uploadingPhoto.set(false);
        input.value = '';
        this.signatairesUpdated.emit();
      },
      error: () => {
        this.toast.error("Erreur lors de l'upload de la photo.");
        this.uploadingPhoto.set(false);
        input.value = '';
      },
    });
  }
}
