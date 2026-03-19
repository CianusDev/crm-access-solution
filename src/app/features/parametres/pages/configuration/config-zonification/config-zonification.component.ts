import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save, Plus, Pencil, Search } from 'lucide-angular';
import {
  CardComponent, CardContentComponent,
} from '@/shared/components/card/card.component';
import { TabsComponent } from '@/shared/components/tabs/tabs.component';
import { TabComponent } from '@/shared/components/tabs/tab.component';
import {
  DrawerComponent, DrawerHeaderComponent, DrawerTitleComponent,
  DrawerContentComponent, DrawerFooterComponent,
} from '@/shared/components/drawer/drawer.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { ParametresService } from '../../../services/parametres.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { SousZone, Zone, Region, ZoneItem, Team, ZoneAcj, UtilisateurMin } from '../../../interfaces/parametres.interface';

@Component({
  selector: 'app-config-zonification',
  templateUrl: './config-zonification.component.html',
  imports: [
    FormsModule,
    LucideAngularModule,
    CardComponent, CardContentComponent,
    TabsComponent, TabComponent,
    DrawerComponent, DrawerHeaderComponent, DrawerTitleComponent,
    DrawerContentComponent, DrawerFooterComponent,
    PaginationComponent,
  ],
})
export class ConfigZonificationComponent implements OnInit {
  readonly SaveIcon   = Save;
  readonly PlusIcon   = Plus;
  readonly EditIcon   = Pencil;
  readonly SearchIcon = Search;

  private readonly service = inject(ParametresService);
  private readonly toast   = inject(ToastService);

  readonly PAGE_SIZE = 9;

  readonly isLoading = signal(true);
  readonly isSaving  = signal(false);

  // Data
  readonly sousZones = signal<SousZone[]>([]);
  readonly zones     = signal<Zone[]>([]);
  readonly regions   = signal<Region[]>([]);
  readonly teams     = signal<Team[]>([]);
  readonly zonesAcj  = signal<ZoneAcj[]>([]);

  // Ref lists for selects
  readonly zonesRef              = signal<ZoneItem[]>([]);
  readonly regionsRef            = signal<{ id: number; libelle: string }[]>([]);
  readonly teamsRef              = signal<{ id: number; libelle: string }[]>([]);
  readonly responsablesRegionaux = signal<UtilisateurMin[]>([]);
  readonly superviseurs          = signal<UtilisateurMin[]>([]);
  readonly chefEquipes           = signal<UtilisateurMin[]>([]);
  readonly cdcUsers              = signal<UtilisateurMin[]>([]);
  readonly acjUsers              = signal<UtilisateurMin[]>([]);

  // Search + page per tab
  readonly searchSz     = signal('');
  readonly pageSz       = signal(1);
  readonly searchZone   = signal('');
  readonly pageZone     = signal(1);
  readonly searchRegion = signal('');
  readonly pageRegion   = signal(1);
  readonly searchTeam   = signal('');
  readonly pageTeam     = signal(1);
  readonly searchAcj    = signal('');
  readonly pageAcj      = signal(1);

  readonly filteredSz = computed(() => {
    const q = this.searchSz().toLowerCase().trim();
    if (!q) return this.sousZones();
    return this.sousZones().filter((s) =>
      s.libelle.toLowerCase().includes(q) || (s.zone?.libelle ?? '').toLowerCase().includes(q)
    );
  });
  readonly pagedSz = computed(() => {
    const start = (this.pageSz() - 1) * this.PAGE_SIZE;
    return this.filteredSz().slice(start, start + this.PAGE_SIZE);
  });

  readonly filteredZone = computed(() => {
    const q = this.searchZone().toLowerCase().trim();
    if (!q) return this.zones();
    return this.zones().filter((z) =>
      z.libelle.toLowerCase().includes(q) || (z.description ?? '').toLowerCase().includes(q)
    );
  });
  readonly pagedZone = computed(() => {
    const start = (this.pageZone() - 1) * this.PAGE_SIZE;
    return this.filteredZone().slice(start, start + this.PAGE_SIZE);
  });

  readonly filteredRegion = computed(() => {
    const q = this.searchRegion().toLowerCase().trim();
    if (!q) return this.regions();
    return this.regions().filter((r) =>
      r.libelle.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q)
    );
  });
  readonly pagedRegion = computed(() => {
    const start = (this.pageRegion() - 1) * this.PAGE_SIZE;
    return this.filteredRegion().slice(start, start + this.PAGE_SIZE);
  });

  readonly filteredTeam = computed(() => {
    const q = this.searchTeam().toLowerCase().trim();
    if (!q) return this.teams();
    return this.teams().filter((t) =>
      t.libelle.toLowerCase().includes(q)
    );
  });
  readonly pagedTeam = computed(() => {
    const start = (this.pageTeam() - 1) * this.PAGE_SIZE;
    return this.filteredTeam().slice(start, start + this.PAGE_SIZE);
  });

  readonly filteredAcj = computed(() => {
    const q = this.searchAcj().toLowerCase().trim();
    if (!q) return this.zonesAcj();
    return this.zonesAcj().filter((z) =>
      z.libelle.toLowerCase().includes(q) || (z.team?.libelle ?? '').toLowerCase().includes(q)
    );
  });
  readonly pagedAcj = computed(() => {
    const start = (this.pageAcj() - 1) * this.PAGE_SIZE;
    return this.filteredAcj().slice(start, start + this.PAGE_SIZE);
  });

  // Drawer unique
  drawerOpen  = false;
  drawerType: 'souszone' | 'zone' | 'region' | 'team' | 'acj' | null = null;
  drawerTitle = '';
  isEditing   = false;

  editingSzId:     number | undefined;
  editingZoneId:   number | undefined;
  editingRegionId: number | undefined;
  editingTeamId:   number | undefined;
  editingAcjId:    number | undefined;

  szForm:     Partial<SousZone> = { libelle: '' };
  zoneForm:   Partial<Zone>     = { libelle: '' };
  regionForm: Partial<Region>   = { libelle: '' };
  teamForm:   Partial<Team>     = { libelle: '' };
  acjForm:    Partial<ZoneAcj>  = { libelle: '' };

  ngOnInit() { this.load(); }

  load() {
    this.isLoading.set(true);
    let done = 0;
    const check = () => { if (++done === 10) this.isLoading.set(false); };

    this.service.getSousZones2().subscribe({ next: (d) => { this.sousZones.set(d); check(); }, error: () => check() });
    this.service.getZones2().subscribe({
      next: (d) => {
        this.zones.set(d);
        this.zonesRef.set(d.map((z) => ({ id: z.id!, libelle: z.libelle })));
        check();
      },
      error: () => check(),
    });
    this.service.getRegions().subscribe({
      next: (d) => {
        this.regions.set(d);
        this.regionsRef.set(d.map((r) => ({ id: r.id!, libelle: r.libelle })));
        check();
      },
      error: () => check(),
    });
    this.service.getTeams().subscribe({
      next: (d) => {
        this.teams.set(d);
        this.teamsRef.set(d.map((t) => ({ id: t.id!, libelle: t.libelle })));
        check();
      },
      error: () => check(),
    });
    this.service.getZonesAcj().subscribe({ next: (d) => { this.zonesAcj.set(d); check(); }, error: () => check() });
    this.service.getResponsablesRegionaux().subscribe({ next: (d) => { this.responsablesRegionaux.set(d); check(); }, error: () => check() });
    this.service.getSuperviseurs().subscribe({ next: (d) => { this.superviseurs.set(d); check(); }, error: () => check() });
    this.service.getChefEquipes().subscribe({ next: (d) => { this.chefEquipes.set(d); check(); }, error: () => check() });
    this.service.getCDC().subscribe({ next: (d) => { this.cdcUsers.set(d); check(); }, error: () => check() });
    this.service.getACJ().subscribe({ next: (d) => { this.acjUsers.set(d); check(); }, error: () => check() });
  }

  private openDrawer(type: typeof this.drawerType, title: string, editing: boolean) {
    this.drawerType  = type;
    this.drawerTitle = title;
    this.isEditing   = editing;
    this.drawerOpen  = true;
  }

  setSearch(tab: 'souszone' | 'zone' | 'region' | 'team' | 'acj', value: string) {
    if (tab === 'souszone') { this.searchSz.set(value); this.pageSz.set(1); }
    else if (tab === 'zone') { this.searchZone.set(value); this.pageZone.set(1); }
    else if (tab === 'region') { this.searchRegion.set(value); this.pageRegion.set(1); }
    else if (tab === 'team') { this.searchTeam.set(value); this.pageTeam.set(1); }
    else { this.searchAcj.set(value); this.pageAcj.set(1); }
  }

  // ── Sous-zones ────────────────────────────────────────────────────────────
  openSzCreate() { this.editingSzId = undefined; this.szForm = { libelle: '' }; this.openDrawer('souszone', 'Nouvelle sous-zone', false); }
  openSzEdit(s: SousZone) { this.editingSzId = s.id; this.szForm = { ...s }; this.openDrawer('souszone', 'Modifier la sous-zone', true); }

  saveSz() {
    if (!this.szForm.libelle?.trim()) return;
    this.isSaving.set(true);
    const obs = this.editingSzId
      ? this.service.updateSousZone(this.editingSzId, this.szForm)
      : this.service.saveSousZone(this.szForm);
    obs.subscribe({
      next: () => { this.toast.success('Sous-zone enregistrée.'); this.drawerOpen = false; this.isSaving.set(false); this.load(); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  // ── Zones ─────────────────────────────────────────────────────────────────
  openZoneCreate() { this.editingZoneId = undefined; this.zoneForm = { libelle: '' }; this.openDrawer('zone', 'Nouvelle zone', false); }
  openZoneEdit(z: Zone) { this.editingZoneId = z.id; this.zoneForm = { ...z }; this.openDrawer('zone', 'Modifier la zone', true); }

  saveZone() {
    if (!this.zoneForm.libelle?.trim()) return;
    this.isSaving.set(true);
    const payload: Record<string, unknown> = {
      libelle: this.zoneForm.libelle,
      description: this.zoneForm.description,
      user: (this.zoneForm.sup as UtilisateurMin | null)?.id ?? null,
      region: (this.zoneForm.region as { id: number } | null)?.id ?? null,
    };
    const obs = this.editingZoneId
      ? this.service.updateZone(this.editingZoneId, payload)
      : this.service.saveZone(payload);
    obs.subscribe({
      next: () => { this.toast.success('Zone enregistrée.'); this.drawerOpen = false; this.isSaving.set(false); this.load(); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  // ── Régions ───────────────────────────────────────────────────────────────
  openRegionCreate() { this.editingRegionId = undefined; this.regionForm = { libelle: '' }; this.openDrawer('region', 'Nouvelle région', false); }
  openRegionEdit(r: Region) { this.editingRegionId = r.id; this.regionForm = { ...r }; this.openDrawer('region', 'Modifier la région', true); }

  saveRegion() {
    if (!this.regionForm.libelle?.trim()) return;
    this.isSaving.set(true);
    const payload: Record<string, unknown> = {
      libelle: this.regionForm.libelle,
      description: this.regionForm.description,
      user: (this.regionForm.user as UtilisateurMin | null)?.id ?? null,
    };
    if (this.editingRegionId) payload['id'] = this.editingRegionId;
    this.service.saveRegion(payload).subscribe({
      next: () => { this.toast.success('Région enregistrée.'); this.drawerOpen = false; this.isSaving.set(false); this.load(); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  // ── Teams ─────────────────────────────────────────────────────────────────
  openTeamCreate() { this.editingTeamId = undefined; this.teamForm = { libelle: '' }; this.openDrawer('team', 'Nouvelle équipe', false); }
  openTeamEdit(t: Team) { this.editingTeamId = t.id; this.teamForm = { ...t }; this.openDrawer('team', 'Modifier l\'équipe', true); }

  saveTeam() {
    if (!this.teamForm.libelle?.trim()) return;
    this.isSaving.set(true);
    this.service.saveTeam(this.teamForm).subscribe({
      next: () => { this.toast.success('Équipe enregistrée.'); this.drawerOpen = false; this.isSaving.set(false); this.load(); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  // ── Zone ACJ ──────────────────────────────────────────────────────────────
  openAcjCreate() { this.editingAcjId = undefined; this.acjForm = { libelle: '' }; this.openDrawer('acj', 'Nouvelle zone ACJ', false); }
  openAcjEdit(z: ZoneAcj) { this.editingAcjId = z.id; this.acjForm = { ...z }; this.openDrawer('acj', 'Modifier la zone ACJ', true); }

  saveAcj() {
    if (!this.acjForm.libelle?.trim()) return;
    this.isSaving.set(true);
    this.service.saveZoneAcj(this.acjForm).subscribe({
      next: () => { this.toast.success('Zone ACJ enregistrée.'); this.drawerOpen = false; this.isSaving.set(false); this.load(); },
      error: () => { this.toast.error('Erreur.'); this.isSaving.set(false); },
    });
  }

  save() {
    if (this.drawerType === 'souszone') this.saveSz();
    else if (this.drawerType === 'zone') this.saveZone();
    else if (this.drawerType === 'region') this.saveRegion();
    else if (this.drawerType === 'team') this.saveTeam();
    else if (this.drawerType === 'acj') this.saveAcj();
  }
}
