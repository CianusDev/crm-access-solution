import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save, Plus, Pencil, Search } from 'lucide-angular';
import {
  CardComponent, CardContentComponent,
} from '@/shared/components/card/card.component';
import {
  DrawerComponent, DrawerHeaderComponent, DrawerTitleComponent,
  DrawerContentComponent, DrawerFooterComponent,
} from '@/shared/components/drawer/drawer.component';
import { PaginationComponent } from '@/shared/components/pagination/pagination.component';
import { ParametresService } from '../../../services/parametres.service';
import { ToastService } from '@/core/services/toast/toast.service';
import { NaturePrestation } from '../../../interfaces/parametres.interface';

@Component({
  selector: 'app-config-asc',
  templateUrl: './config-asc.component.html',
  imports: [
    FormsModule,
    LucideAngularModule,
    CardComponent, CardContentComponent,
    DrawerComponent, DrawerHeaderComponent, DrawerTitleComponent,
    DrawerContentComponent, DrawerFooterComponent,
    PaginationComponent,
  ],
})
export class ConfigAscComponent implements OnInit {
  readonly SaveIcon   = Save;
  readonly PlusIcon   = Plus;
  readonly EditIcon   = Pencil;
  readonly SearchIcon = Search;

  private readonly service = inject(ParametresService);
  private readonly toast   = inject(ToastService);

  readonly isLoading   = signal(true);
  readonly isSaving    = signal(false);
  readonly natures     = signal<NaturePrestation[]>([]);
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly PAGE_SIZE   = 9;

  readonly filteredNatures = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.natures();
    return this.natures().filter((n) => n.libelle.toLowerCase().includes(q));
  });

  readonly pagedNatures = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredNatures().slice(start, start + this.PAGE_SIZE);
  });

  drawerOpen = false;
  editingId: number | null = null;
  form = { libelle: '' };

  ngOnInit() { this.load(); }

  load() {
    this.isLoading.set(true);
    this.service.getNaturesPrestationAsc().subscribe({
      next: (n) => { this.natures.set(n); this.isLoading.set(false); },
      error: () => { this.toast.error('Erreur chargement.'); this.isLoading.set(false); },
    });
  }

  setSearch(value: string) { this.searchQuery.set(value); this.currentPage.set(1); }

  openCreate() {
    this.editingId = null;
    this.form = { libelle: '' };
    this.drawerOpen = true;
  }

  openEdit(n: NaturePrestation) {
    this.editingId = n.id ?? null;
    this.form = { libelle: n.libelle };
    this.drawerOpen = true;
  }

  save() {
    if (!this.form.libelle.trim()) return;
    this.isSaving.set(true);
    const data: NaturePrestation = { id: this.editingId ?? undefined, libelle: this.form.libelle };
    this.service.saveNaturePrestationAsc(data).subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'Nature modifiée.' : 'Nature créée.');
        this.drawerOpen = false;
        this.isSaving.set(false);
        this.load();
      },
      error: () => { this.toast.error('Erreur lors de la sauvegarde.'); this.isSaving.set(false); },
    });
  }
}
