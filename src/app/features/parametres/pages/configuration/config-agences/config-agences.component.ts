import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save, RefreshCw, Pencil, Phone, Mail, Search } from 'lucide-angular';
import {
  CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent,
} from '@/shared/components/card/card.component';
import {
  DrawerComponent, DrawerHeaderComponent, DrawerTitleComponent,
  DrawerContentComponent, DrawerFooterComponent,
} from '@/shared/components/drawer/drawer.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { ParametresService } from '../../../services/parametres.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { AgenceInfo, UtilisateurMin } from '../../../interfaces/parametres.interface';

interface AgenceForm {
  ca: number | null;
  caa: number | null;
  suPme: number | null;
  respoReseau: number | null;
}

@Component({
  selector: 'app-config-agences',
  templateUrl: './config-agences.component.html',
  imports: [
    FormsModule,
    LucideAngularModule,
    CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent,
    DrawerComponent, DrawerHeaderComponent, DrawerTitleComponent,
    DrawerContentComponent, DrawerFooterComponent,
    PaginationComponent,
  ],
})
export class ConfigAgencesComponent implements OnInit {
  readonly SaveIcon    = Save;
  readonly RefreshIcon = RefreshCw;
  readonly EditIcon    = Pencil;
  readonly PhoneIcon   = Phone;
  readonly MailIcon    = Mail;
  readonly SearchIcon  = Search;

  private readonly service = inject(ParametresService);
  private readonly toast   = inject(ToastService);

  readonly isLoading        = signal(true);
  readonly isSaving         = signal(false);
  readonly agences          = signal<AgenceInfo[]>([]);
  readonly usersCA          = signal<UtilisateurMin[]>([]);
  readonly usersCAA         = signal<UtilisateurMin[]>([]);
  readonly usersSuPme       = signal<UtilisateurMin[]>([]);
  readonly usersRespoReseau = signal<UtilisateurMin[]>([]);

  readonly searchQuery  = signal('');
  readonly currentPage  = signal(1);
  readonly PAGE_SIZE    = 9;

  readonly filteredAgences = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.agences();
    return this.agences().filter((a) =>
      a.libelle.toLowerCase().includes(q) || (a.code ?? '').toLowerCase().includes(q)
    );
  });

  readonly pagedAgences = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredAgences().slice(start, start + this.PAGE_SIZE);
  });

  drawerOpen    = false;
  selectedAgence: AgenceInfo | null = null;
  form: AgenceForm = { ca: null, caa: null, suPme: null, respoReseau: null };

  ngOnInit() { this.load(); }

  load() {
    this.isLoading.set(true);
    let done = 0;
    const check = () => { if (++done === 3) this.isLoading.set(false); };

    this.service.getAgencesInfos().subscribe({
      next: (agences) => { this.agences.set(agences); check(); },
      error: () => { this.toast.error('Erreur chargement agences.'); check(); },
    });

    this.service.getCAetCAA().subscribe({
      next: ({ ca, caa }) => { this.usersCA.set(ca); this.usersCAA.set(caa); check(); },
      error: () => check(),
    });

    this.service.getUsersSuperviseurPME().subscribe({ next: (u) => { this.usersSuPme.set(u); check(); }, error: () => check() });
    this.service.getUsersResponsableReseau().subscribe({ next: (u) => { this.usersRespoReseau.set(u); check(); }, error: () => check() });
  }

  setSearch(value: string) { this.searchQuery.set(value); this.currentPage.set(1); }

  openDrawer(agence: AgenceInfo) {
    this.selectedAgence = agence;
    this.form = {
      ca: agence.ca?.id ?? null,
      caa: agence.caa?.id ?? null,
      suPme: agence.suPme?.id ?? null,
      respoReseau: agence.respoReseau?.id ?? null,
    };
    this.drawerOpen = true;
  }

  closeDrawer() { this.drawerOpen = false; }

  saveRole(userId: number | null) {
    if (!this.selectedAgence || !userId) return;
    this.isSaving.set(true);
    this.service.affecterUtilisateurAgence({ user: userId, agence: this.selectedAgence.id }).subscribe({
      next: () => { this.toast.success('Affectation enregistrée.'); this.isSaving.set(false); this.load(); },
      error: () => { this.toast.error('Erreur lors de l\'affectation.'); this.isSaving.set(false); },
    });
  }
}
