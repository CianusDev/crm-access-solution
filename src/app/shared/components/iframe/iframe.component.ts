import { Component, Input } from '@angular/core';
import { SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-iframe',
  imports: [],
  template: `
    <div
      class=" rounded-md overflow-hidden h-[calc(100svh-13rem)] bg-background border border-border w-full"
    >
      <iframe
        [src]="src"
        class="w-full h-full"
        width="100%"
        height="100%"
        frameborder="0"
        allowFullScreen="true"
      ></iframe>
    </div>
  `,
})
export class IframeComponent {
  @Input({ required: true }) src: string | SafeUrl | SafeResourceUrl = '';
  constructor() {}
}
