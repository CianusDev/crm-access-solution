import { SidebarGroup } from '@/shared/components/sidebar/sidebar.interface';
import {
  Ellipsis,
  FileText,
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-angular';

export const DEFAULT_MENU: SidebarGroup[] = [
  {
    label: 'Power Bi',
    icon: Ellipsis,
    items: [{ label: 'Tableau de bord', href: '/app/power-bi/dashboard', icon: LayoutDashboard }],
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
