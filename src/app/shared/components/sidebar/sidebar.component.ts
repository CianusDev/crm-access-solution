import { SIDEBAR_STORAGE_KEY } from '@/core/constants/local-storage-key';
import { DEFAULT_MENU } from '@/core/constants/sidebar-menu';
import { LocalStorageService } from '@/core/services/local-storage/local-storage.service';
import { PermissionService } from '@/core/services/permission/permission.service';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Event, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  ChevronDown,
  Ellipsis,
  LucideAngularModule,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-angular';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { SidebarGroup } from './sidebar.interface';

/**
 * Sidebar simplifié avec comportement accordéon.
 *sidebar Sideba interfceexport

 /**
  * - Sidebar simplifié avec comportement accordéon.
  * - Simple et robuste, pas de mesure DOM.
  * - Persiste l'état réduit et le dernier groupe ouvert (optionnel).
  * - Synchronise le groupe ouvert avec la route courante.
  * - Accordéon : un seul groupe ouvert à la fois.
  * - Ouverture/fermeture via CSS uniquement, pas de calcul JS de hauteur.
  */

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
})
export class Sidebar implements OnInit, OnDestroy {
  // Groupes du menu (configurable via input)
  readonly groups = input<SidebarGroup[]>(DEFAULT_MENU);

  private readonly permissions = inject(PermissionService);

  /** Groups/items filtered by the current user's role. */
  protected readonly visibleGroups = computed(() => {
    return this.groups()
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => !item.roles?.length || this.permissions.hasRole(...item.roles),
        ),
      }))
      .filter((group) => group.items.length > 0);
  });

  // Etat réduit : si true, seuls les icônes sont visibles (sidebar étroite)
  protected readonly collapsed = signal(false);
  protected readonly hovered = signal(false);
  // Auto-collapse déclenché par la taille d'écran (< 1024px)
  protected readonly autoCollapsed = signal(false);
  protected readonly isCollapsed = computed(() => (this.collapsed() || this.autoCollapsed()) && !this.hovered());

  // Accordéon : un seul groupe ouvert à la fois ; null => aucun groupe forcé ouvert
  protected readonly openGroupIndex = signal<number | null>(null);

  // Icônes exposées pour le template
  protected readonly panelClose = PanelLeftClose;
  protected readonly panelOpen = PanelLeftOpen;
  protected readonly moreIcon = Ellipsis;
  protected readonly chevron = ChevronDown;

  // Services de plateforme
  private readonly platformId = inject(PLATFORM_ID);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly router = inject(Router);
  private routerSub: Subscription | null = null;
  private resizeSub: Subscription | null = null;

  private readonly BREAKPOINT = 1024; // px — en dessous: auto-collapsed

  constructor() {
    // Restaure l'état réduit si stocké (uniquement navigateur)
    if (isPlatformBrowser(this.platformId)) {
      const stored = this.localStorageService.getState(SIDEBAR_STORAGE_KEY);
      if (stored !== null) {
        this.collapsed.set(stored === 'true');
      }

      // Restaure l'index du groupe ouvert si stocké
      const storedGroup = this.localStorageService.getState(`${SIDEBAR_STORAGE_KEY}_group`);
      if (storedGroup !== null) {
        const idx = Number(storedGroup);
        if (!Number.isNaN(idx)) {
          this.openGroupIndex.set(idx);
        } else {
          this.syncOpenGroupWithUrl(this.router.url);
        }
      } else {
        // Déduit à partir de l'URL courante
        this.syncOpenGroupWithUrl(this.router.url);
      }

      // Abonnement aux navigations pour mettre à jour le groupe actif
      this.routerSub = this.router.events.subscribe((ev: Event) => {
        if (ev instanceof NavigationEnd) {
          this.syncOpenGroupWithUrl(ev.urlAfterRedirects || ev.url);
        }
      });
    } else {
      // Environnements non-navigateur : tentative best-effort avec snapshot router
      this.syncOpenGroupWithUrl(this.router.url);
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.resizeSub = fromEvent(window, 'resize')
      .pipe(debounceTime(100), startWith(null))
      .subscribe(() => {
        this.autoCollapsed.set(window.innerWidth < this.BREAKPOINT);
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.routerSub = null;
    this.resizeSub?.unsubscribe();
    this.resizeSub = null;
  }

  toggleCollapsed(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    if (isPlatformBrowser(this.platformId)) {
      this.localStorageService.setState(SIDEBAR_STORAGE_KEY, String(next));
    }
  }

  /**
   * Ouvre/ferme un groupe (accordéon).
   * Un groupe ouvert ferme les autres. Cliquer sur le groupe ouvert le ferme.
   */
  toggleGroup(index: number): void {
    const current = this.openGroupIndex();
    const next = current === index ? null : index;
    this.openGroupIndex.set(next);
    if (isPlatformBrowser(this.platformId)) {
      this.localStorageService.setState(
        `${SIDEBAR_STORAGE_KEY}_group`,
        next === null ? null : String(next),
      );
    }
  }

  isGroupOpen(index: number): boolean {
    return this.openGroupIndex() === index;
  }

  chevronClass(index: number): string {
    if (this.isCollapsed()) {
      return 'hidden';
    }
    return this.isGroupOpen(index)
      ? 'transform rotate-180 transition-transform duration-200'
      : 'transform rotate-0 transition-transform duration-200';
  }

  /**
   * Choisit le meilleur groupe correspondant à l'URL donnée.
   * Utilise le préfixe le plus long pour que les sous-routes prennent le bon groupe.
   */
  private syncOpenGroupWithUrl(url: string): void {
    const groups = this.visibleGroups();
    let bestIndex: number | null = null;
    let bestLength = -1;

    groups.forEach((g, i) => {
      for (const item of g.items) {
        if (!item.href) continue;
        const href = item.href;
        if (href === url || url.startsWith(href)) {
          if (href.length > bestLength) {
            bestLength = href.length;
            bestIndex = i;
          }
        }
      }
    });

    this.openGroupIndex.set(bestIndex);
  }
}
