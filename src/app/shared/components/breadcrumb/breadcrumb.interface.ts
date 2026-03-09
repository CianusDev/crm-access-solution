import { LucideIconData } from 'lucide-angular';

export interface BreadcrumbItem {
  label: string;
  link?: string | undefined;
  icon?: LucideIconData | null;
}
