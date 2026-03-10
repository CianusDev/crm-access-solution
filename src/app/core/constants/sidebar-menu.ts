import { SidebarGroup } from '@/shared/components/sidebar/sidebar.interface';
import {
  Ellipsis,
  FileText,
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  UserPlus,
  Users,
} from 'lucide-angular';

export const DEFAULT_MENU: SidebarGroup[] = [
  {
    label: 'Power Bi',
    icon: Ellipsis,
    items: [{ label: 'Tableau de bord', href: '/app/power-bi/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Reseau de CORA',
    icon: Ellipsis,
    items: [
      { label: 'Tableau de bord', href: '/app/cora/dashboard', icon: LayoutDashboard },
      { label: 'Creer un cora', href: '/app/cora/create', icon: UserPlus },
      { label: 'Commandes', href: '/app/orders', icon: ShoppingCart },
      { label: 'Clients', href: '/app/clients', icon: Users },
    ],
  },
  {
    label: 'Avance sur cheque',
    icon: Ellipsis,
    items: [
      { label: 'Rapports', href: '/app/reports', icon: FileText },
      { label: 'Paramètres', href: '/app/settings', icon: Settings },
    ],
  },
];
