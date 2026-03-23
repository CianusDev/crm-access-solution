import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { LucideAngularModule, Save, Plus, Pencil, Search } from 'lucide-angular';
import {
  CardComponent, CardContentComponent,
} from '@/shared/components/card/card.component';
import { BadgeComponent } from '@/shared/components/badge/badge.component';
import { TabsComponent } from '@/shared/components/tabs/tabs.component';
import { TabComponent } from '@/shared/components/tabs/tab.component';
import {
  DrawerComponent, DrawerHeaderComponent, DrawerTitleComponent,
  DrawerContentComponent, DrawerFooterComponent,
} from '@/shared/components/drawer/drawer.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { ParametresService } from '../../../services/parametres.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { TypeActivite, TypeCredit, TypeCharge, FraisDossier } from '../../../interfaces/parametres.interface';

@Component({
  selector: 'app-config-credit',
  templateUrl: './config-credit.component.html',
  imports: [
    FormsModule, DecimalPipe,
    LucideAngularModule,
    CardComponent, CardContentComponent,
    BadgeComponent,
    TabsComponent, TabComponent,
    DrawerComponent, DrawerHeaderComponent, DrawerTitleComponent,
    DrawerContentComponent, DrawerFooterComponent,
    PaginationComponent,
  ],
})
export class ConfigCreditComponent implements OnInit {
  readonly SaveIcon   = Save;
  readonly PlusIcon   = Plus;
  readonly EditIcon   = Pencil;
  readonly SearchIcon = Search;

  private readonly service = inject(ParametresService);
  private readonly toast   = inject(ToastService);

  readonly PAGE_SIZE = 9;

  readonly isLoading     = signal(true);
  readonly isSaving      = signal(false);
  readonly typesActivite = signal<TypeActivite[]>([]);
  readonly typesCredit   = signal<TypeCredit[]>([]);
  readonly typesCharge   = signal<TypeCharge[]>([]);
  readonly fraisDossier  = signal<FraisDossier[]>([]);

  // Search + page per tab
  readonly searchActivite = signal('');
  readonly pageActivite   = signal(1);
  readonly searchCredit   = signal('');
  readonly pageCredit     = signal(1);
  readonly searchCharge   = signal('');
  readonly pageCharge     = signal(1);
  readonly searchFrais    = signal('');
  readonly pageFrais      = signal(1);

  readonly filteredActivite = computed(() => {
    const q = this.searchActivite().toLowerCase().trim();
    if (!q) return this.typesActivite();
    return this.typesActivite().filter((a) => a.libelle.toLowerCase().includes(q));
  });
  readonly pagedActivite = computed(() => {
    const s = (this.pageActivite() - 1) * this.PAGE_SIZE;
    return this.filteredActivite().slice(s, s + this.PAGE_SIZE);
  });

  readonly filteredCredit = computed(() => {
    const q = this.searchCredit().toLowerCase().trim();
    if (!q) return this.typesCredit();
    return this.typesCredit().filter((t) =>
      t.libelle.toLowerCase().includes(q) || (t.code ?? '').toLowerCase().includes(q)
    );
  });
  readonly pagedCredit = computed(() => {
    const s = (this.pageCredit() - 1) * this.PAGE_SIZE;
    return this.filteredCredit().slice(s, s + this.PAGE_SIZE);
  });

  /** Plafond maximum parmi tous les types de crédit — sert à calibrer la barre de progression */
  readonly maxPlafondCredit = computed(() =>
    Math.max(...this.typesCredit().map((t) => t.mttPlafondCrd ?? 0), 1),
  );

  readonly filteredCharge = computed(() => {
    const q = this.searchCharge().toLowerCase().trim();
    if (!q) return this.typesCharge();
    return this.typesCharge().filter((c) => c.libelle.toLowerCase().includes(q));
  });
  readonly pagedCharge = computed(() => {
    const s = (this.pageCharge() - 1) * this.PAGE_SIZE;
    return this.filteredCharge().slice(s, s + this.PAGE_SIZE);
  });

  readonly filteredFrais = computed(() => {
    const q = this.searchFrais().toLowerCase().trim();
    if (!q) return this.fraisDossier();
    return this.fraisDossier().filter((f) =>
      String(f.montantMin ?? '').includes(q) || String(f.montantMax ?? '').includes(q)
    );
  });
  readonly pagedFrais = computed(() => {
    const s = (this.pageFrais() - 1) * this.PAGE_SIZE;
    return this.filteredFrais().slice(s, s + this.PAGE_SIZE);
  });

  // Drawer état unique
  drawerOpen    = false;
  drawerType: 'activite' | 'credit' | 'charge' | 'frais' | null = null;
  drawerTitle   = '';
  isEditing     = false;

  activiteForm: TypeActivite  = { libelle: '' };
  creditForm:   TypeCredit    = { libelle: '' };
  chargeForm:   TypeCharge    = { libelle: '' };
  fraisForm:    FraisDossier  = {};

  ngOnInit() { this.load(); }

  load() {
    this.isLoading.set(true);
    let done = 0;
    const check = () => { if (++done === 4) this.isLoading.set(false); };
    this.service.getTypesActivite().subscribe({ next: (d) => { this.typesActivite.set(d); check(); }, error: () => check() });
    this.service.getTypesCredit2().subscribe({ next: (d) => { this.typesCredit.set(d); check(); }, error: () => check() });
    this.service.getTypesCharge().subscribe({ next: (d) => { this.typesCharge.set(d); check(); }, error: () => check() });
    this.service.getFraisDossier().subscribe({ next: (d) => { this.fraisDossier.set(d); check(); }, error: () => check() });
  }

  private openDrawer(type: typeof this.drawerType, title: string, editing: boolean) {
    this.drawerType  = type;
    this.drawerTitle = title;
    this.isEditing   = editing;
    this.drawerOpen  = true;
  }

  setSearch(tab: 'activite' | 'credit' | 'charge' | 'frais', value: string) {
    if (tab === 'activite') { this.searchActivite.set(value); this.pageActivite.set(1); }
    else if (tab === 'credit') { this.searchCredit.set(value); this.pageCredit.set(1); }
    else if (tab === 'charge') { this.searchCharge.set(value); this.pageCharge.set(1); }
    else { this.searchFrais.set(value); this.pageFrais.set(1); }
  }

  // ── Secteur Activité ──────────────────────────────────────────────────────
  openActiviteCreate() { this.activiteForm = { libelle: '' }; this.openDrawer('activite', 'Nouveau secteur d\'activité', false); }
  openActiviteEdit(a: TypeActivite) { this.activiteForm = { ...a }; this.openDrawer('activite', 'Modifier le secteur', true); }

  saveActivite() {
    if (!this.activiteForm.libelle.trim()) return;
    this.isSaving.set(true);
    this.service.saveTypeActivite(this.activiteForm).subscribe({
      next: () => { this.toast.success('Secteur enregistré.'); this.drawerOpen = false; this.isSaving.set(false); this.load(); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  // ── Type Crédit ───────────────────────────────────────────────────────────
  openCreditCreate() { this.creditForm = { libelle: '' }; this.openDrawer('credit', 'Nouveau type de crédit', false); }
  openCreditEdit(t: TypeCredit) { this.creditForm = { ...t }; this.openDrawer('credit', 'Modifier le type de crédit', true); }

  saveCredit() {
    if (!this.creditForm.libelle.trim()) return;
    this.isSaving.set(true);
    this.service.saveTypeCredit(this.creditForm).subscribe({
      next: () => { this.toast.success('Type de crédit enregistré.'); this.drawerOpen = false; this.isSaving.set(false); this.load(); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  // ── Type Charge ───────────────────────────────────────────────────────────
  openChargeCreate() { this.chargeForm = { libelle: '' }; this.openDrawer('charge', 'Nouveau type de charge', false); }
  openChargeEdit(t: TypeCharge) { this.chargeForm = { ...t }; this.openDrawer('charge', 'Modifier le type de charge', true); }

  saveCharge() {
    if (!this.chargeForm.libelle.trim()) return;
    this.isSaving.set(true);
    this.service.saveTypeCharge(this.chargeForm).subscribe({
      next: () => { this.toast.success('Type de charge enregistré.'); this.drawerOpen = false; this.isSaving.set(false); this.load(); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  // ── Frais Dossier ─────────────────────────────────────────────────────────
  openFraisCreate() { this.fraisForm = {}; this.openDrawer('frais', 'Nouveaux frais de dossier', false); }
  openFraisEdit(f: FraisDossier) { this.fraisForm = { ...f }; this.openDrawer('frais', 'Modifier les frais', true); }

  saveFrais() {
    this.isSaving.set(true);
    this.service.saveFraisDossier(this.fraisForm).subscribe({
      next: () => { this.toast.success('Frais enregistrés.'); this.drawerOpen = false; this.isSaving.set(false); this.load(); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  save() {
    if (this.drawerType === 'activite') this.saveActivite();
    else if (this.drawerType === 'credit') this.saveCredit();
    else if (this.drawerType === 'charge') this.saveCharge();
    else if (this.drawerType === 'frais') this.saveFrais();
  }
}
