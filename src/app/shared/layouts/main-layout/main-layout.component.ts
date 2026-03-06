import { AuthService } from '@/core/services/auth/auth.service';
import { Avatar } from '@/shared/components/avatar/avatar.component';
import { Dropdown, DropdownItem } from '@/shared/components/dropdown';
import { Sidebar } from '@/shared/components/sidebar/sidebar.component';

import { ChangeDetectionStrategy, Component, inject, effect, input, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import type { User } from '@/core/models/user.model';
import { of } from 'rxjs';
import {
  BellIcon,
  LogOut,
  LucideAngularModule,
  SearchIcon,
  User as UserIcon,
} from 'lucide-angular';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, LucideAngularModule, Avatar, Dropdown],
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  readonly menuItems: DropdownItem[] = [
    { label: 'Mon profil', icon: UserIcon, action: () => this.goToProfile() },
    { separator: true, label: '' },
    { label: 'Déconnexion', icon: LogOut, action: () => this.logout() },
  ];
  readonly icons = {
    search: SearchIcon,
    bell: BellIcon,
  };

  // Raw input coming from the route resolver (User | null)
  readonly userRaw = input<User | null>(null, {
    alias: 'currentUser',
  });

  /**
   * Keep the existing template usage `user()?.nom | async` working without changing the template:
   * we expose `user()` as an object where `nom` is an Observable<string>.
   * That makes `user()?.nom | async` valid while keeping the `user` signal typed.
   */
  readonly user = computed(() => {
    const u = this.userRaw();
    if (!u) return null;
    return u;
    // return {
    //   ...u,
    //   nom: of(u.nom),
    // } as unknown as User & { nom: import('rxjs').Observable<string> };
  });

  goToProfile() {
    // Navigate to profile page
  }

  goToSettings() {
    // Navigate to settings page
  }

  logout() {
    // Perform logout action
  }
}
