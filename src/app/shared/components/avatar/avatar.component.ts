import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar.component.html',
})
export class Avatar {
  src      = input<string | null>(null);
  initials = input<string>('');
  size     = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  readonly sizeClasses = computed(() => ({
    sm: 'size-7 text-[10px]',
    md: 'size-9 text-xs',
    lg: 'size-14 text-lg',
    xl: 'size-16 text-xl',
  }[this.size()]));
}
