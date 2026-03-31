import { Component, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { DatePipe, DecimalPipe, JsonPipe } from '@angular/common';
import {
  LucideAngularModule,
  Search,
  User,
  Building2,
  CreditCard,
  ChevronLeft,
  Save,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardTitleComponent,
} from '@/shared/components/card/card.component';
import { ButtonDirective } from '@/shared/directives/ui/button/button';
import {
  SearchableSelectComponent,
  SelectOption,
} from '@/shared/components/searchable-select/searchable-select.component';
import { FormInput } from '@/shared/components/form-input/form-input.component';
import { FormTextarea } from '@/shared/components/form-textarea/form-textarea.component';
import { ToastService } from '@/core/services/toast/toast.service';
import { UserRole } from '@/core/models/user.model';
import { PermissionService } from '@/core/services/permission/permission.service';
import { CreditService } from '../../services/credit/credit.service';
import {
  CreditClientDetail,
  CreditTirageSearch,
  CreditTypeActivite,
  CreditTypeCredit,
} from '../../interfaces/credit.interface';
import { CreateCreditResolvedData } from './create-credit.resolver';

/** Codes de types de crédit autorisés par groupe de profil */
const CODES_GP = ['004', '011', '019', '015', '021', '033', '016', '032', '035'];
const CODES_ACJ_CE = ['002', '036'];
const CODES_RC_CC = ['001', '008', '014'];

/** Profils autorisés à créer un tirage découvert */
const PROFILS_TIRAGE = [UserRole.GestionnairePortefeuilles, UserRole.Admin];

const OBJETS_CREDIT: SelectOption[] = [
  { value: '1', label: 'Fonds de roulement' },
  { value: '2', label: 'Investissement' },
  { value: '3', label: 'Fonds de roulement et Investissement' },
  { value: '4', label: 'Financement du pas-de-porte' },
  { value: '5', label: 'Avance sur trésorerie' },
];

@Component({
  selector: 'app-create-credit',
  templateUrl: './create-credit.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    ButtonDirective,
    SearchableSelectComponent,
    FormInput,
    FormTextarea,
    JsonPipe,
  ],
})
export class CreateCreditComponent implements OnInit {
  readonly SearchIcon = Search;
  readonly UserIcon = User;
  readonly Building2Icon = Building2;
  readonly CreditCardIcon = CreditCard;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly SaveIcon = Save;
  readonly PhoneIcon = Phone;
  readonly MapPinIcon = MapPin;
  readonly CalendarIcon = Calendar;

  private readonly creditService = inject(CreditService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly permissions = inject(PermissionService);

  readonly data = input<CreateCreditResolvedData>();

  constructor() {
    effect(
      () => {
        const data = this.data();
        if (!data) return;
        this.typesActivite.set(data.typesActivite);
        this.typesCredit.set(data.typesCredit);
        this.isLoadingRefs.set(false);
      },
      { allowSignalWrites: true },
    );
  }

  // ── State ──────────────────────────────────────────────────────────────
  readonly choix = signal<'1' | '2'>('1');
  readonly step = signal<'search' | 'form' | 'tirage-form'>('search');

  // ── Nouvelle demande ───────────────────────────────────────────────────
  readonly codeClient = signal('');
  readonly isSearching = signal(false);
  readonly client = signal<CreditClientDetail | null>(null);

  // ── Tirage découvert ───────────────────────────────────────────────────
  readonly numPerfect = signal('');
  readonly isSearchingTirage = signal(false);
  readonly tirageData = signal<CreditTirageSearch | null>(null);

  readonly isLoadingRefs = signal(true);
  readonly typesCredit = signal<CreditTypeCredit[]>([]);
  readonly typesActivite = signal<CreditTypeActivite[]>([]);

  // ── Selects (signal — non couverts par FormGroup) ──────────────────────
  readonly fcTypeCredit = signal<number | null>(null);
  readonly fcObjetCredit = signal<string | null>(null);
  readonly fcTypeActivite = signal<number | null>(null);

  // ── FormGroup ─────────────────────────────────────────────────────────
  readonly creditForm = new FormGroup({
    montant: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    duree: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    montantEche: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    differe: new FormControl<number | null>(null, [Validators.min(0)]),
    description: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  readonly isSaving = signal(false);
  readonly submitted = signal(false);

  // ── Permissions ────────────────────────────────────────────────────────
  readonly canCreateTirage = computed(() => this.permissions.hasRole(...PROFILS_TIRAGE));

  private readonly allowedCodes = computed<string[]>(() => {
    const role = this.permissions.userRole();
    if (role === UserRole.GestionnairePortefeuilles || role === UserRole.Admin) return CODES_GP;
    if (role === UserRole.AgentCommercialJunior || role === UserRole.ChefEquipe)
      return CODES_ACJ_CE;
    if (role === UserRole.responsableClient || role === UserRole.conseilClientele)
      return CODES_RC_CC;
    return [];
  });

  // ── Computed — options ─────────────────────────────────────────────────
  readonly typesCreditOptions = computed<SelectOption[]>(() => {
    const codes = this.allowedCodes();
    return this.typesCredit()
      .filter((t) => codes.length === 0 || codes.includes(t.code))
      .map((t) => ({ value: t.id, label: t.libelle }));
  });

  readonly typesActiviteOptions = computed<SelectOption[]>(() =>
    this.typesActivite().map((a) => ({ value: a.id, label: a.libelle })),
  );

  readonly objetsCreditOptions: SelectOption[] = OBJETS_CREDIT;

  // ── Validation des selects ─────────────────────────────────────────────
  readonly selectErrors = computed(() => ({
    typeCredit:
      this.submitted() && this.choix() !== '2' && !this.fcTypeCredit()
        ? 'Veuillez sélectionner un type de crédit'
        : null,
    objetCredit:
      this.submitted() && !this.fcObjetCredit() ? "Veuillez sélectionner l'objet du crédit" : null,
    typeActivite:
      this.submitted() && !this.fcTypeActivite()
        ? "Veuillez sélectionner un secteur d'activité"
        : null,
  }));

  readonly formValid = computed(() => {
    const isTirage = this.choix() === '2';
    return (
      this.creditForm.valid &&
      !!this.fcObjetCredit() &&
      !!this.fcTypeActivite() &&
      (isTirage || !!this.fcTypeCredit())
    );
  });

  readonly isPersonneMorale = computed(() => this.client()?.typeAgent !== 'PP');

  // ── Tirage — computed ──────────────────────────────────────────────────
  readonly montantMax = computed(() => this.tirageData()?.decision?.montantEmprunte ?? 0);

  readonly isTirageExpire = computed(() => {
    const d = this.tirageData();
    if (!d?.demande.dateEffet) return false;
    const dateEffet = new Date(d.demande.dateEffet);
    const expiration = new Date(dateEffet);
    expiration.setFullYear(dateEffet.getFullYear() + 1);
    return new Date() > expiration;
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit() {
    const codeFromQuery = this.route.snapshot.queryParamMap.get('codeClient');
    if (codeFromQuery) {
      this.codeClient.set(codeFromQuery);
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────
  searchClient() {
    const code = this.codeClient().trim();
    if (!code) return;
    this.isSearching.set(true);
    this.client.set(null);
    this.creditService.searchClientCredit(code).subscribe({
      next: (c) => {
        this.client.set(c);
        this.step.set('form');
        this.isSearching.set(false);
      },
      error: () => {
        this.toast.error('Client introuvable. Vérifiez le code client.');
        this.isSearching.set(false);
      },
    });
  }

  resetSearch() {
    this.step.set('search');
    this.client.set(null);
    this.tirageData.set(null);
    this.numPerfect.set('');
    this.resetForm();
  }

  searchTirage() {
    const num = this.numPerfect().trim();
    if (!num) return;
    this.isSearchingTirage.set(true);
    this.tirageData.set(null);
    this.creditService.searchTirage(num).subscribe({
      next: (data) => {
        this.tirageData.set(data);
        this.fcTypeCredit.set(data.demande.typeCredit.id);
        this.step.set('tirage-form');
        this.isSearchingTirage.set(false);
      },
      error: () => {
        this.toast.error('Numéro PERFECT introuvable. Vérifiez le numéro saisi.');
        this.isSearchingTirage.set(false);
      },
    });
  }

  saveTirage() {
    this.submitted.set(true);
    if (!this.formValid()) return;

    const d = this.tirageData();
    const typeCredit = this.fcTypeCredit();
    const typeActivite = this.fcTypeActivite();
    const objetCredit = this.fcObjetCredit();
    if (!d || typeCredit === null || typeActivite === null || !objetCredit) return;

    const v = this.creditForm.value;
    const max = this.montantMax();
    if (max > 0 && (v.montant ?? 0) > max) {
      this.toast.error(
        `Le montant ne peut pas excéder ${new Intl.NumberFormat('fr-FR').format(max)} FCFA`,
      );
      return;
    }

    this.isSaving.set(true);
    this.creditService
      .saveTirage({
        codeClient: d.demande.client.codeClient,
        typeCredit,
        objetCredit,
        typeActivite,
        montantSollicite: v.montant!,
        nbreEcheanceSollicite: v.duree!,
        montantEcheSouhaite: v.montantEche!,
        nbreEcheDiffere: v.differe ?? null,
        description: v.description!.trim(),
        numDmde: this.numPerfect(),
      })
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.toast.success('Tirage enregistré avec succès.');
            this.isSaving.set(false);
            this.router.navigate(['/app/credit/list']);
          } else {
            this.toast.error(res.message ?? "Erreur lors de l'enregistrement.");
            this.isSaving.set(false);
          }
        },
        error: (err) => {
          this.toast.error(err.message ?? "Erreur lors de l'enregistrement.");
          this.isSaving.set(false);
        },
      });
  }

  save() {
    this.submitted.set(true);
    if (!this.formValid()) return;

    const c = this.client();
    const typeCredit = this.fcTypeCredit();
    const typeActivite = this.fcTypeActivite();
    const objetCredit = this.fcObjetCredit();
    if (!c || typeCredit === null || typeActivite === null || !objetCredit) return;

    const v = this.creditForm.value;
    this.isSaving.set(true);
    this.creditService
      .saveDemandeCredit({
        codeClient: c.codeClient,
        typeCredit,
        objetCredit,
        typeActivite,
        montantSollicite: v.montant!,
        nbreEcheanceSollicite: v.duree!,
        montantEcheSouhaite: v.montantEche!,
        nbreEcheDiffere: v.differe ?? null,
        description: v.description!.trim(),
      })
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.toast.success('Demande enregistrée avec succès.');
            this.isSaving.set(false);
            this.router.navigate(['/app/credit/list']);
          } else {
            this.toast.error(res.message ?? "Erreur lors de l'enregistrement.");
            this.isSaving.set(false);
          }
        },
        error: (error) => {
          this.toast.error(error.message ?? "Erreur lors de l'enregistrement.");
          this.isSaving.set(false);
        },
      });
  }

  goBack() {
    this.router.navigate(['/app/credit/dashboard']);
  }

  private resetForm() {
    this.submitted.set(false);
    this.creditForm.reset();
    this.fcTypeCredit.set(null);
    this.fcObjetCredit.set(null);
    this.fcTypeActivite.set(null);
  }
}
