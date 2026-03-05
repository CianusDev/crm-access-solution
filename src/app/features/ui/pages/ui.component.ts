import { H2Directive } from '@/shared/directives/ui/h2/h2';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ui',
  imports: [H2Directive],
  templateUrl: './ui.html',
})
export class UiComponent {}
