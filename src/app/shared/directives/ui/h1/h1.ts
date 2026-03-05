import { Directive } from '@angular/core';

@Directive({
  selector: 'h1[appH1]',
  host: {
    class: 'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
  },
})
export class H1Directive {}
