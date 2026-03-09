import { LucideIconData } from 'lucide-angular';

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
