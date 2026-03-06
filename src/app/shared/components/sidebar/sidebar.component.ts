import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  computed,
  inject,
  afterNextRender,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Settings,
  ChartBar,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Ellipsis,
} from 'lucide-angular';
import { LucideIconData } from 'lucide-angular';
import { SIDEBAR_STORAGE_KEY } from '@/core/constants/local-storage-key';
import { LocalStorageService } from '@/core/services/local-storage/local-storage.service';

export interface SidebarItem {
  readonly label: string;
  readonly href: string;
  readonly icon?: LucideIconData;
}
export interface SidebarGroup {
  readonly label: string;
  readonly icon?: LucideIconData;
  readonly items: SidebarItem[];
}

const DEFAULT_MENU: SidebarGroup[] = [
  {
    label: 'Général',
    icon: Ellipsis,
    items: [
      { label: 'Tableau de bord', href: '/app/home', icon: LayoutDashboard },
      { label: 'Statistiques', href: '/app/stats', icon: ChartBar },
    ],
  },
  {
    label: 'Gestion',
    icon: Ellipsis,
    items: [
      { label: 'Produits', href: '/app/products', icon: Package },
      { label: 'Catégories', href: '/app/categories', icon: FolderTree },
      { label: 'Commandes', href: '/app/orders', icon: ShoppingCart },
      { label: 'Clients', href: '/app/clients', icon: Users },
    ],
  },
  {
    label: 'Système',
    icon: Ellipsis,
    items: [
      { label: 'Rapports', href: '/app/reports', icon: FileText },
      { label: 'Paramètres', href: '/app/settings', icon: Settings },
    ],
  },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  // template: `
  //   <aside
  //     class="h-full border-r border-border bg-sidebar flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
  //     [class]="isCollapsed() ? 'w-16' : 'w-xs'"
  //     (mouseenter)="hovered.set(true)"
  //     (mouseleave)="hovered.set(false)"
  //   >
  //     <!-- Header -->
  //     <div
  //       class="flex items-center h-16 py-3 gap-2 transition-all duration-300"
  //       [class]="isCollapsed() ? 'px-3 justify-center' : 'px-6 justify-between'"
  //     >
  //       <a
  //         routerLink="/app/home"
  //         class="overflow-hidden transition-all duration-300 ease-in-out"
  //         [class]="isCollapsed() ? 'w-0 opacity-0' : 'flex-1 opacity-100'"
  //       >
  //         <img
  //           ngSrc="/assets/images/logo-h-black.png"
  //           alt="Logo"
  //           width="176"
  //           height="176"
  //           priority
  //           class="w-full object-left h-10 object-contain"
  //         />
  //       </a>

  //       <button
  //         (click)="toggleCollapsed()"
  //         class="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
  //         [attr.aria-label]="collapsed() ? 'Déplier le menu' : 'Réduire le menu'"
  //         [attr.aria-expanded]="!collapsed()"
  //       >
  //         <lucide-icon [img]="collapsed() ? panelOpen : panelClose" size="18" aria-hidden="true" />
  //       </button>
  //     </div>

  //     <!-- Nav -->
  //     <nav
  //       class="flex-1 w-full py-4 px-2 flex flex-col gap-4 overflow-y-auto"
  //       aria-label="Menu principal"
  //     >
  //       @for (group of groups(); track group.label) {
  //         <div role="group" [attr.aria-label]="group.label">
  //           <div class="relative h-5 mb-1">
  //             <p
  //               class="absolute inset-0 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden"
  //               [class]="isCollapsed() ? 'opacity-0 w-0' : 'opacity-100 w-full'"
  //             >
  //               {{ group.label }}
  //             </p>
  //             <div
  //               class="absolute inset-0 flex justify-center transition-all duration-300 ease-in-out"
  //               [class]="isCollapsed() ? 'opacity-100' : 'opacity-0'"
  //             >
  //               <lucide-icon
  //                 [img]="group.icon ?? moreIcon"
  //                 size="14"
  //                 class="text-muted-foreground"
  //                 aria-hidden="true"
  //               />
  //             </div>
  //           </div>

  //           <ul class="flex flex-col gap-0.5">
  //             @for (item of group.items; track item.label) {
  //               <li>
  //                 <a
  //                   [routerLink]="item.href"
  //                   routerLinkActive="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
  //                   [title]="isCollapsed() ? item.label : ''"
  //                   class="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
  //                   [class]="isCollapsed() ? 'justify-center' : 'gap-3'"
  //                 >
  //                   @if (item.icon) {
  //                     <lucide-icon
  //                       [img]="item.icon"
  //                       size="18"
  //                       aria-hidden="true"
  //                       class="shrink-0"
  //                     />
  //                   }
  //                   <span
  //                     class="overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out"
  //                     [class]="isCollapsed() ? 'w-0 opacity-0' : 'flex-1 opacity-100'"
  //                   >
  //                     {{ item.label }}
  //                   </span>
  //                 </a>
  //               </li>
  //             }
  //           </ul>
  //         </div>
  //       }
  //     </nav>
  //   </aside>
  // `,
})
export class Sidebar {
  readonly groups = input<SidebarGroup[]>(DEFAULT_MENU);
  private readonly platformId = inject(PLATFORM_ID);
  private localStorageServcice = inject(LocalStorageService);
  protected readonly collapsed = signal(false);
  protected readonly hovered = signal(false);
  protected readonly isCollapsed = computed(() => this.collapsed() && !this.hovered());

  protected readonly panelClose = PanelLeftClose;
  protected readonly panelOpen = PanelLeftOpen;
  protected readonly moreIcon = Ellipsis;

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        const stored = this.localStorageServcice.getState(SIDEBAR_STORAGE_KEY);
        if (stored !== null) {
          this.collapsed.set(stored === 'true');
        }
      }
    });
  }

  toggleCollapsed(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    if (isPlatformBrowser(this.platformId)) {
      this.localStorageServcice.setState(SIDEBAR_STORAGE_KEY, String(next));
    }
  }
}
