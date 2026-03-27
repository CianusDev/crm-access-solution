import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

/**
 * Pipe qui sanitise une URL pour un usage sécurisé dans les templates Angular.
 *
 * Protocoles autorisés : http, https, mailto, tel
 * Tout le reste (javascript:, data:, vbscript:, etc.) est bloqué.
 *
 * Usage :
 *   <a [href]="url | safeUrl">Lien</a>
 *   <img [src]="imageUrl | safeUrl" />
 *   <iframe [src]="videoUrl | safeUrl:'resource'"></iframe>
 */
@Pipe({
  name: 'safeUrl',
  standalone: true,
  pure: true,
})
export class SafeUrlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  /** Protocoles considérés comme sûrs */
  private readonly ALLOWED_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:'];

  /** URL de fallback renvoyée si l'URL est dangereuse */
  private readonly FALLBACK = 'about:blank';

  transform(value: string | null | undefined, type: 'url' | 'resource' = 'url'): SafeUrl {
    if (!value || typeof value !== 'string') {
      return this.sanitizer.bypassSecurityTrustUrl(this.FALLBACK);
    }

    const url = value.trim();

    if (!this.isSafe(url)) {
      console.warn(`[SafeUrlPipe] URL bloquée pour raison de sécurité : "${url}"`);
      return this.sanitizer.bypassSecurityTrustUrl(this.FALLBACK);
    }

    // ✅ bypassSecurityTrustResourceUrl pour iframe/script, bypassSecurityTrustUrl pour le reste
    return type === 'resource'
      ? this.sanitizer.bypassSecurityTrustResourceUrl(url)
      : this.sanitizer.bypassSecurityTrustUrl(url);
  }

  private isSafe(url: string): boolean {
    const decoded = this.decode(url);
    const protocol = this.extractProtocol(decoded);

    if (!protocol) {
      // URL relative → autorisée
      return true;
    }

    return this.ALLOWED_PROTOCOLS.includes(protocol);
  }

  private extractProtocol(url: string): string | null {
    const cleaned = url.replace(/[\s\u0000-\u001F]/g, '');
    const match = cleaned.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):/);
    return match ? match[1].toLowerCase() + ':' : null;
  }

  private decode(url: string): string {
    try {
      const once = decodeURIComponent(url);
      return decodeURIComponent(once);
    } catch {
      return url;
    }
  }
}
