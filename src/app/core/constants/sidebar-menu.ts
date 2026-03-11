import { SidebarGroup } from '@/shared/components/sidebar/sidebar.interface';
import {
  Clock,
  Ellipsis,
  FileText,
  LayoutDashboard,
  List,
  MapPin,
  Settings,
  UserPlus,
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
      { label: 'Créer un CORA', href: '/app/cora/create', icon: UserPlus },
      { label: 'Liste des CORAs', href: '/app/cora/list', icon: List },
      { label: 'Demandes en attente', href: '/app/cora/pending', icon: Clock },
      { label: 'Créer un agent', href: '/app/cora/agent/create', icon: UserPlus },
      { label: 'Géolocalisation CORA', href: '/cora-map', icon: MapPin },
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
