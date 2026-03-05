import { Directive } from '@angular/core';

@Directive({
  selector: 'h2[appH2]',
  host: {
    class: 'scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0',
  },
})
export class H2Directive {}
