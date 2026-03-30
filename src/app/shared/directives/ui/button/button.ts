import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';

// Définition des variantes de style pour les boutons
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90', // Style par défaut
        destructive: 'bg-destructive text-background shadow-sm hover:bg-destructive/90', // Style destructif
        outline:
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground', // Style avec bordure
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80', // Style secondaire
        ghost: 'hover:bg-accent hover:text-accent-foreground', // Style fantôme
        link: 'text-primary underline-offset-4 hover:underline', // Style lien
        success: 'bg-green-500 text-white shadow-xs hover:bg-green-600', // Style succès
      },
      size: {
        default: 'h-9 px-4 py-2', // Taille par défaut
        sm: 'h-8 rounded-md px-3 text-xs', // Petite taille
        lg: 'h-10 rounded-md px-8', // Grande taille
        icon: 'h-9 w-9', // Taille pour icône
      },
    },
    defaultVariants: {
      variant: 'default', // Variante par défaut
      size: 'default', // Taille par défaut
    },
  },
);

// Types pour les variantes et tailles des boutons
export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;

@Directive({
  selector: 'button[appButton], a[appButton]', // Sélecteur pour les éléments bouton et lien
  host: {
    '[class]': 'hostClasses()', // Classes dynamiques basées sur les variantes
    '[attr.disabled]': 'isDisabled()', // Attribut désactivé basé sur l'état
  },
})
export class ButtonDirective {
  variant = input<ButtonVariant>('default'); // Variante par défaut
  size = input<ButtonSize>('default'); // Taille par défaut
  disabled = input(false, { transform: booleanAttribute }); // État désactivé par défaut
  hostClasses = computed(() => buttonVariants({ variant: this.variant(), size: this.size() })); // Calcul des classes hôtes

  isDisabled = computed(() => (this.disabled() ? true : null)); // Calcul de l'état désactivé
}
