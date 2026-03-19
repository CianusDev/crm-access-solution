import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass, UpperCasePipe } from '@angular/common';
import {
  LucideAngularModule,
  ArrowLeft, User, Shield, CreditCard, MapPin,
  Save, KeyRound, ToggleLeft, ToggleRight, ChevronDown,
} from 'lucide-angular';
import {
  CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent,
} from '@/shared/components/card/card.component';
import { TabsComponent } from '@/shared/components/tabs/tabs.component';
import { TabComponent } from '@/shared/components/tabs/tab.component';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { getInitiales } from '@/shared/pipes/initiales.pipe';
import { ParametresService } from '../../services/parametres.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { AuthService } from '@/core/services/auth/auth.service';
import { UtilisateurDetailResolvedData } from './utilisateur-detail.resolver';
import {
  Utilisateur, ParametresProfil, ParametresAgence, ParametresCommune,
  ServiceItem, PermissionTypeCredit, ZoneItem,
} from '../../interfaces/parametres.interface';

// Profils qui ont accès aux permissions type crédit
const PROFILS_PERMISSION = ['AR', 'GP', 'CHARGE_COMIT'];
// Profils qui ont un code utilisateur
const PROFILS_CODE = ['AR', 'GP'];

@Component({
  selector: 'app-utilisateur-detail',
  templateUrl: './utilisateur-detail.component.html',
  imports: [
    FormsModule, NgClass, UpperCasePipe,
    LucideAngularModule,
    CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent,
    TabsComponent, TabComponent,
    Avatar,
  ],
})
export class UtilisateurDetailComponent {
  readonly ArrowLeftIcon   = ArrowLeft;
  readonly UserIcon        = User;
  readonly ShieldIcon      = Shield;
  readonly CreditCardIcon  = CreditCard;
  readonly MapPinIcon      = MapPin;
  readonly SaveIcon        = Save;
  readonly KeyRoundIcon    = KeyRound;
  readonly ToggleLeftIcon  = ToggleLeft;
  readonly ToggleRightIcon = ToggleRight;
  readonly ChevronDownIcon = ChevronDown;

  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly service = inject(ParametresService);
  private readonly toast   = inject(ToastService);
  private readonly auth    = inject(AuthService);

  readonly data = input<UtilisateurDetailResolvedData>();

  // ── State ─────────────────────────────────────────────────────────────────
  readonly isLoading  = signal(true);
  readonly isSaving   = signal(false);
  readonly user       = signal<Utilisateur | null>(null);

  // Référentiels
  readonly profils  = signal<ParametresProfil[]>([]);
  readonly services = signal<ServiceItem[]>([]);
  readonly agences  = signal<ParametresAgence[]>([]);
  readonly communes = signal<ParametresCommune[]>([]);

  // Permissions type crédit
  readonly permissions = signal<PermissionTypeCredit[]>([]);

  // Zonification
  readonly zones     = signal<ZoneItem[]>([]);
  readonly sousZones = signal<ZoneItem[]>([]);
  readonly zoneId    = signal<number | null>(null);

  // ── Forms ─────────────────────────────────────────────────────────────────
  infoForm = {
    nom: '', prenom: '', email: '', phone: '', flotte: '',
    profil: 0, service: 0, agence: 0, commune: 0,
    sexe: '', dateNaissance: '', fonction: '',
    numPiece: '', typPiece: '', situationMatri: '',
    nationalite: '', matricule: '', adresse: '',
  };

  pwdForm = { old_password: '', password: '', password_confirmation: '' };
  pwdAdminForm = { password: '', passwordConfirm: '' };
  codeForm = { code: '' };

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly isAdmin = computed(() => this.auth.currentUser()?.profil?.name === 'Admin');
  readonly profilName = computed(() => this.user()?.profil?.name ?? '');
  readonly connectedRole   = computed(() => this.auth.currentUser()?.profil?.name ?? '');
  readonly showPermissions = computed(() => this.connectedRole() === 'Admin' || this.connectedRole() === 'CHARGE_COMIT');
  readonly canEditPermissions = computed(() => this.connectedRole() === 'Admin');
  readonly showCode        = computed(() => PROFILS_CODE.includes(this.profilName()));
  readonly showSousZone    = computed(() => this.profilName() === 'AR');
  readonly showZone        = computed(() => this.profilName() === 'SUP_RISQ_ZONE');
  readonly showZonification = computed(() => this.showSousZone() || this.showZone());

  readonly initiales = computed(() => getInitiales(this.user()?.nom, this.user()?.prenom ?? ''));

  constructor() {
    effect(() => {
      const d = this.data();
      if (!d) return;
      const { user, formData } = d;
      this.user.set(user);
      this.patchInfoForm(user);
      this.profils.set(formData.profils);
      this.services.set(formData.services);
      this.agences.set(formData.agences);
      this.communes.set(formData.communes);
      if (this.showPermissions()) this.loadPermissions(user.id);
      if (user.profil?.name === 'AR') this.loadSousZones();
      if (user.profil?.name === 'SUP_RISQ_ZONE') this.loadZones();
      this.isLoading.set(false);
    }, { allowSignalWrites: true });
  }

  loadUser(id: number) {
    this.isLoading.set(true);
    this.service.getUtilisateurById(id).subscribe({
      next: (u) => {
        this.user.set(u);
        this.patchInfoForm(u);
        this.loadReferentiels(u);
      },
      error: () => { this.toast.error('Erreur lors du chargement.'); this.isLoading.set(false); },
    });
  }

  private patchInfoForm(u: Utilisateur) {
    this.infoForm = {
      nom: u.nom, prenom: u.prenom, email: u.email, phone: u.phone ?? '',
      flotte: u.flotte ?? '', profil: u.profil?.id ?? 0, service: u.service?.id ?? 0,
      agence: u.agence?.id ?? 0, commune: u.commune?.id ?? 0, sexe: u.sexe ?? '',
      dateNaissance: u.dateNaiss ? u.dateNaiss.slice(0, 10) : '',
      fonction: u.fonction ?? '', numPiece: u.cni ?? '', typPiece: u.typPiece ?? '',
      situationMatri: u.situation ?? '', nationalite: u.nationalite ?? '',
      matricule: u.matricule ?? '', adresse: u.adresse ?? '',
    };
    this.codeForm.code = u.code ?? '';
  }

  private loadReferentiels(u: Utilisateur) {
    this.service.getFormData().subscribe({
      next: ({ profils, services, agences, communes }) => {
        this.profils.set(profils);
        this.services.set(services);
        this.agences.set(agences);
        this.communes.set(communes);

        if (this.showPermissions()) this.loadPermissions(u.id);
        if (u.profil?.name === 'AR')             this.loadSousZones();
        if (u.profil?.name === 'SUP_RISQ_ZONE')  this.loadZones();

        this.isLoading.set(false);
      },
      error: (err) => { console.error('[UtilisateurDetail] formData error=', err); this.toast.error('Erreur référentiels.'); this.isLoading.set(false); },
    });
  }

  private loadPermissions(userId: number) {
    this.service.getTypesCredit().subscribe({
      next: (types) => {
        this.service.getPermissionsTypeCredit(userId).subscribe({
          next: (perms) => {
            this.permissions.set(
              types.map((t) => ({
                typeCredit: t.id,
                libelle: t.libelle,
                type: perms.find((p) => p.typeCredit === t.id)?.type ?? '0',
              })),
            );
          },
          error: () => {
            this.permissions.set(types.map((t) => ({ typeCredit: t.id, libelle: t.libelle, type: '0' })));
          },
        });
      },
    });
  }

  private loadSousZones() {
    this.service.getSousZones().subscribe({
      next: (z) => {
        this.sousZones.set(z);
        this.zoneId.set(this.user()?.sousZone?.id ?? null);
      },
    });
  }

  private loadZones() {
    this.service.getZones().subscribe({
      next: (z) => {
        this.zones.set(z);
        this.zoneId.set(this.user()?.zone?.id ?? null);
      },
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  saveInfo() {
    const u = this.user();
    if (!u) return;
    this.isSaving.set(true);
    this.service.updateUtilisateur({ utilisateur: u.id, ...this.infoForm }).subscribe({
      next: () => { this.toast.success('Informations mises à jour.'); this.isSaving.set(false); this.loadUser(u.id); },
      error: () => { this.toast.error('Erreur lors de la sauvegarde.'); this.isSaving.set(false); },
    });
  }

  changerStatut() {
    const u = this.user();
    if (!u) return;
    this.isSaving.set(true);
    this.service.changerStatut({ user: u.id }).subscribe({
      next: () => { this.toast.success('Statut modifié.'); this.isSaving.set(false); this.loadUser(u.id); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  changerMotPasse() {
    const u = this.user();
    if (!u) return;
    this.isSaving.set(true);
    if (this.isAdmin()) {
      const pwd = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
      this.service.changerMotPasseAdmin({ utilisateur: u.id, password: pwd, passwordConfirm: pwd }).subscribe({
        next: () => { this.toast.success(`Nouveau mot de passe : ${pwd}`); this.isSaving.set(false); },
        error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
      });
    } else {
      this.service.changerMotPasseUser(this.pwdForm).subscribe({
        next: () => { this.toast.success('Mot de passe modifié.'); this.isSaving.set(false); this.pwdForm = { old_password: '', password: '', password_confirmation: '' }; },
        error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
      });
    }
  }

  updateCode() {
    const u = this.user();
    if (!u) return;
    this.isSaving.set(true);
    this.service.updateCode({ user: u.id, code: this.codeForm.code }).subscribe({
      next: () => { this.toast.success('Code mis à jour.'); this.isSaving.set(false); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  savePermissions() {
    const u = this.user();
    if (!u) return;
    this.isSaving.set(true);
    this.service.savePermissionsTypeCredit({ user: u.id, data: this.permissions() }).subscribe({
      next: () => { this.toast.success('Permissions mises à jour.'); this.isSaving.set(false); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  saveZone() {
    const u = this.user();
    const z = this.zoneId();
    if (!u || !z) return;
    this.isSaving.set(true);
    this.service.affecterZone({ user: u.id, zone: z }).subscribe({
      next: () => { this.toast.success('Zone affectée.'); this.isSaving.set(false); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  updatePermType(i: number, val: string) {
    const perms = [...this.permissions()];
    perms[i] = { ...perms[i], type: val };
    this.permissions.set(perms);
  }

  goBack() { this.router.navigate(['/app/parametres/utilisateurs']); }

  statutInfo(statut?: number) {
    return statut === 1
      ? { label: 'Actif',   class: 'bg-green-100 text-green-700' }
      : { label: 'Inactif', class: 'bg-red-100 text-red-700' };
  }
}
