import {
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { FormCheckbox } from '@/shared/components/form-checkbox/form-checkbox.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormRadioGroup } from '@/shared/components/form-radio-group/form-radio-group.component';
import { FormSelect } from '@/shared/components/form-select/form-select.component';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';
import {
  CIVILITIES_OPTIONS,
  DOCUMENT_TYPES,
  FORME_JURIDIQUE,
  INTERNET_OPTIONS,
  NATURE_BAIL,
  PARTNERS_OPTIONS,
  SITUATION_MAT,
  TYPE_DEBIT,
  TYPE_DEVICES_OPTIONS,
  TYPE_FACTURE,
} from '@/core/constants/cora-form';
import { ToastService } from '@/core/services/toast/toast.service';
import { LabelDirective } from '@/shared/directives/ui/label/label';
import { LucideAngularModule, CheckIcon } from 'lucide-angular';
import { ButtonComponent } from '@/shared/components/button/button.component';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CoraFormData, CreateCoraDto } from '../../interfaces/create-cora-dto.interface';
import { CoraService } from '../../services/cora/cora.service';

@Component({
  selector: 'app-create-cora',
  templateUrl: './create-cora.component.html',
  imports: [
    CardComponent,
    CardTitleComponent,
    CardHeaderComponent,
    CardContentComponent,
    FormInput,
    FormSelect,
    FormCheckbox,
    FormRadioGroup,
    FormTextarea,
    CardDescriptionComponent,
    ButtonComponent,
    LucideAngularModule,
    LabelDirective,
    ReactiveFormsModule,
  ],
})
export class CreateCoraComponent {
  readonly CheckIcon = CheckIcon;

  // ── Constants ────────────────────────────────────────────────────────────
  readonly DOCUMENT_TYPES = [...DOCUMENT_TYPES];
  readonly CIVILITIES_OPTIONS = [...CIVILITIES_OPTIONS];
  readonly SITUATION_MAT = [...SITUATION_MAT];
  readonly FORME_JURIDIQUE = [...FORME_JURIDIQUE];
  readonly NATURE_BAIL = [...NATURE_BAIL];
  readonly TYPE_FACTURE = [...TYPE_FACTURE];
  readonly TYPE_DEBIT = [...TYPE_DEBIT];
  readonly PARTNERS_OPTIONS = [...PARTNERS_OPTIONS];
  readonly TYPE_DEVICES_OPTIONS = [...TYPE_DEVICES_OPTIONS];
  readonly INTERNET_OPTIONS = [...INTERNET_OPTIONS];

  // ── Injections ────────────────────────────────────────────────────────────
  private readonly fb = inject(FormBuilder);
  private readonly coraService = inject(CoraService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  // ── Resolver data ─────────────────────────────────────────────────────────
  readonly formData = input<CoraFormData>();

  readonly paysOptions = computed(
    () => this.formData()?.pays.map((p) => ({ value: p.id, label: p.nationalite })) ?? [],
  );

  readonly communesOptions = computed(
    () => this.formData()?.communes.map((c) => ({ value: c.id, label: c.libelle })) ?? [],
  );

  // ── Multi-select state ─────────────────────────────────────────────────────
  readonly selectedPartners = signal(new Set<string>());
  readonly selectedDevices = signal(new Set<string>());

  // ── Loading state ─────────────────────────────────────────────────────────
  readonly isLoading = signal(false);

  // ── Form ──────────────────────────────────────────────────────────────────
  readonly form = this.fb.group({
    // Mandataire social
    nomPrenom: ['', Validators.required],
    dateNaiss: ['', Validators.required],
    lieuNaiss: ['', Validators.required],
    nationalite: [null as number | null, Validators.required],
    typePiece: [null as number | null, Validators.required],
    numeroPiece: ['', Validators.required],
    civilite: [null as number | null, Validators.required],
    situationMat: [null as number | null],
    fonction: ['', Validators.required],
    contactMandataire: ['', Validators.required],
    ancieneteMmAn: [null as number | null, [Validators.required, Validators.min(0)]],
    ancieneteMmMois: [null as number | null, [Validators.required, Validators.min(0), Validators.max(11)]],
    nombrePtService: [null as number | null, [Validators.required, Validators.min(1)]],

    // Description de l'activité
    designation: ['', Validators.required],
    dateCreation: ['', Validators.required],
    formuleJuridique: [null as number | null, Validators.required],
    capital: [null as number | null, [Validators.required, Validators.min(0)]],
    rccm: ['', Validators.required],
    ncc: [''],
    mobile: ['', Validators.required],
    fixe: [''],
    email: ['', Validators.email],
    nombreEmploye: [null as number | null, [Validators.required, Validators.min(0)]],
    commune: [null as number | null, Validators.required],
    quartier: ['', Validators.required],
    lot: [''],
    ilot: [''],
    bail: [null as number | null, Validators.required],
    ancieneteLocalAn: [null as number | null, [Validators.required, Validators.min(0)]],
    ancieneteLocalMois: [null as number | null, [Validators.required, Validators.min(0), Validators.max(11)]],
    immeuble: [''],
    etage: [''],
    porte: [''],
    typeFacture: [null as number | null, Validators.required],
    facture: ['', Validators.required],
    rue: [''],
    reperes: [''],
    autrePartners: [''],
    debit: [null as number | null, Validators.required],
    internet: [null as string | null, Validators.required],
    description: ['', Validators.required],

    // Description du local
    enDur: [false],
    ephemere: [false],
    espaceClient: [false],
    camera: [false],
    securite: [false],
    caisseIsole: [false],
    caisseNonIsole: [false],
  });

  // ── Multi-select helpers ───────────────────────────────────────────────────
  isPartnerSelected(partner: string): boolean {
    return this.selectedPartners().has(partner);
  }

  togglePartner(partner: string): void {
    this.selectedPartners.update((set) => {
      const next = new Set(set);
      next.has(partner) ? next.delete(partner) : next.add(partner);
      return next;
    });
  }

  isDeviceSelected(device: string): boolean {
    return this.selectedDevices().has(device);
  }

  toggleDevice(device: string): void {
    this.selectedDevices.update((set) => {
      const next = new Set(set);
      next.has(device) ? next.delete(device) : next.add(device);
      return next;
    });
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    this.isLoading.set(true);
    const v = this.form.value;

    const dto: CreateCoraDto = {
      nomPrenom: v.nomPrenom!,
      dateNaiss: v.dateNaiss!,
      lieuNaiss: v.lieuNaiss!,
      nationalite: v.nationalite!,
      typePiece: v.typePiece!,
      numeroPiece: v.numeroPiece!,
      civilite: v.civilite!,
      situationMat: v.situationMat ?? null,
      fonction: v.fonction!,
      contactMandataire: v.contactMandataire!,
      ancieneteMmAn: v.ancieneteMmAn!,
      ancieneteMmMois: v.ancieneteMmMois!,
      nombrePtService: v.nombrePtService!,
      designation: v.designation!,
      dateCreation: v.dateCreation!,
      formuleJuridique: v.formuleJuridique!,
      capital: v.capital!,
      rccm: v.rccm!,
      ncc: v.ncc ?? '',
      mobile: v.mobile!,
      fixe: v.fixe ?? '',
      email: v.email ?? '',
      nombreEmploye: v.nombreEmploye!,
      commune: v.commune!,
      quartier: v.quartier!,
      lot: v.lot ?? '',
      ilot: v.ilot ?? '',
      bail: v.bail!,
      ancieneteLocalAn: v.ancieneteLocalAn!,
      ancieneteLocalMois: v.ancieneteLocalMois!,
      immeuble: v.immeuble ?? '',
      etage: v.etage ?? '',
      porte: v.porte ?? '',
      typeFacture: v.typeFacture!,
      facture: v.facture!,
      rue: v.rue ?? '',
      reperes: v.reperes ?? '',
      partners: [...this.selectedPartners()],
      autrePartners: v.autrePartners ?? '',
      typeDevice: [...this.selectedDevices()],
      debit: v.debit!,
      internet: v.internet!,
      description: v.description!,
      enDur: v.enDur ?? false,
      ephemere: v.ephemere ?? false,
      espaceClient: v.espaceClient ?? false,
      camera: v.camera ?? false,
      securite: v.securite ?? false,
      caisseIsole: v.caisseIsole ?? false,
      caisseNonIsole: v.caisseNonIsole ?? false,
      statusEnvoyer: 1,
    };

    this.coraService.createCora(dto).subscribe({
      next: () => {
        this.toast.success('CORA enregistré avec succès.');
        this.router.navigate(['/app/cora/dashboard']);
      },
      error: (err) => {
        this.toast.error(err.message ?? "Une erreur est survenue lors de l'enregistrement.");
        this.isLoading.set(false);
      },
    });
  }
}
