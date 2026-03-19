import { LucideIconData } from 'lucide-angular';
import { UserRole } from '@/core/models/user.model';

export interface SidebarItem {
  readonly label: string;
  readonly href: string;
  readonly icon?: LucideIconData;
  /** If set, only users with one of these roles will see this item. */
  readonly roles?: UserRole[];
}

export interface SidebarGroup {
  readonly label: string;
  readonly icon?: LucideIconData;
  readonly items: SidebarItem[];
}
