import { Directive, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';

// Définition des variantes de style pour les boutons
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90', // Style par défaut
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90', // Style destructif
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground', // Style avec bordure
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80', // Style secondaire
        ghost: 'hover:bg-accent hover:text-accent-foreground', // Style fantôme
        link: 'text-primary underline-offset-4 hover:underline', // Style lien
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
  standalone: true,
  host: {
    '[class]': 'hostClasses()', // Classes dynamiques basées sur les variantes
    '[attr.disabled]': 'isDisabled()', // Attribut désactivé basé sur l'état
    '(click)': 'onClick($event)', // Gestionnaire d'événements pour les clics
  },
})
export class ButtonDirective {
  private elementRef = inject(ElementRef); // Injection de la référence de l'élément

  variant = input<ButtonVariant>('default'); // Variante par défaut
  size = input<ButtonSize>('default'); // Taille par défaut
  disabled = input(false, { transform: booleanAttribute }); // État désactivé par défaut
  hostClasses = computed(() => buttonVariants({ variant: this.variant(), size: this.size() })); // Calcul des classes hôtes

  isDisabled = computed(() => (this.disabled() ? true : null)); // Calcul de l'état désactivé

  onClick(event: Event): void {
    if (this.disabled()) return; // Ne pas exécuter si désactivé

    const mouseEvent = event as MouseEvent;
    const button = this.elementRef.nativeElement as HTMLElement;
    const rect = button.getBoundingClientRect();
    const x = mouseEvent.clientX - rect.left;
    const y = mouseEvent.clientY - rect.top;

    // Ajouter un léger effet d'enfoncement
    button.style.transform = 'scale(0.95)';
    button.style.transition = 'transform 0.1s ease-in-out';

    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);

    // Calculer la distance maximale du point de clic aux coins du bouton
    const maxX = Math.max(x, rect.width - x);
    const maxY = Math.max(y, rect.height - y);
    const maxRadius = Math.sqrt(maxX * maxX + maxY * maxY) * 2;

    // Créer l'effet de vague (ripple)
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '0';
    ripple.style.height = '0';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.pointerEvents = 'none';
    ripple.style.transition = 'width 0.6s ease-out, height 0.6s ease-out, opacity 0.6s ease-out';
    ripple.style.opacity = '1';

    button.appendChild(ripple);

    // Déclencher un reflow pour s'assurer que la transition fonctionne
    ripple.offsetWidth;

    ripple.style.width = `${maxRadius}px`;
    ripple.style.height = `${maxRadius}px`;
    ripple.style.opacity = '0';

    setTimeout(() => {
      ripple.remove(); // Supprimer l'effet de vague après la transition
    }, 600);
  }
}
