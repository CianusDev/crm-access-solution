import { LucideIconData } from 'lucide-angular';

export type DropdownAlign = 'start' | 'end';

export interface DropdownItem {
  readonly label: string;
  readonly icon?: LucideIconData;
  readonly disabled?: boolean;
  readonly separator?: boolean;
  readonly required?: boolean;
  readonly action?: () => void;
}
