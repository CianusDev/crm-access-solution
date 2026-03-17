import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar.component.html',
})
export class Avatar {
  src = input<string | null>(null);
  size = input<'sm' | 'md' | 'lg'>('md');

  readonly sizeClasses = computed(() => ({
    sm: 'size-7',
    md: 'size-9',
    lg: 'size-14',
  }[this.size()]));

  readonly imgSrc = computed(() => this.src() ?? '/assets/illustrations/user-placeholder.png');
}
