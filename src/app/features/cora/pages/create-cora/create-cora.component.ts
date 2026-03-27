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
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
export class CreateCoraComponent implements OnInit {
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
  private readonly route = inject(ActivatedRoute);

  readonly isEditMode = signal(false);
  readonly editCoraId = signal<number | null>(null);

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
    ancieneteMmMois: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(11)],
    ],
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
    ancieneteLocalMois: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(11)],
    ],
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

  ngOnInit(): void {
    const coraId = this.route.snapshot.queryParamMap.get('coraId');
    if (!coraId) return;
    this.isEditMode.set(true);
    this.editCoraId.set(+coraId);
    this.isLoading.set(true);
    this.coraService.getCoraById(+coraId).subscribe({
      next: (cora) => {
        // Fallback sur le sous-objet "agent" de l'ancienne API pour les champs
        // qui étaient stockés sur l'entité agent (mandataire social)
        const ag = cora.agent ?? {};

        const partners = this.parseJsonArray(cora.partners);
        const typeDevice = this.parseJsonArray(cora.typeDevice);

        this.form.patchValue({
          nomPrenom: cora.nomPrenom ?? '',
          dateNaiss: cora.dateNaiss ? cora.dateNaiss.slice(0, 10) : '',
          lieuNaiss: cora.lieuNaiss ?? '',
          nationalite: this.resolveNationaliteId(cora.pays, cora.nationalite),
          typePiece: cora.typePiece != null ? Number(cora.typePiece) : null,
          numeroPiece: cora.numeroPiece ?? '',
          civilite: cora.civilite != null ? Number(cora.civilite) : null,
          situationMat: this.resolveSituationMat(cora, ag),
          fonction: cora.fonction ?? '',
          contactMandataire: cora.contactMandataire ?? ag.mobile ?? '',
          ancieneteMmAn: cora.ancieneteMmAn ?? (ag.ancieneteLocalAn != null ? Number(ag.ancieneteLocalAn) : null),
          ancieneteMmMois: cora.ancieneteMmMois ?? (ag.ancieneteLocalMois != null ? Number(ag.ancieneteLocalMois) : null),
          nombrePtService: cora.nombrePtService != null ? Number(cora.nombrePtService) : null,
          designation: cora.designation ?? '',
          dateCreation: cora.dateCreation ? cora.dateCreation.slice(0, 10) : '',
          formuleJuridique: cora.formuleJuridique != null ? Number(cora.formuleJuridique) : null,
          capital: cora.capital != null ? Number(cora.capital) : null,
          rccm: cora.rccm ?? '',
          ncc: cora.ncc ?? '',
          mobile: cora.mobile ?? '',
          fixe: cora.fixe ?? '',
          email: cora.email ?? '',
          nombreEmploye: cora.nombreEmploye ?? null,
          commune: cora.commune?.id ?? null,
          quartier: cora.quartier ?? ag.quartier ?? '',
          lot: cora.lot ?? ag.lot ?? '',
          ilot: cora.ilot ?? ag.ilot ?? '',
          bail: cora.bail != null ? Number(cora.bail) : (ag.bail != null ? Number(ag.bail) : null),
          ancieneteLocalAn: cora.ancieneteLocalAn != null ? Number(cora.ancieneteLocalAn) : null,
          ancieneteLocalMois: cora.ancieneteLocalMois != null ? Number(cora.ancieneteLocalMois) : null,
          immeuble: cora.immeuble ?? ag.immeuble ?? '',
          etage: cora.etage ?? (ag.etage != null ? String(ag.etage) : ''),
          porte: cora.porte ?? (ag.porte != null ? String(ag.porte) : ''),
          typeFacture: cora.typeFacture != null ? Number(cora.typeFacture) : (ag.typeFacture != null ? Number(ag.typeFacture) : null),
          facture: cora.facture ?? ag.facture ?? '',
          rue: cora.rue ?? ag.rue ?? '',
          reperes: cora.reperes ?? (ag.reperes != null ? String(ag.reperes) : ''),
          autrePartners: cora.autrePartners ?? '',
          debit: cora.debit != null ? Number(cora.debit) : (ag.tel3g != null ? Number(ag.tel3g) : null),
          internet: cora.internet != null ? String(cora.internet) : (ag.internet != null ? String(ag.internet) : null),
          description: cora.description ?? '',
          enDur: cora.enDur ?? ag.enDur ?? false,
          ephemere: cora.ephemere ?? ag.ephemere ?? false,
          espaceClient: cora.espaceClient ?? ag.espaceClient ?? false,
          camera: cora.camera ?? ag.camera ?? false,
          securite: cora.securite ?? ag.securite ?? false,
          caisseIsole: cora.caisseIsole ?? ag.caisseIsole ?? false,
          caisseNonIsole: cora.caisseNonIsole ?? ag.caisseNonIsole ?? false,
        });

        if (partners.length) this.selectedPartners.set(new Set(partners));
        if (typeDevice.length) this.selectedDevices.set(new Set(typeDevice));
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Erreur lors du chargement.');
        this.isLoading.set(false);
      },
    });
  }

  /** Résout l'ID de nationalité : priorité à cora.pays.id (old API), puis cora.nationalite */
  private resolveNationaliteId(
    pays: { id: number } | undefined | null,
    nationalite: { id: number } | number | undefined | null,
  ): number | null {
    if (pays?.id != null) return pays.id;
    if (nationalite == null) return null;
    if (typeof nationalite === 'number') return nationalite;
    return nationalite.id ?? null;
  }

  private resolveSituationMat(
    cora: { situationMat?: number | string; situationMatri?: number | string },
    ag: { situationMat?: number | string; situationMatri?: number | string },
  ): number | null {
    const raw = cora.situationMat ?? cora.situationMatri ?? ag.situationMat ?? ag.situationMatri;
    if (raw == null) return null;
    const n = Number(raw);
    return isNaN(n) ? null : n;
  }

  private parseJsonArray(val: string[] | string | undefined | null): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
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

    const call = this.isEditMode()
      ? this.coraService.updateCora({ ...dto, cora: this.editCoraId()! })
      : this.coraService.createCora(dto);

    call.subscribe({
      next: () => {
        this.toast.success(
          this.isEditMode() ? 'CORA mis à jour avec succès.' : 'CORA enregistré avec succès.',
        );
        this.router.navigate(['/app/cora/pending']);
      },
      error: (err: { message?: string }) => {
        this.toast.error(err?.message ?? "Une erreur est survenue lors de l'enregistrement.");
        this.isLoading.set(false);
      },
    });
  }
}
