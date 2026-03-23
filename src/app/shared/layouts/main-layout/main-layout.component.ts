import { Avatar } from '@/shared/components/avatar/avatar.component';
import { Dropdown, DropdownItem } from '@/shared/components/dropdown';
import { Sidebar } from '@/shared/components/sidebar/sidebar.component';
import { DEFAULT_MENU } from '@/core/constants/sidebar-menu';
import type { User } from '@/core/models/user.model';
import { Breadcrumb } from '@/shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '@/shared/components/breadcrumb/breadcrumb.interface';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import {
  BellIcon,
  Home,
  LogOut,
  LucideAngularModule,
  SearchIcon,
  User as UserIcon,
} from 'lucide-angular';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '@/core/services/auth/auth.service';
import { RouteLoaderComponent } from '../route-loader/route-loader.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    Sidebar,
    LucideAngularModule,
    Avatar,
    Dropdown,
    RouterLink,
    Breadcrumb,
    RouteLoaderComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout implements OnInit, OnDestroy {
  breadcrumbItems: BreadcrumbItem[] = [];
  // Signaux et entrées
  readonly user = input<User | null>(null, { alias: 'currentUser' });
  readonly searchQuery = signal('');
  readonly searchOpen = signal(false);

  readonly filteredSidebarItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return DEFAULT_MENU;

    return DEFAULT_MENU
      .map((group) => ({
        ...group,
        // Si le nom du groupe matche → garder tous ses items, sinon filtrer item par item
        items: group.label.toLowerCase().includes(q)
          ? group.items
          : group.items.filter((i) => i.label.toLowerCase().includes(q)),
      }))
      .filter((group) => group.items.length > 0);
  });

  // Router & breadcrumb
  private readonly router = inject(Router);
  private routerSub?: Subscription;

  // Icônes et menu
  readonly icons = { search: SearchIcon, bell: BellIcon };
  readonly menuItems: DropdownItem[] = [
    { label: 'Mon profil', icon: UserIcon, action: () => this.goToProfile() },
    { separator: true, label: '' },
    { label: 'Déconnexion', icon: LogOut, action: () => this.logout() },
  ];

  // Injection de l'élément hôte et de la zone Angular
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);
  private readonly authService = inject(AuthService);

  // Gestionnaires d'événements conservés en tant que propriétés pour pouvoir être supprimés de manière fiable
  private readonly _onDocumentClick = (event: MouseEvent) => {
    if (!this.searchOpen()) return;

    const target = event.target as Element | null;
    if (!target) return;

    // Si le clic est sur un résultat de recherche (role="option"), fermer le menu déroulant
    if (target.closest('[role="option"]')) {
      this.ngZone.run(() => this.closeSearch());
      return;
    }

    // Si le clic est en dehors du composant hôte, fermer le menu déroulant
    if (!this.hostEl.nativeElement.contains(target)) {
      this.ngZone.run(() => this.closeSearch());
    }
  };

  private readonly _onDocumentKeydown = (event: KeyboardEvent) => {
    if (!this.searchOpen()) return;
    if (event.key === 'Escape') {
      this.ngZone.run(() => this.closeSearch());
    }
  };

  ngOnInit(): void {
    // Enregistrer les écouteurs globaux en dehors d'Angular pour éviter des cycles de détection de changement inutiles.
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('click', this._onDocumentClick, true);
      document.addEventListener('keydown', this._onDocumentKeydown, true);
    });

    // Breadcrumbs: subscribe to navigation events and update on init
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.ngZone.run(() => this.updateBreadcrumbs(this.router.url));
      });

    // Initial breadcrumbs
    this.updateBreadcrumbs(this.router.url);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this._onDocumentClick, true);
    document.removeEventListener('keydown', this._onDocumentKeydown, true);
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private updateBreadcrumbs(url: string): void {
    const normalize = (s: string) =>
      (s || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

    const current = normalize(url);

    // Find the best (longest) matching href from DEFAULT_MENU
    let bestGroup: any = null;
    let bestItem: any = null;
    let bestLen = -1;

    for (const group of DEFAULT_MENU) {
      for (const item of group.items) {
        const href = normalize(item.href || '');
        if (!href) continue;

        // Exact match or prefix match (so /app/products/123 matches /app/products)
        if (current === href || current.startsWith(href + '/') || current.startsWith(href)) {
          if (href.length > bestLen) {
            bestLen = href.length;
            bestGroup = group;
            bestItem = item;
          }
        }
      }
    }

    const crumbs: BreadcrumbItem[] = [{ label: 'Accueil', link: '/app', icon: Home }];
    if (bestGroup) {
      crumbs.push({ label: bestGroup.label });
    }
    if (bestItem) {
      crumbs.push({ label: bestItem.label, link: bestItem.href, icon: bestItem.icon });
    }

    this.breadcrumbItems = crumbs;
  }

  closeSearch(): void {
    this.searchOpen.set(false);
    this.searchQuery.set('');
  }

  // Actions de remplacement
  goToProfile(): void {
    // naviguer vers le profil
  }

  goToSettings(): void {
    // naviguer vers les paramètres
  }

  logout(): void {
    this.authService.logout();
  }
}
