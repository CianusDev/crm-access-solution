import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
    DatePipe,
    DecimalPipe,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    ButtonDirective,
    SearchableSelectComponent,
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

  // ── Form fields ────────────────────────────────────────────────────────
  readonly fcTypeCredit = signal<number | null>(null);
  readonly fcObjetCredit = signal<string | null>(null);
  readonly fcTypeActivite = signal<number | null>(null);
  readonly fcMontant = signal('');
  readonly fcDuree = signal('');
  readonly fcMontantEche = signal('');
  readonly fcDiffere = signal('');
  readonly fcDescription = signal('');

  readonly isSaving = signal(false);
  readonly submitted = signal(false);

  // ── Permissions ────────────────────────────────────────────────────────
  /** Le profil connecté peut créer un tirage découvert */
  readonly canCreateTirage = computed(() =>
    this.permissions.hasRole(...PROFILS_TIRAGE),
  );

  /** Codes de types de crédit autorisés selon le profil */
  private readonly allowedCodes = computed<string[]>(() => {
    const role = this.permissions.userRole();
    if (role === UserRole.GestionnairePortefeuilles || role === UserRole.Admin) return CODES_GP;
    if (role === UserRole.AgentCommercialJunior || role === UserRole.ChefEquipe) return CODES_ACJ_CE;
    if (role === UserRole.responsableClient || role === UserRole.conseilClientele) return CODES_RC_CC;
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

  // ── Validation par champ ───────────────────────────────────────────────
  readonly errors = computed(() => {
    const montant = Number(this.fcMontant());
    const duree = Number(this.fcDuree());
    const montantEche = Number(this.fcMontantEche());
    const differe = String(this.fcDiffere()).trim();
    const isTirage = this.choix() === '2';
    const max = this.montantMax();

    return {
      typeCredit: !isTirage && this.fcTypeCredit() === null
        ? 'Veuillez sélectionner un type de crédit'
        : null,

      objetCredit: !this.fcObjetCredit() ? "Veuillez sélectionner l'objet du crédit" : null,

      typeActivite:
        this.fcTypeActivite() === null ? "Veuillez sélectionner un secteur d'activité" : null,

      montant: !String(this.fcMontant()).trim()
        ? 'Le montant est obligatoire'
        : isNaN(montant) || montant <= 0
          ? 'Le montant doit être un nombre positif'
          : isTirage && max > 0 && montant > max
            ? `Le montant ne peut pas excéder ${new Intl.NumberFormat('fr-FR').format(max)} FCFA`
            : null,

      duree: !String(this.fcDuree()).trim()
        ? 'La durée est obligatoire'
        : !Number.isInteger(duree) || duree < 1
          ? 'La durée doit être un entier ≥ 1'
          : null,

      montantEche: !String(this.fcMontantEche()).trim()
        ? "Le montant d'échéance est obligatoire"
        : isNaN(montantEche) || montantEche <= 0
          ? 'Le montant doit être un nombre positif'
          : null,

      differe:
        differe && (!Number.isInteger(Number(differe)) || Number(differe) < 0)
          ? 'La valeur doit être un entier ≥ 0'
          : null,

      description: !String(this.fcDescription()).trim()
        ? 'La description est obligatoire'
        : String(this.fcDescription()).trim().length < 10
          ? 'La description doit contenir au moins 10 caractères'
          : null,
    };
  });

  readonly formValid = computed(() => Object.values(this.errors()).every((e) => e === null));

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

    this.creditService.getTypesActivite().subscribe({
      next: (list) => {
        this.typesActivite.set(list);
        this.creditService.getTypesCredit().subscribe({
          next: (credits) => {
            this.typesCredit.set(credits);
            this.isLoadingRefs.set(false);
          },
          error: () => {
            this.toast.error('Erreur lors du chargement des types de crédit.');
            this.isLoadingRefs.set(false);
          },
        });
      },
      error: () => {
        this.toast.error("Erreur lors du chargement des secteurs d'activité.");
        this.isLoadingRefs.set(false);
      },
    });
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

    this.isSaving.set(true);
    this.creditService
      .saveTirage({
        codeClient: d.demande.client.codeClient,
        typeCredit,
        objetCredit,
        typeActivite,
        montantSollicite: Number(this.fcMontant()),
        nbreEcheanceSollicite: Number(this.fcDuree()),
        montantEcheSouhaite: Number(this.fcMontantEche()),
        nbreEcheDiffere: String(this.fcDiffere()).trim() ? Number(this.fcDiffere()) : null,
        description: String(this.fcDescription()).trim(),
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

    this.isSaving.set(true);
    this.creditService
      .saveDemandeCredit({
        codeClient: c.codeClient,
        typeCredit,
        objetCredit,
        typeActivite,
        montantSollicite: Number(this.fcMontant()),
        nbreEcheanceSollicite: Number(this.fcDuree()),
        montantEcheSouhaite: Number(this.fcMontantEche()),
        nbreEcheDiffere: String(this.fcDiffere()).trim() ? Number(this.fcDiffere()) : null,
        description: String(this.fcDescription()).trim(),
      })
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.toast.success('Demande enregistrée avec succès.');
            this.isSaving.set(false);
            this.router.navigate(['/app/credit/list']);
          } else {
            console.error('Erreur API:', res);
            this.toast.error(res.message ?? "Erreur lors de l'enregistrement.");
            this.isSaving.set(false);
          }
        },
        error: (error) => {
          console.error('Erreur API:', error);
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
    this.fcTypeCredit.set(null);
    this.fcObjetCredit.set(null);
    this.fcTypeActivite.set(null);
    this.fcMontant.set('');
    this.fcDuree.set('');
    this.fcMontantEche.set('');
    this.fcDiffere.set('');
    this.fcDescription.set('');
  }
}
