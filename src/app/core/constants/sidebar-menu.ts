import { SidebarGroup } from '@/shared/components/sidebar/sidebar.interface';
import {
  Clock,
  Ellipsis,
  FileText,
  LayoutDashboard,
  List,
  MapPin,
  Search,
  Settings,
  UserPlus,
  Users,
  AlarmClock,
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
      { label: 'Créer un sous-agent', href: '/app/cora/agent/create', icon: UserPlus },
      { label: 'Liste des CORAs', href: '/app/cora/list', icon: List },
      { label: 'Demandes en attente', href: '/app/cora/pending', icon: Clock },
      { label: 'Géolocalisation CORA', href: '/cora-map', icon: MapPin },
    ],
  },
  {
    label: 'Avance sur chèque',
    icon: Ellipsis,
    items: [
      { label: 'Tableau de bord', href: '/app/asc/dashboard', icon: LayoutDashboard },
      { label: 'Nouvelle demande', href: '/app/asc/client-search', icon: Search },
      { label: 'Demandes en attente', href: '/app/asc/pending', icon: Clock },
      { label: 'Liste des chèques', href: '/app/asc/list', icon: List },
      { label: 'Liste des tireurs', href: '/app/asc/tireurs', icon: Users },
      { label: 'Chèques en attente (7j)', href: '/app/asc/cheques-attente', icon: AlarmClock },
    ],
  },
];
