import { Pipe, PipeTransform } from '@angular/core';

export function getInitiales(name?: string | null, second?: string): string {
  if (second !== undefined) {
    return ((name?.[0] ?? '') + (second?.[0] ?? '')).toUpperCase();
  }
  if (!name?.trim()) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

@Pipe({ name: 'initiales', standalone: true, pure: true })
export class InitialesPipe implements PipeTransform {
  transform(value?: string | null, second?: string): string {
    return getInitiales(value, second);
  }
}
