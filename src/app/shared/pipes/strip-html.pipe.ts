import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'stripHtml', standalone: true, pure: true })
export class StripHtmlPipe implements PipeTransform {
  transform(value?: string | null): string {
    if (!value) return '';
    return value.replace(/<[^>]*>/g, '').trim();
  }
}
