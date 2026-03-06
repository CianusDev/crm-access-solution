import { Avatar } from '@/shared/components/avatar/avatar.component';
import { Dropdown, DropdownItem } from '@/shared/components/dropdown';
import { Sidebar } from '@/shared/components/sidebar/sidebar.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BellIcon, LogOut, LucideAngularModule, SearchIcon, User } from 'lucide-angular';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, LucideAngularModule, Avatar, Dropdown],
  templateUrl: './main-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  readonly menuItems: DropdownItem[] = [
    { label: 'Mon profil', icon: User, action: () => this.goToProfile() },
    { separator: true, label: '' },
    { label: 'Déconnexion', icon: LogOut, action: () => this.logout() },
  ];
  readonly icons = {
    search: SearchIcon,
    bell: BellIcon,
  };

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
